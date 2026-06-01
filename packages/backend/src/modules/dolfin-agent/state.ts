import { Annotation } from "@langchain/langgraph";
import type { MarketContext } from "../discovery-engine/types.js";
import type { RiskLevel, RiskResult } from "../risk-engine/types.js";

export interface PortfolioSnapshot {
  wallet: string;
  totalValueUsd: number;
  assets: { symbol: string; valueUsd: number }[];
  lending?: { collateralUsd: number; debtUsd: number; healthFactor: number };
  leverage?: { sizeUsd: number; collateralUsd: number };
}

export interface RiskReport {
  score: number;
  level: RiskLevel;
  results: RiskResult[];
  recommendations: string[];
}

export interface Action {
  type: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface TransactionPlan {
  to: string;
  value: string;
  data: string;
  description: string;
}

export interface AdvisorState {
  wallet: string;
  portfolio?: PortfolioSnapshot;
  risk?: RiskReport;
  market?: MarketContext;
  actions?: Action[];
  advice?: string;
  txPlan?: TransactionPlan[];
}

/**
 * LangGraph state schema. Each channel uses last-write-wins reducer (default).
 * Nodes return a Partial<AdvisorState>; LangGraph merges it into the running state.
 */
export const AdvisorAnnotation = Annotation.Root({
  wallet: Annotation<string>(),
  portfolio: Annotation<PortfolioSnapshot | undefined>(),
  risk: Annotation<RiskReport | undefined>(),
  market: Annotation<MarketContext | undefined>(),
  actions: Annotation<Action[] | undefined>(),
  advice: Annotation<string | undefined>(),
  txPlan: Annotation<TransactionPlan[] | undefined>(),
});
