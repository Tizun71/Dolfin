"use client";

import { useCallback, useEffect, useState } from "react";
import { type Address } from "viem";
import { readOnchainPortfolio, type OnchainPortfolio } from "@/lib/onchain-portfolio";
import { ONCHAIN_POLL_MS, useOnchainRefresh } from "@/lib/onchain-refresh";

const EMPTY: OnchainPortfolio = {
  totalValueUsd: 0,
  aavePositionUsd: 0,
  aaveCollateralUsd: 0,
  aaveDebtUsd: 0,
  healthFactor: null,
  allocation: { stablePct: 0, equityPct: 0 },
};

// On-chain total value + Aave health factor for a single smart account.
// Polls every 5s and refetches immediately on a deposit/withdraw refresh event.
export function useOnchainPortfolio(account: Address | null) {
  const [data, setData] = useState<OnchainPortfolio>(EMPTY);
  const [loading, setLoading] = useState(false);

  // Background refetch: keep prior data on a failed read (no flicker to empty).
  const refetch = useCallback(async () => {
    if (!account) return;
    try {
      setData(await readOnchainPortfolio(account));
    } catch {
      // keep prior data
    }
  }, [account]);

  useEffect(() => {
    if (!account) {
      setData(EMPTY);
      return;
    }
    let cancelled = false;
    setLoading(true);
    readOnchainPortfolio(account)
      .then((p) => !cancelled && setData(p))
      .catch(() => {}) // read failure: keep prior data
      .finally(() => !cancelled && setLoading(false));

    const id = setInterval(refetch, ONCHAIN_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [account, refetch]);

  useOnchainRefresh(refetch);

  return { data, loading, refetch };
}
