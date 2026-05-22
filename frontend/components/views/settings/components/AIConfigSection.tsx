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
    <div className="border border-[#1a1a1a] bg-[#050505] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#1a1a1a] pb-4">
        <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444]">
          AI Configuration
        </h2>
        <button
          onClick={handleSave}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-[2px] transition-all duration-300 border ${
            saved
              ? "border-green-600 text-green-400 bg-green-600/10"
              : "border-[#333] text-[#666] hover:border-white hover:text-white"
          }`}
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Rebalance Frequency */}
        <div>
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-4">
            Rebalance Frequency
          </p>
          <div className="flex gap-3">
            {frequencies.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-[2px] transition-all duration-300 border ${
                  frequency === f.value
                    ? "border-white text-white bg-white/5"
                    : "border-[#1a1a1a] text-[#444] hover:text-[#999] hover:border-[#333]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-4">
            Risk Level
          </p>
          <div className="grid grid-cols-3 gap-3">
            {risks.map((r) => (
              <button
                key={r.value}
                onClick={() => setRisk(r.value)}
                className={`p-4 text-left border transition-all duration-300 ${
                  risk === r.value
                    ? "border-white bg-white/5"
                    : "border-[#1a1a1a] hover:border-[#333]"
                }`}
              >
                <p
                  className={`text-xs font-mono uppercase tracking-[2px] mb-1 ${
                    risk === r.value ? "text-white" : "text-[#444]"
                  }`}
                >
                  {r.label}
                </p>
                <p className="text-[#333] text-xs font-mono">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
