"use client";

import { useState } from "react";
import { type Address } from "viem";
import { useAgentManage } from "@/hooks/useAgentManage";
import { type TransferMode } from "@/hooks/useAccountTransfer";
import AccountStatusCard from "./AccountStatusCard";
import UtilizationBar from "./UtilizationBar";
import PermissionsBreakdown from "./PermissionsBreakdown";
import TransferDrawer from "./TransferDrawer";

function StatTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card-3d p-8">
      <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">{label}</p>
      <p className={`text-2xl font-normal mt-4 tracking-[1px] ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}

const BTN = "px-6 py-3 text-xs uppercase tracking-[2px] font-mono border transition disabled:opacity-50";

export default function ManagePanel({
  owner,
  account,
  sessionKey,
  onSessionKeyChange,
}: {
  owner: Address | null;
  account: Address | null;
  sessionKey: Address | null;
  onSessionKeyChange: (key: Address) => void;
}) {
  const { status, loading, error, pause, resume, revoke, register, rotate, refresh } = useAgentManage(
    owner,
    account,
    sessionKey,
    onSessionKeyChange,
  );

  const [drawer, setDrawer] = useState<TransferMode | null>(null);

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
  const stateAccent =
    state === "Active" ? "text-green-400" : state === "—" ? "text-[#666]" : "text-yellow-400";

  return (
    <div className="space-y-8">
      <AccountStatusCard
        owner={owner ?? undefined}
        account={account}
        exists={!!account}
        sessionKey={sessionKey}
      />

      {/* Fund movement */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setDrawer("deposit")}
          className={`${BTN} border-green-600 text-green-400 hover:bg-green-600/10`}
        >
          ↓ Deposit
        </button>
        <button
          onClick={() => setDrawer("withdraw")}
          className={`${BTN} border-[#627EEA] text-[#aab8f5] hover:bg-[#627EEA1a]`}
        >
          ↑ Withdraw
        </button>
      </div>

      {/* Capacity hero — usage filled against policy caps (Hyperbeat-style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        <StatTile label="Status" value={state} accent={stateAccent} />
        <StatTile
          label="Expiry"
          value={status ? new Date(status.expiry * 1000).toLocaleDateString() : "—"}
        />
        <UtilizationBar
          label="Exposure"
          used={status?.exposure ?? BigInt(0)}
          cap={status?.maxExposure ?? BigInt(0)}
        />
        <UtilizationBar
          label="24h Volume"
          used={status?.dayVolume ?? BigInt(0)}
          cap={status?.maxDailyVolume ?? BigInt(0)}
          color="#5ea0e0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <PermissionsBreakdown owner={owner} />
        </div>

        {/* Controls */}
        <div className="card-3d p-8">
          <div className="flex items-center justify-between mb-8 border-b border-[#262626] pb-4">
            <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">Controls</h2>
            <button
              onClick={refresh}
              className="text-[#666] hover:text-white text-xs font-mono uppercase tracking-[1px] transition"
            >
              ↻ Refresh
            </button>
          </div>

          {error && <p className="text-red-500 text-xs font-mono mb-6 break-words">{error}</p>}

          <div className="flex flex-col gap-3">
            {dead ? (
              <button onClick={register} disabled={loading} className={`${BTN} border-blue-600 text-blue-400 hover:bg-blue-600/10`}>
                Register New Key
              </button>
            ) : (
              <>
                {status?.paused ? (
                  <button onClick={resume} disabled={loading} className={`${BTN} border-green-600 text-green-400 hover:bg-green-600/10`}>
                    Resume Agent
                  </button>
                ) : (
                  <button onClick={pause} disabled={loading} className={`${BTN} border-yellow-600 text-yellow-400 hover:bg-yellow-600/10`}>
                    Pause Agent
                  </button>
                )}
                <button onClick={rotate} disabled={loading} className={`${BTN} border-[#627EEA] text-[#aab8f5] hover:bg-[#627EEA1a]`}>
                  Rotate Key
                </button>
                <button onClick={revoke} disabled={loading} className={`${BTN} border-red-700 text-red-400 hover:bg-red-700/10`}>
                  Revoke Key
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <TransferDrawer
        open={drawer !== null}
        mode={drawer ?? "deposit"}
        owner={owner}
        account={account}
        onClose={() => setDrawer(null)}
        onDone={refresh}
      />
    </div>
  );
}
