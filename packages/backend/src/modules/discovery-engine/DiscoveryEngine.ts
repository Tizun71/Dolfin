import { DuneClient, ExecutionState } from "@duneanalytics/client-sdk";
import type { IDiscoveryEnigne } from "./DiscoveryEngine.interface.js";
import type { MarketContext } from "./types.js";

const PRICE_SYMBOLS = ["ETH", "WETH", "USDC", "USDT", "DAI", "ARB", "GMX", "BTC"] as const;
const DUNE_CHAIN = "sepolia";
const DUNE_RATE_SCALE = 1e18;
const DUNE_PERFORMANCE_TIERS = ["small", "medium", "large"] as const;

type DuneRow = Record<string, unknown>;

/**
 * Aggregates market signals (yields, funding rates, prices, alerts) into a
 * single MarketContext. Sources are wired in incrementally; until a source is
 * connected its channel stays empty rather than fabricated.
 */
export class DiscoveryEngine implements IDiscoveryEnigne {
  private readonly duneClient: DuneClient | null;

  constructor() {
    const apiKey = process.env.DUNE_API_KEY;
    this.duneClient = apiKey ? new DuneClient(apiKey) : null;
  }

  async collect(): Promise<MarketContext> {
    if (!this.duneClient) {
      return {
        timestamp: Date.now(),
        yields: [],
        fundingRates: [],
        tokenPrices: [],
        protocolMetrics: [],
        alerts: [],
      };
    }

    const priceRows = await this.fetchRows(this.buildPriceQuery());
    const yieldRows = await this.fetchRows(this.buildYieldQuery());
    const fundingRows = await this.fetchRows(this.buildFundingQuery());
    const protocolRows = await this.fetchRows(this.buildProtocolQuery());
    const liquidationRows = await this.fetchRows(this.buildLiquidationQuery());

    const tokenPrices = this.buildTokenPrices(priceRows);
    const yields = this.buildYieldOpportunities(yieldRows);
    const fundingRates = this.buildFundingRates(fundingRows);
    const protocolMetrics = this.buildProtocolMetrics(protocolRows);
    const alerts = [
      ...this.buildLiquidationAlerts(liquidationRows),
      ...this.buildVolatilityAlerts(tokenPrices),
    ].slice(0, 10);

    return {
      timestamp: Date.now(),
      yields,
      fundingRates,
      tokenPrices,
      protocolMetrics,
      alerts,
    };
  }

  private async fetchRows(sql: string): Promise<DuneRow[]> {
    if (!this.duneClient) {
      return [];
    }

    for (const performance of DUNE_PERFORMANCE_TIERS) {
      try {
        const execution = await this.duneClient.exec.executeSql({
          sql,
          performance: performance as never,
        });
        let status = await this.duneClient.exec.getExecutionStatus(execution.execution_id);

        while (
          status.state === ExecutionState.PENDING ||
          status.state === ExecutionState.EXECUTING
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          status = await this.duneClient.exec.getExecutionStatus(execution.execution_id);
        }

        if (status.state !== ExecutionState.COMPLETED) {
          return [];
        }

        const results = await this.duneClient.exec.getExecutionResults(execution.execution_id);
        return (results.result?.rows ?? []) as DuneRow[];
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (
          !message.includes("Invalid performance tier") ||
          performance === DUNE_PERFORMANCE_TIERS[DUNE_PERFORMANCE_TIERS.length - 1]
        ) {
          throw error;
        }
      }
    }

    return [];
  }

  private buildPriceQuery(): string {
    const symbols = PRICE_SYMBOLS.map((symbol) => `'${symbol}'`).join(", ");

    return `
      SELECT
        symbol,
        price,
        timestamp
      FROM prices.day
      WHERE blockchain = '${DUNE_CHAIN}'
        AND symbol IN (${symbols})
        AND timestamp >= current_timestamp - interval '2' day
      ORDER BY symbol, timestamp DESC
    `;
  }

  private buildYieldQuery(): string {
    return `
      SELECT
        project,
        symbol,
        amount_usd,
        block_time
      FROM lending.supply
      WHERE blockchain = '${DUNE_CHAIN}'
        AND block_time >= current_timestamp - interval '30' day
      ORDER BY block_time DESC
      LIMIT 50
    `;
  }

  private buildFundingQuery(): string {
    return `
      SELECT
        project,
        symbol,
        amount_usd,
        block_time
      FROM lending.borrow
      WHERE blockchain = '${DUNE_CHAIN}'
        AND block_time >= current_timestamp - interval '30' day
      ORDER BY block_time DESC
      LIMIT 50
    `;
  }

  private buildProtocolQuery(): string {
    return `
      SELECT
        project,
        SUM(CASE WHEN block_time >= current_timestamp - interval '24' hour THEN amount_usd ELSE 0 END) AS volume_24h,
        SUM(amount_usd) AS volume_30d,
        SUM(CASE WHEN transaction_type = 'liquidation' THEN 1 ELSE 0 END) AS liquidation_count,
        COUNT(DISTINCT borrower) AS active_borrowers
      FROM lending.borrow
      WHERE blockchain = '${DUNE_CHAIN}'
        AND block_month >= date_trunc('month', current_timestamp - interval '30' day)
        AND block_time >= current_timestamp - interval '30' day
      GROUP BY project
      ORDER BY volume_24h DESC
      LIMIT 10
    `;
  }

  private buildLiquidationQuery(): string {
    return `
      SELECT
        project,
        symbol,
        amount_usd,
        block_time,
        borrower,
        liquidator
      FROM lending.borrow
      WHERE blockchain = '${DUNE_CHAIN}'
        AND transaction_type = 'liquidation'
        AND block_month >= date_trunc('month', current_timestamp - interval '7' day)
        AND block_time >= current_timestamp - interval '7' day
      ORDER BY amount_usd DESC
      LIMIT 10
    `;
  }

  private buildTokenPrices(rows: DuneRow[]): MarketContext["tokenPrices"] {
    const latestBySymbol = new Map<string, DuneRow[]>();

    for (const row of rows) {
      const symbol = this.readString(row.symbol);
      if (!symbol) {
        continue;
      }

      const bucket = latestBySymbol.get(symbol) ?? [];
      bucket.push(row);
      latestBySymbol.set(symbol, bucket);
    }

    return Array.from(latestBySymbol.entries())
      .map(([symbol, symbolRows]) => {
        const latest = symbolRows[0];
        const previous = symbolRows[1];
        const price = this.readNumber(latest.price);
        const previousPrice = previous ? this.readNumber(previous.price) : undefined;

        return {
          symbol,
          price,
          change24h:
            previousPrice && previousPrice !== 0
              ? ((price - previousPrice) / previousPrice) * 100
              : 0,
        };
      })
      .filter((entry) => Number.isFinite(entry.price));
  }

  private buildYieldOpportunities(rows: DuneRow[]): MarketContext["yields"] {
    return rows.map((row) => ({
      protocol: this.readString(row.project) ?? "unknown",
      asset: this.readString(row.symbol) ?? "unknown",
      apy: this.readNumber(row.amount_usd),
    }));
  }

  private buildFundingRates(rows: DuneRow[]): MarketContext["fundingRates"] {
    return rows.map((row) => ({
      market: `${this.readString(row.project) ?? "unknown"}:${this.readString(row.symbol) ?? "unknown"}`,
      rate: this.readNumber(row.amount_usd),
    }));
  }

  private buildProtocolMetrics(rows: DuneRow[]): MarketContext["protocolMetrics"] {
    return rows
      .map((row) => {
        const volume24h = this.readNumber(row.volume_24h);
        const volume30d = this.readNumber(row.volume_30d);
        const liquidationCount = this.readNumber(row.liquidation_count);
        const activeBorrowers = this.readNumber(row.active_borrowers);

        return {
          protocol: this.readString(row.project) ?? "unknown",
          tvlUsd: volume30d,
          volume24h,
          riskScore: Math.min(
            100,
            Math.max(
              0,
              Math.round(
                liquidationCount * 8 +
                  Math.min(30, volume24h / 5_000_000) +
                  Math.min(20, activeBorrowers / 25),
              ),
            ),
          ),
        };
      })
      .filter((entry) => Number.isFinite(entry.tvlUsd) && Number.isFinite(entry.volume24h));
  }

  private buildLiquidationAlerts(rows: DuneRow[]): MarketContext["alerts"] {
    return rows
      .map((row) => {
        const amountUsd = this.readNumber(row.amount_usd);
        const project = this.readString(row.project) ?? "unknown";
        const symbol = this.readString(row.symbol) ?? "unknown";
        const severity: MarketContext["alerts"][number]["severity"] =
          amountUsd >= 1_000_000 ? "HIGH" : amountUsd >= 100_000 ? "MEDIUM" : "LOW";

        return {
          severity,
          message: `${project} liquidated ${symbol} for $${amountUsd.toFixed(0)}`,
        };
      })
      .filter((entry) => entry.message.length > 0);
  }

  private buildVolatilityAlerts(
    tokenPrices: MarketContext["tokenPrices"],
  ): MarketContext["alerts"] {
    return tokenPrices
      .filter((token) => Math.abs(token.change24h) >= 8)
      .map((token) => {
        const severity: MarketContext["alerts"][number]["severity"] =
          Math.abs(token.change24h) >= 15 ? "HIGH" : "MEDIUM";

        return {
          severity,
          message: `${token.symbol} moved ${token.change24h.toFixed(2)}% in 24h`,
        };
      });
  }

  private readString(value: unknown): string | undefined {
    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === "bigint") {
      return value.toString();
    }

    return undefined;
  }

  private readNumber(value: unknown): number {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "bigint") {
      return Number(value);
    }

    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }

    return 0;
  }

  private scaleRate(value: unknown): number {
    return (this.readNumber(value) / DUNE_RATE_SCALE) * 100;
  }
}
