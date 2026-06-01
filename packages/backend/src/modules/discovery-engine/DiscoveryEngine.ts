import type { IDiscoveryEnigne } from "./DiscoveryEngine.interface.js";
import type { MarketContext } from "./types.js";

/**
 * Aggregates market signals (yields, funding rates, prices, alerts) into a
 * single MarketContext. Sources are wired in incrementally; until a source is
 * connected its channel stays empty rather than fabricated.
 */
export class DiscoveryEngine implements IDiscoveryEnigne {
  //TODO: Research Dune to get market data (yields, funding rates, token prices, protocol metrics) and alerts (liquidations, large trades, volatility spikes)
  collect(): MarketContext {
    return {
      timestamp: Date.now(),
      yields: [],
      fundingRates: [],
      tokenPrices: [],
      protocolMetrics: [],
      alerts: [],
    };
  }
}
