import type { IRiskAnalyzer } from "../RiskAnalyzer.interface.js";
import { RiskLevel, type RiskContext, type RiskResult } from "../types.js";

export class LendingRiskAnalyzer implements IRiskAnalyzer {
  analyze(context: RiskContext): RiskResult {
    const lending = context.lending;

    if (!lending) {
      return {
        category: "LENDING",
        score: 0,
        level: RiskLevel.LOW,
        reasons: [],
        recommendations: [],
      };
    }

    let score = 0;

    const reasons: string[] = [];

    const recommendations: string[] = [];

    if (lending.healthFactor < 1.2) {
      score = 95;

      reasons.push("Health factor dangerously low");

      recommendations.push("Repay debt immediately");
    } else if (lending.healthFactor < 1.5) {
      score = 70;

      reasons.push("Health factor approaching liquidation");

      recommendations.push("Increase collateral");
    }

    return {
      category: "LENDING",
      score,
      level: this.getLevel(score),
      reasons,
      recommendations,
    };
  }

  private getLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL;

    if (score >= 60) return RiskLevel.HIGH;

    if (score >= 30) return RiskLevel.MEDIUM;

    return RiskLevel.LOW;
  }
}
