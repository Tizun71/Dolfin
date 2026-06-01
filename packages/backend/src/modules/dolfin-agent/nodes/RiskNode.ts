import type { IRiskEngine } from "../../risk-engine/RiskEngine.interface.js";
import type { RiskContext } from "../../risk-engine/types.js";
import type { AdvisorState, RiskReport } from "../state.js";

/**
 * Scores portfolio risk by feeding the snapshot into the risk engine analyzers.
 */
export class RiskNode {
  constructor(private readonly riskEngine: IRiskEngine) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    if (!state.portfolio) {
      throw new Error("RiskNode requires portfolio snapshot in state");
    }

    const context: RiskContext = {
      wallet: state.portfolio.wallet,
      portfolio: {
        totalValueUsd: state.portfolio.totalValueUsd,
        assets: state.portfolio.assets,
      },
      lending: state.portfolio.lending,
      leverage: state.portfolio.leverage,
    };

    const risk = (await this.riskEngine.analyze(context)) as RiskReport;

    return { risk };
  };
}
