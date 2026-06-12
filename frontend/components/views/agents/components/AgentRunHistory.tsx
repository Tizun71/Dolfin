"use client";

import { useCallback, useEffect, useState } from "react";
import { type Address } from "viem";
import {
  getSession,
  getSessions,
  type RejectedDecisionView,
  type SessionListItem,
} from "@/lib/agent-api";
import { type AgentAction, type AgentRun } from "@/hooks/useAgentActivity";

const TX_BASE = "https://sepolia.arbiscan.io/tx/";
const short = (a: string) => `${a.slice(0, 8)}…${a.slice(-6)}`;

function statusDot(status: string): string {
  if (status === "running") return "bg-[#fb923c] animate-pulse";
  if (status === "succeeded") return "bg-[#4ade80]";
  if (status === "failed") return "bg-[#f87171]";
  return "bg-[#555]";
}

function fmtTime(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : "—";
}

interface RunDetail {
  run: AgentRun;
  actions: AgentAction[];
}

function RunDetailBody({ detail }: { detail: RunDetail }) {
  const { run, actions } = detail;
  const rejected: RejectedDecisionView[] = run.rejected ?? [];
  return (
    <div className="mt-3 space-y-4 border-t border-[#1f1f1f] pt-3">
      {run.advice && <p className="text-sm text-[#bbb] leading-relaxed">{run.advice}</p>}

      <div>
        <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">
          Actions ({actions.length})
        </p>
        {actions.length === 0 ? (
          <p className="text-[#555] text-sm font-mono">No on-chain actions.</p>
        ) : (
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 border border-[#1f1f1f] rounded px-3 py-2">
                <span className="text-sm text-white">
                  {a.action} <span className="text-[#555] text-xs font-mono">· {a.details.protocol}</span>
                </span>
                {a.details.transactionHash ? (
                  <a href={`${TX_BASE}${a.details.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#fb923c] hover:underline">
                    {short(a.details.transactionHash)} ↗
                  </a>
                ) : (
                  <span className="text-xs font-mono text-[#555]">not submitted</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {rejected.length > 0 && (
        <div>
          <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">
            Blocked by Policy ({rejected.length})
          </p>
          <ul className="space-y-2">
            {rejected.map((r, i) => (
              <li key={i} className="border border-[#3a1f1f] rounded px-3 py-2">
                <span className="text-sm text-[#ddd]">
                  <span className="text-[#f87171]">✕</span> {r.decision.reason ?? `action ${r.decision.actionType}`}
                </span>
                <p className="text-xs font-mono text-[#a06666] mt-1">{r.errors.join("; ")}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Persisted run history for an account, sourced from the DB (/sessions). Survives reloads.
// The first row is the latest run already expanded in AgentActivityPanel, so history starts
// from the second run to avoid duplication.
export default function AgentRunHistory({ owner, account }: { owner: Address | null; account: Address | null }) {
  const [items, setItems] = useState<SessionListItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, RunDetail>>({});

  const load = useCallback(async () => {
    if (!owner || !account) return;
    try {
      const res = await getSessions(owner, account);
      setItems(res.items);
    } catch {
      // backend unreachable: keep previous list
    }
  }, [owner, account]);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const toggle = async (runId: string) => {
    if (expanded === runId) {
      setExpanded(null);
      return;
    }
    setExpanded(runId);
    if (!details[runId] && owner && account) {
      try {
        const d = (await getSession(owner, account, runId)) as RunDetail;
        setDetails((prev) => ({ ...prev, [runId]: d }));
      } catch {
        // leave row expanded with no detail; user can retry
      }
    }
  };

  // Skip the first (latest) run; AgentActivityPanel already shows it in full.
  const past = items.slice(1);
  if (past.length === 0) return null;

  return (
    <div className="card-3d p-6">
      <h3 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-6 border-b border-[#262626] pb-4">
        Run History ({past.length})
      </h3>
      <ul className="space-y-2">
        {past.map((it) => (
          <li key={it.id} className="border border-[#1f1f1f] rounded">
            <button
              onClick={() => toggle(it.id)}
              className="w-full flex flex-wrap items-center gap-3 px-3 py-3 text-xs font-mono text-left hover:bg-[#141414] transition"
            >
              <span className={`w-2 h-2 rounded-full ${statusDot(it.status)}`} />
              <span className="uppercase tracking-[1px] text-[#ccc]">{it.status}</span>
              <span className="text-[#555]">·</span>
              <span className="text-[#888]">{fmtTime(it.startedAt)}</span>
              <span className="text-[#555]">·</span>
              <span className="text-[#888]">{it.actionCount} act</span>
              {it.rejectedCount > 0 && <span className="text-[#a06666]">{it.rejectedCount} blocked</span>}
              {it.riskLevel && <span className="text-[#888]">· risk {it.riskLevel}</span>}
              <span className={`ml-auto transition-transform ${expanded === it.id ? "rotate-90" : ""}`}>▸</span>
            </button>
            {expanded === it.id && (
              <div className="px-3 pb-3">
                {details[it.id] ? (
                  <RunDetailBody detail={details[it.id]} />
                ) : (
                  <p className="text-[#555] text-xs font-mono mt-2">Loading…</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
