export const chartData = [
  4.85, 4.9, 4.88, 4.93, 4.91, 4.87, 4.9, 4.93, 4.91, 4.89, 4.87, 4.91, 4.93,
  4.9, 4.88, 4.87, 4.9, 4.92, 4.94, 4.91, 4.89, 4.87, 4.91, 4.93, 4.91, 4.89,
  4.87, 4.91, 4.93, 4.91, 4.88, 4.87, 4.91, 4.94, 4.92, 4.9, 4.87, 4.91, 4.93,
  4.91,
];

export const MIN_VAL = 4.78;
export const MAX_VAL = 5.0;
export const W = 500;
export const H = 120;

export function toY(val: number) {
  return H - ((val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * H;
}

export const headerStats = [
  { label: "Reserve Size", value: "$643.33M" },
  { label: "Available Liquidity", value: "$49.33M" },
  { label: "Utilization Rate", value: "92.33%" },
  { label: "Oracle Price", value: "$1.00" },
];

export const capabilities = [
  {
    label: "Tracking Health Factor",
    desc: "Monitor liquidation risk in real-time",
  },
  {
    label: "Stablecoin Yield Monitor",
    desc: "Track USDT supply rate vs competitors",
  },
  {
    label: "Wallet Balance Reader",
    desc: "Read USDT balances from your wallet",
  },
];

export const automatedActions = [
  "Deposit / Withdraw to avoid liquidation",
  "Adjust borrow ratio for safety",
];
