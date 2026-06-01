import { Annotation } from "@langchain/langgraph";
import type { AdapterCall, TradeDecision } from "@dolfin/onchain";
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

/** A strategy-proposed decision that failed the client-side policy filter. */
export interface RejectedDecision {
  decision: TradeDecision;
  errors: string[];
}

export interface AdvisorState {
  wallet: string;
  portfolio?: PortfolioSnapshot;
  risk?: RiskReport;
  market?: MarketContext;
  /** Rule-engine output (Strategy node). The AI never authors these. */
  decisions?: TradeDecision[];
  /** Decisions that passed the client-side policy mirror (Validation node). */
  validDecisions?: TradeDecision[];
  /** Decisions dropped before gas, with reasons (Validation node). */
  rejected?: RejectedDecision[];
  /** Encoded adapter calls ready for executeAction (Planner node). */
  calls?: AdapterCall[];
  /** userOpHashes returned by the bundler (Executor node). */
  userOpHashes?: string[];
  /** Human-readable narration (Advisor / Claude node, explain-only). */
  advice?: string;
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
  decisions: Annotation<TradeDecision[] | undefined>(),
  validDecisions: Annotation<TradeDecision[] | undefined>(),
  rejected: Annotation<RejectedDecision[] | undefined>(),
  calls: Annotation<AdapterCall[] | undefined>(),
  userOpHashes: Annotation<string[] | undefined>(),
  advice: Annotation<string | undefined>(),
});
