"use client";

import { useCallback, useEffect, useState } from "react";
import { type Address } from "viem";
import { TRANSFER_TOKENS, type TransferToken } from "@/constants/dolfin";
import { balanceOf } from "@/lib/dolfin-actions";
import { errMsg } from "@/lib/dolfin-wallet";
import { ONCHAIN_POLL_MS, useOnchainRefresh } from "@/lib/onchain-refresh";
import { toast } from "sonner";

export interface TokenBalance {
  token: TransferToken;
  balance: bigint;
}

// Read on-chain balances of all supported transfer tokens (ETH, USDC, WETH) for one holder.
// Polls every 5s and refetches immediately on a deposit/withdraw refresh event.
export function useTokenBalances(holder: Address | null) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

  // Background refetch: no spinner, swallow transient read errors to avoid toast spam on poll.
  const refetch = useCallback(async () => {
    if (!holder) return;
    try {
      const res = await Promise.all(
        TRANSFER_TOKENS.map((token) => balanceOf(token, holder).then((balance) => ({ token, balance }))),
      );
      setBalances(res);
    } catch {
      // keep prior balances on a flaky read
    }
  }, [holder]);

  useEffect(() => {
    if (!holder) {
      setBalances([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(TRANSFER_TOKENS.map((token) => balanceOf(token, holder).then((balance) => ({ token, balance }))))
      .then((res) => !cancelled && setBalances(res))
      .catch((e) => !cancelled && toast.error(errMsg(e, "Failed to read balances.")))
      .finally(() => !cancelled && setLoading(false));

    const id = setInterval(refetch, ONCHAIN_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [holder, refetch]);

  useOnchainRefresh(refetch);

  return { balances, loading, refetch };
}
