"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import {
  chartData,
  W,
  H,
  toY,
  headerStats,
  capabilities,
  automatedActions,
} from "./USDCData";

export default function USDCDetail() {
  const router = useRouter();
  const { login, authenticated, user } = usePrivy();
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("1w");

  const handleRun = async () => {
    if (!authenticated) {
      await login();
    } else {
      setIsRunning(true);
    }
  };

  const points = chartData
    .map((v, i) => `${(i / (chartData.length - 1)) * W},${toY(v)}`)
    .join(" ");

  const avgY = toY(4.52);

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
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border border-[#2775CA44] text-[#2775CA]">
            $
          </div>
          <div>
            <p className="text-[#444] text-xs uppercase tracking-[2px] font-mono">
              USDC
            </p>
            <h1 className="text-3xl font-light uppercase tracking-widest">
              USD Coin
            </h1>
          </div>
        </div>
        <div className="ml-4">
          <span className="text-xs font-mono text-[#444] uppercase tracking-[2px] border border-[#1a1a1a] px-3 py-1">
            Core Market · V3
          </span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-6 mb-10 pb-8 border-b border-[#1a1a1a]">
        {headerStats.map((stat) => (
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
        {/* Left: Reserve Status */}
        <div className="border border-[#1a1a1a] bg-[#050505] p-8">
          <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] mb-8">
            Reserve Status & Configuration
          </h2>

          {/* Supply Info */}
          <div className="mb-8">
            <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono mb-5">
              Supply Info
            </p>
            <div className="flex items-center gap-8">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#2775CA"
                    strokeWidth="8"
                    strokeDasharray={`${(2 * Math.PI * 42 * 82.14) / 100} ${2 * Math.PI * 42}`}
                    opacity="0.8"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-light text-white">82.14%</span>
                </div>
              </div>

              <div>
                <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
                  Total Supplied
                </p>
                <p className="text-xl font-light text-white">1.84B of 2.24B</p>
                <p className="text-[#555] text-sm font-mono mt-1">
                  $1.84B of $2.24B
                </p>
                <p className="text-xs font-mono mt-3 tracking-[2px] text-[#2775CA]">
                  APY 4.52%
                </p>
              </div>
            </div>
          </div>

          {/* APR Chart */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2775CA]" />
                <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono">
                  Supply APR
                </p>
              </div>
              <div className="flex gap-4">
                {["1w", "1m", "6m", "1y"].map((t) => (
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
                viewBox={`0 0 ${W} ${H + 10}`}
                className="w-full"
                preserveAspectRatio="none"
                style={{ height: "130px" }}
              >
                <defs>
                  <linearGradient id="usdcFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2775CA" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2775CA" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line
                  x1="0"
                  y1={avgY}
                  x2={W}
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
                  Avg 4.52%
                </text>
                <polygon
                  points={`0,${H} ${points} ${W},${H}`}
                  fill="url(#usdcFill)"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#2775CA"
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
          </div>

          {/* Collateral */}
          <div className="border-t border-[#1a1a1a] pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono">
                Collateral Usage
              </p>
              <span className="text-yellow-600 text-xs font-mono tracking-widest">
                ⚠ Can be collateral
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Max LTV", value: "75%" },
                { label: "Liq. Threshold", value: "78.00%" },
                { label: "Liq. Penalty", value: "4.50%" },
              ].map((item) => (
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
        </div>

        {/* Right: AI Agent */}
        <div className="border border-[#1a1a1a] bg-[#050505] p-8 flex flex-col">
          <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] mb-8">
            AI Agent
          </h2>

          <div
            className="flex items-center justify-between px-5 py-4 mb-6"
            style={{
              border: "1px solid #2775CA22",
              backgroundColor: "#2775CA08",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm border border-[#2775CA44] text-[#2775CA]">
                $
              </div>
              <span className="text-white font-light tracking-widest text-base uppercase">
                USDC
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

          <div className="mb-8">
            <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono mb-4">
              Agent Capabilities
            </p>
            <div className="space-y-3">
              {capabilities.map((cap) => (
                <div
                  key={cap.label}
                  className="flex items-start gap-3 border border-[#111] p-4"
                >
                  <div className="w-1 min-h-[32px] flex-shrink-0 mt-1 bg-[#2775CA] opacity-60" />
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

          <div className="mt-auto">
            <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono mb-4">
              Automated Actions
            </p>
            <div className="grid grid-cols-2 gap-3">
              {automatedActions.map((action) => (
                <div key={action} className="border border-[#111] p-3">
                  <p className="text-[#555] text-xs font-mono leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
    </div>
  );
}
