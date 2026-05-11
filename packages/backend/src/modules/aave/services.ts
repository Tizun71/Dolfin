import { AaveClient, evmAddress, chainId } from "@aave/client";
import { market } from "@aave/client/actions";
import type { Reserve } from "@aave/graphql";
import { getLogger } from "@logtape/logtape";

const aaveClient = AaveClient.create();
const aaveLogger = getLogger();
const ARBITRUM_ONE_CHAIN_ID = chainId(42161);
const ARBITRUM_ONE_MARKET_ADDRESS = evmAddress("0x794a61358D6845594F94dc1DB02A252b5b4814aD");

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

export async function getArbitrumMarketData() {
  const result = await market(aaveClient, {
    chainId: ARBITRUM_ONE_CHAIN_ID,
    address: ARBITRUM_ONE_MARKET_ADDRESS,
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
