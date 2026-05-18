"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AiInsights() {
  const chartData = [
    { time: "00:00", strategy: 30, benchmark: 25 },
    { time: "04:00", strategy: 45, benchmark: 35 },
    { time: "08:00", strategy: 40, benchmark: 38 },
    { time: "12:00", strategy: 65, benchmark: 45 },
    { time: "16:00", strategy: 60, benchmark: 50 },
    { time: "22:00", strategy: 70, benchmark: 65 },
    { time: "20:00", strategy: 80, benchmark: 55 },
    { time: "24:00", strategy: 95, benchmark: 60 },
  ];

  return (
    <div className="p-12 bg-black min-h-screen text-white font-sans selection:bg-blue-500/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#1a1a1a] pb-8">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-[0.3em] text-white mb-2">
            AI Analytics & Strategy
          </h1>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <p className="text-[#666] font-mono text-xs uppercase tracking-[2px]">
              Core Status: Active | Neural Load: 74.2%
            </p>
          </div>
        </div>

        <div className="flex gap-12 mt-8 md:mt-0">
          <div className="text-right">
            <p className="text-[#444] text-xs uppercase tracking-[2px] mb-1">
              Global APY
            </p>
            <p className="text-2xl font-light tracking-tight text-blue-400">
              18.42%
            </p>
          </div>
          <div className="text-right border-l border-[#1a1a1a] pl-12">
            <p className="text-[#444] text-xs uppercase tracking-[2px] mb-1">
              Total TVL
            </p>
            <p className="text-2xl font-light tracking-tight text-white">
              $2.4B
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart Sectio n */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xs uppercase tracking-[3px] text-[#888] font-medium">
                Yield Performance
              </h2>
              <p className="text-xs text-[#444] font-mono mt-1">
                Archimedes Engine v2.0.4
              </p>
            </div>
            <div className="flex gap-6 text-xs font-mono uppercase tracking-widest text-[#555]">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{" "}
                Strategy
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#222]"></span>{" "}
                Benchmark
              </span>
            </div>
          </div>

          <div className="h-[350px] w-full border border-[#1a1a1a] bg-[#050505] p-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#111"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "monospace" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#444", fontSize: 10, fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #222",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Line
                  type="monotone"
                  dataKey="strategy"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#222"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: Load & Status */}
        <div className="space-y-10">
          <div className="border border-[#1a1a1a] bg-[#050505] p-8">
            <h2 className="text-xs uppercase tracking-[4px] text-[#888] font-medium mb-8">
              Computational Load
            </h2>
            <div className="space-y-8">
              {[
                { label: "Rebalancing Engine", value: 88 },
                { label: "Predictive Analysis", value: 64 },
                { label: "Latency Optimization", value: 42 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between font-mono text-xs uppercase tracking-widest mb-3">
                    <span className="text-[#666]">{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-[#111] h-[2px]">
                    <div
                      className="bg-blue-500 h-[2px] transition-all duration-1000"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border border-[#1a1a1a]">
            <p className="font-mono text-[12px] text-blue-500 uppercase tracking-[3px] mb-4">
              Node Cluster [Omega]
            </p>
            <p className="text-[14px] leading-relaxed text-[#555] font-light italic">
              "Primary compute node operating within optimal thermal parameters.
              No throttle events recorded in the last 24H window."
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Log Section */}
      <div className="mt-20">
        <h2 className="text-xs uppercase tracking-[3px] text-[#888] font-medium mb-8">
          Strategy Execution Log
        </h2>
        <div className="border-t border-[#1a1a1a]">
          {[
            {
              time: "14:22:18 UTC",
              status: "SUCCESS",
              text: "Archimedes AI rebalanced 50% USDC from Uniswap-Arb to Curve-OP to optimize yield by 1.8%.",
              hash: "0X82A...F92E",
            },
            {
              time: "13:05:44 UTC",
              status: "INFO",
              text: "Sentinel module detected anomalous slippage on GMX-AVAX. Auto-suspension of withdrawals initiated.",
              hash: "0X14B...E21A",
            },
            {
              time: "11:40:02 UTC",
              status: "SUCCESS",
              text: "Staking pool [Aero-Alpha] harvested 42.4 ETH. Auto-compounding cycle complete.",
              hash: "0X99D...A44B",
            },
          ].map((log, i) => (
            <div
              key={i}
              className="group flex flex-col md:flex-row items-start gap-6 py-6 border-b border-[#1a1a1a] hover:bg-[#050505] transition-colors px-4"
            >
              <span className="font-mono text-[12px] text-[#444] w-32 shrink-0 pt-1">
                {log.time}
              </span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 border tracking-tighter shrink-0 mt-1 ${
                  log.status === "SUCCESS"
                    ? "border-blue-900 text-blue-500"
                    : "border-[#333] text-[#666]"
                }`}
              >
                {log.status}
              </span>
              <div className="flex-1">
                <p className="text-[14px] text-[#999] leading-relaxed group-hover:text-white transition-colors">
                  {log.text}
                </p>
                <p className="font-mono text-[11px] text-[#333] mt-2 uppercase tracking-widest">
                  {log.hash}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
