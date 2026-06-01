"use client";

import { type PolicySettings } from "@/constants/dolfin";

const FIELD =
  "w-full bg-[#050505] border border-[#222] text-[#f0f0f0] text-sm font-mono px-4 py-3 focus:border-[#627EEA] focus:outline-none transition";

const USD_FIELDS: { key: keyof PolicySettings; label: string; hint: string }[] = [
  { key: "maxTradePerTx", label: "Max Trade / Tx", hint: "USD cap per single action" },
  { key: "maxDailyVolume", label: "Max Daily Volume", hint: "USD cap per rolling 24h" },
  { key: "maxExposure", label: "Max Exposure", hint: "USD open-risk ceiling" },
  { key: "maxLossPerDay", label: "Max Loss / Day", hint: "trips circuit breaker" },
];

export default function PolicyForm({
  settings,
  onChange,
}: {
  settings: PolicySettings;
  onChange: (patch: Partial<PolicySettings>) => void;
}) {
  return (
    <div className="card-3d p-8">
      <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-8 border-b border-[#262626] pb-4">
        Risk Policy
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {USD_FIELDS.map((f) => (
          <div key={f.key as string}>
            <label className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-2 block font-medium">
              {f.label} <span className="text-[#555]">($)</span>
            </label>
            <input
              type="number"
              min="0"
              value={settings[f.key] as string}
              onChange={(e) => onChange({ [f.key]: e.target.value } as Partial<PolicySettings>)}
              className={FIELD}
            />
            <p className="text-[#444] text-xs font-mono mt-1">{f.hint}</p>
          </div>
        ))}

        <div>
          <label className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-2 block font-medium">
            Max Drawdown <span className="text-[#555]">(bps)</span>
          </label>
          <input
            type="number"
            min="0"
            max="10000"
            value={settings.maxDrawdownBps}
            onChange={(e) => onChange({ maxDrawdownBps: Number(e.target.value) })}
            className={FIELD}
          />
        </div>
        <div>
          <label className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-2 block font-medium">
            Max Leverage <span className="text-[#555]">(bps · 10000 = 1x)</span>
          </label>
          <input
            type="number"
            min="0"
            value={settings.maxLeverageBps}
            onChange={(e) => onChange({ maxLeverageBps: Number(e.target.value) })}
            className={FIELD}
          />
        </div>
        <div>
          <label className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-2 block font-medium">
            Session Expiry <span className="text-[#555]">(days)</span>
          </label>
          <input
            type="number"
            min="1"
            value={settings.expiryDays}
            onChange={(e) => onChange({ expiryDays: Number(e.target.value) })}
            className={FIELD}
          />
        </div>
      </div>
    </div>
  );
}
