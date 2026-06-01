"use client";

import { useState } from "react";

type RebalanceFrequency = "daily" | "weekly" | "monthly";
type RiskLevel = "conservative" | "moderate" | "aggressive";

export default function AIConfigSection() {
  const [frequency, setFrequency] = useState<RebalanceFrequency>("weekly");
  const [risk, setRisk] = useState<RiskLevel>("moderate");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const frequencies: { label: string; value: RebalanceFrequency }[] = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ];

  const risks: { label: string; value: RiskLevel; desc: string }[] = [
    {
      label: "Conservative",
      value: "conservative",
      desc: "Lower risk, stable returns",
    },
    { label: "Moderate", value: "moderate", desc: "Balanced risk and returns" },
    {
      label: "Aggressive",
      value: "aggressive",
      desc: "Higher risk, higher returns",
    },
  ];

  return (
    <div className="border border-[#222] bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#222] pb-4">
        <h2 className="text-sm font-mono uppercase tracking-[2px] text-[#999] font-semibold">
          AI Configuration
        </h2>
        <button
          onClick={handleSave}
          className={`px-5 py-2 text-sm font-mono uppercase tracking-[1.5px] font-medium transition-all duration-300 border ${
            saved
              ? "border-green-600 text-green-300 bg-green-600/15"
              : "border-[#444] text-[#aaa] hover:border-white hover:text-white"
          }`}
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Rebalance Frequency */}
        <div>
          <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-4 font-medium">
            Rebalance Frequency
          </p>
          <div className="flex gap-3">
            {frequencies.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`px-5 py-2.5 text-sm font-mono uppercase tracking-[1.5px] font-medium transition-all duration-300 border ${
                  frequency === f.value
                    ? "border-white text-white bg-white/8"
                    : "border-[#333] text-[#777] hover:text-[#bbb] hover:border-[#555]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-4 font-medium">
            Risk Level
          </p>
          <div className="grid grid-cols-3 gap-3">
            {risks.map((r) => (
              <button
                key={r.value}
                onClick={() => setRisk(r.value)}
                className={`p-5 text-left border transition-all duration-300 ${
                  risk === r.value
                    ? "border-white bg-white/5"
                    : "border-[#222] hover:border-[#444]"
                }`}
              >
                <p
                  className={`text-sm font-mono uppercase tracking-[1.5px] mb-2 font-semibold ${
                    risk === r.value ? "text-white" : "text-[#777]"
                  }`}
                >
                  {r.label}
                </p>
                <p
                  className={`text-xs font-mono font-medium ${
                    risk === r.value ? "text-[#aaa]" : "text-[#555]"
                  }`}
                >
                  {r.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
