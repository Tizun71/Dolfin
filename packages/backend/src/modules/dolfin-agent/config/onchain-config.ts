import type { Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ActionType, actionBit, ExecutionRelayer, type UserPolicy } from "@dolfin/onchain";

/**
 * DolfinStack deployment on Arbitrum Sepolia (non-secret; safe to commit).
 * Secrets (RPC/bundler URL, session key) come from env — see loadOnchainConfig.
 */
export const ADDRESSES = {
  account: "0xF1D11915cb461C9B2d375a69C0A969b78cFA9808",
  aaveAdapter: "0x36e0D11A242C2c580F354c57a4993b3c894e8270",
  policyManager: "0x6790d288B68BA06D01Ed3Bd33C421F29782B09e9",
  factory: "0x2D44cF1fD244a910Eb3Aafd0aF0C37B0284C0f96",
  aavePool: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
  usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  entryPoint: "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
} as const satisfies Record<string, Address>;

export interface TokenInfo {
  symbol: string;
  address: Address;
  decimals: number;
  priceUsd: number;
}

/** Tokens the agent may act on, keyed by symbol. Aave Arb Sepolia supports USDC + WETH. */
export const TOKEN_REGISTRY: Record<string, TokenInfo> = {
  USDC: { symbol: "USDC", address: ADDRESSES.usdc, decimals: 6, priceUsd: 1 },
};

export interface OnchainConfig {
  relayer: ExecutionRelayer;
  userPolicy: UserPolicy;
  tokens: Record<string, TokenInfo>;
  aave: { pool: Address; adapter: Address };
}

function reqEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`missing env: ${key} (see smart_contract/.env.example)`);
  return v;
}

/**
 * Builds the runtime on-chain config from env. Throws fast at boot if anything is missing.
 * The session key never leaves this module's closure (carried inside the relayer).
 */
export function loadOnchainConfig(): OnchainConfig {
  const rpcUrl = reqEnv("ALCHEMY_RPC_URL");
  const bundlerUrl = reqEnv("ALCHEMY_BUNDLER_URL");
  const sessionKey = privateKeyToAccount(reqEnv("SESSION_KEY") as `0x${string}`);

  const relayer = new ExecutionRelayer({
    rpcUrl,
    bundlerUrl,
    entryPoint: ADDRESSES.entryPoint,
    account: ADDRESSES.account,
    sessionKey,
  });

  // Client-side mirror of the on-chain policy (chain stays authoritative).
  const aaveMask =
    actionBit(ActionType.SUPPLY) | actionBit(ActionType.WITHDRAW) | actionBit(ActionType.BORROW) | actionBit(ActionType.REPAY);
  const days = Number(process.env.POLICY_EXPIRY_DAYS ?? 7);
  const userPolicy: UserPolicy = {
    agent: sessionKey.address,
    account: ADDRESSES.account,
    expiry: Math.floor(Date.now() / 1000) + days * 86_400,
    maxTradePerTxUsd: Number(process.env.POLICY_MAX_TRADE_USD ?? 1000),
    maxDailyVolumeUsd: Number(process.env.POLICY_MAX_DAILY_USD ?? 5000),
    maxExposureUsd: Number(process.env.POLICY_MAX_EXPOSURE_USD ?? 5000),
    maxLossPerDayUsd: Number(process.env.POLICY_MAX_LOSS_PER_DAY_USD ?? 500),
    maxLeverageBps: 10_000,
    allowedTokens: [ADDRESSES.usdc],
    allowedActions: { [ADDRESSES.aavePool]: aaveMask },
    adapters: { [ADDRESSES.aavePool]: ADDRESSES.aaveAdapter },
  };

  return {
    relayer,
    userPolicy,
    tokens: TOKEN_REGISTRY,
    aave: { pool: ADDRESSES.aavePool, adapter: ADDRESSES.aaveAdapter },
  };
}
