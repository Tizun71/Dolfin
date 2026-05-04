import { AaveClient, evmAddress, chainId } from "@aave/client";
import { market } from "@aave/client/actions";
import { getLogger } from "@logtape/logtape";

const aaveClient = AaveClient.create();
const aaveLogger = getLogger();

/**
 * Retrieves market data for the Arbitrum One network from Aave.
 */
export async function getArbitrumMarketData() {
  const arbitrumOne = chainId(42161); // Arbitrum One

  const result = await market(aaveClient, {
    chainId: arbitrumOne,
    address: evmAddress("0x794a61358D6845594F94dc1DB02A252b5b4814aD"),
  });

  if (result.isErr()) {
    aaveLogger.error(`Failed to fetch market data: ${result.error.message}`);
    throw new Error(`Failed to fetch market data: ${result.error.message}`);
  }

  return result.value;
}
