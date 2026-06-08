import { ActionType, type TradeDecision } from "@dolfin/onchain";
import type { OnchainConfig } from "../config/onchain-config.js";
import { makeAaveDecision } from "./decision-factory.js";
import type { AdvisorState } from "../state.js";

/** Health factor below this triggers debt repayment. */
const HF_REPAIR_THRESHOLD = 1.4;
/** Fraction of remaining idle USDC to supply to Aave. */
const SUPPLY_CLIP_RATIO = 0.5;

/**
 * Deterministic, budget-aware Aave rule engine. The AI never authors these — it only
 * explains them downstream. Decisions are ordered by priority and draw from a shared
 * USDC budget so REPAY and SUPPLY never double-spend the same balance.
 */
export function deriveAaveDecisions(state: AdvisorState, cfg: OnchainConfig): TradeDecision[] {
  const usdc = cfg.tokens.USDC;
  const decisions: TradeDecision[] = [];

  // Idle USDC value ≈ token amount (USDC pegged to $1).
  let budgetUsd = state.portfolio?.assets.find((a) => a.symbol === "USDC")?.valueUsd ?? 0;
  const hf = state.portfolio?.lending?.healthFactor;
  const debtUsd = state.portfolio?.lending?.debtUsd ?? 0;

  // Rule 1 (priority 1): low health factor → repay debt with available USDC.
  if (hf !== undefined && hf < HF_REPAIR_THRESHOLD && debtUsd > 0 && budgetUsd > 0) {
    const repayUsd = Math.min(budgetUsd, debtUsd);
    decisions.push(makeAaveDecision(ActionType.REPAY, usdc, repayUsd, cfg, `health factor ${hf} < ${HF_REPAIR_THRESHOLD}; repay $${repayUsd.toFixed(2)} debt`));
    budgetUsd -= repayUsd;
  }

  // Rule 2 (priority 2): remaining idle USDC → supply a clip to earn yield.
  if (budgetUsd > 0) {
    const supplyUsd = budgetUsd * SUPPLY_CLIP_RATIO;
    if (supplyUsd >= 1) {
      decisions.push(makeAaveDecision(ActionType.SUPPLY, usdc, supplyUsd, cfg, `idle USDC; supply $${supplyUsd.toFixed(2)} to Aave for yield`));
    }
  }

  return decisions;
}
