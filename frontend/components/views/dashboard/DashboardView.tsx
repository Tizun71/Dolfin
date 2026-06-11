"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Address } from "viem";
import { useAccounts } from "@/hooks/useAccounts";
import OwnerBalanceCard from "./OwnerBalanceCard";
import SubAccountCard from "./SubAccountCard";
import AgentActivityPanel from "@/components/views/agents/components/AgentActivityPanel";
import CrossChainPanel from "@/components/views/agents/components/CrossChainPanel";

export default function DashboardView() {
  const { owner, accounts } = useAccounts();
  const [selected, setSelected] = useState<Address | null>(null);

  // Default to the first account once they load; keep the user's choice otherwise.
  useEffect(() => {
    if (!selected && accounts.length > 0) setSelected(accounts[0].address);
  }, [accounts, selected]);

  return (
    <div className="text-white font-sans">
      <div className="flex items-end justify-between mb-12">
        <h1 className="text-3xl font-normal uppercase tracking-[4px]">Dolfin A.I</h1>
        <Link
          href="/agents"
          className="text-[#fb923c] text-xs font-mono uppercase tracking-[2px] hover:underline"
        >
          + New account
        </Link>
      </div>

      {/* Owner wallet balances — read straight from chain. */}
      <div className="mb-12">
        <OwnerBalanceCard owner={owner} />
      </div>

      {/* Sub accounts (smart accounts) the user created. */}
      <div className="mb-16">
        <p className="text-[#666] text-xs font-mono uppercase tracking-[3px] mb-6">
          Your Accounts · {accounts.length}
        </p>
        {accounts.length === 0 ? (
          <div className="border border-[#1a1a1a] bg-[#050505] p-16 text-center">
            <p className="text-[#444] text-xs font-mono uppercase tracking-[3px] mb-4">No accounts yet</p>
            <Link href="/agents" className="text-[#fb923c] text-sm font-mono hover:underline">
              Create an account to get started →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.map((a) => (
              <SubAccountCard
                key={a.address}
                account={a}
                selected={selected === a.address}
                onSelect={() => setSelected(a.address)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live agent activity + cross-chain allocation for the selected account. */}
      {accounts.length > 0 && (
        <div className="space-y-8">
          <AgentActivityPanel owner={owner} account={selected} />
          <CrossChainPanel owner={owner} account={selected} />
        </div>
      )}
    </div>
  );
}
