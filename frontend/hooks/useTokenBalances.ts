"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { TRANSFER_TOKENS, type TransferToken } from "@/constants/dolfin";
import { balanceOf } from "@/lib/dolfin-actions";
import { errMsg } from "@/lib/dolfin-wallet";
import { toast } from "sonner";

export interface TokenBalance {
  token: TransferToken;
  balance: bigint;
}

// Read on-chain balances of all supported transfer tokens (ETH, USDC, WETH) for one holder.
export function useTokenBalances(holder: Address | null) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);

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
    return () => {
      cancelled = true;
    };
  }, [holder]);

  return { balances, loading };
}
