import type { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { OnchainConfig } from "../config/onchain-config.js";
import { deriveAaveDecisions } from "../strategy/aave-rules.js";
import { deriveAiDecisions } from "../strategy/ai-strategy.js";
import type { AdvisorState } from "../state.js";

// Rules run first, then the AI proposes extra actions on top. Both streams are
// re-checked downstream; AI failure is non-fatal.
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
