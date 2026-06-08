import type { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { OnchainConfig } from "../config/onchain-config.js";
import { deriveAaveDecisions } from "../strategy/aave-rules.js";
import { deriveAiDecisions } from "../strategy/ai-strategy.js";
import type { AdvisorState } from "../state.js";

/**
 * Strategy node. Rules run first (deterministic, priority-ordered); then the AI proposes
 * additional Aave actions on top. Both streams are re-checked by the ValidationNode against
 * the policy mirror, and the on-chain PolicyManager remains authoritative. AI failure is
 * non-fatal — the rule decisions still drive the pipeline.
 */
export class StrategyNode {
  constructor(
    private readonly cfg: OnchainConfig,
    private readonly model?: ChatGoogleGenerativeAI,
  ) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    const ruleDecisions = deriveAaveDecisions(state, this.cfg);
    const aiDecisions = await deriveAiDecisions(state, this.cfg, ruleDecisions, this.model);
    return { decisions: [...ruleDecisions, ...aiDecisions] };
  };
}
