"use client";

import { type Address } from "viem";
import { type PolicySettings } from "@/constants/dolfin";
import { useAgentManage } from "@/hooks/useAgentManage";
import UtilizationBar from "./UtilizationBar";
import PermissionsBreakdown from "./PermissionsBreakdown";

const BTN = "px-5 py-2.5 text-xs uppercase tracking-[2px] font-mono border transition disabled:opacity-50";
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

// One scoped session (AI agent) on an account: status, capacity vs caps, permissions, controls.
export default function SessionPanel({
  index,
  owner,
  account,
  sessionKey,
  settings,
  onSessionKeyChange,
}: {
  index: number;
  owner: Address | null;
  account: Address | null;
  sessionKey: Address | null;
  settings: PolicySettings | null;
  onSessionKeyChange: (key: Address) => void;
}) {
  const { status, loading, pause, resume, revoke, register, rotate, refresh } = useAgentManage(
    owner,
    account,
    sessionKey,
    onSessionKeyChange,
  );

  const dead = !sessionKey || (status ? status.revoked || status.expired : false);
  const state = !status
    ? "—"
    : status.revoked
      ? "Revoked"
      : status.broken
        ? "Circuit Broken"
        : status.paused
          ? "Paused"
          : status.expired
            ? "Expired"
            : "Active";
  const dot =
    state === "Active" ? "bg-green-400" : state === "—" ? "bg-[#555]" : "bg-yellow-400";

  return (
    <div className="card-3d p-8">
      <div className="flex items-center justify-between mb-8 border-b border-[#262626] pb-4">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${dot} ${state === "Active" ? "animate-pulse" : ""}`} />
          <h3 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">Agent #{index + 1}</h3>
          <span className="text-[#555] text-xs font-mono">{sessionKey ? short(sessionKey) : "—"}</span>
          <span className="text-xs font-mono text-[#888]">· {state}</span>
        </div>
        <button
          onClick={refresh}
          className="text-[#666] hover:text-white text-xs font-mono uppercase tracking-[1px] transition"
        >
          ↻
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
        <UtilizationBar label="Exposure" used={status?.exposure ?? BigInt(0)} cap={status?.maxExposure ?? BigInt(0)} />
        <UtilizationBar label="24h Volume" used={status?.dayVolume ?? BigInt(0)} cap={status?.maxDailyVolume ?? BigInt(0)} color="#f59e0b" />
        <div className="card-3d p-8">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">Expiry</p>
          <p className="text-lg font-normal mt-4 text-white">
            {status ? new Date(status.expiry * 1000).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      <PermissionsBreakdown settings={settings} />

      <div className="flex flex-wrap gap-3 mt-8">
        {dead ? (
          <button onClick={register} disabled={loading} className={`${BTN} btn-brand-outline`}>
            Register New Key
          </button>
        ) : (
          <>
            {status?.paused ? (
              <button onClick={resume} disabled={loading} className={`${BTN} border-green-600 text-green-400 hover:bg-green-600 hover:text-black`}>
                Resume
              </button>
            ) : (
              <button onClick={pause} disabled={loading} className={`${BTN} border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black`}>
                Pause
              </button>
            )}
            <button onClick={rotate} disabled={loading} className={`${BTN} btn-brand-outline`}>
              Rotate Key
            </button>
            <button onClick={revoke} disabled={loading} className={`${BTN} border-red-700 text-red-400 hover:bg-red-700 hover:text-white`}>
              Revoke Key
            </button>
          </>
        )}
      </div>
    </div>
  );
}
