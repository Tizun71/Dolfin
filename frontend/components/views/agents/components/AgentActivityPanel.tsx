"use client";

import { type Address } from "viem";
import { useAgentActivity, type AgentRun } from "@/hooks/useAgentActivity";
import { type RejectedDecisionView } from "@/lib/agent-api";
import Skeleton from "@/components/ui/Skeleton";

function ActivitySkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-32 h-3" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-4/5 h-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-full h-9 rounded" />
        <Skeleton className="w-full h-9 rounded" />
      </div>
    </div>
  );
}

const BTN = "px-5 py-2.5 text-xs uppercase tracking-[2px] font-mono border transition disabled:opacity-50";
const TX_BASE = "https://sepolia.arbiscan.io/tx/";
const short = (a: string) => `${a.slice(0, 8)}…${a.slice(-6)}`;

function statusDot(status: string): string {
  if (status === "running") return "bg-[#fb923c] animate-pulse";
  if (status === "succeeded") return "bg-[#4ade80]";
  if (status === "failed") return "bg-[#f87171]";
  return "bg-[#555]";
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function RunHeader({ run }: { run: AgentRun }) {
  const hf = run.portfolioSnapshot?.lending?.healthFactor;
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
      <span className={`w-2 h-2 rounded-full ${statusDot(run.status)}`} />
      <span className="uppercase tracking-[2px] text-[#ccc]">{run.status}</span>
      <span className="text-[#555]">·</span>
      <span className="text-[#888]">{fmtTime(run.startedAt)}</span>
      {run.riskLevel && (
        <>
          <span className="text-[#555]">·</span>
          <span className="text-[#888]">
            Risk: {run.riskLevel}
            {run.riskScore ? ` (${run.riskScore})` : ""}
          </span>
        </>
      )}
      {hf !== undefined && (
        <>
          <span className="text-[#555]">·</span>
          <span className={hf < 1.5 ? "text-[#f87171]" : "text-[#888]"}>
            Health: {hf >= 999 ? "∞" : hf.toFixed(2)}
          </span>
        </>
      )}
    </div>
  );
}

// Decisions the policy blocked before they cost gas. The headline guardrail proof:
// the agent proposed these, but the policy mirror (and on-chain PolicyManager) rejected them.
function RejectedList({ rejected }: { rejected: RejectedDecisionView[] }) {
  if (rejected.length === 0) return null;
  return (
    <div>
      <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">
        Blocked by Policy ({rejected.length})
      </p>
      <ul className="space-y-2">
        {rejected.map((r, i) => (
          <li key={i} className="border border-[#3a1f1f] rounded px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#f87171]">✕</span>
              <span className="text-[#ddd]">{r.decision.reason ?? `action ${r.decision.actionType}`}</span>
            </div>
            <p className="text-xs font-mono text-[#a06666] mt-1">{r.errors.join("; ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Shows what the backend AI agent actually did: latest run status, its advice, and the on-chain
// actions it submitted. "Run now" triggers a run on demand instead of waiting for the cron.
export default function AgentActivityPanel({
  owner,
  account,
}: {
  owner: Address | null;
  account: Address | null;
}) {
  const { data, loading, running, run, refresh, runState } = useAgentActivity(owner, account);
  const latest = data?.run ?? null;
  const actions = data?.actions ?? [];
  // Prefer the fresh live run; fall back to the persisted run so "Blocked by Policy"
  // survives a page reload (runState is in-memory and resets to null on reload).
  const rejected = runState?.rejected ?? latest?.rejected ?? [];

  return (
    <div className="card-3d p-6">
      <div className="flex items-center justify-between mb-6 border-b border-[#262626] pb-4">
        <h3 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">
          AI Agent Activity
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="text-[#666] hover:text-white text-xs font-mono uppercase tracking-[1px] transition"
          >
            ↻
          </button>
          <button onClick={run} disabled={running} className={`${BTN} btn-brand-outline`}>
            {running ? "Running…" : "Run Now"}
          </button>
        </div>
      </div>

      {loading && !latest ? (
        <ActivitySkeleton />
      ) : !latest ? (
        <div className="py-10 text-center">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[3px]">No agent runs yet</p>
          <p className="text-[#333] text-sm font-mono mt-3">
            Run the agent or wait for the scheduled tick.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <RunHeader run={latest} />

          {latest.error && (
            <p className="text-xs font-mono text-[#f87171] break-words">{latest.error}</p>
          )}

          {latest.advice && (
            <div>
              <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">Advice</p>
              <p className="text-sm text-[#ddd] leading-relaxed">{latest.advice}</p>
            </div>
          )}

          <div>
            <p className="text-[#666] text-xs font-mono uppercase tracking-[2px] mb-2">
              Actions ({actions.length})
            </p>
            {actions.length === 0 ? (
              <p className="text-[#555] text-sm font-mono">No on-chain actions this run.</p>
            ) : (
              <ul className="space-y-2">
                {actions.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 border border-[#1f1f1f] rounded px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white">{a.action}</span>
                      <span className="text-[#555] text-xs font-mono">· {a.details.protocol}</span>
                    </div>
                    {a.details.transactionHash ? (
                      <a
                        href={`${TX_BASE}${a.details.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#fb923c] hover:underline"
                      >
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

          <RejectedList rejected={rejected} />

          <p className="text-[#444] text-xs font-mono">
            Finished: {fmtTime(latest.finishedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
