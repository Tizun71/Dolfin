import type { IRiskAnalyzer } from "./RiskAnalyzer.interface.js";
import type { IRiskEngine } from "./RiskEngine.interface.js";
import { RiskLevel, type RiskContext, type RiskResult } from "./types.js";

class RiskEngineImplement implements IRiskEngine {
  constructor(private readonly analyzers: IRiskAnalyzer[]) {}

  async analyze(context: RiskContext) {
    const results = await this.analyzers.map((analyzer) =>
      analyzer.analyze(context),
    );

    const score = this.aggregateScore(results);

    return {
      score,
      level: this.getRiskLevel(score),
      results,
      recommendations: this.collectRecommendations(results),
    };
  }

  private aggregateScore(results: RiskResult[]) {
    const total = results.reduce((acc, item) => acc + item.score, 0);

    return Math.round(total / results.length);
  }

  private collectRecommendations(results: RiskResult[]) {
    return results.flatMap((x) => x.recommendations);
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL;

    if (score >= 60) return RiskLevel.HIGH;

    if (score >= 30) return RiskLevel.MEDIUM;

    return RiskLevel.LOW;
  }
}
