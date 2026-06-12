import type { Address } from "viem";
import { createLlm } from "./llm.js";
import { ChainId } from "../../configs/chain.js";
import { PortfolioEngine, type WalletPortfolio } from "../portfolio-engine/PortfolioEngine.js";
import { loadEquityRegistry } from "../portfolio-engine/equity-registry.js";
import { ADDRESSES, TOKEN_REGISTRY } from "./config/onchain-config.js";

export interface CrossChainPortfolio {
  // DeFi side: stablecoins + Aave lending on Arbitrum Sepolia.
  defi: { chainId: number; portfolio: WalletPortfolio };
  // Equity side: tokenized stocks on Robinhood Chain testnet.
  equity: { chainId: number; portfolio: WalletPortfolio };
  totalValueUsd: number;
  // Split of total value between stable/DeFi and equity, in percent.
  allocation: { stablePct: number; equityPct: number };
  // Advice-only allocation suggestion.
  advice?: string;
}

// Read-only cross-chain view. The same wallet address is used on both chains (CREATE2
// accounts are deterministic). No session key, no execution: just aggregation + advice.
export async function readCrossChainPortfolio(wallet: Address): Promise<CrossChainPortfolio> {
  const defiEngine = new PortfolioEngine(
    ChainId.ARBITRUM_SEPOLIA,
    Object.values(TOKEN_REGISTRY),
    ADDRESSES.aavePool,
  );
  const equityTokens = loadEquityRegistry();
  const equityEngine = new PortfolioEngine(ChainId.ROBINHOOD_TESTNET, equityTokens);

  const [defi, equity] = await Promise.all([
    defiEngine.getWalletPortfolio(wallet),
    equityTokens.length > 0
      ? equityEngine.getWalletPortfolio(wallet)
      : Promise.resolve<WalletPortfolio>({ totalValueUsd: 0, assets: [] }),
  ]);

  const defiUsd = defi.totalValueUsd;
  const equityUsd = equity.totalValueUsd;
  const totalValueUsd = defiUsd + equityUsd;
  const stablePct = totalValueUsd > 0 ? round1((defiUsd / totalValueUsd) * 100) : 0;
  const equityPct = totalValueUsd > 0 ? round1((equityUsd / totalValueUsd) * 100) : 0;

  const result: CrossChainPortfolio = {
    defi: { chainId: ChainId.ARBITRUM_SEPOLIA, portfolio: defi },
    equity: { chainId: ChainId.ROBINHOOD_TESTNET, portfolio: equity },
    totalValueUsd,
    allocation: { stablePct, equityPct },
  };
  result.advice = await deriveAllocationAdvice(result);
  return result;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const SYSTEM_PROMPT =
  "You are Dolfin's cross-chain allocation advisor. Given a portfolio split between DeFi " +
  "stablecoin yield (Arbitrum/Aave) and tokenized equities (Robinhood Chain), suggest at most " +
  "one allocation adjustment in ONE sentence, citing the current percentages. This is advice " +
  "only. Never claim an action was taken, never mention bridging mechanics.";

// One-line allocation suggestion. Failure yields a deterministic fallback.
async function deriveAllocationAdvice(p: CrossChainPortfolio): Promise<string> {
  const summary =
    `Total $${p.totalValueUsd.toFixed(2)}: ${p.allocation.stablePct}% DeFi stable/yield, ` +
    `${p.allocation.equityPct}% tokenized equity.`;
  try {
    const llm = createLlm();
    const res = await llm.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: summary },
    ]);
    return String(res.content);
  } catch {
    return `${summary} (allocation advisor unavailable)`;
  }
}
