import { erc20Abi, formatUnits, type Address } from "viem";
import type { ChainId } from "../../configs/chain.js";
import { getPublicClient } from "../../utils/viemClient.js";
import type { IPortfolioEngine } from "./PortfolioEngine.interface.js";

/** A token the portfolio engine should read the wallet's balance for. */
export interface PortfolioToken {
  symbol: string;
  address: Address;
  decimals: number;
  priceUsd: number;
}

export interface WalletPortfolio {
  totalValueUsd: number;
  assets: { symbol: string; valueUsd: number }[];
}

export class PortfolioEngine implements IPortfolioEngine {
  private readonly client: ReturnType<typeof getPublicClient>;

  constructor(chainId: ChainId, private readonly tokens: PortfolioToken[]) {
    this.client = getPublicClient(chainId);
  }

  //TODO: Update variety token of portfolio 
  async getWalletPortfolio(walletAddress: Address): Promise<WalletPortfolio> {
    const assets: { symbol: string; valueUsd: number }[] = [];
    let totalValueUsd = 0;

    for (const token of this.tokens) {
      const raw = (await this.client.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [walletAddress],
      })) as bigint;

      const valueUsd = Number(formatUnits(raw, token.decimals)) * token.priceUsd;
      assets.push({ symbol: token.symbol, valueUsd });
      totalValueUsd += valueUsd;
    }

    return { totalValueUsd, assets };
  }

  getAavePosition(_walletAddress: Address) {
    throw new Error("Method not implemented.");
  }
  getGmxPositions(_walletAddress: Address) {
    throw new Error("Method not implemented.");
  }
  getWalletPnL(_walletAddress: Address) {
    throw new Error("Method not implemented.");
  }
  getRiskMetrics(_walletAddress: Address) {
    throw new Error("Method not implemented.");
  }
}
