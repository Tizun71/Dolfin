"use client";

import { useState } from "react";
import { type Address } from "viem";
import { DEFAULT_POLICY_SETTINGS, type PolicySettings } from "@/constants/dolfin";
import { useCreateSession } from "@/hooks/useCreateSession";
import PolicyForm from "./PolicyForm";

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
    <PolicyForm
      title="New Agent"
      subtitle="Delegate scoped, revocable trading authority to the AI."
      settings={settings}
      onChange={onChange}
      loading={loading}
      onSubmit={() => create(settings)}
      onCancel={onCancel}
    />
  );
}
