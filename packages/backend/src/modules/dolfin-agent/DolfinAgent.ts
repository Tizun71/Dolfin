import { END, START, StateGraph } from "@langchain/langgraph";
import type { IPortfolioEngine } from "../portfolio-engine/PortfolioEngine.interface.js";
import type { IRiskEngine } from "../risk-engine/RiskEngine.interface.js";
import type { IDiscoveryEnigne } from "../discovery-engine/DiscoveryEngine.interface.js";
import { AdvisorAnnotation, type AdvisorState } from "./state.js";
import { PortfolioNode } from "./nodes/PortfolioNode.js";
import { RiskNode } from "./nodes/RiskNode.js";
import { MarketNode } from "./nodes/MarketNode.js";
import { AdvisorNode } from "./nodes/AdvisorNode.js";

export interface DolfinAgentDeps {
  portfolioEngine: IPortfolioEngine;
  riskEngine: IRiskEngine;
  discoveryEngine: IDiscoveryEnigne;
}

/**
 * Orchestrates the advisor pipeline as a LangGraph state machine:
 *
 *   START -> portfolio -> risk -> market -> advisor -> END
 *
 * Each node reads the shared AdvisorState and returns a partial update that
 * LangGraph merges back in before the next node runs.
 */
export class DolfinAgent {
  private readonly graph;

  constructor(deps: DolfinAgentDeps) {
    const portfolio = new PortfolioNode(deps.portfolioEngine);
    const risk = new RiskNode(deps.riskEngine);
    const market = new MarketNode(deps.discoveryEngine);
    const advisor = new AdvisorNode();

    this.graph = new StateGraph(AdvisorAnnotation)
      .addNode("portfolio", portfolio.execute)
      .addNode("risk", risk.execute)
      .addNode("market", market.execute)
      .addNode("advisor", advisor.execute)
      .addEdge(START, "portfolio")
      .addEdge("portfolio", "risk")
      .addEdge("risk", "market")
      .addEdge("market", "advisor")
      .addEdge("advisor", END)
      .compile();
  }

  /** Run the full advisory pipeline for a wallet and return the final state. */
  async run(wallet: string): Promise<AdvisorState> {
    return this.graph.invoke({ wallet });
  }
}
