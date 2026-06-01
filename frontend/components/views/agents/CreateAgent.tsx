"use client";

import { type PolicySettings } from "@/constants/dolfin";
import { type useCreateAgent } from "@/hooks/useCreateAgent";
import AccountStatusCard from "./components/AccountStatusCard";
import PolicyForm from "./components/PolicyForm";
import ProtocolGrants from "./components/ProtocolGrants";
import SessionSummary from "./components/SessionSummary";

export default function CreateAgent({
  agent,
  settings,
  onChange,
}: {
  agent: ReturnType<typeof useCreateAgent>;
  settings: PolicySettings;
  onChange: (patch: Partial<PolicySettings>) => void;
}) {
  return (
    <div className="space-y-8">
      <AccountStatusCard
        owner={agent.owner ?? undefined}
        account={agent.account}
        exists={agent.accountExists}
        sessionKey={agent.sessionKey}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <PolicyForm settings={settings} onChange={onChange} />
          <ProtocolGrants settings={settings} onChange={onChange} />
        </div>
        <div className="lg:sticky lg:top-20">
          <SessionSummary
            step={agent.step}
            loading={agent.loading}
            error={agent.error}
            accountExists={agent.accountExists}
            onSubmit={() => agent.create(settings)}
          />
        </div>
      </div>
    </div>
  );
}
