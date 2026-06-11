"use client";

import { formatUnits, type Address } from "viem";
import { TOKEN_LOGOS } from "@/constants/dolfin";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useAccountPause } from "@/hooks/useAccountPause";
import Skeleton from "@/components/ui/Skeleton";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-2 font-medium">
        {label}
      </p>
      <p className="text-[#f0f0f0] text-sm font-mono break-all">{value}</p>
    </div>
  );
}

function fmt(v: bigint, decimals: number) {
  return Number(formatUnits(v, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

const BTN = "flex-1 px-4 py-3 text-xs uppercase tracking-[2px] font-mono border transition disabled:opacity-50";

function BalancePanel({
  account,
  onDeposit,
  onWithdraw,
}: {
  account: Address | null;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  const { balances, loading } = useTokenBalances(account);

  return (
    <div className="border-l border-[#262626] md:pl-8 pl-0 pt-8 md:pt-0 flex flex-col">
      <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-5 font-medium">
        Balance
      </p>
      {loading && !balances.length ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-12 h-4" />
              </div>
              <Skeleton className="w-20 h-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {balances.map(({ token, balance }) => {
            const logo = TOKEN_LOGOS[token.symbol];
            return (
              <div key={token.symbol} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {logo && <img src={logo} alt={token.symbol} className="w-6 h-6 rounded-full" />}
                  <span className="text-[#ccc] text-sm font-mono uppercase tracking-[1px]">{token.symbol}</span>
                </div>
                <span className="text-[#f0f0f0] text-sm font-mono tabular-nums">
                  {fmt(balance, token.decimals)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 mt-6 pt-6 border-t border-[#262626]">
        <button onClick={onDeposit} className={`${BTN} btn-brand border-transparent`}>
          ↓ Deposit
        </button>
        <button onClick={onWithdraw} className={`${BTN} btn-brand-outline`}>
          ↑ Withdraw
        </button>
      </div>
    </div>
  );
}

export default function AccountStatusCard({
  owner,
  account,
  exists,
  onDeposit,
  onWithdraw,
}: {
  owner?: string;
  account: Address | null;
  exists: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  const { paused, loading, toggle } = useAccountPause((owner as Address) ?? null, account);

  return (
    <div className="card-3d p-8">
      <div className="flex items-center justify-between mb-8 border-b border-[#262626] pb-4">
        <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">
          Smart Account
        </h2>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 border w-fit ${
              paused
                ? "border-[#333] bg-[#111]"
                : exists
                  ? "border-[#fb923c] bg-[#fb923c]/15"
                  : "border-[#333] bg-[#111]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                paused ? "bg-[#888]" : exists ? "bg-[#fb923c] animate-pulse" : "bg-[#555]"
              }`}
            />
            <span className="text-xs uppercase tracking-[2px] font-mono text-[#ccc]">
              {paused ? "Paused" : exists ? "Active" : "Not deployed"}
            </span>
          </div>
          <button
            onClick={toggle}
            disabled={loading || paused == null}
            className={`px-4 py-1.5 text-xs uppercase tracking-[2px] font-mono border transition disabled:opacity-50 ${
              paused
                ? "btn-brand border-transparent"
                : "border-[#333] text-[#ccc] hover:bg-white hover:text-black hover:border-white"
            }`}
          >
            {paused ? "ENABLE" : "DISABLE"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: owner / account / session info */}
        <div className="space-y-6">
          <InfoRow label="Owner (EOA)" value={owner ?? "—"} />
          <InfoRow label="Smart Account" value={account ?? "—"} />
        </div>

        {/* Right: account balances + fund movement */}
        <BalancePanel account={account} onDeposit={onDeposit} onWithdraw={onWithdraw} />
      </div>
    </div>
  );
}
