import type { IPortfolioEngine } from "../../portfolio-engine/PortfolioEngine.interface.js";
import type { Address } from "viem";
import type { AdvisorState, PortfolioSnapshot } from "../state.js";

// Pulls the wallet's on-chain positions into a PortfolioSnapshot.
export class PortfolioNode {
  constructor(private readonly portfolioEngine: IPortfolioEngine) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    const wallet = state.wallet as Address;
    const raw = await this.portfolioEngine.getWalletPortfolio(wallet);

    const portfolio: PortfolioSnapshot = {
      wallet: state.wallet,
      totalValueUsd: raw?.totalValueUsd ?? 0,
      assets: raw?.assets ?? [],
      lending: raw?.lending,
      leverage: raw?.leverage,
    };

    return { portfolio };
  };
}
