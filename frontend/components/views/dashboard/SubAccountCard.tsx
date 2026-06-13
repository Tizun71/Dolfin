"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUnits } from "viem";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useOnchainPortfolio } from "@/hooks/useOnchainPortfolio";
import { type StoredAccount } from "@/lib/account-store";
import { TOKEN_LOGOS, PROTOCOLS } from "@/constants/dolfin";
import Skeleton from "@/components/ui/Skeleton";

const AAVE_LOGO = PROTOCOLS.find((p) => p.key === "aave")?.logo;

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const fmt = (v: bigint, decimals: number) =>
  Number(formatUnits(v, decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 });

// One smart (sub) account: on-chain value + Aave health factor + token balances + agent count.
// Clickable to drive the live panels below.
export default function SubAccountCard({
  account,
  selected,
  onSelect,
}: {
  account: StoredAccount;
  selected: boolean;
  onSelect: () => void;
}) {
  const { balances, loading: balLoading } = useTokenBalances(account.address);
  const { data, loading } = useOnchainPortfolio(account.address);
  const hf = data.healthFactor;
  const [aura, setAura] = useState(false);

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={`card-3d p-6 text-left w-full cursor-pointer flex flex-col transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb923c]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
        aura
          ? "border-[#fb923c]/60 shadow-[0_0_40px_-8px_rgba(249,115,22,0.35)] -translate-y-0.5"
          : selected
          ? "border-[#fb923c]"
          : "hover:border-[#333]"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white text-sm tracking-[1px]">Account #{account.salt + 1}</p>
          <p className="text-[#666] text-xs font-mono mt-1">{short(account.address)}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[#141414] border border-[#222] text-[#888] text-[10px] font-mono uppercase tracking-[1px]">
          {account.sessions.length} agent{account.sessions.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[#666] text-xs font-mono uppercase tracking-[1px]">Value</p>
          {loading ? (
            <Skeleton className="w-24 h-7 mt-1.5" />
          ) : (
            <p className="text-2xl text-white mt-1 tracking-[0.5px] tabular-nums">{usd(data.totalValueUsd)}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[#666] text-xs font-mono uppercase tracking-[1px]">Health</p>
          {loading ? (
            <Skeleton className="w-12 h-7 mt-1.5 ml-auto" />
          ) : (
            <p
              className={`text-2xl mt-1 tracking-[0.5px] tabular-nums ${
                hf !== null && hf < 1.5 ? "text-[#f87171]" : "text-white"
              }`}
            >
              {hf === null ? "—" : hf >= 999 ? "∞" : hf.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-[#555] text-[10px] font-mono uppercase tracking-[1.5px] mb-2">Wallet</p>
          <div className="flex flex-wrap gap-2">
            {balLoading && !balances.length
              ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="w-20 h-7 rounded-full" />)
              : null}
            {balances.map(({ token, balance }) => (
              <span
                key={token.symbol}
                className="flex items-center gap-1.5 rounded-full bg-[#0c0c0c] border border-[#1a1a1a] px-2.5 py-1 text-xs font-mono text-[#aaa]"
              >
                {TOKEN_LOGOS[token.symbol] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={TOKEN_LOGOS[token.symbol]} alt={token.symbol} className="w-4 h-4 rounded-full" />
                )}
                <span className="text-[#666]">{token.symbol}</span>{" "}
                {balLoading ? "…" : fmt(balance, token.decimals)}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[#555] text-[10px] font-mono uppercase tracking-[1.5px] mb-2">DeFi Positions</p>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <Skeleton className="w-28 h-7 rounded-full" />
            ) : data.aavePositionUsd > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[#0c0c0c] border border-[#1a1a1a] px-2.5 py-1 text-xs font-mono text-[#aaa]">
                {AAVE_LOGO && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={AAVE_LOGO} alt="Aave" className="w-4 h-4 rounded-full" />
                )}
                <span className="text-[#666]">Aave V3</span> {loading ? "…" : usd(data.aavePositionUsd)}
              </span>
            ) : (
              <span className="text-xs font-mono text-[#444]">{loading ? "…" : "No positions"}</span>
            )}
          </div>
        </div>
      </div>

      <Link
        href={`/agents/${account.address}`}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setAura(true)}
        onMouseLeave={() => setAura(false)}
        onFocus={() => setAura(true)}
        onBlur={() => setAura(false)}
        className="mt-auto block w-full text-center py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition"
      >
        Manage →
      </Link>
    </div>
  );
}
