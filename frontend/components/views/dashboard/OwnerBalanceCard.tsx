"use client";

import { formatUnits, type Address } from "viem";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { TOKEN_LOGOS } from "@/constants/dolfin";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmt = (v: bigint, decimals: number) =>
  Number(formatUnits(v, decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 });

// Connected owner wallet (EOA): shows native + token balances read straight from chain.
export default function OwnerBalanceCard({ owner }: { owner: Address | null }) {
  const { balances, loading } = useTokenBalances(owner);

  return (
    <div className="card-3d p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#666] text-xs font-mono uppercase tracking-[2px]">Your Wallet</p>
        {owner && <p className="text-[#888] text-xs font-mono">{short(owner)}</p>}
      </div>

      {!owner ? (
        <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] py-4">Connect a wallet</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {balances.map(({ token, balance }) => (
            <div key={token.symbol} className="flex items-center gap-3">
              {TOKEN_LOGOS[token.symbol] && (
                <img src={TOKEN_LOGOS[token.symbol]} alt={token.symbol} className="w-7 h-7" />
              )}
              <div>
                <p className="text-[#666] text-xs font-mono uppercase tracking-[1px]">{token.symbol}</p>
                <p className="text-lg text-white tracking-[0.5px]">
                  {loading ? "…" : fmt(balance, token.decimals)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
