export const chartData = [
  0.32, 0.38, 0.35, 0.4, 0.36, 0.33, 0.39, 0.37, 0.34, 0.38, 0.36, 0.33, 0.37,
  0.4, 0.38, 0.35, 0.33, 0.36, 0.39, 0.37, 0.35, 0.33, 0.37, 0.4, 0.38, 0.36,
  0.33, 0.35, 0.38, 0.37, 0.34, 0.36, 0.39, 0.41, 0.38, 0.35, 0.33, 0.36, 0.39,
  0.37,
];

export const MIN_VAL = 0.28;
export const MAX_VAL = 0.45;
export const W = 500;
export const H = 120;

export function toY(val: number) {
  return H - ((val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * H;
}

export const headerStats = [
  { label: "Reserve Size", value: "$2.42B" },
  { label: "Available Liquidity", value: "$2.33B" },
  { label: "Utilization Rate", value: "3.37%" },
  { label: "Oracle Price", value: "$80,534.00" },
];

export const capabilities = [
  {
    label: "Tracking Health Factor",
    desc: "Monitor liquidation risk in real-time",
  },
  {
    label: "Market Volatility Forecast",
    desc: "Predict BTC price movements and adjust strategy",
  },
  {
    label: "Wallet Balance Reader",
    desc: "Read WBTC balances from your wallet",
  },
];

export const automatedActions = [
  "Deposit / Withdraw to avoid liquidation",
  "Adjust borrow ratio for safety",
];

export const collateralStats = [
  { label: "Max LTV", value: "70%" },
  { label: "Liq. Threshold", value: "75.00%" },
  { label: "Liq. Penalty", value: "6.25%" },
];
