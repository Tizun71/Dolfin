"use client";

import { type Address } from "viem";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-2 font-medium">
        {label}
      </p>
      <p className="text-[#f0f0f0] text-sm font-mono truncate">{value}</p>
    </div>
  );
}

export default function AccountStatusCard({
  owner,
  account,
  exists,
  sessionKey,
}: {
  owner?: string;
  account: Address | null;
  exists: boolean;
  sessionKey: Address | null;
}) {
  return (
    <div className="card-3d p-8">
      <div className="flex items-center justify-between mb-8 border-b border-[#262626] pb-4">
        <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">
          Smart Account
        </h2>
        <div
          className={`flex items-center gap-2 px-3 py-1 border w-fit ${
            exists ? "border-green-600 bg-green-600/15" : "border-[#333] bg-[#111]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${exists ? "bg-green-400 animate-pulse" : "bg-[#555]"}`} />
          <span className="text-xs uppercase tracking-[2px] font-mono text-[#ccc]">
            {exists ? "Deployed" : "Not deployed"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InfoRow label="Owner (EOA)" value={owner ?? "—"} />
        <InfoRow label="Account (counterfactual)" value={account ?? "—"} />
        <InfoRow label="AI Session Key" value={sessionKey ?? "—"} />
      </div>
    </div>
  );
}
