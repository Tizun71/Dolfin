export const chartData = [
  0.22, 0.25, 0.23, 0.27, 0.24, 0.22, 0.26, 0.25, 0.23, 0.27, 0.24, 0.22, 0.25,
  0.27, 0.25, 0.23, 0.22, 0.24, 0.26, 0.25, 0.23, 0.22, 0.25, 0.27, 0.25, 0.23,
  0.22, 0.24, 0.26, 0.25, 0.23, 0.22, 0.25, 0.27, 0.25, 0.23, 0.22, 0.24, 0.26,
  0.25,
];

export const MIN_VAL = 0.18;
export const MAX_VAL = 0.32;
export const W = 500;
export const H = 120;

export function toY(val: number) {
  return H - ((val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * H;
}

export const headerStats = [
  { label: "Reserve Size", value: "$1.27B" },
  { label: "Available Liquidity", value: "$1.26B" },
  { label: "Utilization Rate", value: "0.22%" },
  { label: "Oracle Price", value: "$2,681.00" },
];

export const capabilities = [
  {
    label: "Tracking Health Factor",
    desc: "Monitor liquidation risk in real-time",
  },
  {
    label: "Market Volatility Forecast",
    desc: "Predict wstETH price movements and adjust strategy",
  },
  {
    label: "Wallet Balance Reader",
    desc: "Read wstETH balances from your wallet",
  },
];

export const automatedActions = [
  "Deposit / Withdraw to avoid liquidation",
  "Adjust borrow ratio for safety",
];

export const collateralStats = [
  { label: "Max LTV", value: "78.5%" },
  { label: "Liq. Threshold", value: "81.00%" },
  { label: "Liq. Penalty", value: "5.00%" },
];
