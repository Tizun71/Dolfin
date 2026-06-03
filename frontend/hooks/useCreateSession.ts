"use client";

import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { type PolicySettings } from "@/constants/dolfin";
import { buildWalletClient, errMsg, getActiveWallet } from "@/lib/dolfin-wallet";
import { grantSession } from "@/lib/dolfin-actions";
import { addSession, newSession } from "@/lib/account-store";
import { syncAgentConfig } from "@/lib/agent-api";
import { policyToBackend } from "@/lib/policy-to-backend";
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
      // Register the session with the backend so the autonomous cron agent runs with this
      // user's key + policy. Done after the on-chain grant confirms, so the backend never
      // gets a key the chain rejected. userId = owner address.
      await syncAgentConfig(owner, account, {
        sessionKey: session.privateKey,
        policy: policyToBackend(settings),
        enabled: true,
      });
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
