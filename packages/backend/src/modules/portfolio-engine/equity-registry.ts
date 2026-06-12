import type { Address } from "viem";
import type { PortfolioToken } from "./PortfolioEngine.js";

// Tokenized-stock tokens on Robinhood Chain testnet, read from ROBINHOOD_STOCK_TOKENS as a
// JSON array: [{"symbol":"TSLA","address":"0x...","decimals":18,"chainlinkFeed":"0x..."}].
// Keeping them in env avoids a code change for testnet addresses. Returns [] when unset/invalid.
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
      // No $1 peg for equities; default to 0 so an unpriced token reads as $0. Set
      // chainlinkFeed for a live price.
      priceUsd: t.priceUsd ?? 0,
      chainlinkFeed: t.chainlinkFeed as Address | undefined,
    }));
  } catch {
    return [];
  }
}
