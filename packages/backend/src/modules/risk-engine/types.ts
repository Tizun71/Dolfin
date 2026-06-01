export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export type RiskContext = {
  wallet: string;

  portfolio: {
    totalValueUsd: number;

    assets: {
      symbol: string;
      valueUsd: number;
    }[];
  };

  lending?: {
    collateralUsd: number;
    debtUsd: number;
    healthFactor: number;
  };

  leverage?: {
    sizeUsd: number;
    collateralUsd: number;
  };
}

export interface RiskResult {
  category: string;

  score: number;

  level: RiskLevel;

  reasons: string[];

  recommendations: string[];
}