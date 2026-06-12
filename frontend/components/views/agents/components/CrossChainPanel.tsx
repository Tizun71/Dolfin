"use client";

import { useCallback, useEffect, useState } from "react";
import { type Address } from "viem";
import { getCrossChainPortfolio, type CrossChainPortfolio } from "@/lib/agent-api";
import Skeleton from "@/components/ui/Skeleton";

const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function CrossChainSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-10 h-3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-24 h-6" />
          <Skeleton className="w-10 h-3" />
        </div>
      </div>
      <Skeleton className="w-full h-2 rounded" />
      <Skeleton className="w-28 h-3" />
    </div>
  );
}

// Read-only cross-chain view: DeFi stable/yield (Arbitrum) vs tokenized equity
// (Robinhood Chain), with an advice-only allocation suggestion. No bridging, no execution.
export default function CrossChainPanel({
  owner,
  account,
}: {
  owner: Address | null;
  account: Address | null;
}) {
  const [data, setData] = useState<CrossChainPortfolio | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!owner || !account) return;
    setLoading(true);
    try {
      setData(await getCrossChainPortfolio(owner, account));
    } catch {
      // backend unreachable: keep prior data, panel shows empty state
    } finally {
      setLoading(false);
    }
  }, [owner, account]);

  useEffect(() => {
    load();
  }, [load]);

  const alloc = data?.allocation;

  return (
    <div className="card-3d p-6">
      <div className="flex items-center justify-between mb-6 border-b border-[#262626] pb-4">
        <h3 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">
          Cross-Chain Allocation
        </h3>
        <button
          onClick={load}
          className="text-[#666] hover:text-white text-xs font-mono uppercase tracking-[1px] transition"
        >
          ↻
        </button>
      </div>

      {loading && !data ? (
        <CrossChainSkeleton />
      ) : !data ? (
        <p className="text-[#444] text-xs font-mono uppercase tracking-[3px] py-8 text-center">
          No cross-chain data
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-6 sm:divide-x divide-[#262626]">
            <div>
              <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">
                DeFi / Yield (Arbitrum)
              </p>
              <p className="text-lg text-white">{usd(data.defi.portfolio.totalValueUsd)}</p>
              <p className="text-xs font-mono text-[#fb923c] mt-1">{alloc?.stablePct ?? 0}%</p>
            </div>
            <div className="sm:pl-6">
              <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">
                Equity (Robinhood)
              </p>
              <p className="text-lg text-white">{usd(data.equity.portfolio.totalValueUsd)}</p>
              <p className="text-xs font-mono text-[#60a5fa] mt-1">{alloc?.equityPct ?? 0}%</p>
            </div>
          </div>

          {/* Allocation bar */}
          <div className="h-2 w-full rounded overflow-hidden bg-[#1a1a1a] flex">
            <div className="bg-[#fb923c]" style={{ width: `${alloc?.stablePct ?? 0}%` }} />
            <div className="bg-[#60a5fa]" style={{ width: `${alloc?.equityPct ?? 0}%` }} />
          </div>

          <p className="text-[#888] text-xs font-mono">Total: {usd(data.totalValueUsd)}</p>

          {data.advice && (
            <div>
              <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">Suggestion</p>
              <p className="text-sm text-[#ddd] leading-relaxed">{data.advice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
