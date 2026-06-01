// Dolfin ERC-4337 stack — Arbitrum Sepolia (chain 421614).
// Addresses from packages/smart_contract/ignition/deployments/chain-421614/deployed_addresses.json
// Aave addresses from @aave-dao/aave-address-book (AaveV3ArbitrumSepolia).
import { type Address } from "viem";

export const CHAIN_ID = 421614 as const;

export const DOLFIN = {
  factory: "0x2D44cF1fD244a910Eb3Aafd0aF0C37B0284C0f96",
  policyManager: "0x6790d288B68BA06D01Ed3Bd33C421F29782B09e9",
  aaveAdapter: "0x36e0D11A242C2c580F354c57a4993b3c894e8270",
  aavePool: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
} as const;

// Tokens selectable for the session whitelist.
export const TOKENS = [
  { symbol: "USDC", address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", decimals: 6 },
  { symbol: "WETH", address: "0x1dF462e2712496373A347f8ad10802a5E95f053D", decimals: 18 },
] as const;

// PolicyManager.ActionType enum -> bit index used in the per-protocol action mask.
export enum ActionType {
  SWAP = 0,
  SUPPLY = 1,
  WITHDRAW = 2,
  BORROW = 3,
  REPAY = 4,
  OPEN_PERP = 5,
  CLOSE_PERP = 6,
}

// Account salt strategy: fixed 0 (one Dolfin account per owner EOA). Bump per-user if multi-account needed.
export const ACCOUNT_SALT = BigInt(0);

// v1 protocol catalog. Only the Aave adapter is deployed on this network.
export const PROTOCOLS = [
  {
    key: "aave",
    name: "Aave V3",
    protocol: DOLFIN.aavePool,
    adapter: DOLFIN.aaveAdapter,
    actions: [ActionType.SUPPLY, ActionType.WITHDRAW, ActionType.BORROW, ActionType.REPAY],
  },
] as const;

export const ACTION_LABELS: Record<ActionType, string> = {
  [ActionType.SWAP]: "Swap",
  [ActionType.SUPPLY]: "Supply",
  [ActionType.WITHDRAW]: "Withdraw",
  [ActionType.BORROW]: "Borrow",
  [ActionType.REPAY]: "Repay",
  [ActionType.OPEN_PERP]: "Open Perp",
  [ActionType.CLOSE_PERP]: "Close Perp",
};

// Build a PolicyManager action bitmask from a set of ActionTypes: bit (1 << actionType).
export function buildActionMask(actions: ActionType[]): bigint {
  return actions.reduce((mask, a) => mask | (BigInt(1) << BigInt(a)), BigInt(0));
}

// User-facing policy form (USD as strings, bps/days as numbers).
export interface PolicySettings {
  maxTradePerTx: string;
  maxDailyVolume: string;
  maxExposure: string;
  maxLossPerDay: string;
  maxDrawdownBps: number;
  maxLeverageBps: number;
  expiryDays: number;
  tokens: Address[]; // whitelisted token addresses
  protocols: Record<string, ActionType[]>; // protocol key -> allowed actions
}
