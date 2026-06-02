"use client";

import { type PolicySettings } from "@/constants/dolfin";
import ProtocolGrants from "./ProtocolGrants";
import RiskPolicySection from "./RiskPolicySection";
import SummaryPanel from "./SummaryPanel";

// Shared permissions + risk-policy editor. Drives both the create and edit-in-place flows.
export default function PolicyForm({
  title,
  subtitle,
  settings,
  onChange,
  loading,
  onSubmit,
  onCancel,
  submitLabel,
  note,
}: {
  title: string;
  subtitle: string;
  settings: PolicySettings;
  onChange: (patch: Partial<PolicySettings>) => void;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
  note?: string;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <div>
          <h2 className="text-lg font-normal uppercase tracking-[3px] text-white">{title}</h2>
          <p className="text-[#666] text-xs font-mono mt-2">{subtitle}</p>
        </div>
        <button onClick={onCancel} className="text-[#444] hover:text-white text-sm font-mono transition">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <ProtocolGrants settings={settings} onChange={onChange} />
          <RiskPolicySection settings={settings} onChange={onChange} />
        </div>
        <SummaryPanel settings={settings} loading={loading} onSubmit={onSubmit} submitLabel={submitLabel} note={note} />
      </div>
    </div>
  );
}
