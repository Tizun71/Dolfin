"use client";

import { useState } from "react";

type StrategyStatus = "running" | "completed" | "stopped";

interface HistoryItem {
  asset: string;
  name: string;
  icon: string;
  color: string;
  apy: number;
  totalSupplied: string;
  status: StrategyStatus;
  startedAt: string;
}

const mockHistory: HistoryItem[] = [
  {
    asset: "eth",
    name: "Ethereum",
    icon: "Ξ",
    color: "#627EEA",
    apy: 1.44,
    totalSupplied: "$4.44B",
    status: "running",
    startedAt: "Oct 24, 14:32 UTC",
  },
  {
    asset: "sgho",
    name: "Savings GHO",
    icon: "◎",
    color: "#22c55e",
    apy: 5.66,
    totalSupplied: "$266.97M",
    status: "completed",
    startedAt: "Oct 23, 09:15 UTC",
  },
  {
    asset: "usdc",
    name: "USD Coin",
    icon: "$",
    color: "#2775CA",
    apy: 4.52,
    totalSupplied: "$1.84B",
    status: "completed",
    startedAt: "Oct 22, 11:20 UTC",
  },
  {
    asset: "wbtc",
    name: "Wrapped Bitcoin",
    icon: "B",
    color: "#F7931A",
    apy: 0.37,
    totalSupplied: "$2.42B",
    status: "stopped",
    startedAt: "Oct 21, 16:45 UTC",
  },
  {
    asset: "usdt",
    name: "Tether USD",
    icon: "₮",
    color: "#26A17B",
    apy: 4.91,
    totalSupplied: "$643.33M",
    status: "completed",
    startedAt: "Oct 20, 08:30 UTC",
  },
];

const statusConfig = {
  running: {
    label: "Running",
    color: "text-yellow-500",
    border: "border-yellow-600",
    bg: "bg-yellow-600/10",
    dot: "bg-yellow-500 animate-pulse",
  },
  completed: {
    label: "Completed",
    color: "text-green-400",
    border: "border-green-600",
    bg: "bg-green-600/10",
    dot: "bg-green-400",
  },
  stopped: {
    label: "Stopped",
    color: "text-[#666]",
    border: "border-[#333]",
    bg: "bg-[#111]",
    dot: "bg-[#555]",
  },
};

type FilterType = "all" | StrategyStatus;

export default function HistoryView() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Running", value: "running" },
    { label: "Completed", value: "completed" },
    { label: "Stopped", value: "stopped" },
  ];

  const filtered =
    filter === "all"
      ? mockHistory
      : mockHistory.filter((h) => h.status === filter);

  return (
    <div className="text-white font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-normal uppercase tracking-[4px] text-white mb-2">
          History
        </h1>
        <p className="text-[#444] text-xs font-mono uppercase tracking-[2px]">
          Review recent AI strategy executions
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 border-b border-[#1a1a1a] pb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-[2px] transition-all duration-300 border ${
              filter === f.value
                ? "border-white text-white bg-white/5"
                : "border-[#1a1a1a] text-[#444] hover:text-[#999] hover:border-[#333]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="border border-[#1a1a1a] bg-[#050505] p-16 text-center">
            <p className="text-[#444] text-xs font-mono uppercase tracking-[3px]">
              No history found
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const status = statusConfig[item.status];
            return (
              <div
                key={item.asset}
                className="border border-[#1a1a1a] bg-[#050505] px-6 py-5 flex items-center justify-between hover:border-[#2a2a2a] transition-all duration-300"
              >
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm border shrink-0"
                    style={{
                      borderColor: `${item.color}44`,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#444] text-xs font-mono uppercase tracking-[2px]">
                        {item.asset}
                      </p>
                      <span className="text-[#333] text-xs font-mono">·</span>
                      <p className="text-white text-xs font-mono uppercase tracking-[2px]">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-[#333] text-xs font-mono">
                      {item.startedAt}
                    </p>
                  </div>
                </div>

                {/* Right: APY + Status */}
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
                      APY
                    </p>
                    <p className="text-white text-sm font-light">{item.apy}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
                      Total Supplied
                    </p>
                    <p className="text-white text-sm font-light">
                      {item.totalSupplied}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 border ${status.border} ${status.bg}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                    />
                    <span
                      className={`text-xs uppercase tracking-[3px] font-mono ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
