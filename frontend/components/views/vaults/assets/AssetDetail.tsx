"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import SetupModal from "./SetupModal";
import { useAssetSetup } from "@/hooks/useAssetSetup";
import { ASSET_DETAILS_MAP } from "@/constants/vaults";
import AssetHeader from "./components/AssetHeader";
import AIAgentPanel from "./components/AIAgentPanel";
import AssetChart from "./components/AssetChart";

interface AssetDetailProps {
  assetKey?: string;
}

export default function AssetDetail({ assetKey = "eth" }: AssetDetailProps) {
  const { login, authenticated, user, ready } = usePrivy();
  const [activeTab, setActiveTab] = useState("1w");

  const data =
    ASSET_DETAILS_MAP[assetKey.toLowerCase()] || ASSET_DETAILS_MAP["eth"];

  const { isRunning, showSetup, setShowSetup, onComplete, onClose, onReset } =
    useAssetSetup(data.symbol, {
      name: data.name,
      apy: data.apy,
      totalSupplied: data.totalSuppliedStr,
      utilizationRate: data.utilizationRate,
      lastAction: data.lastAction,
    });

  useEffect(() => {
    if (ready && !authenticated) {
      onReset();
    }
  }, [ready, authenticated]);

  const handleRun = async () => {
    if (!authenticated) {
      await login();
    } else {
      setShowSetup(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans px-12 py-10">
      <AssetHeader
        symbol={data.symbol}
        name={data.name}
        icon={data.icon}
        color={data.color}
      />

      {data.symbol.toLowerCase() === "sgho" && (
        <p className="text-[#444] text-sm tracking-widest leading-relaxed mb-8 max-w-2xl font-mono">
          Deposit GHO into savings GHO (sGHO) and earn{" "}
          <span style={{ color: data.color }}>{data.apy}% APY</span> on your GHO
          holdings. No lockups, no rehypothecation, withdraw anytime.
        </p>
      )}

      <div className="grid grid-cols-4 gap-6 mb-10 pb-8 border-b border-[#1a1a1a]">
        {data.headerStats.map((stat) => (
          <div key={stat.label}>
            <p className="text-[#444] text-xs uppercase tracking-[2px] mb-2 font-mono">
              {stat.label}
            </p>
            <p className="text-2xl font-light text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="border border-[#1a1a1a] bg-[#050505] p-8">
          <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] mb-8">
            {data.name} ({data.symbol})
          </h2>

          <div className="flex gap-12 mb-8">
            <div>
              <p className="text-[#444] text-xs uppercase tracking-[2px] font-mono mb-1">
                Total Deposited
              </p>
              <p className="text-white font-light text-base">
                {data.totalSuppliedStr}
              </p>
            </div>
            <div>
              <p className="text-[#444] text-xs uppercase tracking-[2px] font-mono mb-1">
                APY
              </p>
              <p className="text-white font-light text-base">{data.apy}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="text-xs font-mono text-[#444] uppercase tracking-[2px]">
                {data.symbol} APY
              </span>
            </div>
            <div className="flex gap-4">
              {["1w", "1m", "6m"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`text-xs font-mono uppercase tracking-widest transition ${
                    activeTab === t
                      ? "text-white"
                      : "text-[#444] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <AssetChart
            symbol={data.symbol}
            color={data.color}
            w={data.w}
            h={data.h}
            chartData={data.chartData}
            minVal={data.minVal}
            maxVal={data.maxVal}
            avgApr={data.avgApr.toString()}
          />

          <div className="flex justify-between mt-2 px-1">
            <span className="text-[#333] text-xs font-mono">Thu 07</span>
            <span className="text-[#333] text-xs font-mono">Sat 09</span>
            <span className="text-[#333] text-xs font-mono">Mon 11</span>
          </div>

          {/* Collateral: only shown when the asset has collateral data (Max LTV > 0%) */}
          {data.collateral && data.collateral[0]?.value !== "0%" && (
            <div className="border-t border-[#1a1a1a] pt-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono">
                  Collateral Usage
                </p>
                <span className="text-yellow-600 text-xs font-mono tracking-widest">
                  ⚠ Can be collateral
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {data.collateral.map((item) => (
                  <div key={item.label} className="border border-[#111] p-3">
                    <p className="text-[#333] text-xs font-mono uppercase tracking-[2px] mb-2">
                      {item.label}
                    </p>
                    <p className="text-white font-light text-base">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AIAgentPanel
          symbol={data.symbol}
          icon={data.icon}
          color={data.color}
          isRunning={isRunning}
          onRun={handleRun}
          capabilities={data.capabilities}
          automatedActions={data.automatedActions}
          walletAddress={authenticated && user ? user.wallet?.address : undefined}
        />
      </div>
      {showSetup && <SetupModal onComplete={onComplete} onClose={onClose} />}
    </div>
  );
}
