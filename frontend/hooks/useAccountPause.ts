"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { ACCOUNT_ABI } from "@/constants/dolfin-abi";
import { buildWalletClient, errMsg, feeOverrides, getActiveWallet, publicClient } from "@/lib/dolfin-wallet";
import { toast } from "sonner";

// Account-wide kill switch (DolfinSmartAccount.accountPaused). pauseAgent/resumeAgent pause ALL sessions.
export function useAccountPause(owner: Address | null, account: Address | null) {
  const { wallets } = useWallets();
  const [paused, setPaused] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!account) return;
    try {
      const p = await publicClient.readContract({ address: account, abi: ACCOUNT_ABI, functionName: "accountPaused" });
      setPaused(p as boolean);
    } catch (e: unknown) {
      toast.error(errMsg(e, "Failed to read account pause state."));
    }
  }, [account]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async () => {
    if (!account || !owner || paused == null) return;
    const functionName = paused ? "resumeAgent" : "pauseAgent";
    setLoading(true);
    try {
      const w = getActiveWallet(wallets);
      if (!w) throw new Error("Please connect an external wallet first.");
      const { walletClient, owner: o } = await buildWalletClient(w);
      const hash = await walletClient.writeContract({
        address: account,
        abi: ACCOUNT_ABI,
        functionName,
        args: [],
        account: o,
        chain: walletClient.chain,
        ...(await feeOverrides()),
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await refresh();
      toast.success(paused ? "Account resumed." : "Account paused — all sessions halted.");
    } catch (e: unknown) {
      console.error(`[DOLFIN] ${functionName} failed:`, e);
      toast.error(errMsg(e, `${functionName} failed.`));
    } finally {
      setLoading(false);
    }
  };

  return { paused, loading, toggle, refresh };
}
