// Shared viem client helpers for the Dolfin ERC-4337 flow on Arbitrum Sepolia.
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import { type ConnectedWallet } from "@privy-io/react-auth";
import { CHAIN_ID } from "@/constants/dolfin";

export const publicClient: PublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

// Gas fee overrides: estimate current fees and apply a buffer so txs don't underprice the
// block base fee (injected wallets often stale-estimate on fast-moving L2 base fees).
export async function feeOverrides(): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }> {
  const { maxFeePerGas, maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();
  const BUFFER = BigInt(3); // 3x headroom
  return {
    maxFeePerGas: maxFeePerGas * BUFFER,
    maxPriorityFeePerGas: maxPriorityFeePerGas * BUFFER,
  };
}

// Extract a human-readable message from an unknown thrown value (viem errors carry shortMessage).
export function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === "object") {
    const o = e as { shortMessage?: string; message?: string };
    return o.shortMessage || o.message || fallback;
  }
  return fallback;
}

// Prefer an external (injected) wallet over the embedded Privy one for on-chain owner txs.
export function getActiveWallet(wallets: ConnectedWallet[]): ConnectedWallet | null {
  if (!wallets.length) return null;
  return wallets.find((w) => w.walletClientType !== "privy") ?? wallets[0];
}

export async function ensureNetwork(wallet: ConnectedWallet): Promise<void> {
  if (wallet.chainId === `eip155:${CHAIN_ID}`) return;
  await wallet.switchChain(CHAIN_ID);
}

// Build a walletClient bound to the active wallet's injected provider + the owner address.
export async function buildWalletClient(
  wallet: ConnectedWallet,
): Promise<{ walletClient: WalletClient; owner: Address }> {
  await ensureNetwork(wallet);
  const owner = wallet.address as Address;
  const provider = await wallet.getEthereumProvider();
  const walletClient = createWalletClient({
    account: owner,
    chain: arbitrumSepolia,
    transport: custom(provider),
  });
  return { walletClient, owner };
}
