import { ActionType, type TradeDecision } from "@dolfin/onchain";
import type { OnchainConfig } from "../config/onchain-config.js";
import { makeAaveDecision } from "./decision-factory.js";
import type { AdvisorState } from "../state.js";

// Target leverage band. The agent drives the Aave health factor into [LOW, HIGH]
// and rebalances toward TARGET whenever it drifts outside the band.
const HF_TARGET = 1.3;
const HF_LOW = 1.2;
const HF_HIGH = 1.4;
// USDC collateral liquidation threshold on Aave (Arbitrum). Only used to size the FIRST
// borrow when there's no debt yet; once debt exists the band math is exact and LT cancels.
const ASSUMED_LT = 0.8;
// Below this, collateral is dust — not worth levering, so pull it out instead.
const MIN_LEVER_USD = 10;
const SUPPLY_CLIP_RATIO = 0.9;
const WITHDRAW_CLIP_RATIO = 0.5;
const MIN_ACTION_USD = 1;

// Deterministic Aave leverage manager. Health factor HF = collateral*LT / debt, so for a
// target HF_t the target debt is debt*(HF/HF_t): borrowing raises debt (lowers HF), repaying
// lowers debt (raises HF). Action ranges are disjoint by (debt, HF) so one run never both
// borrows and repays. ValidationNode + the on-chain PolicyManager still gate every decision.
export function deriveAaveDecisions(state: AdvisorState, cfg: OnchainConfig): TradeDecision[] {
  const usdc = cfg.tokens.USDC;
  const decisions: TradeDecision[] = [];

  // USDC pegged to $1, so value equals amount.
  const walletUsdc = state.portfolio?.assets.find((a) => a.symbol === "USDC")?.valueUsd ?? 0;
  let budgetUsd = walletUsdc;
  const hf = state.portfolio?.lending?.healthFactor;
  const debtUsd = state.portfolio?.lending?.debtUsd ?? 0;
  const collateralUsd = state.portfolio?.lending?.collateralUsd ?? 0;

  if (debtUsd > 0 && hf !== undefined) {
    if (hf > HF_HIGH) {
      // Under-levered: borrow up to the target band (exact, LT-free).
      const borrowUsd = debtUsd * (hf / HF_TARGET - 1);
      if (borrowUsd >= MIN_ACTION_USD) {
        decisions.push(makeAaveDecision(ActionType.BORROW, usdc, borrowUsd, cfg, `HF ${hf.toFixed(2)} > ${HF_HIGH}; borrow $${borrowUsd.toFixed(2)} to target HF ${HF_TARGET}`));
      }
    } else if (hf < HF_LOW) {
      // Over-levered: repay toward target, capped by available USDC.
      const wantRepay = debtUsd * (1 - hf / HF_TARGET);
      const repayUsd = Math.min(wantRepay, budgetUsd, debtUsd);
      if (repayUsd >= MIN_ACTION_USD) {
        decisions.push(makeAaveDecision(ActionType.REPAY, usdc, repayUsd, cfg, `HF ${hf.toFixed(2)} < ${HF_LOW}; repay $${repayUsd.toFixed(2)} to target HF ${HF_TARGET}`));
        budgetUsd -= repayUsd;
      }
    }
    // In-band [LOW, HIGH]: hold the debt position.
  } else if (debtUsd === 0 && collateralUsd >= MIN_LEVER_USD) {
    // No debt yet: open leverage from idle collateral. debt = collateral*LT / HF_target.
    const borrowUsd = (collateralUsd * ASSUMED_LT) / HF_TARGET;
    if (borrowUsd >= MIN_ACTION_USD) {
      decisions.push(makeAaveDecision(ActionType.BORROW, usdc, borrowUsd, cfg, `no debt; borrow $${borrowUsd.toFixed(2)} against $${collateralUsd.toFixed(2)} collateral to target HF ${HF_TARGET}`));
    }
  } else if (debtUsd === 0 && collateralUsd > MIN_ACTION_USD && walletUsdc < MIN_ACTION_USD) {
    // Debt-free dust collateral, no fresh USDC to grow it: pull it out.
    const withdrawUsd = collateralUsd * WITHDRAW_CLIP_RATIO;
    if (withdrawUsd >= MIN_ACTION_USD) {
      decisions.push(makeAaveDecision(ActionType.WITHDRAW, usdc, withdrawUsd, cfg, `debt-free dust collateral; withdraw $${withdrawUsd.toFixed(2)}`));
    }
  }

  // Deploy any remaining idle USDC as collateral to grow the leverage base.
  if (budgetUsd > 0) {
    const supplyUsd = budgetUsd * SUPPLY_CLIP_RATIO;
    if (supplyUsd >= MIN_ACTION_USD) {
      decisions.push(makeAaveDecision(ActionType.SUPPLY, usdc, supplyUsd, cfg, `idle USDC; supply $${supplyUsd.toFixed(2)} to Aave as collateral`));
    }
  }

  return decisions;
}
