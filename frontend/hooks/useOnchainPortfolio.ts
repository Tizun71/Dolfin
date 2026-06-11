"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { readOnchainPortfolio, type OnchainPortfolio } from "@/lib/onchain-portfolio";

const EMPTY: OnchainPortfolio = {
  totalValueUsd: 0,
  aavePositionUsd: 0,
  healthFactor: null,
  allocation: { stablePct: 0, equityPct: 0 },
};

// On-chain total value + Aave health factor for a single smart account.
export function useOnchainPortfolio(account: Address | null) {
  const [data, setData] = useState<OnchainPortfolio>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account) {
      setData(EMPTY);
      return;
    }
    let cancelled = false;
    setLoading(true);
    readOnchainPortfolio(account)
      .then((p) => !cancelled && setData(p))
      .catch(() => {}) // read failure — keep prior data
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [account]);

  return { data, loading };
}
