"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const assets = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    totalSupplied: "1.93M",
    totalSuppliedUSD: "$4.44B",
    supplyAPY: "1.44",
    totalBorrowed: "1.73M",
    totalBorrowedUSD: "$4.00B",
    borrowAPY: "1.93",
    color: "#627EEA",
  },
  {
    symbol: "weETH",
    name: "Wrapped eETH",
    icon: "◈",
    totalSupplied: "1.07M",
    totalSuppliedUSD: "$2.71B",
    supplyAPY: "< 0.01",
    totalBorrowed: "50.71",
    totalBorrowedUSD: "$128.07K",
    borrowAPY: "1.01",
    color: "#9B59B6",
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    icon: "₿",
    totalSupplied: "29.91K",
    totalSuppliedUSD: "$2.42B",
    supplyAPY: "< 0.01",
    totalBorrowed: "1.01K",
    totalBorrowedUSD: "$81.26M",
    borrowAPY: "0.36",
    color: "#F7931A",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "$",
    totalSupplied: "1.84B",
    totalSuppliedUSD: "$1.84B",
    supplyAPY: "4.52",
    totalBorrowed: "1.51B",
    totalBorrowedUSD: "$1.51B",
    borrowAPY: "6.12",
    color: "#2775CA",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    icon: "₮",
    totalSupplied: "643.33M",
    totalSuppliedUSD: "$643.33M",
    supplyAPY: "4.91",
    totalBorrowed: "594.00M",
    totalBorrowedUSD: "$594.00M",
    borrowAPY: "6.58",
    color: "#26A17B",
  },
  {
    symbol: "wstETH",
    name: "Wrapped stETH",
    icon: "⟠",
    totalSupplied: "473.68K",
    totalSuppliedUSD: "$1.27B",
    supplyAPY: "< 0.01",
    totalBorrowed: "1.06K",
    totalBorrowedUSD: "$2.84M",
    borrowAPY: "0.25",
    color: "#00A3FF",
  },
];

const marketStats = [
  { label: "Total Market Size", value: "$20.25B" },
  { label: "Total Available", value: "$11.35B" },
  { label: "Total Borrows", value: "$8.55B" },
];

export default function VaultsContent() {
  const router = useRouter();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white font-sans px-6 md:px-12 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-[#1a1a1a] pb-10">
          <p className="text-[#444] text-xs uppercase tracking-[3px] mb-3 font-mono">
            Ethereum Mainnet · V3
          </p>
          <h1 className="text-4xl font-light uppercase tracking-widest text-white mb-4">
            Core Instance
          </h1>
          <p className="text-[#666] text-sm tracking-widest max-w-2xl">
            Main Ethereum market with the largest selection of assets and yield
            options
          </p>
          <div className="flex gap-24 mt-12">
            {marketStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[#444] text-[10px] uppercase tracking-[2px] mb-2 font-mono">
                  {stat.label}
                </p>
                <p className="text-3xl font-light text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* sGHO Banner */}
        <div className="card-3d p-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-green-400 text-xl border border-green-900/50 bg-green-900/10">
              ◎
            </div>
            <div>
              <p className="text-white font-light tracking-[3px] uppercase text-lg">
                Save with sGHO
              </p>
              <p className="text-[#555] text-xs tracking-[2px] mt-1 font-mono">
                GHO yield with instant withdraws
              </p>
            </div>
          </div>
          <div className="flex items-center gap-20">
            <div>
              <p className="text-[#444] text-[10px] uppercase tracking-[2px] mb-1 font-mono">
                Total Deposited
              </p>
              <p className="text-white font-light text-xl">$267.04M</p>
            </div>
            <div>
              <p className="text-[#444] text-[10px] uppercase tracking-[2px] mb-1 font-mono">
                APY
              </p>
              <p className="text-white font-light text-xl">5.66%</p>
            </div>
            <button
              className="border border-[#333] px-8 py-3 text-xs uppercase tracking-[2px] text-[#888] hover:text-white hover:border-[#666] transition-all duration-300 font-mono bg-transparent"
              onClick={() => router.push("/vaults/sgho")}
            >
              View Details
            </button>
          </div>
        </div>

        {/* Asset Table */}
        <div className="card-3d overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2.5fr_1.5fr_1fr_1.5fr_1fr_80px] px-8 py-5 border-b border-[#1e1e1e]">
            {[
              "Asset",
              "Total Supplied",
              "Supply APY",
              "Total Borrowed",
              "Borrow APY",
            ].map((col) => (
              <p
                key={col}
                className="text-[#444] text-[10px] uppercase tracking-[2px] font-mono"
              >
                {col}
              </p>
            ))}
            <div />
          </div>

          {/* Rows */}
          {assets.map((asset) => (
            <div
              key={asset.symbol}
              className="row-3d grid grid-cols-[2.5fr_1.5fr_1fr_1.5fr_1fr_80px] px-8 py-6 cursor-pointer last:border-b-0"
              onMouseEnter={() => setHoveredRow(asset.symbol)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() =>
                router.push(`/vaults/${asset.symbol.toLowerCase()}`)
              }
            >
              {/* Asset Name */}
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base font-light border"
                  style={{
                    color: asset.color,
                    borderColor: asset.color + "33",
                    backgroundColor: asset.color + "11",
                  }}
                >
                  {asset.icon}
                </div>
                <div>
                  <p className="text-white font-light tracking-wider text-lg">
                    {asset.name}
                  </p>
                  <p className="text-[#444] text-xs font-mono tracking-widest uppercase">
                    {asset.symbol}
                  </p>
                </div>
              </div>

              {/* Total Supplied */}
              <div className="flex flex-col justify-center">
                <p className="text-white font-light text-base">
                  {asset.totalSupplied}
                </p>
                <p className="text-[#444] text-[11px] font-mono">
                  {asset.totalSuppliedUSD}
                </p>
              </div>

              {/* Supply APY */}
              <div className="flex items-center">
                <p className="text-white font-light text-base">
                  {asset.supplyAPY}%
                </p>
              </div>

              {/* Total Borrowed */}
              <div className="flex flex-col justify-center">
                <p className="text-white font-light text-base">
                  {asset.totalBorrowed}
                </p>
                <p className="text-[#444] text-[11px] font-mono">
                  {asset.totalBorrowedUSD}
                </p>
              </div>

              {/* Borrow APY */}
              <div className="flex items-center">
                <p className="text-white font-light text-base">
                  {asset.borrowAPY}%
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-end">
                <span
                  className="text-xl transition-all duration-300"
                  style={{
                    color: hoveredRow === asset.symbol ? "white" : "#222",
                    transform:
                      hoveredRow === asset.symbol
                        ? "translateX(0)"
                        : "translateX(-6px)",
                    opacity: hoveredRow === asset.symbol ? 1 : 0,
                  }}
                >
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
