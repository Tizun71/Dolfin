// SGHOData.ts
export const chartData = [
  5.61, 5.63, 5.6, 5.62, 5.65, 5.61, 5.6, 5.63, 5.66, 5.64, 5.62, 5.61, 5.63,
  5.65, 5.66, 5.64, 5.61, 5.6, 5.62, 5.63, 5.65, 5.66, 5.64, 5.63, 5.61, 5.62,
  5.64, 5.65, 5.66, 5.63, 5.61, 5.62, 5.64, 5.66, 5.65, 5.63, 5.61, 5.62, 5.64,
  5.66,
];

export const MIN_VAL = 5.58;
export const MAX_VAL = 5.68;
export const W = 500;
export const H = 120;

export const toY = (val: number) =>
  H - ((val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * H;

export const headerStats = [
  { label: "APY", value: "5.66%" },
  { label: "Total Deposited", value: "$266.97M" },
  { label: "Price", value: "$1.00" },
  { label: "Weekly Rewards", value: "—" },
];

export const capabilities = [
  {
    label: "APY Monitoring",
    desc: "Track sGHO savings rate changes in real-time",
  },
  {
    label: "Yield Optimization",
    desc: "Compare GHO yield vs other stablecoin strategies",
  },
  {
    label: "Wallet Balance Reader",
    desc: "Read GHO & sGHO balances from your wallet",
  },
];

export const automatedActions = [
  "Auto-deposit GHO when idle",
  "Withdraw & rebalance on yield drop",
];
