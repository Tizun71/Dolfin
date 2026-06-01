// frontend/constants/vaults.ts

export const SETUP_STEPS = [
  {
    id: "sign",
    label: "Sign Authorization",
    desc: "Ký uỷ quyền offchain — miễn phí, không tốn gas",
  },
  {
    id: "approve",
    label: "Approve Token",
    desc: "Cho phép GMX Router dùng token — tốn gas nhỏ",
  },
  { id: "done", label: "Done", desc: "Hoàn tất, strategy sẵn sàng chạy" },
];

export const STEP_INDEX: Record<string, number> = {
  sign: 0,
  approve: 1,
  done: 2,
};

export interface AssetDetails {
  name: string;
  symbol: string;
  icon: string;
  color: string;
  apy: number;
  totalSuppliedStr: string;
  utilizationRate: string;
  lastAction: string;
  minVal: number;
  maxVal: number;
  w: number;
  h: number;
  avgApr: number;
  chartData: number[];
  headerStats: { label: string; value: string }[];
  collateral: { label: string; value: string }[];
  capabilities: { label: string; desc: string }[];
  automatedActions: string[];
}

export const ASSET_DETAILS_MAP: Record<string, AssetDetails> = {
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    color: "#627EEA",
    apy: 1.44,
    totalSuppliedStr: "$4.44B",
    utilizationRate: "89.98%",
    lastAction: "Monitoring health factor...",
    minVal: 2.0,
    maxVal: 2.7,
    w: 500,
    h: 120,
    avgApr: 2.23,
    chartData: [
      2.21, 2.35, 2.18, 2.42, 2.55, 2.31, 2.18, 2.44, 2.61, 2.38, 2.22, 2.15,
      2.33, 2.51, 2.48, 2.36, 2.19, 2.08, 2.24, 2.31, 2.43, 2.52, 2.38, 2.27,
      2.15, 2.22, 2.34, 2.41, 2.38, 2.27, 2.19, 2.24, 2.36, 2.44, 2.41, 2.33,
      2.19, 2.22, 2.34, 2.44,
    ],
    headerStats: [
      { label: "Reserve Size", value: "$4.44B" },
      { label: "Available Liquidity", value: "$445.20M" },
      { label: "Utilization Rate", value: "89.98%" },
      { label: "Oracle Price", value: "$2,307.45" },
    ],
    collateral: [
      { label: "Max LTV", value: "0%" },
      { label: "Liq. Threshold", value: "83.00%" },
      { label: "Liq. Penalty", value: "5.00%" },
    ],
    capabilities: [
      {
        label: "Tracking Health Factor",
        desc: "Monitor liquidation risk in real-time",
      },
      {
        label: "Market Volatility Forecast",
        desc: "Predict ETH price movements and adjust strategy",
      },
      {
        label: "Wallet Balance Reader",
        desc: "Read ETH & WETH balances from your wallet",
      },
    ],
    automatedActions: [
      "Deposit / Withdraw to avoid liquidation",
      "Adjust borrow ratio for safety",
    ],
  },
  sgho: {
    name: "Staked GHO",
    symbol: "sGHO",
    icon: "◎",
    color: "#BBCC11",
    apy: 5.66,
    totalSuppliedStr: "$266.97M",
    utilizationRate: "—",
    lastAction: "Tracking sGHO savings rate...",
    minVal: 5.58,
    maxVal: 5.68,
    w: 500,
    h: 120,
    avgApr: 5.62,
    chartData: [
      5.61, 5.63, 5.6, 5.62, 5.65, 5.61, 5.6, 5.63, 5.66, 5.64, 5.62, 5.61,
      5.63, 5.65, 5.66, 5.64, 5.61, 5.6, 5.62, 5.63, 5.65, 5.66, 5.64, 5.63,
      5.61, 5.62, 5.64, 5.65, 5.66, 5.63, 5.61, 5.62, 5.64, 5.66, 5.65, 5.63,
      5.61, 5.62, 5.64, 5.66,
    ],
    headerStats: [
      { label: "APY", value: "5.66%" },
      { label: "Total Deposited", value: "$266.97M" },
      { label: "Price", value: "$1.00" },
      { label: "Weekly Rewards", value: "—" },
    ],
    collateral: [
      { label: "Max LTV", value: "0%" },
      { label: "Liq. Threshold", value: "0%" },
      { label: "Liq. Penalty", value: "0%" },
    ],
    capabilities: [
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
    ],
    automatedActions: [
      "Auto-deposit GHO when idle",
      "Withdraw & rebalance on yield drop",
    ],
  },
  usdc: {
    name: "USD Coin",
    symbol: "USDC",
    icon: "$",
    color: "#2775CA",
    apy: 4.52,
    totalSuppliedStr: "$1.84B",
    utilizationRate: "82.07%",
    lastAction: "Stablecoin yield monitoring...",
    minVal: 4.4,
    maxVal: 4.65,
    w: 500,
    h: 120,
    avgApr: 4.51,
    chartData: [
      4.48, 4.52, 4.5, 4.55, 4.53, 4.49, 4.51, 4.54, 4.52, 4.5, 4.48, 4.53,
      4.55, 4.52, 4.5, 4.49, 4.51, 4.53, 4.55, 4.52, 4.5, 4.48, 4.52, 4.54,
      4.53, 4.51, 4.49, 4.52, 4.54, 4.52, 4.5, 4.48, 4.52, 4.55, 4.53, 4.51,
      4.49, 4.52, 4.54, 4.52,
    ],
    headerStats: [
      { label: "Reserve Size", value: "$1.84B" },
      { label: "Available Liquidity", value: "$330.12M" },
      { label: "Utilization Rate", value: "82.07%" },
      { label: "Oracle Price", value: "$1.00" },
    ],
    collateral: [
      { label: "Max LTV", value: "0%" },
      { label: "Liq. Threshold", value: "0%" },
      { label: "Liq. Penalty", value: "0%" },
    ],
    capabilities: [
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
    ],
    automatedActions: [
      "Deposit / Withdraw to avoid liquidation",
      "Adjust borrow ratio for safety",
    ],
  },
  usdt: {
    name: "Tether",
    symbol: "USDT",
    icon: "₮",
    color: "#26A17B",
    apy: 4.91,
    totalSuppliedStr: "$643.33M",
    utilizationRate: "92.33%",
    lastAction: "Monitoring health factor...",
    minVal: 4.78,
    maxVal: 5.0,
    w: 500,
    h: 120,
    avgApr: 4.9,
    chartData: [
      4.85, 4.9, 4.88, 4.93, 4.91, 4.87, 4.9, 4.93, 4.91, 4.89, 4.87, 4.91,
      4.93, 4.9, 4.88, 4.87, 4.9, 4.92, 4.94, 4.91, 4.89, 4.87, 4.91, 4.93,
      4.91, 4.89, 4.87, 4.91, 4.93, 4.91, 4.88, 4.87, 4.91, 4.94, 4.92, 4.9,
      4.87, 4.91, 4.93, 4.91,
    ],
    headerStats: [
      { label: "Reserve Size", value: "$643.33M" },
      { label: "Available Liquidity", value: "$49.33M" },
      { label: "Utilization Rate", value: "92.33%" },
      { label: "Oracle Price", value: "$1.00" },
    ],
    collateral: [
      { label: "Max LTV", value: "0%" },
      { label: "Liq. Threshold", value: "0%" },
      { label: "Liq. Penalty", value: "0%" },
    ],
    capabilities: [
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
    ],
    automatedActions: [
      "Deposit / Withdraw to avoid liquidation",
      "Adjust borrow ratio for safety",
    ],
  },
  wbtc: {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    icon: "₿",
    color: "#F7931A",
    apy: 0.37,
    totalSuppliedStr: "$2.42B",
    utilizationRate: "3.37%",
    lastAction: "Monitoring health factor...",
    minVal: 0.28,
    maxVal: 0.45,
    w: 500,
    h: 120,
    avgApr: 0.36,
    chartData: [
      0.32, 0.38, 0.35, 0.4, 0.36, 0.33, 0.39, 0.37, 0.34, 0.38, 0.36, 0.33,
      0.37, 0.4, 0.38, 0.35, 0.33, 0.36, 0.39, 0.37, 0.35, 0.33, 0.37, 0.4,
      0.38, 0.36, 0.33, 0.35, 0.38, 0.37, 0.34, 0.36, 0.39, 0.41, 0.38, 0.35,
      0.33, 0.36, 0.39, 0.37,
    ],
    headerStats: [
      { label: "Reserve Size", value: "$2.42B" },
      { label: "Available Liquidity", value: "$2.33B" },
      { label: "Utilization Rate", value: "3.37%" },
      { label: "Oracle Price", value: "$80,534.00" },
    ],
    collateral: [
      { label: "Max LTV", value: "70%" },
      { label: "Liq. Threshold", value: "75.00%" },
      { label: "Liq. Penalty", value: "6.25%" },
    ],
    capabilities: [
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
    ],
    automatedActions: [
      "Deposit / Withdraw to avoid liquidation",
      "Adjust borrow ratio for safety",
    ],
  },
  weeth: {
    name: "Ether.fi eETH",
    symbol: "weETH",
    icon: "⧫",
    color: "#E84142",
    apy: 0.009,
    totalSuppliedStr: "$2.71B",
    utilizationRate: "0.005%",
    lastAction: "Monitoring health factor...",
    minVal: 0.005,
    maxVal: 0.012,
    w: 500,
    h: 120,
    avgApr: 0.008,
    chartData: [
      0.008, 0.009, 0.007, 0.01, 0.008, 0.009, 0.007, 0.008, 0.01, 0.009, 0.007,
      0.008, 0.009, 0.01, 0.008, 0.007, 0.009, 0.008, 0.01, 0.009, 0.008, 0.007,
      0.009, 0.01, 0.008, 0.009, 0.007, 0.008, 0.01, 0.009, 0.007, 0.008, 0.009,
      0.01, 0.008, 0.007, 0.009, 0.008, 0.01, 0.009,
    ],
    headerStats: [
      { label: "Reserve Size", value: "$2.71B" },
      { label: "Available Liquidity", value: "$2.70B" },
      { label: "Utilization Rate", value: "0.005%" },
      { label: "Oracle Price", value: "$2,381.20" },
    ],
    collateral: [
      { label: "Max LTV", value: "72.5%" },
      { label: "Liq. Threshold", value: "78.00%" },
      { label: "Liq. Penalty", value: "6.00%" },
    ],
    capabilities: [
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
    ],
    automatedActions: [
      "Deposit / Withdraw to avoid liquidation",
      "Adjust borrow ratio for safety",
    ],
  },
  wsteth: {
    name: "Lido Staked ETH",
    symbol: "wstETH",
    icon: "⧫",
    color: "#00A3FF",
    apy: 0.25,
    totalSuppliedStr: "$1.27B",
    utilizationRate: "0.22%",
    lastAction: "Monitoring health factor...",
    minVal: 0.18,
    maxVal: 0.32,
    w: 500,
    h: 120,
    avgApr: 0.24,
    chartData: [
      0.22, 0.25, 0.23, 0.27, 0.24, 0.22, 0.26, 0.25, 0.23, 0.27, 0.24, 0.22,
      0.25, 0.27, 0.25, 0.23, 0.22, 0.24, 0.26, 0.25, 0.23, 0.22, 0.25, 0.27,
      0.25, 0.23, 0.22, 0.24, 0.26, 0.25, 0.23, 0.22, 0.25, 0.27, 0.25, 0.23,
      0.22, 0.24, 0.26, 0.25,
    ],
    headerStats: [
      { label: "Reserve Size", value: "$1.27B" },
      { label: "Available Liquidity", value: "$1.26B" },
      { label: "Utilization Rate", value: "0.22%" },
      { label: "Oracle Price", value: "$2,681.00" },
    ],
    collateral: [
      { label: "Max LTV", value: "78.5%" },
      { label: "Liq. Threshold", value: "81.00%" },
      { label: "Liq. Penalty", value: "5.00%" },
    ],
    capabilities: [
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
    ],
    automatedActions: [
      "Deposit / Withdraw to avoid liquidation",
      "Adjust borrow ratio for safety",
    ],
  },
};
