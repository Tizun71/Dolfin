"use client";

import { useCallback, useEffect, useState } from "react";
import { type Address } from "viem";
import { getLatestSession, runAgent } from "@/lib/agent-api";
import { toast } from "sonner";

// Shapes mirror the backend serializers (dolfin-agent/index.ts: serializeRun / serializeAction).
export interface AgentAction {
  id: string;
  action: string;
  actionType: string;
  details: {
    asset: string | null;
    amount: string;
    amountUsd: number | null;
    protocol: string;
    transactionHash: string | null;
  };
}

export interface AgentRun {
  id: string;
  status: "running" | "succeeded" | "failed" | string;
  startedAt: string;
  finishedAt: string | null;
  error: string | null;
  advice: string | null;
  riskLevel: string | null;
  riskScore: string | null;
}

interface LatestSession {
  run: AgentRun | null;
  actions: AgentAction[];
}

// Drives the AgentActivityPanel: loads the latest backend run for (owner, account) and lets the
// user trigger an on-demand run (POST /run) instead of waiting for the hourly cron.
export function useAgentActivity(owner: Address | null, account: Address | null) {
  const [data, setData] = useState<LatestSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    if (!owner || !account) return;
    setLoading(true);
    try {
      setData((await getLatestSession(owner, account)) as LatestSession);
    } catch {
      // backend unreachable — leave previous data, surface nothing (panel shows empty state)
    } finally {
      setLoading(false);
    }
  }, [owner, account]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async () => {
    if (!owner || !account) return;
    setRunning(true);
    try {
      await runAgent(owner, account);
      toast.success("Agent run complete.");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Agent run failed.");
    } finally {
      setRunning(false);
    }
  };

  return { data, loading, running, run, refresh: load };
}
