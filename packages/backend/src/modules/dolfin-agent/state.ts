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

// A decision that failed the client-side policy filter.
export interface RejectedDecision {
  decision: TradeDecision;
  errors: string[];
}

export interface AdvisorState {
  wallet: string;
  portfolio?: PortfolioSnapshot;
  risk?: RiskReport;
  market?: MarketContext;
  // Strategy node output.
  decisions?: TradeDecision[];
  // Decisions that passed the policy mirror (Validation node).
  validDecisions?: TradeDecision[];
  // Decisions dropped before gas, with reasons (Validation node).
  rejected?: RejectedDecision[];
  // Encoded adapter calls (Planner node).
  calls?: AdapterCall[];
  // userOpHashes from the bundler (Executor node).
  userOpHashes?: string[];
  // Tx hashes mined per userOp (Receipt node, parallel to userOpHashes).
  transactions?: `0x${string}`[];
  // Narration (Advisor node, explain-only).
  advice?: string;
}

// LangGraph schema. Channels use the default last-write-wins reducer; nodes return a
// Partial<AdvisorState> that LangGraph merges into the running state.
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
  transactions: Annotation<`0x${string}`[] | undefined>(),
  advice: Annotation<string | undefined>(),
});
