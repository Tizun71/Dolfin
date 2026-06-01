import type { RiskContext } from "./types.js";

export interface IRiskEngine {
    analyze(context: RiskContext): any;
}