"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Address } from "viem";
import { useAccounts } from "@/hooks/useAccounts";
import { useDashboardData } from "@/hooks/useDashboardData";
import AgentActivityPanel from "@/components/views/agents/components/AgentActivityPanel";
import CrossChainPanel from "@/components/views/agents/components/CrossChainPanel";

const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function DashboardView() {
  const { owner, accounts } = useAccounts();
  const [selected, setSelected] = useState<Address | null>(null);

  // Default to the first account once they load; keep the user's choice otherwise.
  useEffect(() => {
    if (!selected && accounts.length > 0) setSelected(accounts[0].address);
  }, [accounts, selected]);

  const { data, loading } = useDashboardData(owner, selected);
  const hf = data.healthFactor;

  if (accounts.length === 0) {
    return (
      <div className="text-white font-sans">
        <h1 className="text-3xl font-normal uppercase tracking-[4px] mb-12">Dolfin A.I</h1>
        <div className="border border-[#1a1a1a] bg-[#050505] p-16 text-center">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[3px] mb-4">No accounts yet</p>
          <Link href="/agents" className="text-[#fb923c] text-sm font-mono hover:underline">
            Create an account to get started →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white font-sans">
      <div className="flex items-end justify-between mb-12">
        <h1 className="text-3xl font-normal uppercase tracking-[4px]">Dolfin A.I</h1>
        {accounts.length > 1 && (
          <select
            value={selected ?? ""}
            onChange={(e) => setSelected(e.target.value as Address)}
            className="bg-[#0a0a0a] border border-[#262626] text-[#ccc] text-xs font-mono px-3 py-2"
          >
            {accounts.map((a) => (
              <option key={a.address} value={a.address}>
                Account #{a.salt + 1} · {short(a.address)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Overview cards — all backend-backed */}
      <div className="grid grid-cols-3 gap-8 mb-16">
        <div className="card-3d p-8">
          <p className="text-[#666] text-xs font-mono uppercase tracking-[2px]">Total Value</p>
          <p className="text-4xl font-normal text-white mt-4 tracking-[1px]">
            {loading ? "…" : usd(data.totalValueUsd)}
          </p>
          <p className="text-[#ccc] text-sm mt-2 tracking-wide">
            {data.allocation
              ? `${data.allocation.stablePct}% DeFi · ${data.allocation.equityPct}% equity`
              : "DeFi + tokenized equity"}
          </p>
        </div>

        <div className="card-3d p-8">
          <p className="text-[#666] text-xs font-mono uppercase tracking-[2px]">Health Factor</p>
          <p
            className={`text-4xl font-normal mt-4 tracking-[1px] ${
              hf !== null && hf < 1.5 ? "text-[#f87171]" : "text-white"
            }`}
          >
            {hf === null ? "—" : hf >= 999 ? "∞" : hf.toFixed(2)}
          </p>
          <p className="text-[#ccc] text-sm mt-2 tracking-wide">
            {hf === null ? "No Aave position" : hf < 1.5 ? "At risk — add collateral" : "Healthy"}
          </p>
        </div>

        <div className="card-3d p-8">
          <p className="text-[#666] text-xs font-mono uppercase tracking-[2px]">Guardrail</p>
          <p className="text-4xl font-normal text-white mt-4 tracking-[1px]">
            {data.executed}
            <span className="text-[#666] text-2xl"> / </span>
            <span className="text-[#f87171]">{data.blocked}</span>
          </p>
          <p className="text-[#ccc] text-sm mt-2 tracking-wide">
            {data.executed} executed · {data.blocked} blocked by policy
          </p>
        </div>
      </div>

      {/* Live agent activity + cross-chain allocation (reused panels) */}
      <div className="space-y-8">
        <AgentActivityPanel owner={owner} account={selected} />
        <CrossChainPanel owner={owner} account={selected} />
      </div>
    </div>
  );
}
