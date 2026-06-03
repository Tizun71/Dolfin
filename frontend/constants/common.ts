export const ITEMS_DEVS = [
  {
    index: "01",
    title: "Security",
    desc: "Find and report vulnerabilities, receive generous rewards.",
    href: "#",
  },
  {
    index: "02",
    title: "SDK",
    desc: "Utilize our SDK to streamline frontend development and enhance user experiences.",
    href: "#",
  },
  {
    index: "03",
    title: "Github",
    desc: "Explore our open-source repository for collaborative development.",
    href: "https://github.com/Tizun71/Dolfin",
  },
  {
    index: "04",
    title: "Developer Docs",
    desc: "Access comprehensive documentation for seamless API integration.",
    href: "#",
  },
];

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
    title: "AI Trading Agents",
    description:
      "Create and manage autonomous AI agents that execute DeFi strategies 24/7 based on your custom policies and risk parameters.",
  },
  {
    icon: "zap",
    title: "Flash Loan Execution",
    description:
      "Access instant, uncollateralized loans for arbitrage and yield farming—all executed automatically within a single transaction block.",
  },
  {
    icon: "chart",
    title: "Real-Time Analytics",
    description:
      "Monitor portfolio performance, track agent activities, and view predictive market forecasts powered by advanced time-series analysis.",
  },
];

export const HOW_IT_WORKS_ITEMS = [
  {
    number: "01",
    title: "Authenticate with Privy",
    description:
      "Sign in with Google or connect your MetaMask wallet. Dolfin supports MetaMask and Rabby Wallet for seamless wallet integration.",
    icon: "lock",
  },
  {
    number: "02",
    title: "Deploy Your AI Agent",
    description:
      "Create a secure smart account (ERC-4337) powered by Arbitrum. Your agent is deployed with full control and protection.",
    icon: "cpu",
  },
  {
    number: "03",
    title: "Deposit & Fund Your Agent",
    description:
      "Transfer ETH or USDC from your wallet to your AI agent account. Your funds are ready for automated trading.",
    icon: "wallet",
  },
  {
    number: "04",
    title: "AI Executes Trades 24/7",
    description:
      "Set your risk policy (Conservative/Balanced/Aggressive) and let Dolfin's AI automatically execute profitable strategies around the clock.",
    icon: "trending-up",
  },
];
