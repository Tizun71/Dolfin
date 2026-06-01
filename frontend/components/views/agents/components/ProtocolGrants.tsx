"use client";

import { type Address } from "viem";
import { ACTION_LABELS, PROTOCOLS, TOKENS, TOKEN_LOGOS, type ActionType, type PolicySettings } from "@/constants/dolfin";
import { ACTION_ICONS } from "./action-icons";

export default function ProtocolGrants({
  settings,
  onChange,
}: {
  settings: PolicySettings;
  onChange: (patch: Partial<PolicySettings>) => void;
}) {
  const toggleAction = (key: string, action: ActionType) => {
    const cur = settings.protocols[key] ?? [];
    const next = cur.includes(action) ? cur.filter((a) => a !== action) : [...cur, action];
    onChange({ protocols: { ...settings.protocols, [key]: next } });
  };

  const toggleToken = (addr: Address) => {
    const cur = settings.tokens;
    onChange({ tokens: cur.includes(addr) ? cur.filter((t) => t !== addr) : [...cur, addr] });
  };

  const chip = (active: boolean) =>
    `flex items-center gap-2 px-3 py-2 border text-xs font-mono uppercase tracking-[1px] transition ${
      active
        ? "border-[#fb923c] bg-[#fb923c1a] text-[#fbbf24]"
        : "border-[#222] text-[#666] hover:border-[#333]"
    }`;

  return (
    <div className="card-3d p-8">
      <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-8 border-b border-[#262626] pb-4">
        Permissions
      </h2>

      {/* Tokens */}
      <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-3 font-medium">
        Allowed Tokens
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {TOKENS.map((t) => {
          const active = settings.tokens.includes(t.address as Address);
          const logo = TOKEN_LOGOS[t.symbol];
          return (
            <button key={t.symbol} type="button" onClick={() => toggleToken(t.address as Address)} className={chip(active)}>
              {logo && <img src={logo} alt={t.symbol} className={`w-4 h-4 rounded-full ${active ? "" : "opacity-50"}`} />}
              {t.symbol}
            </button>
          );
        })}
      </div>

      {/* Protocols + actions */}
      {PROTOCOLS.map((p) => (
        <div key={p.key} className="mb-6 last:mb-0">
          <div className="flex items-center gap-2 mb-3">
            <img src={p.logo} alt={p.name} className="w-5 h-5 rounded-full" />
            <p className="text-[#ccc] text-sm font-mono">{p.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.actions.map((a) => {
              const Icon = ACTION_ICONS[a];
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAction(p.key, a)}
                  className={chip((settings.protocols[p.key] ?? []).includes(a))}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {ACTION_LABELS[a]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
