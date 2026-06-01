import type { Address } from "viem";
import type { IPortfolioEngine } from "./PortfolioEngine.interface.js";

export class PortfolioEngine implements IPortfolioEngine {
    getWalletPortfolio(walletAddress: Address) {
        throw new Error("Method not implemented.");
    }
    getAavePosition(walletAddress: Address) {
        throw new Error("Method not implemented.");
    }
    getGmxPositions(walletAddress: Address) {
        throw new Error("Method not implemented.");
    }
    getWalletPnL(walletAddress: Address) {
        throw new Error("Method not implemented.");
    }
    getRiskMetrics(walletAddress: Address) {
        throw new Error("Method not implemented.");
    }
}