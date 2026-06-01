"use client";

import { useState } from "react";
import { RISK_PRESETS, type PolicySettings } from "@/constants/dolfin";

const LEVERAGE_OPTS = [1, 2, 3, 5, 10];
const EXPIRY_OPTS = [1, 7, 30];
const USD_FIELDS: { key: keyof PolicySettings; label: string }[] = [
  { key: "maxTradePerTx", label: "Max / Trade" },
  { key: "maxDailyVolume", label: "Daily Volume" },
  { key: "maxExposure", label: "Max Exposure" },
  { key: "maxLossPerDay", label: "Max Loss / Day" },
];

export default function RiskPolicySection({
  settings,
  onChange,
}: {
  settings: PolicySettings;
  onChange: (patch: Partial<PolicySettings>) => void;
}) {
  const [mode, setMode] = useState<string>("balanced");

  const applyPreset = (key: string) => {
    const p = RISK_PRESETS.find((x) => x.key === key);
    if (p) {
      onChange(p.caps);
      setMode(key);
    }
  };
  const editCustom = (patch: Partial<PolicySettings>) => {
    onChange(patch);
    setMode("custom");
  };

  const leverageX = Math.round(settings.maxLeverageBps / 10000);
  const drawdownPct = Math.round(settings.maxDrawdownBps / 100);
  const presetCls = (active: boolean) =>
    `flex-1 min-w-[120px] text-left p-4 border transition ${
      active ? "border-[#627EEA] bg-[#627EEA12]" : "border-[#222] hover:border-[#333]"
    }`;
  const chip = (active: boolean) =>
    `px-3 py-2 border text-xs font-mono transition ${
      active ? "border-[#627EEA] bg-[#627EEA1a] text-[#aab8f5]" : "border-[#222] text-[#666] hover:border-[#333]"
    }`;

  return (
    <div className="card-3d p-8">
      <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-8 border-b border-[#262626] pb-4">
        Risk Policy
      </h2>

      {/* Presets */}
      <div className="flex flex-wrap gap-3 mb-6">
        {RISK_PRESETS.map((p) => (
          <button key={p.key} type="button" onClick={() => applyPreset(p.key)} className={presetCls(mode === p.key)}>
            <p className="text-white text-sm font-normal tracking-wide">{p.name}</p>
            <p className="text-[#666] text-xs font-mono mt-1">{p.desc}</p>
          </button>
        ))}
        <button type="button" onClick={() => setMode("custom")} className={presetCls(mode === "custom")}>
          <p className="text-white text-sm font-normal tracking-wide">Custom</p>
          <p className="text-[#666] text-xs font-mono mt-1">Tune each cap</p>
        </button>
      </div>

      {mode === "custom" && (
        <div className="border-t border-[#1a1a1a] pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {USD_FIELDS.map((f) => (
              <div key={f.key as string}>
                <label className="text-[#888] text-xs font-mono uppercase tracking-[1px] mb-2 block">{f.label}</label>
                <div className="flex items-center border border-[#222] bg-[#050505] focus-within:border-[#627EEA] transition">
                  <span className="text-[#555] font-mono px-3">$</span>
                  <input
                    type="number"
                    min="0"
                    value={settings[f.key] as string}
                    onChange={(e) => editCustom({ [f.key]: e.target.value } as Partial<PolicySettings>)}
                    className="w-full bg-transparent text-[#f0f0f0] text-sm font-mono py-2.5 pr-3 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-[#888] text-xs font-mono uppercase tracking-[1px] mb-2 block">Max Leverage</label>
            <div className="flex flex-wrap gap-2">
              {LEVERAGE_OPTS.map((x) => (
                <button key={x} type="button" onClick={() => editCustom({ maxLeverageBps: x * 10000 })} className={chip(leverageX === x)}>
                  {x}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#888] text-xs font-mono uppercase tracking-[1px] mb-2 block">
              Max Drawdown — {drawdownPct}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={drawdownPct}
              onChange={(e) => editCustom({ maxDrawdownBps: Number(e.target.value) * 100 })}
              className="w-full accent-[#627EEA]"
            />
          </div>

          <div>
            <label className="text-[#888] text-xs font-mono uppercase tracking-[1px] mb-2 block">Session Expiry</label>
            <div className="flex flex-wrap gap-2">
              {EXPIRY_OPTS.map((d) => (
                <button key={d} type="button" onClick={() => editCustom({ expiryDays: d })} className={chip(settings.expiryDays === d)}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
