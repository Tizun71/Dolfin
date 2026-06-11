import { erc20Abi, formatUnits, type Address } from "viem";
import type { ChainId } from "../../configs/chain.js";
import { getPublicClient } from "../../utils/viemClient.js";
import { fetchChainlinkPriceUsd } from "../../utils/price-oracle.js";
import type { IPortfolioEngine } from "./PortfolioEngine.interface.js";

/** A token the portfolio engine should read the wallet's balance for. */
export interface PortfolioToken {
  symbol: string;
  address: Address;
  decimals: number;
  /** Static fallback price; used when no feed is set or the feed read fails. */
  priceUsd: number;
  /** Optional Chainlink USD feed. When set, the live price overrides priceUsd. */
  chainlinkFeed?: Address;
}

/** Aave account-level position, normalized to USD. Feeds RiskContext.lending. */
export interface LendingPosition {
  collateralUsd: number;
  debtUsd: number;
  healthFactor: number;
}

export interface WalletPortfolio {
  totalValueUsd: number;
  assets: { symbol: string; valueUsd: number }[];
  lending?: LendingPosition;
}

/** Aave V3 base currency (totalCollateralBase/totalDebtBase) is USD with 8 decimals. */
const AAVE_BASE_DECIMALS = 8;
/** healthFactor is returned with 1e18 precision; capped for display when there is no debt. */
const HEALTH_FACTOR_NO_DEBT = 999;

/** Minimal Aave V3 Pool ABI: only the account-data read we need. */
const aavePoolAbi = [
  {
    type: "function",
    name: "getUserAccountData",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalCollateralBase", type: "uint256" },
      { name: "totalDebtBase", type: "uint256" },
      { name: "availableBorrowsBase", type: "uint256" },
      { name: "currentLiquidationThreshold", type: "uint256" },
      { name: "ltv", type: "uint256" },
      { name: "healthFactor", type: "uint256" },
    ],
  },
] as const;

export class PortfolioEngine implements IPortfolioEngine {
  private readonly client: ReturnType<typeof getPublicClient>;

  constructor(
    chainId: ChainId,
    private readonly tokens: PortfolioToken[],
    private readonly aavePool?: Address,
  ) {
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

      const priceUsd = await this.priceFor(token);
      const valueUsd = Number(formatUnits(raw, token.decimals)) * priceUsd;
      assets.push({ symbol: token.symbol, valueUsd });
      totalValueUsd += valueUsd;
    }

    // Lending position is best-effort: a read failure must not blank the wallet snapshot.
    const lending = await this.getAavePosition(walletAddress).catch(() => undefined);
    return { totalValueUsd, assets, lending };
  }

  // Read the wallet's Aave position via Pool.getUserAccountData. Undefined when no pool is
  // set. Health factor is capped at HEALTH_FACTOR_NO_DEBT when there is no debt.
  async getAavePosition(walletAddress: Address): Promise<LendingPosition | undefined> {
    if (!this.aavePool) return undefined;
    const [totalCollateralBase, totalDebtBase, , , , healthFactor] =
      (await this.client.readContract({
        address: this.aavePool,
        abi: aavePoolAbi,
        functionName: "getUserAccountData",
        args: [walletAddress],
      })) as readonly [bigint, bigint, bigint, bigint, bigint, bigint];

    const collateralUsd = Number(formatUnits(totalCollateralBase, AAVE_BASE_DECIMALS));
    const debtUsd = Number(formatUnits(totalDebtBase, AAVE_BASE_DECIMALS));
    const hf =
      totalDebtBase === 0n ? HEALTH_FACTOR_NO_DEBT : Number(formatUnits(healthFactor, 18));
    return { collateralUsd, debtUsd, healthFactor: hf };
  }

  /** Live Chainlink price when a feed is configured; static priceUsd otherwise. */
  private async priceFor(token: PortfolioToken): Promise<number> {
    if (!token.chainlinkFeed) return token.priceUsd;
    const live = await fetchChainlinkPriceUsd(this.client, token.chainlinkFeed);
    return live ?? token.priceUsd;
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
