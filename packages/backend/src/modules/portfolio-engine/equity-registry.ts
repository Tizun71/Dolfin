import type { Address } from "viem";
import type { PortfolioToken } from "./PortfolioEngine.js";

/**
 * Tokenized-stock tokens on Robinhood Chain testnet that we read balances for.
 *
 * Addresses are NOT hard-coded: they come from the env var ROBINHOOD_STOCK_TOKENS,
 * a JSON array like:
 *   [{"symbol":"TSLA","address":"0x...","decimals":18,"chainlinkFeed":"0x..."}]
 * This keeps the read path real while letting us fill the (testnet-only, not yet
 * verified) token addresses without a code change. Returns [] when unset/invalid.
 */
export function loadEquityRegistry(): PortfolioToken[] {
  const raw = process.env.ROBINHOOD_STOCK_TOKENS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{
      symbol: string;
      address: string;
      decimals: number;
      priceUsd?: number;
      chainlinkFeed?: string;
    }>;
    return parsed.map((t) => ({
      symbol: t.symbol,
      address: t.address as Address,
      decimals: t.decimals,
      // Equities have no $1 peg; default to 0 so an unpriced token reads as $0
      // rather than a wrong value. Set chainlinkFeed for a live price.
      priceUsd: t.priceUsd ?? 0,
      chainlinkFeed: t.chainlinkFeed as Address | undefined,
    }));
  } catch {
    return [];
  }
}
