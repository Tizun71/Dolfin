"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { DOLFIN } from "@/constants/dolfin";
import { ACCOUNT_ABI, POLICY_MANAGER_ABI } from "@/constants/dolfin-abi";
import { buildWalletClient, errMsg, feeOverrides, getActiveWallet, publicClient } from "@/lib/dolfin-wallet";
import { editSession, grantSession, revokeKey } from "@/lib/dolfin-actions";
import { addSession, getSession, newSession, replaceSession, updateSessionSettings } from "@/lib/account-store";
import { type PolicySettings } from "@/constants/dolfin";
import { toast } from "sonner";

export interface AgentStatus {
  paused: boolean;
  revoked: boolean;
  expiry: number;
  expired: boolean;
  exposure: bigint;
  dayVolume: bigint;
  broken: boolean;
  // policy caps (Hyperbeat-style capacity context)
  maxTradePerTx: bigint;
  maxDailyVolume: bigint;
  maxExposure: bigint;
  maxLeverageBps: number;
}

// Read live (account, sessionKey) state. `expired` is computed here (off-render).
async function readStatus(account: Address, sessionKey: Address): Promise<AgentStatus> {
  const [paused, sk, exposure, dayVolume, broken, policy] = await Promise.all([
    publicClient.readContract({ address: account, abi: ACCOUNT_ABI, functionName: "accountPaused" }),
    publicClient.readContract({ address: account, abi: ACCOUNT_ABI, functionName: "sessionKeys", args: [sessionKey] }),
    publicClient.readContract({ address: DOLFIN.policyManager, abi: POLICY_MANAGER_ABI, functionName: "exposure", args: [account, sessionKey] }),
    publicClient.readContract({ address: DOLFIN.policyManager, abi: POLICY_MANAGER_ABI, functionName: "dayVolume", args: [account, sessionKey] }),
    publicClient.readContract({ address: DOLFIN.policyManager, abi: POLICY_MANAGER_ABI, functionName: "isBroken", args: [account, sessionKey] }),
    publicClient.readContract({ address: DOLFIN.policyManager, abi: POLICY_MANAGER_ABI, functionName: "getPolicy", args: [account, sessionKey] }),
  ]);
  const [validUntil, revoked] = sk as [number, boolean, boolean];
  const p = policy as {
    maxTradePerTx: bigint;
    maxDailyVolume: bigint;
    maxExposure: bigint;
    maxLeverageBps: number;
  };
  const expiry = Number(validUntil);
  return {
    paused: paused as boolean,
    revoked,
    expiry,
    expired: expiry * 1000 < Date.now(),
    exposure: exposure as bigint,
    dayVolume: dayVolume as bigint,
    broken: broken as boolean,
    maxTradePerTx: p.maxTradePerTx,
    maxDailyVolume: p.maxDailyVolume,
    maxExposure: p.maxExposure,
    maxLeverageBps: Number(p.maxLeverageBps),
  };
}

// Lifecycle controls (pause/resume/revoke/register/rotate) + live reads for (account, sessionKey).
export function useAgentManage(
  owner: Address | null,
  account: Address | null,
  sessionKey: Address | null,
  onSessionKeyChange: (key: Address) => void,
) {
  const { wallets } = useWallets();
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!account || !sessionKey) return;
    try {
      setStatus(await readStatus(account, sessionKey));
    } catch (e: unknown) {
      toast.error(errMsg(e, "Failed to load agent status."));
    }
  }, [account, sessionKey]);

  useEffect(() => {
    if (!account || !sessionKey) return;
    let cancelled = false;
    readStatus(account, sessionKey)
      .then((s) => !cancelled && setStatus(s))
      .catch((e) => !cancelled && toast.error(errMsg(e, "Failed to load agent status.")));
    return () => {
      cancelled = true;
    };
  }, [account, sessionKey]);

  // Run an owner-driven action with shared loading/error handling, then refresh.
  const run = async (label: string, fn: (wallet: Awaited<ReturnType<typeof buildWalletClient>>) => Promise<void>) => {
    if (!account || !owner) return;
    setLoading(true);
    try {
      const w = getActiveWallet(wallets);
      if (!w) throw new Error("Please connect an external wallet first.");
      const built = await buildWalletClient(w);
      await fn(built);
      await refresh();
    } catch (e: unknown) {
      console.error(`[DOLFIN] ${label} failed:`, e);
      toast.error(errMsg(e, `${label} failed.`));
    } finally {
      setLoading(false);
    }
  };

  const lifecycle = (functionName: "pauseAgent" | "resumeAgent") =>
    run(functionName, async ({ walletClient, owner: o }) => {
      const hash = await walletClient.writeContract({
        address: account!,
        abi: ACCOUNT_ABI,
        functionName,
        args: [],
        account: o,
        chain: walletClient.chain,
        ...(await feeOverrides()),
      });
      await publicClient.waitForTransactionReceipt({ hash });
    });

  const revoke = () =>
    sessionKey && run("revoke", async ({ walletClient, owner: o }) => {
      await revokeKey(walletClient, o, account!, sessionKey);
    });

  // Generate a fresh key + grant it from stored settings. Used when the current key is dead.
  const register = () =>
    run("register", async ({ walletClient, owner: o }) => {
      const stored = sessionKey && getSession(o, account!, sessionKey);
      if (!stored) throw new Error("No stored policy for this session.");
      const session = newSession(stored.settings);
      await grantSession(walletClient, o, account!, session.key, stored.settings);
      addSession(o, account!, session);
      onSessionKeyChange(session.key);
    });

  // Rotate: grant a new key (same policy), then revoke the old one. Owner signs both txs.
  const rotate = () =>
    sessionKey && run("rotate", async ({ walletClient, owner: o }) => {
      const stored = getSession(o, account!, sessionKey);
      if (!stored) throw new Error("No stored policy for this session.");
      const session = newSession(stored.settings);
      await grantSession(walletClient, o, account!, session.key, stored.settings);
      await revokeKey(walletClient, o, account!, sessionKey);
      replaceSession(o, account!, sessionKey, session);
      onSessionKeyChange(session.key);
    });

  // Edit policy in place: keep the same key, overwrite caps/scope on-chain + in the local store.
  const edit = (next: PolicySettings) =>
    sessionKey && run("edit", async ({ walletClient, owner: o }) => {
      const stored = getSession(o, account!, sessionKey);
      if (!stored) throw new Error("No stored policy for this session.");
      await editSession(walletClient, o, account!, sessionKey, stored.settings, next);
      updateSessionSettings(o, account!, sessionKey, next);
      onSessionKeyChange(sessionKey);
    });

  return {
    status,
    loading,
    refresh,
    pause: () => lifecycle("pauseAgent"),
    resume: () => lifecycle("resumeAgent"),
    revoke,
    register,
    rotate,
    edit,
  };
}
