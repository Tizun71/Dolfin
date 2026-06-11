// Shared types for the Dolfin off-chain stack (AI agent + execution relayer).
// These mirror the on-chain policy for client-side pre-filtering only; the chain is authoritative.

export type Address = `0x${string}`;

/** Mirrors IPolicyManager.ActionType. */
export enum ActionType {
  SWAP = 0,
  SUPPLY = 1,
  WITHDRAW = 2,
  BORROW = 3,
  REPAY = 4,
  OPEN_PERP = 5,
  CLOSE_PERP = 6,
}

export const actionBit = (a: ActionType): bigint => 1n << BigInt(a);

/** What the user granted to one session key (mirror of on-chain policy). */
export interface UserPolicy {
  agent: Address; // AI session key
  account: Address; // ERC-4337 smart account
  expiry: number; // unix seconds
  maxTradePerTxUsd: number;
  maxDailyVolumeUsd: number;
  maxExposureUsd: number;
  maxLossPerDayUsd: number;
  maxLeverageBps: number; // 10000 = 1x
  allowedTokens: Address[];
  // protocol (router/pool) => allowed action bitmask
  allowedActions: Record<Address, bigint>;
  // adapter address per protocol the agent may route through
  adapters: Record<Address, Address>;
}

export interface MarketData {
  prices: Record<string, number>; // token => USD price
  [k: string]: unknown;
}

export interface Portfolio {
  balances: Record<Address, bigint>;
  [k: string]: unknown;
}

export interface AgentInput {
  marketData: MarketData;
  portfolio: Portfolio;
  userPolicy: UserPolicy;
}

/** A protocol-agnostic action the AI proposes. `amount` is the raw tokenIn amount. */
export interface TradeDecision {
  actionType: ActionType;
  protocol: Address; // router / pool
  adapter: Address; // trusted adapter that plans this action
  tokenIn: Address; // collateral / input token (for valuation)
  tokenOut: Address; // output / borrowed / index token (zero-addr if n/a)
  amount: bigint; // raw tokenIn amount
  fee?: number; // uniswap fee tier
  leverageBps?: number; // perps
  reason?: string;
}

/** A fully-built adapter call ready for the account's executeAction. */
export interface AdapterCall {
  adapter: Address;
  actionData: `0x${string}`;
}

/** ERC-4337 v0.8 packed user operation. */
export interface PackedUserOperation {
  sender: Address;
  nonce: bigint;
  initCode: `0x${string}`;
  callData: `0x${string}`;
  accountGasLimits: `0x${string}`;
  preVerificationGas: bigint;
  gasFees: `0x${string}`;
  paymasterAndData: `0x${string}`;
  signature: `0x${string}`;
}
