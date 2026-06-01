// Owner-driven Dolfin transactions, shared by the create + manage hooks. Each fn sends a tx
// and waits for the receipt. Reads use the shared publicClient.
import { parseUnits, type Address, type WalletClient } from "viem";
import { ACCOUNT_SALT, DOLFIN, PROTOCOLS, buildActionMask, type PolicySettings } from "@/constants/dolfin";
import { ACCOUNT_ABI, FACTORY_ABI } from "@/constants/dolfin-abi";
import { publicClient } from "./dolfin-wallet";

const usd = (v: string) => parseUnits(v || "0", 18);

export function counterfactualAddress(owner: Address) {
  return publicClient.readContract({
    address: DOLFIN.factory,
    abi: FACTORY_ABI,
    functionName: "getAddress",
    args: [owner, ACCOUNT_SALT],
  }) as Promise<Address>;
}

export async function isDeployed(account: Address): Promise<boolean> {
  const code = await publicClient.getCode({ address: account });
  return !!code && code !== "0x";
}

// Deploy the smart account if not already deployed. Returns the account address.
export async function provisionAccount(wallet: WalletClient, owner: Address): Promise<Address> {
  const account = await counterfactualAddress(owner);
  if (await isDeployed(account)) return account;
  const hash = await wallet.writeContract({
    address: DOLFIN.factory,
    abi: FACTORY_ABI,
    functionName: "createAccount",
    args: [owner, ACCOUNT_SALT],
    account: owner,
    chain: wallet.chain,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return account;
}

// Register a session key + write its policy/tokens/action-masks in one owner tx (configureSession).
export async function grantSession(
  wallet: WalletClient,
  owner: Address,
  account: Address,
  sessionKey: Address,
  s: PolicySettings,
): Promise<void> {
  const selected = PROTOCOLS.filter((p) => (s.protocols[p.key] ?? []).length > 0);
  if (!selected.length) throw new Error("Select at least one protocol action.");
  if (!s.tokens.length) throw new Error("Select at least one token.");

  const adapters = selected.map((p) => p.adapter as Address);
  const grants = selected.map((p) => ({
    protocol: p.protocol as Address,
    actionMask: buildActionMask(s.protocols[p.key]),
  }));
  const expiry = Math.floor(Date.now() / 1000) + s.expiryDays * 86_400;
  const policy = {
    expiry,
    maxTradePerTx: usd(s.maxTradePerTx),
    maxDailyVolume: usd(s.maxDailyVolume),
    maxExposure: usd(s.maxExposure),
    maxLossPerDay: usd(s.maxLossPerDay),
    maxDrawdownBps: s.maxDrawdownBps,
    maxLeverageBps: s.maxLeverageBps,
    exists: true,
    paused: false,
  };

  const hash = await wallet.writeContract({
    address: account,
    abi: ACCOUNT_ABI,
    functionName: "configureSession",
    args: [sessionKey, expiry, policy, adapters, s.tokens, grants],
    account: owner,
    chain: wallet.chain,
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

export async function revokeKey(
  wallet: WalletClient,
  owner: Address,
  account: Address,
  key: Address,
): Promise<void> {
  const hash = await wallet.writeContract({
    address: account,
    abi: ACCOUNT_ABI,
    functionName: "revokeSessionKey",
    args: [key],
    account: owner,
    chain: wallet.chain,
  });
  await publicClient.waitForTransactionReceipt({ hash });
}
