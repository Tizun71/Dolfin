// Dolfin ERC-4337 stack on Arbitrum Sepolia (chain 421614).
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

// Tokens supported for deposit/withdraw transfers (native ETH has address null).
export interface TransferToken {
  symbol: string;
  address: Address | null;
  decimals: number;
}
export const TRANSFER_TOKENS: TransferToken[] = [
  { symbol: "ETH", address: null, decimals: 18 },
  ...TOKENS.map((t) => ({ symbol: t.symbol, address: t.address as Address, decimals: t.decimals })),
];

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

// Token / protocol logos (cryptocurrency-icons CDN, pinned commit). WETH reuses the ETH glyph.
const ICON = (s: string) =>
  `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${s}.svg`;

export const TOKEN_LOGOS: Record<string, string> = {
  ETH: ICON("eth"),
  WETH: ICON("eth"),
  USDC: ICON("usdc"),
};

// v1 protocol catalog. Only the Aave adapter is deployed on this network.
export const PROTOCOLS = [
  {
    key: "aave",
    name: "Aave V3",
    logo: 'https://icons.llamao.fi/icons/protocols/aave?w=48&h=48',
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

// Numeric risk caps (everything in PolicySettings except token/protocol grants).
export type RiskCaps = Pick<
  PolicySettings,
  "maxTradePerTx" | "maxDailyVolume" | "maxExposure" | "maxLossPerDay" | "maxDrawdownBps" | "maxLeverageBps" | "expiryDays"
>;

export interface RiskPreset {
  key: string;
  name: string;
  desc: string;
  caps: RiskCaps;
}

export const RISK_PRESETS: RiskPreset[] = [
  {
    key: "conservative",
    name: "Conservative",
    desc: "Tight caps, no leverage",
    caps: { maxTradePerTx: "250", maxDailyVolume: "1000", maxExposure: "1000", maxLossPerDay: "100", maxDrawdownBps: 3000, maxLeverageBps: 10000, expiryDays: 7 },
  },
  {
    key: "balanced",
    name: "Balanced",
    desc: "Moderate caps, up to 2x",
    caps: { maxTradePerTx: "1000", maxDailyVolume: "5000", maxExposure: "5000", maxLossPerDay: "500", maxDrawdownBps: 5000, maxLeverageBps: 20000, expiryDays: 7 },
  },
  {
    key: "aggressive",
    name: "Aggressive",
    desc: "Wide caps, up to 5x",
    caps: { maxTradePerTx: "5000", maxDailyVolume: "25000", maxExposure: "25000", maxLossPerDay: "2500", maxDrawdownBps: 8000, maxLeverageBps: 50000, expiryDays: 30 },
  },
];

export const DEFAULT_POLICY_SETTINGS: PolicySettings = {
  maxTradePerTx: "1000",
  maxDailyVolume: "5000",
  maxExposure: "5000",
  maxLossPerDay: "500",
  maxDrawdownBps: 5000,
  maxLeverageBps: 10000,
  expiryDays: 7,
  tokens: [TOKENS[0].address],
  protocols: {
    aave: [ActionType.SUPPLY, ActionType.WITHDRAW, ActionType.BORROW, ActionType.REPAY],
  },
};
