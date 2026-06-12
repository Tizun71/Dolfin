import { parseUnits, zeroAddress } from "viem";
import { ActionType, type TradeDecision } from "@dolfin/onchain";
import type { OnchainConfig, TokenInfo } from "../config/onchain-config.js";

export type AaveActionName = "SUPPLY" | "WITHDRAW" | "BORROW" | "REPAY";

const ACTION_BY_NAME: Record<AaveActionName, ActionType> = {
  SUPPLY: ActionType.SUPPLY,
  WITHDRAW: ActionType.WITHDRAW,
  BORROW: ActionType.BORROW,
  REPAY: ActionType.REPAY,
};

// Build a policy-shaped Aave TradeDecision. protocol/adapter come from config, not the
// caller, so a proposal can only pick action, token and size.
export function makeAaveDecision(
  actionType: ActionType,
  token: TokenInfo,
  amountUsd: number,
  cfg: OnchainConfig,
  reason: string,
): TradeDecision {
  const amount = parseUnits((amountUsd / token.priceUsd).toFixed(token.decimals), token.decimals);
  return {
    actionType,
    protocol: cfg.aave.pool,
    adapter: cfg.aave.adapter,
    tokenIn: token.address,
    tokenOut: zeroAddress,
    amount,
    reason,
  };
}

export function resolveToken(symbol: string, cfg: OnchainConfig): TokenInfo | undefined {
  return cfg.tokens[symbol.toUpperCase()];
}

export function resolveAction(name: string): ActionType | undefined {
  return ACTION_BY_NAME[name.toUpperCase() as AaveActionName];
}
