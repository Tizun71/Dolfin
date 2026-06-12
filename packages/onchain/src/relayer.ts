// Dolfin execution relayer.
// Flow: adapter call -> build UserOperation -> sign with the session key -> bundler ->
// EntryPoint -> smart account -> adapter/protocol.
// The relayer holds only the session key (scoped, revocable, expiring), never the owner key,
// so a full compromise is still capped by the on-chain PolicyManager.

import { createPublicClient, http, encodeFunctionData, concat, type Account, type Address } from "viem";
import type { AdapterCall, PackedUserOperation } from "./types.js";

const ACCOUNT_ABI = [
  {
    type: "function",
    name: "executeAction",
    stateMutability: "nonpayable",
    inputs: [{ name: "adapter", type: "address" }, { name: "actionData", type: "bytes" }],
    outputs: [],
  },
] as const;

const PACKED_FIELDS = [
  { name: "sender", type: "address" },
  { name: "nonce", type: "uint256" },
  { name: "initCode", type: "bytes" },
  { name: "callData", type: "bytes" },
  { name: "accountGasLimits", type: "bytes32" },
  { name: "preVerificationGas", type: "uint256" },
  { name: "gasFees", type: "bytes32" },
  { name: "paymasterAndData", type: "bytes" },
  { name: "signature", type: "bytes" },
] as const;

const ENTRYPOINT_ABI = [
  {
    type: "function",
    name: "getNonce",
    stateMutability: "view",
    inputs: [{ name: "sender", type: "address" }, { name: "key", type: "uint192" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getUserOpHash",
    stateMutability: "view",
    inputs: [{ name: "userOp", type: "tuple", components: PACKED_FIELDS }],
    outputs: [{ type: "bytes32" }],
  },
] as const;

const SIG_MODE_SESSION = "0x01" as const; // matches DolfinSmartAccount._validateSignature

function pack(hi: bigint, lo: bigint): `0x${string}` {
  return `0x${((hi << 128n) | lo).toString(16).padStart(64, "0")}`;
}

export interface RelayerConfig {
  rpcUrl: string;
  bundlerUrl: string;
  entryPoint: Address;
  account: Address; // user's smart account
  sessionKey: Account; // viem account derived from the SESSION key
}

/** ERC-4337 UserOperation receipt (bundler `eth_getUserOperationReceipt`). */
export interface UserOpReceipt {
  userOpHash: `0x${string}`;
  success: boolean;
  reason?: string;
  actualGasUsed?: `0x${string}`;
  receipt?: { transactionHash: `0x${string}`; blockNumber: `0x${string}` };
}

export class ExecutionRelayer {
  private pub;
  constructor(private cfg: RelayerConfig) {
    this.pub = createPublicClient({ transport: http(cfg.rpcUrl) });
  }

  /** Build, sign (session key) and submit a prepared adapter call. Returns the userOpHash. */
  async submit(call: AdapterCall): Promise<`0x${string}`> {
    const callData = encodeFunctionData({
      abi: ACCOUNT_ABI,
      functionName: "executeAction",
      args: [call.adapter, call.actionData],
    });

    const nonce = (await this.pub.readContract({
      address: this.cfg.entryPoint,
      abi: ENTRYPOINT_ABI,
      functionName: "getNonce",
      args: [this.cfg.account, 0n],
    })) as bigint;

    const fees = await this.pub.estimateFeesPerGas();
    // Arbitrum often returns a 0 priority fee, which bundlers reject, so floor it.
    const minPriority = 1_000_000_000n; // 1 gwei
    const maxPriorityFeePerGas = (fees.maxPriorityFeePerGas ?? 0n) > minPriority ? fees.maxPriorityFeePerGas! : minPriority;
    const maxFeePerGas = (fees.maxFeePerGas ?? 0n) > maxPriorityFeePerGas ? fees.maxFeePerGas! : maxPriorityFeePerGas * 2n;

    const userOp: PackedUserOperation = {
      sender: this.cfg.account,
      nonce,
      initCode: "0x",
      callData,
      // Placeholders; replaced by the bundler's gas estimate below.
      accountGasLimits: pack(1_000_000n, 1_000_000n),
      preVerificationGas: 1_000_000n,
      gasFees: pack(maxPriorityFeePerGas, maxFeePerGas),
      paymasterAndData: "0x",
      // Dummy session-mode signature so estimation has the right calldata size.
      signature: concat([SIG_MODE_SESSION, `0x${"00".repeat(65)}`]),
    };

    // Gas sizing favours reliable inclusion over cost.
    // callGasLimit / preVerificationGas: padded generously; over-provisioning is refunded if
    //   unused and avoids out-of-gas reverts.
    // verificationGasLimit: padding backfires here. Alchemy/Rundler require
    //   efficiency = actualGasUsed / limit >= 0.4, so a high limit is rejected. Session-key
    //   validation uses ~40-60k, so cap it tight.
    const VERIFICATION_GAS_CAP = 90_000n;
    const est = await this.estimateGas(userOp);
    const verificationGasLimit =
      est.verificationGasLimit > VERIFICATION_GAS_CAP ? VERIFICATION_GAS_CAP : est.verificationGasLimit;
    // Pad the non-efficiency-gated limits 2x for headroom (cost is refunded if unused).
    const callGasLimit = est.callGasLimit * 2n;
    userOp.accountGasLimits = pack(verificationGasLimit, callGasLimit);
    userOp.preVerificationGas = est.preVerificationGas * 2n;

    // EntryPoint computes the canonical hash, binding chainId + entrypoint for replay safety.
    const userOpHash = (await this.pub.readContract({
      address: this.cfg.entryPoint,
      abi: ENTRYPOINT_ABI,
      functionName: "getUserOpHash",
      args: [userOp],
    })) as `0x${string}`;

    const sig = await this.cfg.sessionKey.signMessage!({ message: { raw: userOpHash } });
    userOp.signature = concat([SIG_MODE_SESSION, sig]);

    await this.sendToBundler(userOp);
    return userOpHash;
  }

  /** Ask the bundler to size verification/call/preVerification gas for this op. */
  private async estimateGas(
    userOp: PackedUserOperation,
  ): Promise<{ preVerificationGas: bigint; verificationGasLimit: bigint; callGasLimit: bigint }> {
    const res = await fetch(this.cfg.bundlerUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_estimateUserOperationGas",
        params: [serializeUserOp(userOp), this.cfg.entryPoint],
      }),
    });
    const json = (await res.json()) as {
      result?: { preVerificationGas: `0x${string}`; verificationGasLimit: `0x${string}`; callGasLimit: `0x${string}` };
      error?: { message: string };
    };
    if (json.error) throw new Error(`bundler estimate: ${json.error.message}`);
    const r = json.result!;
    return {
      preVerificationGas: BigInt(r.preVerificationGas),
      verificationGasLimit: BigInt(r.verificationGasLimit),
      callGasLimit: BigInt(r.callGasLimit),
    };
  }

  /** Poll the bundler for a UserOperation receipt. Returns null until it is mined. */
  async getReceipt(userOpHash: `0x${string}`): Promise<UserOpReceipt | null> {
    const res = await fetch(this.cfg.bundlerUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getUserOperationReceipt", params: [userOpHash] }),
    });
    const json = (await res.json()) as { result?: UserOpReceipt | null; error?: { message: string } };
    if (json.error) throw new Error(`bundler: ${json.error.message}`);
    return json.result ?? null;
  }

  /** Wait until the UserOperation is mined (or timeout). Throws if the op reverted on-chain. */
  async waitForReceipt(
    userOpHash: `0x${string}`,
    { timeoutMs = 60_000, intervalMs = 3_000 }: { timeoutMs?: number; intervalMs?: number } = {},
  ): Promise<UserOpReceipt> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const receipt = await this.getReceipt(userOpHash);
      if (receipt) {
        if (!receipt.success) throw new Error(`userOp reverted: ${userOpHash} (reason: ${receipt.reason ?? "unknown"})`);
        return receipt;
      }
      if (Date.now() > deadline) throw new Error(`userOp receipt timeout after ${timeoutMs}ms: ${userOpHash}`);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  private async sendToBundler(userOp: PackedUserOperation) {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_sendUserOperation",
      params: [serializeUserOp(userOp), this.cfg.entryPoint],
    };
    const res = await fetch(this.cfg.bundlerUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { result?: `0x${string}`; error?: { message: string } };
    if (json.error) throw new Error(`bundler: ${json.error.message}`);
    return json.result as `0x${string}`;
  }
}

/** Split a packed bytes32 (hi<<128 | lo) into its two 16-byte halves. */
function unpack(b32: `0x${string}`): [bigint, bigint] {
  const h = b32.slice(2).padStart(64, "0");
  return [BigInt(`0x${h.slice(0, 32)}`), BigInt(`0x${h.slice(32)}`)];
}

const hex = (v: bigint): `0x${string}` => `0x${v.toString(16)}`;

// Convert the packed UserOperation into the unpacked JSON-RPC shape the bundler expects
// (EntryPoint v0.7/v0.8). Packed fields are split; empty factory/paymaster omitted.
function serializeUserOp(op: PackedUserOperation) {
  const [verificationGasLimit, callGasLimit] = unpack(op.accountGasLimits);
  const [maxPriorityFeePerGas, maxFeePerGas] = unpack(op.gasFees);
  return {
    sender: op.sender,
    nonce: hex(op.nonce),
    callData: op.callData,
    callGasLimit: hex(callGasLimit),
    verificationGasLimit: hex(verificationGasLimit),
    preVerificationGas: hex(op.preVerificationGas),
    maxFeePerGas: hex(maxFeePerGas),
    maxPriorityFeePerGas: hex(maxPriorityFeePerGas),
    signature: op.signature,
  };
}
