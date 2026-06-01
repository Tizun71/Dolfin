import type { RiskContext, RiskResult } from "./types.js";

export interface IRiskAnalyzer {
    analyze(context: RiskContext) : RiskResult
}