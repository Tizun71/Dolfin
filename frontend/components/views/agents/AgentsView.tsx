"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useAccounts } from "@/hooks/useAccounts";

const short = (a: string) => `${a.slice(0, 8)}…${a.slice(-6)}`;

export default function AgentsView() {
  const { authenticated, login } = usePrivy();
  const { accounts, loading, createAccount } = useAccounts();
  const router = useRouter();

  const onCreate = async () => {
    const addr = await createAccount();
    if (addr) router.push(`/agents/${addr}`);
  };

  return (
    <div className="text-white font-sans">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-3xl font-normal uppercase tracking-[4px] text-white">Accounts</h1>
          <p className="text-[#666] text-sm font-mono mt-3 tracking-wide">
            Your Dolfin smart accounts. Each holds funds and delegates scoped agents.
          </p>
        </div>
        {authenticated && (
          <button
            onClick={onCreate}
            disabled={loading}
            className="px-6 py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition disabled:opacity-50"
          >
            {loading ? "Deploying…" : "+ New Account"}
          </button>
        )}
      </div>

      {!authenticated ? (
        <div className="card-3d p-16 text-center">
          <p className="text-[#888] text-sm font-mono uppercase tracking-[2px] mb-6">Connect a wallet to continue</p>
          <button
            onClick={login}
            className="px-8 py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition"
          >
            Connect Wallet →
          </button>
        </div>
      ) : accounts.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((a) => (
            <Link key={a.address} href={`/agents/${a.address}`} className="card-3d p-8 block">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-normal tracking-[1px] text-white">Account #{a.salt + 1}</h2>
                <span className="flex items-center gap-2 text-xs uppercase tracking-[1px] font-mono text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-[#666] text-xs font-mono uppercase tracking-[1.5px] mb-2">Address</p>
              <p className="text-[#f0f0f0] text-sm font-mono mb-6">{short(a.address)}</p>
              <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-4">
                <span className="text-[#888] text-xs font-mono uppercase tracking-[1px]">Agents</span>
                <span className="text-white text-sm font-mono">{a.sessions.length}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-3d p-16 text-center">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[3px] mb-4">No accounts yet</p>
          <p className="text-[#333] text-sm font-mono">Create a smart account to delegate AI trading</p>
        </div>
      )}
    </div>
  );
}
