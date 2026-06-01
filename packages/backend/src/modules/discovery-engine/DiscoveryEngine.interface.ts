import type { MarketContext } from "./types.js";

export interface IDiscoveryEnigne {
    collect(): Promise<MarketContext>;
}