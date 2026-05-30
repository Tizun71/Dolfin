// Encode AI decisions into adapter `actionData` (the bytes consumed by each adapter's `plan`).
// These match the abi.decode layouts in UniswapV3Adapter / AaveV3Adapter / GmxAdapter.

import { encodeAbiParameters } from "viem";
import { ActionType, type AdapterCall, type Address, type TradeDecision } from "./types.js";

export function encodeUniswap(
  adapter: Address,
  router: Address,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  fee: number,
  amountOutMinimum: bigint,
  deadline: bigint,
): AdapterCall {
  const actionData = encodeAbiParameters(
    [
      { type: "address" }, { type: "address" }, { type: "address" }, { type: "uint24" },
      { type: "uint256" }, { type: "uint256" }, { type: "uint256" },
    ],
    [router, tokenIn, tokenOut, fee, amountIn, amountOutMinimum, deadline],
  );
  return { adapter, actionData };
}

/** action: 0=SUPPLY 1=WITHDRAW 2=BORROW 3=REPAY */
export function encodeAave(
  adapter: Address,
  action: 0 | 1 | 2 | 3,
  pool: Address,
  asset: Address,
  amount: bigint,
  rateMode: bigint = 2n,
): AdapterCall {
  const actionData = encodeAbiParameters(
    [{ type: "uint8" }, { type: "address" }, { type: "address" }, { type: "uint256" }, { type: "uint256" }],
    [action, pool, asset, amount, rateMode],
  );
  return { adapter, actionData };
}

/** action: 0=OPEN 1=CLOSE */
export function encodeGmx(
  adapter: Address,
  action: 0 | 1,
  router: Address,
  collateralToken: Address,
  indexToken: Address,
  amount: bigint,
  leverageBps: number,
  isLong: boolean,
): AdapterCall {
  const actionData = encodeAbiParameters(
    [
      { type: "uint8" }, { type: "address" }, { type: "address" }, { type: "address" },
      { type: "uint256" }, { type: "uint16" }, { type: "bool" },
    ],
    [action, router, collateralToken, indexToken, amount, leverageBps, isLong],
  );
  return { adapter, actionData };
}

/** Build the adapter call for any decision, with slippage applied to swaps. */
export function buildAdapterCall(d: TradeDecision, quotedOut: bigint, slippageBps = 50): AdapterCall {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 120);
  switch (d.actionType) {
    case ActionType.SWAP: {
      const min = (quotedOut * (10_000n - BigInt(slippageBps))) / 10_000n;
      return encodeUniswap(d.adapter, d.protocol, d.tokenIn, d.tokenOut, d.amount, d.fee ?? 3000, min, deadline);
    }
    case ActionType.SUPPLY:
      return encodeAave(d.adapter, 0, d.protocol, d.tokenIn, d.amount);
    case ActionType.WITHDRAW:
      return encodeAave(d.adapter, 1, d.protocol, d.tokenIn, d.amount);
    case ActionType.BORROW:
      return encodeAave(d.adapter, 2, d.protocol, d.tokenIn, d.amount);
    case ActionType.REPAY:
      return encodeAave(d.adapter, 3, d.protocol, d.tokenIn, d.amount);
    case ActionType.OPEN_PERP:
      return encodeGmx(d.adapter, 0, d.protocol, d.tokenIn, d.tokenOut, d.amount, d.leverageBps ?? 10000, true);
    case ActionType.CLOSE_PERP:
      return encodeGmx(d.adapter, 1, d.protocol, d.tokenIn, d.tokenOut, d.amount, 0, true);
  }
}
