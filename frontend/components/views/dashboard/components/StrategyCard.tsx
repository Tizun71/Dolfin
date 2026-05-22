"use client";

import { useRouter } from "next/navigation";
import { AssetSetupData } from "@/hooks/useAssetSetup";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const assetConfig: Record<string, { icon: string; color: string }> = {
  eth: { icon: "Ξ", color: "#627EEA" },
  sgho: { icon: "◎", color: "#22c55e" },
  usdc: { icon: "$", color: "#2775CA" },
  usdt: { icon: "₮", color: "#26A17B" },
  wbtc: { icon: "B", color: "#F7931A" },
  wsteth: { icon: "◆", color: "#00A3FF" },
  weeth: { icon: "◆", color: "#9B59B6" },
};

export default function StrategyCard({
  strategy,
}: {
  strategy: AssetSetupData;
}) {
  const router = useRouter();
  const config = assetConfig[strategy.asset] ?? { icon: "◈", color: "#627EEA" };

  return (
    <div
      onClick={() => router.push(`/vaults/${strategy.asset}`)}
      className="group border border-[#1a1a1a] bg-[#050505] p-6 cursor-pointer hover:border-[#2a2a2a] transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm border"
            style={{
              borderColor: `${config.color}44`,
              color: config.color,
            }}
          >
            {config.icon}
          </div>
          <div>
            <p className="text-[#444] text-xs font-mono uppercase tracking-[2px]">
              {strategy.asset}
            </p>
            <p className="text-white text-sm font-light uppercase tracking-widest">
              {strategy.name}
            </p>
          </div>
        </div>

        {/* Running Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 border border-yellow-600 bg-yellow-600/10">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-yellow-500 text-xs uppercase tracking-[3px] font-mono">
            Running
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#1a1a1a]">
        <div>
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
            APY
          </p>
          <p className="text-white text-xl font-light">{strategy.apy}%</p>
        </div>
        <div>
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
            Total Supplied
          </p>
          <p className="text-white text-xl font-light">
            {strategy.totalSupplied}
          </p>
        </div>
        <div>
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
            Utilization Rate
          </p>
          <p className="text-white text-xl font-light">
            {strategy.utilizationRate}
          </p>
        </div>
      </div>

      {/* Last Action + Arrow */}
      <div className="flex items-end justify-between">
        <div className="flex-1 pr-4">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
            Last Action
          </p>
          <p className="text-[#888] text-xs font-mono leading-relaxed line-clamp-2">
            {strategy.lastAction}
          </p>
          <p className="text-[#444] text-xs font-mono mt-2 uppercase tracking-[2px]">
            Started {timeAgo(strategy.startedAt)}
          </p>
        </div>

        {/* Arrow */}
        <span className="text-[#444] text-lg group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
          →
        </span>
      </div>
    </div>
  );
}
