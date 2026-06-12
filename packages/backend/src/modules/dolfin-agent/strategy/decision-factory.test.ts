import { describe, expect, it } from "vitest";
import { parseUnits, zeroAddress } from "viem";
import { ActionType } from "@dolfin/onchain";
import { makeAaveDecision, resolveAction, resolveToken } from "./decision-factory.js";
import type { OnchainConfig, TokenInfo } from "../config/onchain-config.js";

const USDC: TokenInfo = {
  symbol: "USDC",
  address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  decimals: 6,
  priceUsd: 1,
};
const WETH: TokenInfo = {
  symbol: "WETH",
  address: "0x1dF462e2712496373A347f8ad10802a5E95f053D",
  decimals: 18,
  priceUsd: 2000,
};

const cfg = {
  tokens: { USDC, WETH },
  aave: {
    pool: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
    adapter: "0x36e0D11A242C2c580F354c57a4993b3c894e8270",
  },
} as unknown as OnchainConfig;

describe("resolveAction", () => {
  it("maps known action names case-insensitively", () => {
    expect(resolveAction("SUPPLY")).toBe(ActionType.SUPPLY);
    expect(resolveAction("repay")).toBe(ActionType.REPAY);
  });
  it("returns undefined for unknown action", () => {
    expect(resolveAction("STAKE")).toBeUndefined();
  });
});

describe("resolveToken", () => {
  it("resolves registry token by symbol (case-insensitive)", () => {
    expect(resolveToken("usdc", cfg)?.address).toBe(USDC.address);
  });
  it("returns undefined for non-whitelisted token", () => {
    expect(resolveToken("DOGE", cfg)).toBeUndefined();
  });
});

describe("makeAaveDecision", () => {
  it("converts USD to raw amount for a $1 stablecoin", () => {
    const d = makeAaveDecision(ActionType.SUPPLY, USDC, 100, cfg, "test");
    expect(d.amount).toBe(parseUnits("100", 6));
    expect(d.protocol).toBe(cfg.aave.pool);
    expect(d.adapter).toBe(cfg.aave.adapter);
    expect(d.tokenIn).toBe(USDC.address);
    expect(d.tokenOut).toBe(zeroAddress);
    expect(d.actionType).toBe(ActionType.SUPPLY);
  });
  it("price-adjusts the raw amount for a non-$1 token", () => {
    // $2000 of WETH @ $2000 = 1 WETH
    const d = makeAaveDecision(ActionType.SUPPLY, WETH, 2000, cfg, "test");
    expect(d.amount).toBe(parseUnits("1", 18));
  });
});
