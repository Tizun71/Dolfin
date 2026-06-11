"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, AlertTriangle, Loader2 } from "lucide-react";
import { useWallets } from "@privy-io/react-auth";
import { CHAIN_ID } from "@/constants/dolfin";
import { getActiveWallet } from "@/lib/dolfin-wallet";

// Network selector — reflects the connected wallet's chain and lets the user switch it.
const ARB_ICON = "https://token-icons.llamao.fi/icons/tokens/gecko/arbitrum?w=100&h=100";

function ArbitrumIcon({ size = 16 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={ARB_ICON}
      alt="Arbitrum"
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}

const CHAINS = [{ id: CHAIN_ID, name: "Arbitrum Sepolia", testnet: true }];

// Parse Privy's CAIP-2 chainId ("eip155:421614") to a number.
function parseChainId(caip?: string): number | null {
  if (!caip) return null;
  const n = Number(caip.split(":")[1]);
  return Number.isNaN(n) ? null : n;
}

export default function ChainSwitcher() {
  const { wallets } = useWallets();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const wallet = getActiveWallet(wallets);
  const walletChainId = parseChainId(wallet?.chainId);
  const isWrong = wallet != null && walletChainId !== CHAIN_ID;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSwitch = async (chainId: number) => {
    if (!wallet) {
      setError("Connect a wallet first.");
      return;
    }
    setSwitching(true);
    setError("");
    try {
      await wallet.switchChain(chainId);
      setOpen(false);
    } catch {
      setError("Switch rejected. Approve in your wallet.");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group flex items-center gap-2.5 cursor-pointer border px-4 py-2 text-xs uppercase tracking-[2px] transition-all duration-300 ${
          isWrong
            ? "border-red-500/60 bg-red-500/5 text-red-400"
            : open
              ? "border-[#f97316]/60 bg-white/5 text-white"
              : "border-white/15 hover:border-white/40 hover:bg-white/5 text-white"
        }`}
      >
        {isWrong ? <AlertTriangle size={14} /> : <ArbitrumIcon size={16} />}
        <span>{isWrong ? "Wrong Network" : "ARB Sepolia"}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""} ${isWrong ? "text-red-400" : "text-[#888] group-hover:text-white"}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-[#0a0a0a] border border-[#262626] shadow-[0_12px_40px_rgba(0,0,0,0.9)] z-30 p-1.5">
          <p className="text-[#666] text-[10px] font-mono uppercase tracking-[2px] px-3 py-2">
            Select Network
          </p>
          {CHAINS.map((c) => {
            const active = walletChainId === c.id;
            return (
              <button
                key={c.id}
                disabled={switching}
                onClick={() => handleSwitch(c.id)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2.5">
                  <ArbitrumIcon size={16} />
                  <span className="text-xs text-white uppercase tracking-[1px]">{c.name}</span>
                  {c.testnet && (
                    <span className="text-[9px] font-mono text-[#666] border border-[#333] px-1 py-px">Testnet</span>
                  )}
                </span>
                {switching ? (
                  <Loader2 size={14} className="text-[#f97316] animate-spin" />
                ) : active ? (
                  <Check size={14} className="text-[#f97316]" />
                ) : null}
              </button>
            );
          })}
          {error && (
            <p className="text-red-400 text-[10px] font-mono px-3 py-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
