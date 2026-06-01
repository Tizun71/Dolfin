"use client";

import { formatUnits } from "viem";

const usd = (v: bigint) => `$${Number(formatUnits(v, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

// Hyperbeat-style capacity bar: usage filled against a policy cap.
export default function UtilizationBar({
  label,
  used,
  cap,
  color = "#627EEA",
}: {
  label: string;
  used: bigint;
  cap: bigint;
  color?: string;
}) {
  const pct = cap > BigInt(0) ? Math.min(100, Number((used * BigInt(10000)) / cap) / 100) : 0;
  const hot = pct >= 80;

  return (
    <div className="card-3d p-8">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">{label}</p>
        <p className="text-xs font-mono text-[#888]">{pct.toFixed(0)}%</p>
      </div>
      <p className="text-2xl font-normal text-white tracking-[1px]">
        {usd(used)} <span className="text-[#555] text-base">/ {usd(cap)}</span>
      </p>
      <div className="mt-5 h-1.5 w-full bg-[#1a1a1a] overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: hot ? "#e0533d" : color }}
        />
      </div>
    </div>
  );
}
