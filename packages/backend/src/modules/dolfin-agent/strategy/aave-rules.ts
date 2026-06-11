import { ActionType, type TradeDecision } from "@dolfin/onchain";
import type { OnchainConfig } from "../config/onchain-config.js";
import { makeAaveDecision } from "./decision-factory.js";
import type { AdvisorState } from "../state.js";

const HF_REPAIR_THRESHOLD = 2.0;
const SUPPLY_CLIP_RATIO = 0.9;

// Priority-ordered rules share one USDC budget so repay and supply never
// double-spend the same balance.
export function deriveAaveDecisions(state: AdvisorState, cfg: OnchainConfig): TradeDecision[] {
  const usdc = cfg.tokens.USDC;
  const decisions: TradeDecision[] = [];

  // USDC pegged to $1, so value equals amount.
  let budgetUsd = state.portfolio?.assets.find((a) => a.symbol === "USDC")?.valueUsd ?? 0;
  const hf = state.portfolio?.lending?.healthFactor;
  const debtUsd = state.portfolio?.lending?.debtUsd ?? 0;

  // Low health factor: repay debt with available USDC.
  if (hf !== undefined && hf < HF_REPAIR_THRESHOLD && debtUsd > 0 && budgetUsd > 0) {
    const repayUsd = Math.min(budgetUsd, debtUsd);
    decisions.push(makeAaveDecision(ActionType.REPAY, usdc, repayUsd, cfg, `health factor ${hf} < ${HF_REPAIR_THRESHOLD}; repay $${repayUsd.toFixed(2)} debt`));
    budgetUsd -= repayUsd;
  }

  // Supply a clip of the remaining idle USDC for yield.
  if (budgetUsd > 0) {
    const supplyUsd = budgetUsd * SUPPLY_CLIP_RATIO;
    if (supplyUsd >= 1) {
      decisions.push(makeAaveDecision(ActionType.SUPPLY, usdc, supplyUsd, cfg, `idle USDC; supply $${supplyUsd.toFixed(2)} to Aave for yield`));
    }
  }

  return decisions;
}
