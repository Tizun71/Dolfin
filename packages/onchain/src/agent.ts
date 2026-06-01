// Dolfin AI Agent (reference)
//
//   input { marketData, portfolio, userPolicy } -> output TradeDecision
//
// HARD CONSTRAINTS (by construction, not by trust):
//   - holds NO private keys (pure function; signing happens in the relayer with the session key)
//   - touches NO funds (it only emits an intent)
//   - cannot bypass policy: every decision is re-checked on-chain by PolicyManager
//
// A defensive client-side policy filter drops invalid intents before they cost gas.
// The on-chain check remains authoritative.

import { ActionType, actionBit, type AgentInput, type TradeDecision, type UserPolicy } from "./types.js";

export interface Strategy {
  decide(input: AgentInput): TradeDecision;
}

/** Example: rotate a clip from the first allowed token into the second via the first SWAP protocol. */
export const exampleStrategy: Strategy = {
  decide({ marketData, userPolicy }: AgentInput): TradeDecision {
    const [tokenIn, tokenOut] = userPolicy.allowedTokens;
    const protocol = (Object.keys(userPolicy.allowedActions) as `0x${string}`[]).find(
      (p) => (userPolicy.allowedActions[p] & actionBit(ActionType.SWAP)) !== 0n,
    )!;
    const clipUsd = userPolicy.maxTradePerTxUsd / 2;
    const priceIn = marketData.prices[tokenIn] ?? 1;
    const amount = BigInt(Math.floor((clipUsd / priceIn) * 1e6)); // demo assumes 6-dp tokenIn
    return {
      actionType: ActionType.SWAP,
      protocol,
      adapter: userPolicy.adapters[protocol],
      tokenIn,
      tokenOut,
      amount,
      fee: 3000,
      reason: "demo clip",
    };
  },
};

export function notionalUsd(d: TradeDecision, prices: Record<string, number>, decimals: number): number {
  const px = prices[d.tokenIn] ?? 0;
  const base = (Number(d.amount) / 10 ** decimals) * px;
  return d.actionType === ActionType.OPEN_PERP ? base * ((d.leverageBps ?? 10000) / 10000) : base;
}

/** Client-side policy check mirroring the on-chain PolicyManager. */
export function checkAgainstPolicy(
  d: TradeDecision,
  policy: UserPolicy,
  prices: Record<string, number>,
  tokenInDecimals: number,
): string[] {
  const errs: string[] = [];
  const now = Math.floor(Date.now() / 1000);
  if (now > policy.expiry) errs.push("session expired");

  const mask = policy.allowedActions[d.protocol] ?? 0n;
  if ((mask & actionBit(d.actionType)) === 0n) errs.push("action/protocol not allowed");
  if (!policy.adapters[d.protocol]) errs.push("no adapter for protocol");
  if (!policy.allowedTokens.includes(d.tokenIn)) errs.push("tokenIn not allowed");
  if (d.tokenOut !== "0x0000000000000000000000000000000000000000" && !policy.allowedTokens.includes(d.tokenOut)) {
    errs.push("tokenOut not allowed");
  }
  if (d.actionType === ActionType.OPEN_PERP && (d.leverageBps ?? 0) > policy.maxLeverageBps) {
    errs.push("leverage too high");
  }
  const usd = notionalUsd(d, prices, tokenInDecimals);
  if (usd > policy.maxTradePerTxUsd) errs.push(`trade $${usd} > cap $${policy.maxTradePerTxUsd}`);
  return errs;
}

export function runAgent(
  strategy: Strategy,
  input: AgentInput,
  tokenInDecimals = 6,
): { decision: TradeDecision; rejected: string[] } {
  const decision = strategy.decide(input);
  const rejected = checkAgainstPolicy(decision, input.userPolicy, input.marketData.prices, tokenInDecimals);
  return { decision, rejected };
}
