import type { Address } from "viem";
import type { IDiscoveryEngine } from "./DiscoveryEngine.interface.js";

class DiscoveryEngine implements IDiscoveryEngine {
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