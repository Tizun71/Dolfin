import type { Address, PublicClient } from "viem";

/** Minimal Chainlink AggregatorV3 ABI: latest price + its decimals. */
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
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

/**
 * Read a USD price from a Chainlink price feed. Returns null on any failure so
 * callers can fall back to a static price instead of failing the pipeline.
 */
export async function fetchChainlinkPriceUsd(
  client: Pick<PublicClient, "readContract">,
  feed: Address,
): Promise<number | null> {
  try {
    const [[, answer], decimals] = await Promise.all([
      client.readContract({ address: feed, abi: aggregatorV3Abi, functionName: "latestRoundData" }) as Promise<
        readonly [bigint, bigint, bigint, bigint, bigint]
      >,
      client.readContract({ address: feed, abi: aggregatorV3Abi, functionName: "decimals" }) as Promise<number>,
    ]);
    if (answer <= 0n) return null;
    return Number(answer) / 10 ** Number(decimals);
  } catch {
    return null;
  }
}
