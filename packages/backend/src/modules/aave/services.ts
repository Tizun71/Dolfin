import { AaveClient, evmAddress, chainId } from "@aave/client";
import { market } from "@aave/client/actions";
import type { Reserve } from "@aave/graphql";
import { getLogger } from "@logtape/logtape";
import { AaveV3ArbitrumSepolia } from "@aave-dao/aave-address-book";
import { IUiPoolDataProvider_ABI } from "@aave-dao/aave-address-book/abis";
import { createPublicClient, http, type Address } from "viem";
import { arbitrumSepolia } from "viem/chains";

const aaveClient = AaveClient.create();
const aaveLogger = getLogger();
const ARBITRUM_ONE_CHAIN_ID = chainId(42161);
const ARBITRUM_ONE_MARKET_ADDRESS = evmAddress("0x794a61358D6845594F94dc1DB02A252b5b4814aD");

const ARBITRUM_SEPOLIA_CHAIN_ID = chainId(421614);
const ARBITRUM_SEPOLIA_MARKET_ADDRESS = evmAddress(AaveV3ArbitrumSepolia.POOL);
const ARBITRUM_SEPOLIA_ALLOWED_ASSETS = new Set([
  AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING,
  AaveV3ArbitrumSepolia.ASSETS.WETH.UNDERLYING,
]);
const arbitrumSepoliaClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

function toNumber(value: unknown): number {
  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatPercentFromRay(value: unknown): string {
  const ray = toNumber(value);
  return `${(ray / 1e25).toFixed(2)}%`;
}

function formatPercentFromBasisPoints(value: unknown): string {
  const bps = toNumber(value);
  return `${(bps / 100).toFixed(2)}%`;
}

function formatAddressToken(symbolPrefix: string, symbol: string, address: Address) {
  return {
    symbol: `${symbolPrefix}${symbol}`,
    address,
    imageUrl: null,
  };
}

function transformReserve(r: Reserve) {
  const si = r.supplyInfo;
  const bi = r.borrowInfo;

  return {
    underlyingToken: {
      symbol: r.underlyingToken.symbol,
      name: r.underlyingToken.name,
      address: r.underlyingToken.address,
      imageUrl: r.underlyingToken.imageUrl,
    },
    aToken: {
      symbol: r.aToken.symbol,
      address: r.aToken.address,
      imageUrl: r.aToken.imageUrl,
    },
    vToken: {
      symbol: r.vToken.symbol,
      address: r.vToken.address,
      imageUrl: r.vToken.imageUrl,
    },
    usdExchangeRate: r.usdExchangeRate,
    usdOracleAddress: r.usdOracleAddress,
    isFrozen: r.isFrozen,
    isPaused: r.isPaused,
    flashLoanEnabled: r.flashLoanEnabled,
    permitSupported: r.permitSupported,
    size: r.size.usd,
    supplyInfo: {
      apy: si.apy.formatted,
      total: si.total.value,
      supplyCap: si.supplyCap.amount.value,
      supplyCapReached: si.supplyCapReached,
      canBeCollateral: si.canBeCollateral,
      maxLTV: si.maxLTV.formatted,
      liquidationThreshold: si.liquidationThreshold.formatted,
      liquidationBonus: si.liquidationBonus.formatted,
    },
    borrowInfo: bi
      ? {
          borrowingState: bi.borrowingState,
          borrowCapReached: bi.borrowCapReached,
          apy: bi.apy.formatted,
          total: bi.total.amount.value,
          totalUsd: bi.total.usd,
          availableLiquidity: bi.availableLiquidity.usd,
          utilizationRate: bi.utilizationRate.formatted,
          reserveFactor: bi.reserveFactor.formatted,
          borrowCap: bi.borrowCap.amount.value,
          optimalUsageRate: bi.optimalUsageRate.formatted,
          baseVariableBorrowRate: bi.baseVariableBorrowRate.formatted,
          variableRateSlope1: bi.variableRateSlope1.formatted,
          variableRateSlope2: bi.variableRateSlope2.formatted,
        }
      : null,
    eModeInfo: r.eModeInfo.map((e) => ({
      categoryId: e.categoryId,
      label: e.label,
      maxLTV: e.maxLTV.formatted,
      liquidationThreshold: e.liquidationThreshold.formatted,
      liquidationPenalty: e.liquidationPenalty.formatted,
      canBeCollateral: e.canBeCollateral,
      canBeBorrowed: e.canBeBorrowed,
    })),
  };
}

async function getMarketData(chainIdValue: ReturnType<typeof chainId>, marketAddress: ReturnType<typeof evmAddress>) {
  const result = await market(aaveClient, {
    chainId: chainIdValue,
    address: marketAddress,
  });

  if (result.isErr()) {
    aaveLogger.error(`Failed to fetch market data: ${result.error.message}`);
    throw new Error(`Failed to fetch market data: ${result.error.message}`);
  }

  const m = result.value;
  if (!m) {
    aaveLogger.error("Market data is undefined");
    throw new Error("Market data is undefined");
  }

  const reserveMap = new Map<string, Reserve>();

  for (const r of m.supplyReserves) {
    reserveMap.set(r.underlyingToken.address, r);
  }

  for (const r of m.borrowReserves) {
    const existing = reserveMap.get(r.underlyingToken.address);
    if (existing) {
      if (!existing.borrowInfo && r.borrowInfo) {
        reserveMap.set(r.underlyingToken.address, {
          ...existing,
          borrowInfo: r.borrowInfo,
        });
      }
    } else {
      reserveMap.set(r.underlyingToken.address, r);
    }
  }

  return {
    name: m.name,
    address: m.address,
    chain: { chainId: m.chain.chainId, name: m.chain.name },
    totalMarketSize: m.totalMarketSize,
    totalAvailableLiquidity: m.totalAvailableLiquidity,
    reserves: Array.from(reserveMap.values()).map(transformReserve),
  };
}

export async function getArbitrumMarketData() {
  return getMarketData(ARBITRUM_ONE_CHAIN_ID, ARBITRUM_ONE_MARKET_ADDRESS);
}

async function getArbitrumSepoliaReserveData() {
  try {
    const [reserves] = (await arbitrumSepoliaClient.readContract({
      address: AaveV3ArbitrumSepolia.UI_POOL_DATA_PROVIDER as Address,
      abi: IUiPoolDataProvider_ABI,
      functionName: "getReservesData",
      args: [AaveV3ArbitrumSepolia.POOL_ADDRESSES_PROVIDER as Address],
    })) as readonly [readonly any[], unknown];

    return reserves;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    aaveLogger.error(`Failed to fetch Arbitrum Sepolia reserve data: ${message}`);
    throw new Error(`Failed to fetch Arbitrum Sepolia reserve data: ${message}`);
  }
}

function transformArbitrumSepoliaReserve(reserve: any) {
  const availableLiquidity = toNumber(reserve.availableLiquidity);
  const stableDebt = toNumber(reserve.totalPrincipalStableDebt);
  const variableDebt = toNumber(reserve.totalScaledVariableDebt);
  const supplyTotal = availableLiquidity + stableDebt + variableDebt;
  const debtTotal = stableDebt + variableDebt;
  const borrowCap = toNumber(reserve.borrowCap);
  const supplyCap = toNumber(reserve.supplyCap);

  return {
    underlyingToken: {
      symbol: reserve.symbol,
      name: reserve.name,
      address: reserve.underlyingAsset,
      imageUrl: null,
    },
    aToken: formatAddressToken("a", reserve.symbol, reserve.aTokenAddress),
    vToken: formatAddressToken("v", reserve.symbol, reserve.variableDebtTokenAddress),
    usdExchangeRate: toNumber(reserve.priceInMarketReferenceCurrency),
    usdOracleAddress: reserve.priceOracle,
    isFrozen: reserve.isFrozen,
    isPaused: reserve.isPaused,
    flashLoanEnabled: reserve.flashLoanEnabled,
    permitSupported: false,
    size: supplyTotal,
    supplyInfo: {
      apy: formatPercentFromRay(reserve.liquidityRate),
      total: supplyTotal,
      supplyCap,
      supplyCapReached: supplyCap > 0 && supplyTotal >= supplyCap,
      canBeCollateral: reserve.usageAsCollateralEnabled,
      maxLTV: formatPercentFromBasisPoints(reserve.baseLTVasCollateral),
      liquidationThreshold: formatPercentFromBasisPoints(reserve.reserveLiquidationThreshold),
      liquidationBonus: formatPercentFromBasisPoints(reserve.reserveLiquidationBonus),
    },
    borrowInfo: reserve.borrowingEnabled
      ? {
          borrowingState: reserve.borrowingEnabled ? "enabled" : "disabled",
          borrowCapReached: borrowCap > 0 && debtTotal >= borrowCap,
          apy: formatPercentFromRay(reserve.variableBorrowRate),
          total: debtTotal,
          totalUsd: debtTotal,
          availableLiquidity,
          utilizationRate: supplyTotal > 0 ? `${((debtTotal / supplyTotal) * 100).toFixed(2)}%` : "0.00%",
          reserveFactor: formatPercentFromBasisPoints(reserve.reserveFactor),
          borrowCap,
          optimalUsageRate: formatPercentFromBasisPoints(reserve.optimalUsageRatio),
          baseVariableBorrowRate: formatPercentFromRay(reserve.baseVariableBorrowRate),
          variableRateSlope1: formatPercentFromRay(reserve.variableRateSlope1),
          variableRateSlope2: formatPercentFromRay(reserve.variableRateSlope2),
        }
      : null,
    eModeInfo: [],
  };
}

export async function getArbitrumSepoliaMarketData() {
  const reserves = (await getArbitrumSepoliaReserveData()).filter((reserve) =>
    ARBITRUM_SEPOLIA_ALLOWED_ASSETS.has(reserve.underlyingAsset),
  );
  const transformedReserves = reserves.map(transformArbitrumSepoliaReserve);

  return {
    name: "Aave V3 Arbitrum Sepolia",
    address: ARBITRUM_SEPOLIA_MARKET_ADDRESS,
    chain: { chainId: Number(AaveV3ArbitrumSepolia.CHAIN_ID), name: "Arbitrum Sepolia" },
    totalMarketSize: transformedReserves.reduce((sum, reserve) => sum + toNumber(reserve.size), 0),
    totalAvailableLiquidity: transformedReserves.reduce((sum, reserve) => {
      return sum + toNumber(reserve.borrowInfo?.availableLiquidity);
    }, 0),
    reserves: transformedReserves,
  };
}
