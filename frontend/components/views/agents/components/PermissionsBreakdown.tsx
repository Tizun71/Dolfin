"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { ACTION_LABELS, PROTOCOLS, TOKENS, type PolicySettings } from "@/constants/dolfin";
import { loadSession } from "@/lib/session-key-store";

const symbolOf = (addr: string) =>
  TOKENS.find((t) => t.address.toLowerCase() === addr.toLowerCase())?.symbol ?? addr.slice(0, 6);

// Allocation-style breakdown (Hyperbeat) of what the session key is permitted to touch.
export default function PermissionsBreakdown({ owner }: { owner: Address | null }) {
  const [settings, setSettings] = useState<PolicySettings | null>(null);

  useEffect(() => {
    if (!owner) return;
    let cancelled = false;
    Promise.resolve(loadSession(owner)?.settings ?? null).then((s) => !cancelled && setSettings(s));
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const chip = "px-3 py-1.5 border border-[#2a2a2a] bg-[#111] text-xs font-mono uppercase tracking-[1px] text-[#aab8f5]";

  return (
    <div className="card-3d p-8">
      <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-8 border-b border-[#262626] pb-4">
        Granted Permissions
      </h2>

      <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px] mb-3">Tokens</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {(settings?.tokens ?? []).length ? (
          settings!.tokens.map((t) => (
            <span key={t} className={chip}>
              {symbolOf(t)}
            </span>
          ))
        ) : (
          <span className="text-[#444] text-xs font-mono">—</span>
        )}
      </div>

      {PROTOCOLS.map((p) => {
        const actions = settings?.protocols[p.key] ?? [];
        return (
          <div key={p.key} className="mb-6 last:mb-0">
            <p className="text-[#ccc] text-sm font-mono mb-3">{p.name}</p>
            <div className="flex flex-wrap gap-2">
              {actions.length ? (
                actions.map((a) => (
                  <span key={a} className={chip}>
                    {ACTION_LABELS[a]}
                  </span>
                ))
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
