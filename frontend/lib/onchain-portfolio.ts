// Direct on-chain portfolio reads for the dashboard (no backend round-trip).
// Mirrors the backend PortfolioEngine + cross-chain-portfolio logic, but runs in the
// browser: DeFi side on Arbitrum Sepolia, equity side on Robinhood Chain testnet.
import {
  createPublicClient,
  defineChain,
  erc20Abi,
  formatUnits,
  http,
  type Address,
  type PublicClient,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import { DOLFIN, TOKENS } from "@/constants/dolfin";

/** Aave V3 base currency (collateral/debt) is USD with 8 decimals. */
const AAVE_BASE_DECIMALS = 8;
/** healthFactor returns 1e18 precision; capped for display when there is no debt. */
const HEALTH_FACTOR_NO_DEBT = 999;

const ROBINHOOD_CHAIN_ID = 46630;

// Robinhood Chain testnet (Arbitrum Orbit L2), not bundled in viem/chains.
const robinhoodTestnet = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.chain.robinhood.com"] } },
  testnet: true,
});

const arbClient: PublicClient = createPublicClient({ chain: arbitrumSepolia, transport: http() });
const equityClient: PublicClient = createPublicClient({ chain: robinhoodTestnet, transport: http() });

interface PortfolioToken {
  symbol: string;
  address: Address;
  decimals: number;
  priceUsd: number; // static fallback ($1 for stables, 0 for unpriced equities)
  chainlinkFeed?: Address; // live USD price; overrides priceUsd when set
}

// Chainlink ETH/USD feed on Arbitrum Sepolia. Override via NEXT_PUBLIC_ETH_USD_FEED.
// Used to price WETH and native ETH. Empty string disables (ETH/WETH read as $0).
const ETH_USD_FEED = "0xf3138B59cAcbA1a4d7d24fA7b184c20B3941433e";

// DeFi tokens valued on Arb Sepolia. USDC pinned to $1; WETH priced via the ETH/USD feed.
const DEFI_TOKENS: PortfolioToken[] = TOKENS.map((t) => ({
  symbol: t.symbol,
  address: t.address as Address,
  decimals: t.decimals,
  priceUsd: t.symbol === "USDC" ? 1 : 0,
  chainlinkFeed: t.symbol === "WETH" && ETH_USD_FEED ? (ETH_USD_FEED as Address) : undefined,
}));

// Tokenized-stock tokens on Robinhood testnet, supplied via env (same shape as backend
// ROBINHOOD_STOCK_TOKENS). JSON array: [{symbol,address,decimals,priceUsd?,chainlinkFeed?}].
function loadEquityTokens(): PortfolioToken[] {
  const raw = process.env.NEXT_PUBLIC_ROBINHOOD_STOCK_TOKENS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{
      symbol: string;
      address: string;
      decimals: number;
      priceUsd?: number;
      chainlinkFeed?: string;
    }>;
    return parsed.map((t) => ({
      symbol: t.symbol,
      address: t.address as Address,
      decimals: t.decimals,
      priceUsd: t.priceUsd ?? 0,
      chainlinkFeed: t.chainlinkFeed as Address | undefined,
    }));
  } catch {
    return [];
  }
}

const aggregatorV3Abi = [
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
] as const;

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

/** Live Chainlink USD price; null on any failure so callers fall back to the static price. */
async function chainlinkPriceUsd(client: PublicClient, feed: Address): Promise<number | null> {
  try {
    const [[, answer], decimals] = await Promise.all([
      client.readContract({ address: feed, abi: aggregatorV3Abi, functionName: "latestRoundData" }) as Promise<
        readonly [bigint, bigint, bigint, bigint, bigint]
      >,
      client.readContract({ address: feed, abi: aggregatorV3Abi, functionName: "decimals" }) as Promise<number>,
    ]);
    if (answer <= BigInt(0)) return null;
    return Number(answer) / 10 ** Number(decimals);
  } catch {
    return null;
  }
}

/** Sum the USD value of `tokens` held by `wallet` on `client`. */
async function valueTokens(client: PublicClient, wallet: Address, tokens: PortfolioToken[]): Promise<number> {
  const values = await Promise.all(
    tokens.map(async (token) => {
      const raw = (await client.readContract({
        address: token.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [wallet],
      })) as bigint;
      const price = token.chainlinkFeed
        ? (await chainlinkPriceUsd(client, token.chainlinkFeed)) ?? token.priceUsd
        : token.priceUsd;
      return Number(formatUnits(raw, token.decimals)) * price;
    }),
  );
  return values.reduce((sum, v) => sum + v, 0);
}

interface AaveAccount {
  // Supplied collateral and outstanding debt in USD.
  collateralUsd: number;
  debtUsd: number;
  // Net position value (collateral minus debt) in USD.
  positionUsd: number;
  healthFactor: number | null;
}

// Aave account-level data via Pool.getUserAccountData: supplied collateral, debt, net position
// value and health factor. All zero / HF null if the read fails.
async function readAaveAccount(wallet: Address): Promise<AaveAccount> {
  try {
    const [totalCollateralBase, totalDebtBase, , , , healthFactor] = (await arbClient.readContract({
      address: DOLFIN.aavePool,
      abi: aavePoolAbi,
      functionName: "getUserAccountData",
      args: [wallet],
    })) as readonly [bigint, bigint, bigint, bigint, bigint, bigint];
    const collateralUsd = Number(formatUnits(totalCollateralBase, AAVE_BASE_DECIMALS));
    const debtUsd = Number(formatUnits(totalDebtBase, AAVE_BASE_DECIMALS));
    return {
      collateralUsd,
      debtUsd,
      positionUsd: collateralUsd - debtUsd,
      healthFactor: totalDebtBase === BigInt(0) ? HEALTH_FACTOR_NO_DEBT : Number(formatUnits(healthFactor, 18)),
    };
  } catch {
    return { collateralUsd: 0, debtUsd: 0, positionUsd: 0, healthFactor: null };
  }
}

/** USD value of the wallet's native ETH (Arb Sepolia), priced via the ETH/USD feed. */
async function valueNativeEth(wallet: Address): Promise<number> {
  if (!ETH_USD_FEED) return 0;
  const price = await chainlinkPriceUsd(arbClient, ETH_USD_FEED as Address);
  if (!price) return 0;
  const wei = await arbClient.getBalance({ address: wallet });
  return Number(formatUnits(wei, 18)) * price;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export interface OnchainPortfolio {
  totalValueUsd: number;
  // Net Aave position value (supplied collateral minus debt) in USD, included in total.
  aavePositionUsd: number;
  // Supplied collateral (lent) and outstanding debt (borrowed) in USD.
  aaveCollateralUsd: number;
  aaveDebtUsd: number;
  healthFactor: number | null;
  allocation: { stablePct: number; equityPct: number };
}

// Read the dashboard's headline metrics straight from chain: total value (wallet DeFi stables
// + tokenized equity + net Aave position) and Aave health factor.
export async function readOnchainPortfolio(wallet: Address): Promise<OnchainPortfolio> {
  const equityTokens = loadEquityTokens();
  const [tokenUsd, nativeUsd, equityUsd, aave] = await Promise.all([
    valueTokens(arbClient, wallet, DEFI_TOKENS),
    valueNativeEth(wallet),
    equityTokens.length > 0 ? valueTokens(equityClient, wallet, equityTokens) : Promise.resolve(0),
    readAaveAccount(wallet),
  ]);
  const defiUsd = tokenUsd + nativeUsd + aave.positionUsd;
  const totalValueUsd = defiUsd + equityUsd;
  return {
    totalValueUsd,
    aavePositionUsd: aave.positionUsd,
    aaveCollateralUsd: aave.collateralUsd,
    aaveDebtUsd: aave.debtUsd,
    healthFactor: aave.healthFactor,
    allocation: {
      stablePct: totalValueUsd > 0 ? round1((defiUsd / totalValueUsd) * 100) : 0,
      equityPct: totalValueUsd > 0 ? round1((equityUsd / totalValueUsd) * 100) : 0,
    },
  };
}
