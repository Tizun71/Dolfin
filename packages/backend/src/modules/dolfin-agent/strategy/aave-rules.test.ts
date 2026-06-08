import { describe, expect, it } from "vitest";
import { parseUnits } from "viem";
import { ActionType } from "@dolfin/onchain";
import { deriveAaveDecisions } from "./aave-rules.js";
import type { OnchainConfig, TokenInfo } from "../config/onchain-config.js";
import type { AdvisorState } from "../state.js";

const USDC: TokenInfo = {
  symbol: "USDC",
  address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  decimals: 6,
  priceUsd: 1,
};

const cfg = {
  tokens: { USDC },
  aave: {
    pool: "0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff",
    adapter: "0x36e0D11A242C2c580F354c57a4993b3c894e8270",
  },
} as unknown as OnchainConfig;

function stateWith(usdcUsd: number, lending?: { healthFactor: number; debtUsd: number }): AdvisorState {
  return {
    wallet: "0xWallet",
    portfolio: {
      wallet: "0xWallet",
      totalValueUsd: usdcUsd,
      assets: [{ symbol: "USDC", valueUsd: usdcUsd }],
      lending: lending
        ? { collateralUsd: 0, debtUsd: lending.debtUsd, healthFactor: lending.healthFactor }
        : undefined,
    },
  } as AdvisorState;
}

describe("deriveAaveDecisions", () => {
  it("supplies half of idle USDC when no debt", () => {
    const decisions = deriveAaveDecisions(stateWith(1000), cfg);
    expect(decisions).toHaveLength(1);
    expect(decisions[0].actionType).toBe(ActionType.SUPPLY);
    expect(decisions[0].amount).toBe(parseUnits("500", 6)); // 1000 * 0.5
  });

  it("repays first when health factor is low, then supplies the rest", () => {
    // budget 1000, debt 200, HF 1.1 < 1.4 → repay 200, then supply (800*0.5)=400
    const decisions = deriveAaveDecisions(stateWith(1000, { healthFactor: 1.1, debtUsd: 200 }), cfg);
    expect(decisions.map((d) => d.actionType)).toEqual([ActionType.REPAY, ActionType.SUPPLY]);
    expect(decisions[0].amount).toBe(parseUnits("200", 6));
    expect(decisions[1].amount).toBe(parseUnits("400", 6));
  });

  it("does not double-spend: repay caps at debt, supply uses remaining budget", () => {
    // budget 100, debt 500, HF low → repay min(100,500)=100, budget 0 → no supply
    const decisions = deriveAaveDecisions(stateWith(100, { healthFactor: 1.0, debtUsd: 500 }), cfg);
    expect(decisions).toHaveLength(1);
    expect(decisions[0].actionType).toBe(ActionType.REPAY);
    expect(decisions[0].amount).toBe(parseUnits("100", 6));
  });

  it("emits nothing when there is no idle USDC and no debt", () => {
    expect(deriveAaveDecisions(stateWith(0), cfg)).toHaveLength(0);
  });

  it("skips sub-$1 supply clips", () => {
    // budget 1 → supply 0.5 < 1 → skipped
    expect(deriveAaveDecisions(stateWith(1), cfg)).toHaveLength(0);
  });
});
