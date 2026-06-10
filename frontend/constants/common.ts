export const ASSET_CONFIG: Record<string, { icon: string; color: string }> = {
  eth: { icon: "Ξ", color: "#627EEA" },
  sgho: { icon: "◎", color: "#22c55e" },
  usdc: { icon: "$", color: "#2775CA" },
  usdt: { icon: "₮", color: "#26A17B" },
  wbtc: { icon: "B", color: "#F7931A" },
  wsteth: { icon: "◆", color: "#00A3FF" },
  weeth: { icon: "◆", color: "#9B59B6" },
};

export const SUPPORT_ITEMS = [
  {
    name: "GitHub",
    description: "View source code and contribute to Dolfin",
    href: "https://github.com/Tizun71/Dolfin",
    logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v11/icons/github.svg",
  },
  {
    name: "Arbitrum",
    description: "Learn about the network powering Dolfin",
    href: "https://arbitrum.io",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg",
  },
];

export const FEATURES_ITEMS = [
  {
    icon: "bot",
    title: "AI Market Prediction",
    description:
      "ARIMA algorithm analyzes market patterns. Predicts opportunities. Executes automatically when conditions align.",
  },
  {
    icon: "zap",
    title: "Flash Loan Execution",
    description:
      "Identify arbitrage. Execute instantly. No capital required. All automated within a single transaction.",
  },
  {
    icon: "chart",
    title: "Real-Time Dashboard",
    description:
      "Monitor predictions, trades, and your agent performance. See what ARIMA is analyzing. Always in control.",
  },
];

export const VALUE_PROPOSITION_ITEMS = [
  {
    icon: "clock",
    title: "ARIMA-Powered Predictions",
    description:
      "Advanced time-series analysis predicts market trends in real-time. Your AI sees patterns before they happen.",
  },
  {
    icon: "trending-up",
    title: "Flash Loans Without Capital",
    description:
      "Execute profitable arbitrage using automated flash loans. No collateral needed. Your capital stays safe.",
  },
  {
    icon: "shield",
    title: "Atomic Execution",
    description:
      "All trades happen in one transaction block. No slippage. No MEV exposure. Predictable and secure.",
  },
];

export const HOW_IT_WORKS_ITEMS = [
  {
    number: "01",
    title: "Connect Wallet",
    description:
      "Sign in with Google or connect MetaMask. Supports MetaMask, Rabby, and more.",
    icon: "lock",
  },
  {
    number: "02",
    title: "Deploy Agent",
    description:
      "We create a secure smart account (ERC-4337) on Arbitrum. Your AI agent. Your complete control.",
    icon: "cpu",
  },
  {
    number: "03",
    title: "Fund Your Agent",
    description:
      "Transfer ETH or USDC to your agent account. Ready to trade.",
    icon: "wallet",
  },
  {
    number: "04",
    title: "AI Predicts & Executes",
    description:
      "ARIMA analyzes markets. When opportunities match your risk level, it executes. Automatically.",
    icon: "trending-up",
  },
];
