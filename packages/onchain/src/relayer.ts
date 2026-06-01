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
    const userOp: PackedUserOperation = {
      sender: this.cfg.account,
      nonce,
      initCode: "0x",
      callData,
      accountGasLimits: pack(800_000n, 800_000n),
      preVerificationGas: 100_000n,
      gasFees: pack(fees.maxPriorityFeePerGas ?? 1_000_000_000n, fees.maxFeePerGas ?? 20_000_000_000n),
      paymasterAndData: "0x",
      signature: "0x",
    };

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

function serializeUserOp(op: PackedUserOperation) {
  return {
    sender: op.sender,
    nonce: `0x${op.nonce.toString(16)}`,
    initCode: op.initCode,
    callData: op.callData,
    accountGasLimits: op.accountGasLimits,
    preVerificationGas: `0x${op.preVerificationGas.toString(16)}`,
    gasFees: op.gasFees,
    paymasterAndData: op.paymasterAndData,
    signature: op.signature,
  };
}
