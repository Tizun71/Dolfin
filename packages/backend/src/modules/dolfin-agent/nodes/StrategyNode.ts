import type { OnchainConfig } from "../config/onchain-config.js";
import { deriveAaveDecisions } from "../strategy/aave-rules.js";
import type { AdvisorState } from "../state.js";

/**
 * Rule engine node. Emits TradeDecisions from portfolio + risk + market.
 * Pure and deterministic — the AI never authors actions here.
 */
export class StrategyNode {
  constructor(private readonly cfg: OnchainConfig) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    return { decisions: deriveAaveDecisions(state, this.cfg) };
  };
}
