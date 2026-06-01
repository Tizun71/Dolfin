"use client";

import { ACTION_LABELS, PROTOCOLS, TOKENS, TOKEN_LOGOS, type PolicySettings } from "@/constants/dolfin";
import { ACTION_ICONS } from "./action-icons";

const tokenOf = (addr: string) => TOKENS.find((t) => t.address.toLowerCase() === addr.toLowerCase());

// Allocation-style breakdown (Hyperbeat) of what a session key is permitted to touch.
export default function PermissionsBreakdown({ settings }: { settings: PolicySettings | null }) {
  const chip = "flex items-center gap-2 px-3 py-1.5 border border-[#2a2a2a] bg-[#111] text-xs font-mono uppercase tracking-[1px] text-[#aab8f5]";

  return (
    <div className="card-3d p-8">
      <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-8 border-b border-[#262626] pb-4">
        Granted Permissions
      </h2>

      <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px] mb-3">Tokens</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {(settings?.tokens ?? []).length ? (
          settings!.tokens.map((addr) => {
            const tok = tokenOf(addr);
            const sym = tok?.symbol ?? addr.slice(0, 6);
            const logo = TOKEN_LOGOS[sym];
            return (
              <span key={addr} className={chip}>
                {logo && <img src={logo} alt={sym} className="w-4 h-4 rounded-full" />}
                {sym}
              </span>
            );
          })
        ) : (
          <span className="text-[#444] text-xs font-mono">—</span>
        )}
      </div>

      {PROTOCOLS.map((p) => {
        const actions = settings?.protocols[p.key] ?? [];
        return (
          <div key={p.key} className="mb-6 last:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <img src={p.logo} alt={p.name} className="w-5 h-5 rounded-full" />
              <p className="text-[#ccc] text-sm font-mono">{p.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.length ? (
                actions.map((a) => {
                  const Icon = ACTION_ICONS[a];
                  return (
                    <span key={a} className={chip}>
                      <Icon className="w-3.5 h-3.5" />
                      {ACTION_LABELS[a]}
                    </span>
                  );
                })
              ) : (
                <span className="text-[#444] text-xs font-mono">No actions granted</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
