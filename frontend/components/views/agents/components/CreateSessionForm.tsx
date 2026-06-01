"use client";

import { useState } from "react";
import { type Address } from "viem";
import { DEFAULT_POLICY_SETTINGS, type PolicySettings } from "@/constants/dolfin";
import { useCreateSession } from "@/hooks/useCreateSession";
import ProtocolGrants from "./ProtocolGrants";
import RiskPolicySection from "./RiskPolicySection";
import SummaryPanel from "./SummaryPanel";

// New-agent flow: pick permissions + risk policy, live summary, grant a fresh session key.
export default function CreateSessionForm({
  account,
  onCancel,
  onDone,
}: {
  account: Address | null;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [settings, setSettings] = useState<PolicySettings>(DEFAULT_POLICY_SETTINGS);
  const { loading, create } = useCreateSession(account, onDone);

  const onChange = (patch: Partial<PolicySettings>) => setSettings((s) => ({ ...s, ...patch }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#262626] pb-4">
        <div>
          <h2 className="text-lg font-normal uppercase tracking-[3px] text-white">New Agent</h2>
          <p className="text-[#666] text-xs font-mono mt-2">Delegate scoped, revocable trading authority to the AI.</p>
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
        <SummaryPanel settings={settings} loading={loading} onSubmit={() => create(settings)} />
      </div>
    </div>
  );
}
