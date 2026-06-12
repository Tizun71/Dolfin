"use client";

import { formatUnits, type Address } from "viem";
import { TOKEN_LOGOS } from "@/constants/dolfin";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useAccountPause } from "@/hooks/useAccountPause";
import { useOnchainPortfolio } from "@/hooks/useOnchainPortfolio";
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

const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Health-factor colour tiers, aligned with the agent's repair threshold (HF < 2 amber,
// HF < 1.4 danger). No debt or unknown reads as a safe green.
function hfTier(hf: number | null, debtUsd: number) {
  if (debtUsd <= 0 || hf == null) return { bar: "#fb923c", text: "text-[#fb923c]", label: "SAFE" };
  if (hf < 1.4) return { bar: "#ef4444", text: "text-[#ef4444]", label: "AT RISK" };
  if (hf < 2) return { bar: "#f59e0b", text: "text-[#f59e0b]", label: "WATCH" };
  return { bar: "#22c55e", text: "text-[#22c55e]", label: "HEALTHY" };
}

// DeFi lending position as an HP-style bar: borrowed (debt) fills against supplied collateral.
function DefiPositionPanel({ account }: { account: Address | null }) {
  const { data, loading } = useOnchainPortfolio(account);
  const collateral = data.aaveCollateralUsd;
  const debt = data.aaveDebtUsd;
  const hf = data.healthFactor;
  const utilization = collateral > 0 ? Math.min(100, (debt / collateral) * 100) : 0;
  const tier = hfTier(hf, debt);
  const hfLabel = hf == null ? "—" : hf >= 999 ? "∞" : hf.toFixed(2);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] font-medium">
          DeFi · Aave V3
        </p>
        <span className={`text-xs font-mono tracking-[1px] ${tier.text}`}>
          HF {hfLabel} · {tier.label}
        </span>
      </div>

      {loading && collateral === 0 && debt === 0 ? (
        <Skeleton className="w-full h-3 rounded-full" />
      ) : collateral === 0 && debt === 0 ? (
        <p className="text-[#444] text-sm font-mono">No DeFi position</p>
      ) : (
        <>
          {/* HP bar: track = supplied collateral, fill = borrowed against it. */}
          <div className="relative w-full h-3 rounded-full bg-[#1a1a1a] border border-[#262626] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500"
              style={{ width: `${utilization}%`, backgroundColor: tier.bar }}
            />
          </div>
          <p className="text-[#555] text-[10px] font-mono mt-1.5 tracking-[1px]">
            {utilization.toFixed(0)}% BORROWED AGAINST COLLATERAL
          </p>

          <div className="flex gap-6 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-[#888] text-[10px] font-mono uppercase tracking-[1px]">Lent</span>
              </div>
              <span className="text-[#f0f0f0] text-sm font-mono tabular-nums">{usd(collateral)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.bar }} />
                <span className="text-[#888] text-[10px] font-mono uppercase tracking-[1px]">Borrowed</span>
              </div>
              <span className="text-[#f0f0f0] text-sm font-mono tabular-nums">{usd(debt)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
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
        {/* Left: owner / account info + DeFi lending position */}
        <div className="space-y-6">
          <InfoRow label="Owner (EOA)" value={owner ?? "—"} />
          <InfoRow label="Smart Account" value={account ?? "—"} />
          <DefiPositionPanel account={account} />
        </div>

        {/* Right: account balances + fund movement */}
        <BalancePanel account={account} onDeposit={onDeposit} onWithdraw={onWithdraw} />
      </div>
    </div>
  );
}
