"use client";

import { formatUnits, type Address } from "viem";
import { TRANSFER_TOKENS } from "@/constants/dolfin";
import { useAccountTransfer, type TransferMode } from "@/hooks/useAccountTransfer";
import Drawer from "./Drawer";

const fmt = (v: bigint | null, decimals: number) =>
  v == null ? "—" : Number(formatUnits(v, decimals)).toLocaleString(undefined, { maximumFractionDigits: 6 });

export default function TransferDrawer({
  open,
  mode,
  owner,
  account,
  onClose,
  onDone,
}: {
  open: boolean;
  mode: TransferMode;
  owner: Address | null;
  account: Address | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useAccountTransfer(owner, account, mode, onDone);
  const isDeposit = mode === "deposit";

  return (
    <Drawer open={open} onClose={onClose} title={isDeposit ? "Deposit to Account" : "Withdraw from Account"}>
      {/* Token select */}
      <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-3 font-medium">Token</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {TRANSFER_TOKENS.map((tok) => (
          <button
            key={tok.symbol}
            onClick={() => t.setToken(tok)}
            className={`px-4 py-2 border text-xs font-mono uppercase tracking-[1px] transition ${
              t.token.symbol === tok.symbol
                ? "border-[#f97316] bg-[#f973161a] text-[#fbbf24]"
                : "border-[#222] text-[#666] hover:border-[#333]"
            }`}
          >
            {tok.symbol}
          </button>
        ))}
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[#666] text-xs font-mono uppercase tracking-[1px] mb-2">Owner</p>
          <p className="text-[#f0f0f0] text-sm font-mono">{fmt(t.ownerBal, t.token.decimals)}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="text-[#666] text-xs font-mono uppercase tracking-[1px] mb-2">Account</p>
          <p className="text-[#f0f0f0] text-sm font-mono">{fmt(t.acctBal, t.token.decimals)}</p>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] font-medium">Amount</p>
        <button onClick={t.setMax} className="text-[#f97316] text-xs font-mono uppercase tracking-[1px] hover:text-[#fbbf24]">
          Max
        </button>
      </div>
      <input
        type="number"
        min="0"
        value={t.amount}
        onChange={(e) => t.setAmount(e.target.value)}
        placeholder="0.0"
        className="w-full bg-[#050505] border border-[#222] text-[#f0f0f0] text-lg font-mono px-4 py-3 focus:border-[#f97316] focus:outline-none transition mb-2"
      />
      <p className="text-[#444] text-xs font-mono mb-8">
        {isDeposit ? "Owner wallet → smart account" : "Smart account → owner wallet"}
      </p>

      <button
        onClick={t.submit}
        disabled={t.loading}
        className="w-full py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition disabled:opacity-50"
      >
        {t.loading ? "Processing…" : isDeposit ? "Deposit →" : "Withdraw →"}
      </button>
    </Drawer>
  );
}
