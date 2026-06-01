import type { IDiscoveryEnigne } from "../../discovery-engine/DiscoveryEngine.interface.js";
import type { AdvisorState } from "../state.js";

/**
 * Collects current market context (yields, funding rates, prices, alerts).
 */
export class MarketNode {
  constructor(private readonly discoveryEngine: IDiscoveryEnigne) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    const market = await this.discoveryEngine.collect();
    return { market };
  };
}
