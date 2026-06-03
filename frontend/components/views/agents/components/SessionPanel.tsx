"use client";

import { useState } from "react";
import { type Address } from "viem";
import { DEFAULT_POLICY_SETTINGS, type PolicySettings } from "@/constants/dolfin";
import { useAgentManage } from "@/hooks/useAgentManage";
import UtilizationBar from "./UtilizationBar";
import PermissionsBreakdown from "./PermissionsBreakdown";
import Modal from "./Modal";
import PolicyForm from "./PolicyForm";

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
  const { status, loading, revoke, register, rotate, refresh, edit, del } = useAgentManage(
    owner,
    account,
    sessionKey,
    onSessionKeyChange,
  );
  const [showPerms, setShowPerms] = useState(false);
  const [editSettings, setEditSettings] = useState<PolicySettings | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  const confirmDelete = async () => {
    if (!sessionKey) return;
    await del(() => onSessionKeyChange(sessionKey));
    setConfirmDel(false);
  };

  const openEdit = () => setEditSettings(settings ?? DEFAULT_POLICY_SETTINGS);
  const patchEdit = (patch: Partial<PolicySettings>) =>
    setEditSettings((s) => (s ? { ...s, ...patch } : s));
  const submitEdit = async () => {
    if (!editSettings) return;
    await edit(editSettings);
    setEditSettings(null);
  };

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
    state === "Active" ? "bg-[#fb923c]" : state === "—" ? "bg-[#555]" : "bg-[#888]";

  return (
    <div className="card-3d p-6">
      <div className="flex items-center justify-between mb-6 border-b border-[#262626] pb-4">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${dot} ${state === "Active" ? "animate-pulse" : ""}`} />
          <h3 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">Agent #{index + 1}</h3>
          <span className="text-[#555] text-xs font-mono">{sessionKey ? short(sessionKey) : "—"}</span>
          <span className="text-xs font-mono text-[#888]">· {state}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="text-[#666] hover:text-white text-xs font-mono uppercase tracking-[1px] transition"
            title="Refresh"
          >
            ↻
          </button>
          <button
            onClick={() => setConfirmDel(true)}
            disabled={loading || !sessionKey}
            className="text-[#666] hover:text-red-400 transition disabled:opacity-40"
            title="Delete agent"
            aria-label="Delete agent"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x divide-[#262626]">
        <UtilizationBar label="Exposure" used={status?.exposure ?? BigInt(0)} cap={status?.maxExposure ?? BigInt(0)} />
        <div className="sm:pl-6">
          <UtilizationBar label="24h Volume" used={status?.dayVolume ?? BigInt(0)} cap={status?.maxDailyVolume ?? BigInt(0)} />
        </div>
        <div className="sm:pl-6">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px] mb-2">Expiry</p>
          <p className="text-lg font-normal text-white">
            {status ? new Date(status.expiry * 1000).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#262626]">
        <button
          onClick={() => setShowPerms((v) => !v)}
          className="flex items-center gap-2 text-[#888] hover:text-white text-xs font-mono uppercase tracking-[2px] transition"
        >
          <span className={`transition-transform ${showPerms ? "rotate-90" : ""}`}>▸</span>
          Granted Permissions
        </button>
        {showPerms && (
          <div className="mt-5">
            <PermissionsBreakdown settings={settings} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        {dead ? (
          <button onClick={register} disabled={loading} className={`${BTN} btn-brand-outline`}>
            Register New Key
          </button>
        ) : (
          <>
            <button onClick={openEdit} disabled={loading} className={`${BTN} btn-brand-outline`}>
              Change Policy
            </button>
            <button onClick={rotate} disabled={loading} className={`${BTN} btn-brand-outline`}>
              Rotate Key
            </button>
            <button onClick={revoke} disabled={loading} className={`${BTN} border-[#333] text-[#888] hover:bg-white hover:text-black hover:border-white`}>
              Revoke Key
            </button>
          </>
        )}
      </div>

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)}>
        <div className="p-2">
          <h3 className="text-sm font-normal uppercase tracking-[3px] text-white mb-4">
            Delete Agent #{index + 1}?
          </h3>
          <p className="text-[#888] text-sm font-mono leading-relaxed mb-2">
            {dead
              ? "This key is already dead. Deleting removes its backend config and local record."
              : "Revokes the key on-chain (owner signs), removes the backend config, and deletes the local record. The agent stops trading immediately."}
          </p>
          <p className="text-[#555] text-xs font-mono mb-6">
            Past activity history is kept. This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmDel(false)}
              disabled={loading}
              className={`${BTN} btn-brand-outline`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={loading}
              className={`${BTN} border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500`}
            >
              {loading ? "Deleting…" : "Delete →"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={editSettings !== null} onClose={() => setEditSettings(null)}>
        {editSettings && (
          <PolicyForm
            title={`Edit Agent #${index + 1}`}
            subtitle="Update scope and risk caps in place. Same key — the agent keeps running."
            settings={editSettings}
            onChange={patchEdit}
            loading={loading}
            onSubmit={submitEdit}
            onCancel={() => setEditSettings(null)}
            submitLabel="Save Changes →"
            note="Overwrites this key's policy on-chain. Dropped tokens/protocols are explicitly revoked. Owner signs."
          />
        )}
      </Modal>
    </div>
  );
}
