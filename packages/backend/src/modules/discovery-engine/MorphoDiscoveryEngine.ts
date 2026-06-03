import type { IDiscoveryEnigne } from "./DiscoveryEngine.interface.js";
import type {
  MarketContext,
  MarketAlert,
  YieldOpportunity,
  FundingRate,
  TokenPrice,
  ProtocolMetric,
} from "./types.js";

// ─── GraphQL Response Types ─────────────────────────────────────────────────────

interface MorphoAsset {
  symbol: string;
  address: string;
  decimals: number;
  price?: { usd: number };
  yield?: { apr: number };
}

interface MorphoMarketState {
  supplyApy: number;
  borrowApy: number;
  avgBorrowApy: number;
  avgSupplyApy: number;
  supplyAssetsUsd: number;
  borrowAssetsUsd: number;
  utilization: number;
}

interface MorphoMarketWarning {
  type: string;
  level: "YELLOW" | "RED";
}

interface MorphoMarket {
  marketId: string;
  loanAsset: MorphoAsset;
  collateralAsset?: MorphoAsset;
  state: MorphoMarketState;
  warnings?: MorphoMarketWarning[];
}

interface MorphoVault {
  address: string;
  name: string;
  symbol: string;
  asset: MorphoAsset;
  totalAssetsUsd: number;
  apy: number;
  netApy: number;
  warnings?: { type: string; level: "YELLOW" | "RED" }[];
}

// ─── GraphQL Queries ────────────────────────────────────────────────────────────

const MARKETS_QUERY = `
  query GetMarketsContext {
    markets(
      first: 50
      orderBy: SupplyAssetsUsd
      orderDirection: Desc
      where: { chainId_in: [42161] }
    ) {
      items {
        marketId
        loanAsset {
          symbol
          address
          decimals
          price { usd }
        }
        collateralAsset {
          symbol
          address
          decimals
          price { usd }
        }
        state {
          supplyApy
          borrowApy
          avgBorrowApy
          avgSupplyApy
          supplyAssetsUsd
          borrowAssetsUsd
          utilization
        }
        warnings {
          type
          level
        }
      }
    }
  }
`;

const VAULTS_QUERY = `
  query GetVaultsContext {
    vaultV2s(
      first: 50
      orderBy: TotalAssetsUsd
      orderDirection: Desc
      where: { chainId_in: [42161] }
    ) {
      items {
        address
        name
        symbol
        asset {
          symbol
          address
          price { usd }
          yield { apr }
        }
        totalAssetsUsd
        apy
        netApy
        warnings {
          type
          level
        }
      }
    }
  }
`;

const ASSETS_QUERY = `
  query GetAssetsPrice {
    assets(
      where: {
        symbol_in: ["WETH", "USDC", "USDT", "wstETH", "cbETH", "rETH", "DAI", "WBTC"]
        chainId_in: [42161]
      }
    ) {
      items {
        symbol
        address
        price { usd }
        yield { apr }
      }
    }
  }
`;

// ─── API Client ─────────────────────────────────────────────────────────────────

const MORPHO_API_URL = "https://api.morpho.org/graphql";

async function morphoQuery<T>(query: string): Promise<T> {
  const response = await fetch(MORPHO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Morpho API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  return json.data as T;
}

// ─── Transformers ───────────────────────────────────────────────────────────────

/**
 * Map warning level from Morpho API → MarketAlert severity
 */
function mapWarningLevel(level: "YELLOW" | "RED"): MarketAlert["severity"] {
  return level === "RED" ? "HIGH" : "MEDIUM";
}

/**
 * Compute a simple risk score (0–10) from market utilization.
 * High utilization → higher risk of liquidity issues.
 */
function utilToRiskScore(utilization: number): number {
  // utilization is 0–1 from the API
  return Math.min(10, Math.round(utilization * 10 * 10) / 10);
}

/**
 * Build YieldOpportunity[] from markets (supply APY) and vaults (net APY).
 */
function buildYields(markets: MorphoMarket[], vaults: MorphoVault[]): YieldOpportunity[] {
  const yields: YieldOpportunity[] = [];

  // From markets: supply APY per loan asset
  for (const market of markets) {
    if (market.state.supplyApy > 0) {
      yields.push({
        protocol: "Morpho Blue",
        asset: market.loanAsset.symbol,
        apy: parseFloat((market.state.supplyApy * 100).toFixed(4)),
      });
    }
  }

  // From vaults: net APY per vault asset
  for (const vault of vaults) {
    if (vault.netApy > 0) {
      yields.push({
        protocol: `Morpho Vault (${vault.name})`,
        asset: vault.asset.symbol,
        apy: parseFloat((vault.netApy * 100).toFixed(4)),
      });
    }
  }

  // Deduplicate: keep highest APY per (protocol-type, asset)
  const seen = new Map<string, YieldOpportunity>();
  for (const y of yields) {
    const key = `${y.protocol.split(" ")[0]}__${y.asset}`;
    if (!seen.has(key) || seen.get(key)!.apy < y.apy) {
      seen.set(key, y);
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.apy - a.apy);
}

/**
 * Build FundingRate[] from markets (borrow APY = cost of borrowing = funding rate).
 */
function buildFundingRates(markets: MorphoMarket[]): FundingRate[] {
  return markets
    .filter((m) => m.state.borrowApy > 0)
    .map((m) => {
      const collateral = m.collateralAsset?.symbol ?? "—";
      return {
        market: `${m.loanAsset.symbol}/${collateral}`,
        rate: parseFloat((m.state.borrowApy * 100).toFixed(4)),
      };
    })
    .sort((a, b) => b.rate - a.rate);
}

/**
 * Build TokenPrice[] from assets with price data.
 * NOTE: Morpho API does not provide 24h price change natively,
 * so change24h is set to 0. You can enrich this from CoinGecko
 * or another price feed if needed.
 */
function buildTokenPrices(markets: MorphoMarket[]): TokenPrice[] {
  const priceMap = new Map<string, number>();

  for (const market of markets) {
    const { loanAsset, collateralAsset } = market;
    if (loanAsset.price?.usd && !priceMap.has(loanAsset.symbol)) {
      priceMap.set(loanAsset.symbol, loanAsset.price.usd);
    }
    if (collateralAsset?.price?.usd && !priceMap.has(collateralAsset.symbol)) {
      priceMap.set(collateralAsset.symbol, collateralAsset.price.usd);
    }
  }

  return Array.from(priceMap.entries()).map(([symbol, price]) => ({
    symbol,
    price,
    change24h: 0, // Morpho API does not expose 24h change — enrich externally if needed
  }));
}

/**
 * Build ProtocolMetric[] aggregated per chain/protocol from markets.
 *
 * Risk score: average utilization across markets, scaled 0–10.
 */
function buildProtocolMetrics(markets: MorphoMarket[], vaults: MorphoVault[]): ProtocolMetric[] {
  // Aggregate totals across all Morpho Blue markets
  let totalTvlMarkets = 0;
  let totalBorrowVolume = 0;
  let totalUtilization = 0;

  for (const m of markets) {
    totalTvlMarkets += m.state.supplyAssetsUsd ?? 0;
    totalBorrowVolume += m.state.borrowAssetsUsd ?? 0;
    totalUtilization += m.state.utilization ?? 0;
  }

  const avgUtilization = markets.length ? totalUtilization / markets.length : 0;

  const blueMetric: ProtocolMetric = {
    protocol: "Morpho Blue",
    tvlUsd: totalTvlMarkets,
    volume24h: totalBorrowVolume, // borrow volume as proxy for 24h activity
    riskScore: utilToRiskScore(avgUtilization),
  };

  // Aggregate totals across all Morpho Vaults
  let totalTvlVaults = 0;
  for (const v of vaults) {
    totalTvlVaults += v.totalAssetsUsd ?? 0;
  }

  const vaultMetric: ProtocolMetric = {
    protocol: "Morpho Vaults",
    tvlUsd: totalTvlVaults,
    volume24h: 0, // vault deposit/withdraw volume not available in this query
    riskScore: 2, // vaults are curator-managed and generally lower-risk
  };

  return [blueMetric, vaultMetric];
}

/**
 * Build MarketAlert[] from market and vault warnings.
 */
function buildAlerts(markets: MorphoMarket[], vaults: MorphoVault[]): MarketAlert[] {
  const alerts: MarketAlert[] = [];

  for (const market of markets) {
    for (const warning of market.warnings ?? []) {
      alerts.push({
        severity: mapWarningLevel(warning.level),
        message: `Market ${market.loanAsset.symbol}/${market.collateralAsset?.symbol ?? "—"} (${market.marketId.slice(0, 8)}…): ${warning.type}`,
      });
    }

    // High utilization alert
    if (market.state.utilization >= 0.95) {
      alerts.push({
        severity: "HIGH",
        message: `Market ${market.loanAsset.symbol}/${market.collateralAsset?.symbol ?? "—"} utilization is critically high (${(market.state.utilization * 100).toFixed(1)}%)`,
      });
    } else if (market.state.utilization >= 0.85) {
      alerts.push({
        severity: "MEDIUM",
        message: `Market ${market.loanAsset.symbol}/${market.collateralAsset?.symbol ?? "—"} utilization is high (${(market.state.utilization * 100).toFixed(1)}%)`,
      });
    }
  }

  for (const vault of vaults) {
    for (const warning of vault.warnings ?? []) {
      alerts.push({
        severity: mapWarningLevel(warning.level),
        message: `Vault ${vault.name} (${vault.address.slice(0, 8)}…): ${warning.type}`,
      });
    }
  }

  // Sort: HIGH first, then MEDIUM, then LOW
  const order: Record<MarketAlert["severity"], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

// ─── Main Fetcher ───────────────────────────────────────────────────────────────

/**
 * Fetches all required data from Morpho API and returns a populated MarketContext.
 *
 * @example
 * ```ts
 * import { fetchMorphoMarketContext } from "./morpho-market-context";
 *
 * const ctx = await fetchMorphoMarketContext();
 * console.log(ctx.yields[0]); // { protocol: "Morpho Blue", asset: "USDC", apy: 4.23 }
 * ```
 */
export async function fetchMorphoMarketContext(): Promise<MarketContext> {
  // Run market + vault queries in parallel for efficiency
  const [marketsData, vaultsData] = await Promise.all([
    morphoQuery<{ markets: { items: MorphoMarket[] } }>(MARKETS_QUERY),
    morphoQuery<{ vaultV2s: { items: MorphoVault[] } }>(VAULTS_QUERY),
  ]);

  const markets = marketsData.markets.items;
  const vaults = vaultsData.vaultV2s.items;

  return {
    timestamp: Math.floor(Date.now() / 1000),
    yields: buildYields(markets, vaults),
    fundingRates: buildFundingRates(markets),
    tokenPrices: buildTokenPrices(markets),
    protocolMetrics: buildProtocolMetrics(markets, vaults),
    alerts: buildAlerts(markets, vaults),
  };
}

export class MorphoDiscoveryEngine implements IDiscoveryEnigne {
  async collect(): Promise<MarketContext> {
    return fetchMorphoMarketContext();
  }
}
