"use client";

import { useRunningStrategies } from "@/hooks/useRunningStrategies";
import StrategyCard from "./components/StrategyCard";

export default function DashboardView() {
  const { strategies } = useRunningStrategies();

  const totalAPY =
    strategies.length > 0
      ? (
          strategies.reduce((sum, s) => sum + s.apy, 0) / strategies.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="text-white font-sans">
      <h1 className="text-3xl font-normal uppercase tracking-[4px] mb-12 text-white">
        Dolfin A.I
      </h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-8 mb-16">
        <div className="card-3d p-8">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">
            Active Strategies
          </p>
          <p className="text-4xl font-normal text-white mt-4 tracking-[1px]">
            {strategies.length}
          </p>
          <p className="text-[#cccccc] text-sm mt-2 tracking-wide">
            {strategies.length > 0 ? "Running" : "No active strategies"}
          </p>
        </div>

        <div className="card-3d p-8">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">
            Average APY
          </p>
          <p className="text-4xl font-normal text-white mt-4 tracking-[1px]">
            {totalAPY}%
          </p>
        </div>

        <div className="card-3d p-8">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">
            AI Rebalancing Status
          </p>
          <p className="text-2xl font-normal text-white mt-5 tracking-[2px] uppercase">
            {strategies.length > 0 ? "Active" : "Idle"}
          </p>
          <p className="text-[#cccccc] text-sm mt-2 tracking-wide">
            {strategies.length > 0
              ? `${strategies.length} strategies running`
              : "Run a strategy to start"}
          </p>
        </div>
      </div>

      {/* Strategy Grid */}
      {strategies.length > 0 ? (
        <div className="mb-16">
          <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] mb-6 border-b border-[#1a1a1a] pb-4">
            Running Strategies
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <StrategyCard key={strategy.asset} strategy={strategy} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="border border-[#1a1a1a] bg-[#050505] p-16 text-center mb-16">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[3px] mb-4">
            No Active Strategies
          </p>
          <p className="text-[#333] text-sm font-mono">
            Go to Vaults and run a strategy to get started
          </p>
        </div>
      )}

      {/* AI Strategy Log */}
      <div className="card-3d p-8">
        <h2 className="text-sm font-normal text-[#cccccc] uppercase tracking-[3px] mb-8 border-b border-[#262626] pb-4">
          AI Strategy Log
        </h2>
        {strategies.length > 0 ? (
          <div className="space-y-8">
            {strategies.map((strategy, i) => (
              <div
                key={strategy.asset}
                className={`border-l pl-6 ${i === 0 ? "border-white" : "border-[#3a3a3a]"}`}
              >
                <p
                  className={`text-[11px] font-mono uppercase tracking-[2px] ${i === 0 ? "text-white" : "text-[#666666]"}`}
                >
                  {strategy.asset.toUpperCase()}
                </p>
                <p
                  className={`font-serif text-lg leading-relaxed mt-2 ${i === 0 ? "text-[#cccccc]" : "text-[#999999]"}`}
                >
                  {strategy.lastAction}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#333] text-sm font-mono">No activity yet</p>
        )}
      </div>
    </div>
  );
}
