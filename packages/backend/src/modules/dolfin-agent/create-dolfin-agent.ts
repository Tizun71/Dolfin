import { ChainId } from "../../configs/chain.js";
import { PortfolioEngine } from "../portfolio-engine/PortfolioEngine.js";
import { RiskEngineImplement } from "../risk-engine/RiskEngine.js";
import { LendingRiskAnalyzer } from "../risk-engine/analyzer/lending-risk.js";
import { DiscoveryEngine } from "../discovery-engine/DiscoveryEngine.js";
import { loadOnchainConfig } from "./config/onchain-config.js";
import { DolfinAgent } from "./DolfinAgent.js";

export function createDolfinAgent(): DolfinAgent {
  const onchain = loadOnchainConfig();

  const portfolioEngine = new PortfolioEngine(ChainId.ARBITRUM_SEPOLIA, Object.values(onchain.tokens));
  const riskEngine = new RiskEngineImplement([new LendingRiskAnalyzer()]);
  const discoveryEngine = new DiscoveryEngine();

  return new DolfinAgent({ portfolioEngine, riskEngine, discoveryEngine, onchain });
}
