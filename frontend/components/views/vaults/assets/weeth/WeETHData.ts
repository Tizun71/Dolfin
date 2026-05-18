export const chartData = [
  0.008, 0.009, 0.007, 0.01, 0.008, 0.009, 0.007, 0.008, 0.01, 0.009, 0.007,
  0.008, 0.009, 0.01, 0.008, 0.007, 0.009, 0.008, 0.01, 0.009, 0.008, 0.007,
  0.009, 0.01, 0.008, 0.009, 0.007, 0.008, 0.01, 0.009, 0.007, 0.008, 0.009,
  0.01, 0.008, 0.007, 0.009, 0.008, 0.01, 0.009,
];

export const MIN_VAL = 0.005;
export const MAX_VAL = 0.012;
export const W = 500;
export const H = 120;

export function toY(val: number) {
  return H - ((val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * H;
}

export const headerStats = [
  { label: "Reserve Size", value: "$2.71B" },
  { label: "Available Liquidity", value: "$2.70B" },
  { label: "Utilization Rate", value: "0.005%" },
  { label: "Oracle Price", value: "$2,381.20" },
];

export const capabilities = [
  {
    label: "Tracking Health Factor",
    desc: "Monitor liquidation risk in real-time",
  },
  {
    label: "Market Volatility Forecast",
    desc: "Predict weETH price movements and adjust strategy",
  },
  {
    label: "Wallet Balance Reader",
    desc: "Read weETH balances from your wallet",
  },
];

export const automatedActions = [
  "Deposit / Withdraw to avoid liquidation",
  "Adjust borrow ratio for safety",
];

export const collateralStats = [
  { label: "Max LTV", value: "72.5%" },
  { label: "Liq. Threshold", value: "78.00%" },
  { label: "Liq. Penalty", value: "6.00%" },
];
