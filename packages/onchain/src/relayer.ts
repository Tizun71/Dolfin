// Dolfin Execution Relayer (reference)
//
// Flow:  AI decision -> buildAdapterCall -> build UserOperation
//                    -> sign with the SESSION KEY -> Bundler -> EntryPoint -> SmartAccount -> adapter/protocol
//
// The relayer holds only the *session key* (scoped, revocable, expiring) — never the owner key.
// Even if fully compromised, the on-chain PolicyManager caps the blast radius to the signed policy.

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
    // Arbitrum's fee estimate often returns a 0 priority fee, which bundlers reject — floor it.
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

    // Let the bundler size the gas (hardcoded limits trip Alchemy's efficiency check on Arbitrum).
    // Alchemy over-pads verificationGasLimit (~1M) then rejects it for low efficiency; cap it.
    const est = await this.estimateGas(userOp);
    const verificationGasLimit = est.verificationGasLimit > 150_000n ? 150_000n : est.verificationGasLimit;
    userOp.accountGasLimits = pack(verificationGasLimit, est.callGasLimit);
    userOp.preVerificationGas = est.preVerificationGas;

    // EntryPoint computes the canonical hash (binds chainId + entrypoint → replay-safe).
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

/**
 * Convert the on-chain PACKED UserOperation into the UNPACKED JSON-RPC shape the bundler
 * expects (EntryPoint v0.7/v0.8). Packed fields are split; empty factory/paymaster omitted.
 */
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
