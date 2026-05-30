import type { Address } from "viem";

export interface IPortfolioEngine {
    getWalletPortfolio(walletAddress: Address): any;
    getAavePosition(walletAddress: Address): any;
    getGmxPositions(walletAddress: Address): any;
    getWalletPnL(walletAddress: Address): any;
    getRiskMetrics(walletAddress: Address): any;
}