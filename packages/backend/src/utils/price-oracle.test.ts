import { describe, expect, it, vi } from "vitest";
import { fetchChainlinkPriceUsd } from "./price-oracle.js";

const FEED = "0x0000000000000000000000000000000000000001" as const;

/** Fake viem client: latestRoundData returns `answer`, decimals returns `decimals`. */
function fakeClient(answer: bigint, decimals: number) {
  return {
    readContract: vi.fn(async ({ functionName }: { functionName: string }) =>
      functionName === "decimals"
        ? decimals
        : ([0n, answer, 0n, 0n, 0n] as const),
    ),
  };
}

describe("fetchChainlinkPriceUsd", () => {
  it("scales the answer by the feed decimals", async () => {
    const price = await fetchChainlinkPriceUsd(fakeClient(200_000_000_000n, 8) as never, FEED);
    expect(price).toBe(2000); // 2000e8 / 1e8
  });

  it("returns null for a non-positive answer", async () => {
    expect(await fetchChainlinkPriceUsd(fakeClient(0n, 8) as never, FEED)).toBeNull();
  });

  it("returns null when the read throws", async () => {
    const client = {
      readContract: vi.fn(async () => {
        throw new Error("rpc down");
      }),
    };
    expect(await fetchChainlinkPriceUsd(client as never, FEED)).toBeNull();
  });
});
