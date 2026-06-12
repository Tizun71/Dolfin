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
    title: "AI Strategy Engine",
    description:
      "A multi-step agent scans Aave yields and GMX funding rates, then plans allocations. It only acts when the strategy fits your goals.",
  },
  {
    icon: "zap",
    title: "On-Chain Policy Control",
    description:
      "Every swap, lend, borrow, and perp is checked against your on-chain policy: max trade size, daily loss, exposure, and leverage caps.",
  },
  {
    icon: "chart",
    title: "Real-Time Dashboard",
    description:
      "Watch what the agent discovers, the risk score behind each move, and your portfolio in real time. Always in control.",
  },
];

export const VALUE_PROPOSITION_ITEMS = [
  {
    icon: "clock",
    title: "AI Strategy Engine",
    description:
      "An agent pipeline analyzes markets, scores risk, and plans moves across Aave and GMX. Strategy you can read, not a black box.",
  },
  {
    icon: "trending-up",
    title: "You Set The Rules",
    description:
      "Grant the AI a scoped session key bound to an on-chain policy. It can only trade within your limits. No limits, no action.",
  },
  {
    icon: "shield",
    title: "Risk-Scored Execution",
    description:
      "Health factor, leverage, and drawdown are scored LOW to CRITICAL before any action. Risky moves are blocked, not gambled.",
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
    title: "Deploy & Set Policy",
    description:
      "We deploy your ERC-4337 smart account on Arbitrum. You set the policy: max trade size, daily loss, exposure, and leverage caps.",
    icon: "cpu",
  },
  {
    number: "03",
    title: "Fund Your Agent",
    description:
      "Transfer tokens to your smart account. The agent trades from here, never from your wallet.",
    icon: "wallet",
  },
  {
    number: "04",
    title: "AI Plans & Executes",
    description:
      "The agent scans market, scores risk, and acts through a session key, only within the policy you set.",
    icon: "trending-up",
  },
];
