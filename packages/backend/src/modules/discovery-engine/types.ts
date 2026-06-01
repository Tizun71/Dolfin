export interface MarketContext {
  timestamp: number;

  yields: YieldOpportunity[];

  fundingRates: FundingRate[];

  tokenPrices: TokenPrice[];

  protocolMetrics: ProtocolMetric[];

  alerts: MarketAlert[];
}

export interface YieldOpportunity {
  protocol: string;
  asset: string;
  apy: number;
}

export interface FundingRate {
  market: string;
  rate: number;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export interface ProtocolMetric {
  protocol: string;
  tvlUsd: number;
  volume24h: number;
  riskScore: number;
}

export interface MarketAlert {
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
}