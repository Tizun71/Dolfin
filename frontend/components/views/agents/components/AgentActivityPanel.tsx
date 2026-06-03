"use client";

import { type Address } from "viem";
import { useAgentActivity, type AgentRun } from "@/hooks/useAgentActivity";

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
  const { data, loading, running, run, refresh } = useAgentActivity(owner, account);
  const latest = data?.run ?? null;
  const actions = data?.actions ?? [];

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

      {!latest ? (
        <div className="py-10 text-center">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[3px]">
            {loading ? "Loading…" : "No agent runs yet"}
          </p>
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

          <p className="text-[#444] text-xs font-mono">
            Finished: {fmtTime(latest.finishedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
