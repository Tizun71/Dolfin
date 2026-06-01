"use client";

import { Check } from "lucide-react";
import { ACTION_LABELS, PROTOCOLS, TOKENS, type PolicySettings } from "@/constants/dolfin";

const usd = (v: string) => `$${Number(v || 0).toLocaleString()}`;
const symbolOf = (addr: string) => TOKENS.find((t) => t.address.toLowerCase() === addr.toLowerCase())?.symbol ?? addr.slice(0, 6);

// Live plain-English review of what the agent is being granted + the activate CTA.
export default function SummaryPanel({
  settings,
  loading,
  onSubmit,
}: {
  settings: PolicySettings;
  loading: boolean;
  onSubmit: () => void;
}) {
  const grants = PROTOCOLS.filter((p) => (settings.protocols[p.key] ?? []).length > 0).map(
    (p) => `${(settings.protocols[p.key] ?? []).map((a) => ACTION_LABELS[a]).join(", ")} on ${p.name}`,
  );
  const tokens = settings.tokens.map(symbolOf).join(", ") || "—";

  const lines = [
    grants.length ? `Can: ${grants.join("; ")}` : "No protocol actions selected",
    `Tokens: ${tokens}`,
    `${usd(settings.maxTradePerTx)} max per trade`,
    `${usd(settings.maxDailyVolume)} daily volume cap`,
    `${usd(settings.maxExposure)} max exposure`,
    `Leverage up to ${Math.round(settings.maxLeverageBps / 10000)}x`,
    `Stops at ${usd(settings.maxLossPerDay)} daily loss / ${Math.round(settings.maxDrawdownBps / 100)}% drawdown`,
    `Expires in ${settings.expiryDays} day${settings.expiryDays === 1 ? "" : "s"}`,
  ];

  const ready = grants.length > 0 && settings.tokens.length > 0;

  return (
    <div className="card-3d p-8 lg:sticky lg:top-6">
      <h3 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-6 border-b border-[#262626] pb-4">
        Summary
      </h3>

      <ul className="space-y-3 mb-8">
        {lines.map((l, i) => (
          <li key={i} className="flex items-start gap-2 text-[#bbb] text-xs font-mono leading-relaxed">
            <Check className="w-3.5 h-3.5 text-[#f97316] mt-0.5 shrink-0" />
            {l}
          </li>
        ))}
      </ul>

      <p className="text-[#555] text-xs font-mono leading-relaxed mb-6">
        Generates a fresh session key, grants it this policy, and registers it on-chain. Owner signs once.
      </p>

      <button
        onClick={onSubmit}
        disabled={loading || !ready}
        className="w-full py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition disabled:opacity-40"
      >
        {loading ? "Processing…" : "Create Agent →"}
      </button>
    </div>
  );
}
