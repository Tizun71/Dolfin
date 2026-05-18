export const chartData = [
  4.48, 4.52, 4.5, 4.55, 4.53, 4.49, 4.51, 4.54, 4.52, 4.5, 4.48, 4.53, 4.55,
  4.52, 4.5, 4.49, 4.51, 4.53, 4.55, 4.52, 4.5, 4.48, 4.52, 4.54, 4.53, 4.51,
  4.49, 4.52, 4.54, 4.52, 4.5, 4.48, 4.52, 4.55, 4.53, 4.51, 4.49, 4.52, 4.54,
  4.52,
];

export const MIN_VAL = 4.4;
export const MAX_VAL = 4.65;
export const W = 500;
export const H = 120;

export function toY(val: number) {
  return H - ((val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * H;
}

export const headerStats = [
  { label: "Reserve Size", value: "$1.84B" },
  { label: "Available Liquidity", value: "$330.12M" },
  { label: "Utilization Rate", value: "82.07%" },
  { label: "Oracle Price", value: "$1.00" },
];

export const capabilities = [
  {
    label: "Tracking Health Factor",
    desc: "Monitor liquidation risk in real-time",
  },
  {
    label: "Stablecoin Yield Monitor",
    desc: "Track USDC supply rate vs competitors",
  },
  {
    label: "Wallet Balance Reader",
    desc: "Read USDC balances from your wallet",
  },
];

export const automatedActions = [
  "Deposit / Withdraw to avoid liquidation",
  "Adjust borrow ratio for safety",
];
