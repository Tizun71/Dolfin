import { AaveClient, evmAddress, chainId } from "@aave/client";
import { market } from "@aave/client/actions";
import { getLogger } from "@logtape/logtape";

const aaveClient = AaveClient.create();
const aaveLogger = getLogger();
const ARBITRUM_ONE_MARKET_ADDRESS =
  "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

/**
 * Retrieves market data for the Arbitrum One network from Aave.
 */
export async function getArbitrumMarketData() {
  const arbitrumOne = chainId(42161); // Arbitrum One

  const result = await market(aaveClient, {
    chainId: arbitrumOne,
    address: evmAddress(ARBITRUM_ONE_MARKET_ADDRESS),
  });

  if (result.isErr()) {
    aaveLogger.error(`Failed to fetch market data: ${result.error.message}`);
    throw new Error(`Failed to fetch market data: ${result.error.message}`);
  }

  const marketData = result.value;
  if (!marketData) {
    aaveLogger.error("Market data is undefined");
    throw new Error("Market data is undefined");
  }

  return {
    name: marketData.name,
    poolAddress: marketData.address,
    chain: {
      name: marketData.chain.name,
      icon: marketData.chain.icon,
      chainId: marketData.chain.chainId,
    },
    totalMarketSize: marketData.totalMarketSize,
    totalAvailableLiquidity: marketData.totalAvailableLiquidity,
    reserves: marketData.supplyReserves.map((reserve) => ({
      symbol: reserve.underlyingToken.symbol,
      name: reserve.underlyingToken.name,
      address: reserve.underlyingToken.address,
      imageUrl: reserve.underlyingToken.imageUrl,
      size: parseFloat(reserve.size.usd),
      aToken: {
        symbol: reserve.aToken.symbol,
        name: reserve.aToken.name,
        address: reserve.aToken.address,
        imageUrl: reserve.aToken.imageUrl,
      },
      vToken: {
        symbol: reserve.vToken.symbol,
        name: reserve.vToken.name,
        address: reserve.vToken.address,
        imageUrl: reserve.vToken.imageUrl,
      },
      usdExchangeRate: reserve.usdExchangeRate,
      usdOracleAddress: reserve.usdOracleAddress,
      isFrozen: reserve.isFrozen,
      isPaused: reserve.isPaused,
      flashLoanEnabled: reserve.flashLoanEnabled,
      permitSupported: reserve.permitSupported,
      supplyInfo: {
        apy: parseFloat(reserve.supplyInfo.apy.formatted) * 100,
        total: parseFloat(reserve.supplyInfo.total.value),
        canBeCollateral: reserve.supplyInfo.canBeCollateral,
        maxLTV: parseFloat(reserve.supplyInfo.maxLTV.formatted),
        supplyCap: parseFloat(reserve.supplyInfo.supplyCap.amount.value),
        supplyCapReached: reserve.supplyInfo.supplyCapReached,
        liquidationThreshold: parseFloat(
          reserve.supplyInfo.liquidationThreshold.formatted,
        ),
        liquidationBonus: parseFloat(
          reserve.supplyInfo.liquidationBonus.formatted,
        ),
      },
      borrowInfo: reserve.borrowInfo
        ? {
            apy: parseFloat(reserve.borrowInfo.apy.formatted) * 100,
            total: parseFloat(reserve.borrowInfo.total.usd),
            borrowCap: parseFloat(reserve.borrowInfo.borrowCap.usd),
            reserveFactor: parseFloat(
              reserve.borrowInfo.reserveFactor.formatted,
            ),
            utilizationRate: parseFloat(
              reserve.borrowInfo.utilizationRate.formatted,
            ),
            baseVariableBorrowRate: parseFloat(
              reserve.borrowInfo.baseVariableBorrowRate.formatted,
            ),
            variableRateSlope1: parseFloat(
              reserve.borrowInfo.variableRateSlope1.formatted,
            ),
            variableRateSlope2: parseFloat(
              reserve.borrowInfo.variableRateSlope2.formatted,
            ),
            optimalUsageRate: parseFloat(
              reserve.borrowInfo.optimalUsageRate.formatted,
            ),
            borrowingState: reserve.borrowInfo.borrowingState,
            borrowCapReached: reserve.borrowInfo.borrowCapReached,
          }
        : null,
    })),
  };
}
