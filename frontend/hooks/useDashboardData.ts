"use client";

import { useCallback, useEffect, useState } from "react";
import { type Address } from "viem";
import {
  getCrossChainPortfolio,
  getSessions,
  type CrossChainPortfolio,
  type SessionListItem,
} from "@/lib/agent-api";

export interface DashboardData {
  totalValueUsd: number;
  healthFactor: number | null;
  /** On-chain actions submitted across all runs. */
  executed: number;
  /** Decisions blocked by policy across all runs (the guardrail story). */
  blocked: number;
  allocation: CrossChainPortfolio["allocation"] | null;
  runs: SessionListItem[];
}

const EMPTY: DashboardData = {
  totalValueUsd: 0,
  healthFactor: null,
  executed: 0,
  blocked: 0,
  allocation: null,
  runs: [],
};

// Backend-backed dashboard for a single account. Aggregates the cross-chain
// portfolio (value + health factor) and the run history (executed vs blocked).
export function useDashboardData(owner: Address | null, account: Address | null) {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!owner || !account) {
      setData(EMPTY);
      return;
    }
    setLoading(true);
    try {
      const [portfolio, sessions] = await Promise.all([
        getCrossChainPortfolio(owner, account),
        getSessions(owner, account),
      ]);
      const executed = sessions.items.reduce((s, r) => s + r.actionCount, 0);
      const blocked = sessions.items.reduce((s, r) => s + r.rejectedCount, 0);
      setData({
        totalValueUsd: portfolio.totalValueUsd,
        healthFactor: portfolio.defi.portfolio.lending?.healthFactor ?? null,
        executed,
        blocked,
        allocation: portfolio.allocation,
        runs: sessions.items,
      });
    } catch {
      // backend unreachable — keep prior data
    } finally {
      setLoading(false);
    }
  }, [owner, account]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
}
