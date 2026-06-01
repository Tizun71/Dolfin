import type { IDiscoveryEnigne } from "./DiscoveryEngine.interface.js";
import type { MarketContext } from "./types.js";
import { getArbitrumSepoliaMarketData } from "../aave/services.js";

type AaveReserve = Awaited<ReturnType<typeof getArbitrumSepoliaMarketData>>["reserves"][number];

function parsePercent(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getReserveRiskScore(reserve: AaveReserve): number {
  const borrowInfo = reserve.borrowInfo;
  const utilization = borrowInfo ? parsePercent(borrowInfo.utilizationRate) : 0;
  const pausedPenalty = reserve.isPaused ? 25 : 0;
  const frozenPenalty = reserve.isFrozen ? 20 : 0;
  const capPenalty = borrowInfo?.borrowCapReached ? 20 : 0;

  return Math.min(
    100,
    Math.max(0, Math.round(utilization / 2 + pausedPenalty + frozenPenalty + capPenalty)),
  );
}

/**
 * Alternative discovery engine backed by Aave market data.
 * This keeps the Dune collector separate while providing a live Aave-only context.
 */
export class AaveDiscoveryEngine implements IDiscoveryEnigne {
  async collect(): Promise<MarketContext> {
    const marketData = await getArbitrumSepoliaMarketData();

    const yields = marketData.reserves
      .map((reserve) => ({
        protocol: marketData.name,
        asset: reserve.underlyingToken.symbol,
        apy: parsePercent(reserve.supplyInfo.apy),
      }))
      .filter((entry) => entry.apy > 0);

    const fundingRates = marketData.reserves
      .filter((reserve) => reserve.borrowInfo !== null)
      .map((reserve) => ({
        market: `${marketData.name}:${reserve.underlyingToken.symbol}`,
        rate: parsePercent(reserve.borrowInfo?.apy),
      }))
      .filter((entry) => entry.rate > 0);

    const tokenPrices = marketData.reserves
      .map((reserve) => ({
        symbol: reserve.underlyingToken.symbol,
        price: Number(reserve.usdExchangeRate ?? 0),
        change24h: 0,
      }))
      .filter((entry) => Number.isFinite(entry.price) && entry.price > 0);

    const protocolMetrics = marketData.reserves.map((reserve) => ({
      protocol: `${marketData.name}:${reserve.underlyingToken.symbol}`,
      tvlUsd: Number(reserve.size ?? 0),
      volume24h: Number(reserve.borrowInfo?.availableLiquidity ?? 0),
      riskScore: getReserveRiskScore(reserve),
    }));

    const alerts = marketData.reserves.flatMap((reserve) => {
      const reserveAlerts: MarketContext["alerts"] = [];

      if (reserve.isPaused) {
        reserveAlerts.push({
          severity: "HIGH",
          message: `${reserve.underlyingToken.symbol} on Aave is paused`,
        });
      }

      if (reserve.isFrozen) {
        reserveAlerts.push({
          severity: "MEDIUM",
          message: `${reserve.underlyingToken.symbol} on Aave is frozen`,
        });
      }

      if (reserve.borrowInfo?.borrowCapReached) {
        reserveAlerts.push({
          severity: "MEDIUM",
          message: `${reserve.underlyingToken.symbol} borrow cap reached`,
        });
      }

      return reserveAlerts;
    });

    return {
      timestamp: Date.now(),
      yields,
      fundingRates,
      tokenPrices,
      protocolMetrics,
      alerts,
    };
  }
}
