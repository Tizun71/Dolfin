"use client";

import { formatUnits } from "viem";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useOnchainPortfolio } from "@/hooks/useOnchainPortfolio";
import { type StoredAccount } from "@/lib/account-store";
import { TOKEN_LOGOS, PROTOCOLS } from "@/constants/dolfin";

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

  return (
    <button
      onClick={onSelect}
      className={`card-3d p-6 text-left transition w-full ${
        selected ? "border-[#fb923c]" : "hover:border-[#333]"
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white text-sm tracking-[1px]">Account #{account.salt + 1}</p>
          <p className="text-[#666] text-xs font-mono mt-1">{short(account.address)}</p>
        </div>
        <span className="text-[#666] text-xs font-mono uppercase tracking-[1px]">
          {account.sessions.length} agent{account.sessions.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[#666] text-xs font-mono uppercase tracking-[1px]">Value</p>
          <p className="text-2xl text-white mt-1 tracking-[0.5px]">{loading ? "…" : usd(data.totalValueUsd)}</p>
        </div>
        <div className="text-right">
          <p className="text-[#666] text-xs font-mono uppercase tracking-[1px]">Health</p>
          <p
            className={`text-2xl mt-1 tracking-[0.5px] ${
              hf !== null && hf < 1.5 ? "text-[#f87171]" : "text-white"
            }`}
          >
            {hf === null ? "—" : hf >= 999 ? "∞" : hf.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="border-t border-[#1a1a1a] pt-4 space-y-3">
        <div>
          <p className="text-[#555] text-[10px] font-mono uppercase tracking-[1px] mb-1.5">Wallet</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {balances.map(({ token, balance }) => (
              <span key={token.symbol} className="flex items-center gap-1.5 text-xs font-mono text-[#888]">
                {TOKEN_LOGOS[token.symbol] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={TOKEN_LOGOS[token.symbol]} alt={token.symbol} className="w-4 h-4 rounded-full" />
                )}
                <span className="text-[#555]">{token.symbol}</span>{" "}
                {balLoading ? "…" : fmt(balance, token.decimals)}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[#555] text-[10px] font-mono uppercase tracking-[1px] mb-1.5">DeFi Positions</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {data.aavePositionUsd > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#888]">
                {AAVE_LOGO && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={AAVE_LOGO} alt="Aave" className="w-4 h-4 rounded-full" />
                )}
                <span className="text-[#555]">Aave V3</span> {loading ? "…" : usd(data.aavePositionUsd)}
              </span>
            ) : (
              <span className="text-xs font-mono text-[#444]">{loading ? "…" : "No positions"}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
