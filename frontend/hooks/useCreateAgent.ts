"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { type PolicySettings } from "@/constants/dolfin";
import { buildWalletClient, errMsg, getActiveWallet } from "@/lib/dolfin-wallet";
import { counterfactualAddress, grantSession, isDeployed, provisionAccount } from "@/lib/dolfin-actions";
import { generateSessionKey, loadSession, saveSession } from "@/lib/session-key-store";

export type Step = "idle" | "provision" | "configure" | "done";

export function useCreateAgent(onComplete?: () => void) {
  const { wallets } = useWallets();

  const [owner, setOwner] = useState<Address | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [accountExists, setAccountExists] = useState(false);
  const [sessionKey, setSessionKey] = useState<Address | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On connect: resolve counterfactual account + deployment status + any locally stored session key.
  useEffect(() => {
    const wallet = getActiveWallet(wallets);
    if (!wallet) return;
    const ownerAddr = wallet.address as Address;
    let cancelled = false;

    Promise.all([counterfactualAddress(ownerAddr), counterfactualAddress(ownerAddr).then(isDeployed)])
      .then(([addr, exists]) => {
        if (cancelled) return;
        setOwner(ownerAddr);
        setAccount(addr);
        setAccountExists(exists);
        setSessionKey(loadSession(ownerAddr)?.address ?? null);
      })
      .catch((e) => !cancelled && setError(errMsg(e, "Failed to load account state.")));

    return () => {
      cancelled = true;
    };
  }, [wallets]);

  // Provision (if needed) + generate a fresh session key + grant the scoped session.
  const create = async (settings: PolicySettings) => {
    setLoading(true);
    setError("");
    try {
      const wallet = getActiveWallet(wallets);
      if (!wallet) throw new Error("Please connect an external wallet first.");
      const { walletClient, owner: ownerAddr } = await buildWalletClient(wallet);

      setStep("provision");
      const acct = await provisionAccount(walletClient, ownerAddr);
      setAccount(acct);
      setAccountExists(true);

      const session = generateSessionKey(settings);
      setStep("configure");
      await grantSession(walletClient, ownerAddr, acct, session.address, settings);
      saveSession(ownerAddr, session);
      setSessionKey(session.address);

      setStep("done");
      onComplete?.();
    } catch (e: unknown) {
      console.error("[DOLFIN] create agent failed:", e);
      setError(errMsg(e, "Failed to create agent."));
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return { owner, account, accountExists, sessionKey, setSessionKey, step, loading, error, create };
}
