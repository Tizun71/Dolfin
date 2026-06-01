import { END, START, StateGraph } from "@langchain/langgraph";
import type { IPortfolioEngine } from "../portfolio-engine/PortfolioEngine.interface.js";
import type { IRiskEngine } from "../risk-engine/RiskEngine.interface.js";
import type { IDiscoveryEnigne } from "../discovery-engine/DiscoveryEngine.interface.js";
import { AdvisorAnnotation, type AdvisorState } from "./state.js";
import type { OnchainConfig } from "./config/onchain-config.js";
import { PortfolioNode } from "./nodes/PortfolioNode.js";
import { RiskNode } from "./nodes/RiskNode.js";
import { MarketNode } from "./nodes/MarketNode.js";
import { StrategyNode } from "./nodes/StrategyNode.js";
import { ValidationNode } from "./nodes/ValidationNode.js";
import { PlannerNode } from "./nodes/PlannerNode.js";
import { ExecutorNode } from "./nodes/ExecutorNode.js";
import { ReceiptNode } from "./nodes/ReceiptNode.js";
import { AdvisorNode } from "./nodes/AdvisorNode.js";

export interface DolfinAgentDeps {
  portfolioEngine: IPortfolioEngine;
  riskEngine: IRiskEngine;
  discoveryEngine: IDiscoveryEnigne;
  onchain: OnchainConfig;
}

/**
 * Orchestrates the advisor pipeline as a LangGraph state machine:
 *
 *   START -> portfolio -> risk -> market -> strategy -> validation
 *         -> (has valid decisions?) -> planner -> executor -> receipt -> advisor -> END
 *         -> (none)                 ----------------------------------> advisor -> END
 *
 * Strategy/Validation/Planner/Executor are pure code; the AI (advisor) only explains the
 * outcome. Execution is autonomous and bounded by the on-chain PolicyManager.
 */
export class DolfinAgent {
  private readonly graph;

  constructor(deps: DolfinAgentDeps) {
    const portfolio = new PortfolioNode(deps.portfolioEngine);
    const risk = new RiskNode(deps.riskEngine);
    const market = new MarketNode(deps.discoveryEngine);
    const strategy = new StrategyNode(deps.onchain);
    const validation = new ValidationNode(deps.onchain);
    const planner = new PlannerNode();
    const executor = new ExecutorNode(deps.onchain);
    const receipt = new ReceiptNode(deps.onchain);
    const advisor = new AdvisorNode();

    this.graph = new StateGraph(AdvisorAnnotation)
      .addNode("portfolio", portfolio.execute)
      .addNode("risk", risk.execute)
      .addNode("market", market.execute)
      .addNode("strategy", strategy.execute)
      .addNode("validation", validation.execute)
      .addNode("planner", planner.execute)
      .addNode("executor", executor.execute)
      .addNode("receipt", receipt.execute)
      .addNode("advisor", advisor.execute)
      .addEdge(START, "portfolio")
      .addEdge("portfolio", "risk")
      .addEdge("risk", "market")
      .addEdge("market", "strategy")
      .addEdge("strategy", "validation")
      .addConditionalEdges("validation", hasValidDecisions, {
        planner: "planner",
        advisor: "advisor",
      })
      .addEdge("planner", "executor")
      .addEdge("executor", "receipt")
      .addEdge("receipt", "advisor")
      .addEdge("advisor", END)
      .compile();
  }

  /** Run the full advisory pipeline for a wallet and return the final state. */
  async run(wallet: string): Promise<AdvisorState> {
    return this.graph.invoke({ wallet });
  }
}

/** Route after validation: execute only when there is something within policy to do. */
function hasValidDecisions(state: AdvisorState): "planner" | "advisor" {
  return (state.validDecisions?.length ?? 0) > 0 ? "planner" : "advisor";
}
