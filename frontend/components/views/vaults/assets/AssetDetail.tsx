"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import SetupModal from "./SetupModal";
import { useAssetSetup } from "@/hooks/useAssetSetup";
import { ASSET_DETAILS_MAP } from "@/constants/vaults";

interface AssetDetailProps {
  assetKey?: string;
}

export default function AssetDetail({ assetKey = "eth" }: AssetDetailProps) {
  const router = useRouter();
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

  function toY(val: number) {
    return (
      data.h - ((val - data.minVal) / (data.maxVal - data.minVal)) * data.h
    );
  }

  const points = data.chartData
    .map((v, i) => `${(i / (data.chartData.length - 1)) * data.w},${toY(v)}`)
    .join(" ");

  const avgY = toY(data.avgApr);

  return (
    <div className="min-h-screen bg-black text-white font-sans px-12 py-10">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10 border-b border-[#1a1a1a] pb-8">
        <button
          onClick={() => router.back()}
          className="text-[#444] hover:text-white transition text-xs uppercase tracking-[2px] font-mono"
        >
          ← Back
        </button>
        <div className="w-px h-6 bg-[#1a1a1a]" />
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg border"
            style={{ borderColor: `${data.color}44`, color: data.color }}
          >
            {data.icon}
          </div>
          <div>
            <p className="text-[#444] text-xs uppercase tracking-[2px] font-mono">
              {data.symbol}
            </p>
            <h1 className="text-3xl font-light uppercase tracking-widest">
              {data.name}
            </h1>
          </div>
        </div>
      </div>

      {data.symbol.toLowerCase() === "sgho" && (
        <p className="text-[#444] text-sm tracking-widest leading-relaxed mb-8 max-w-2xl font-mono">
          Deposit GHO into savings GHO (sGHO) and earn{" "}
          <span style={{ color: data.color }}>{data.apy}% APY</span> on your GHO
          holdings. No lockups, no rehypothecation, withdraw anytime.
        </p>
      )}

      {/* Top Stats */}
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

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left: Chart & Configuration */}
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

          <div className="bg-[#080808] border border-[#111] p-4">
            <svg
              viewBox={`0 0 ${data.w} ${data.h + 10}`}
              className="w-full"
              preserveAspectRatio="none"
              style={{ height: "130px" }}
            >
              <defs>
                <linearGradient
                  id={`fill-${data.symbol}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={data.color} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={data.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1="0"
                y1={avgY}
                x2={data.w}
                y2={avgY}
                stroke="#2a2a2a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x="8"
                y={avgY - 5}
                fill="#555"
                fontSize="11"
                fontFamily="monospace"
              >
                Avg {data.avgApr}%
              </text>
              <polygon
                points={`0,${data.h} ${points} ${data.w},${data.h}`}
                fill={`url(#fill-${data.symbol})`}
              />
              <polyline
                points={points}
                fill="none"
                stroke={data.color}
                strokeWidth="1.5"
                opacity="0.85"
              />
            </svg>
          </div>

          <div className="flex justify-between mt-2 px-1">
            <span className="text-[#333] text-xs font-mono">Thu 07</span>
            <span className="text-[#333] text-xs font-mono">Sat 09</span>
            <span className="text-[#333] text-xs font-mono">Mon 11</span>
          </div>

          {/* Collateral: CHỈ HIỂN THỊ NẾU ASSET ĐÓ CÓ DỮ LIỆU THẾ CHẤP (Max LTV > 0%) */}
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

        {/* Right: AI Agent */}
        <div className="border border-[#1a1a1a] bg-[#050505] p-8 flex flex-col">
          <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] mb-8">
            AI Agent
          </h2>

          <div
            className="flex items-center justify-between border px-5 py-4 mb-6"
            style={{
              borderColor: `${data.color}22`,
              backgroundColor: `${data.color}05`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm border"
                style={{ borderColor: `${data.color}44`, color: data.color }}
              >
                {data.icon}
              </div>
              <span className="text-white font-light tracking-widest text-base uppercase">
                {data.symbol}
              </span>
            </div>

            {!isRunning ? (
              <button
                onClick={handleRun}
                className="px-6 py-2 text-xs uppercase tracking-[3px] font-mono bg-blue-600 hover:bg-blue-500 text-white transition-all duration-300"
              >
                Run
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 border border-yellow-600 bg-yellow-600/10">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-yellow-500 text-xs uppercase tracking-[3px] font-mono">
                  Running
                </span>
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div className="mb-8">
            <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono mb-4">
              Agent Capabilities
            </p>
            <div className="space-y-3">
              {data.capabilities.map((cap) => (
                <div
                  key={cap.label}
                  className="flex items-start gap-3 border border-[#111] p-4"
                >
                  <div
                    className="w-1 min-h-8 shrink-0 mt-1 opacity-60"
                    style={{ backgroundColor: data.color }}
                  />
                  <div>
                    <p className="text-white text-sm font-light tracking-wider">
                      {cap.label}
                    </p>
                    <p className="text-[#444] text-xs font-mono mt-1">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Actions */}
          <div className="mt-auto">
            <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono mb-4">
              Automated Actions
            </p>
            <div className="grid grid-cols-2 gap-3">
              {data.automatedActions.map((action) => (
                <div key={action} className="border border-[#111] p-3">
                  <p className="text-[#555] text-xs font-mono leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Status */}
          {authenticated && user && (
            <div className="mt-6 border-t border-[#1a1a1a] pt-4">
              <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
                Connected Wallet
              </p>
              <p className="text-white text-sm font-mono truncate">
                {user.wallet?.address ?? "—"}
              </p>
            </div>
          )}
        </div>
      </div>
      {showSetup && <SetupModal onComplete={onComplete} onClose={onClose} />}
    </div>
  );
}
