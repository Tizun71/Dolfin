"use client";

import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { type PolicySettings } from "@/constants/dolfin";
import { buildWalletClient, errMsg, getActiveWallet } from "@/lib/dolfin-wallet";
import { grantSession } from "@/lib/dolfin-actions";
import { addSession, newSession } from "@/lib/account-store";
import { toast } from "sonner";

// Create a new scoped session (AI agent) on an already-deployed account.
export function useCreateSession(account: Address | null, onDone: () => void) {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);

  const create = async (settings: PolicySettings) => {
    setLoading(true);
    try {
      const wallet = getActiveWallet(wallets);
      if (!wallet) throw new Error("Please connect an external wallet first.");
      if (!account) throw new Error("Account not ready.");
      const { walletClient, owner } = await buildWalletClient(wallet);

      const session = newSession(settings);
      await grantSession(walletClient, owner, account, session.key, settings);
      addSession(owner, account, session);
      onDone();
    } catch (e: unknown) {
      console.error("[DOLFIN] create session failed:", e);
      toast.error(errMsg(e, "Failed to create session."));
    } finally {
      setLoading(false);
    }
  };

  return { loading, create };
}
