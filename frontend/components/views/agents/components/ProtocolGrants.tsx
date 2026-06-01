"use client";

import { type Address } from "viem";
import { ACTION_LABELS, PROTOCOLS, TOKENS, type ActionType, type PolicySettings } from "@/constants/dolfin";

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
    `px-3 py-2 border text-xs font-mono uppercase tracking-[1px] transition ${
      active
        ? "border-[#627EEA] bg-[#627EEA1a] text-[#aab8f5]"
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
        {TOKENS.map((t) => (
          <button
            key={t.symbol}
            type="button"
            onClick={() => toggleToken(t.address as Address)}
            className={chip(settings.tokens.includes(t.address as Address))}
          >
            {t.symbol}
          </button>
        ))}
      </div>

      {/* Protocols + actions */}
      {PROTOCOLS.map((p) => (
        <div key={p.key} className="mb-6 last:mb-0">
          <p className="text-[#ccc] text-sm font-mono mb-3">{p.name}</p>
          <div className="flex flex-wrap gap-2">
            {p.actions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAction(p.key, a)}
                className={chip((settings.protocols[p.key] ?? []).includes(a))}
              >
                {ACTION_LABELS[a]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
