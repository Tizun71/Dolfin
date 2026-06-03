import type { Address } from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
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

/** Optional overrides for the on-chain policy mirror. Any field set replaces the env default. */
export interface PolicyOverrides {
  maxTradePerTxUsd?: number;
  maxDailyVolumeUsd?: number;
  maxExposureUsd?: number;
  maxLossPerDayUsd?: number;
  expiryDays?: number;
  allowedTokens?: Address[];
  allowedActions?: Record<Address, bigint>;
  adapters?: Record<Address, Address>;
}

function reqEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`missing env: ${key} (see smart_contract/.env.example)`);
  return v;
}

function buildUserPolicy(args: {
  smartAccount: Address;
  sessionKey: PrivateKeyAccount;
  policyOverrides?: PolicyOverrides;
}): UserPolicy {
  const { smartAccount, sessionKey, policyOverrides } = args;
  const aaveMask =
    actionBit(ActionType.SUPPLY) |
    actionBit(ActionType.WITHDRAW) |
    actionBit(ActionType.BORROW) |
    actionBit(ActionType.REPAY);
  const expiryDays = policyOverrides?.expiryDays ?? Number(process.env.POLICY_EXPIRY_DAYS ?? 7);
  return {
    agent: sessionKey.address,
    account: smartAccount,
    expiry: Math.floor(Date.now() / 1000) + expiryDays * 86_400,
    maxTradePerTxUsd: policyOverrides?.maxTradePerTxUsd ?? Number(process.env.POLICY_MAX_TRADE_USD ?? 1000),
    maxDailyVolumeUsd: policyOverrides?.maxDailyVolumeUsd ?? Number(process.env.POLICY_MAX_DAILY_USD ?? 5000),
    maxExposureUsd: policyOverrides?.maxExposureUsd ?? Number(process.env.POLICY_MAX_EXPOSURE_USD ?? 5000),
    maxLossPerDayUsd: policyOverrides?.maxLossPerDayUsd ?? Number(process.env.POLICY_MAX_LOSS_PER_DAY_USD ?? 500),
    maxLeverageBps: 10_000,
    allowedTokens: policyOverrides?.allowedTokens ?? [ADDRESSES.usdc],
    allowedActions: policyOverrides?.allowedActions ?? { [ADDRESSES.aavePool]: aaveMask },
    adapters: policyOverrides?.adapters ?? { [ADDRESSES.aavePool]: ADDRESSES.aaveAdapter },
  };
}

/**
 * Build an OnchainConfig from explicit arguments. Used by AgentManager once
 * it has loaded the per-user config from the database.
 */
export function loadOnchainConfigFor(args: {
  smartAccount: Address;
  sessionKey: `0x${string}`;
  policyOverrides?: PolicyOverrides;
}): OnchainConfig {
  const rpcUrl = reqEnv("ALCHEMY_RPC_URL");
  const bundlerUrl = reqEnv("ALCHEMY_BUNDLER_URL");
  const sessionKey = privateKeyToAccount(args.sessionKey);
  const userPolicy = buildUserPolicy({
    smartAccount: args.smartAccount,
    sessionKey,
    policyOverrides: args.policyOverrides,
  });
  const relayer = new ExecutionRelayer({
    rpcUrl,
    bundlerUrl,
    entryPoint: ADDRESSES.entryPoint,
    account: args.smartAccount,
    sessionKey,
  });
  return {
    relayer,
    userPolicy,
    tokens: TOKEN_REGISTRY,
    aave: { pool: ADDRESSES.aavePool, adapter: ADDRESSES.aaveAdapter },
  };
}

/**
 * Backwards-compatible: build the dev/smoke config from env only, using
 * the hard-coded `ADDRESSES.account` and `SESSION_KEY`. This is what
 * `create-dolfin-agent.ts` and the CLI `run-agent.ts` rely on.
 */
export function loadOnchainConfig(): OnchainConfig {
  return loadOnchainConfigFor({
    smartAccount: ADDRESSES.account,
    sessionKey: reqEnv("SESSION_KEY") as `0x${string}`,
  });
}
