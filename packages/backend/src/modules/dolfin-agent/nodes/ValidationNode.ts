import { checkAgainstPolicy } from "@dolfin/onchain";
import type { OnchainConfig } from "../config/onchain-config.js";
import type { AdvisorState, RejectedDecision } from "../state.js";

// Client-side policy filter. Drops invalid decisions before they cost gas; the
// on-chain PolicyManager stays authoritative.
export class ValidationNode {
  constructor(private readonly cfg: OnchainConfig) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    const prices = this.buildPrices();
    const validDecisions = [];
    const rejected: RejectedDecision[] = [];

    for (const decision of state.decisions ?? []) {
      const decimals = this.decimalsFor(decision.tokenIn);
      const errors = checkAgainstPolicy(decision, this.cfg.userPolicy, prices, decimals);
      if (errors.length > 0) rejected.push({ decision, errors });
      else validDecisions.push(decision);
    }

    return { validDecisions, rejected };
  };

  private buildPrices(): Record<string, number> {
    const prices: Record<string, number> = {};
    for (const t of Object.values(this.cfg.tokens)) prices[t.address] = t.priceUsd;
    return prices;
  }

  private decimalsFor(address: string): number {
    return Object.values(this.cfg.tokens).find((t) => t.address === address)?.decimals ?? 18;
  }
}
