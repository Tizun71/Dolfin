"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Copy, Check, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

// Connected-wallet chip → popover with full address, copy, logout.
export default function WalletMenu() {
  const { logout, user } = usePrivy();
  const address = user?.wallet?.address ?? "";
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied", { description: short(address) });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group flex items-center gap-2.5 cursor-pointer border px-4 py-2 text-xs text-[#ccc] font-mono tracking-[1px] transition-all duration-300 ${
          open
            ? "border-[#f97316]/60 bg-white/5 text-white"
            : "border-white/15 hover:border-white/40 hover:bg-white/5 hover:text-white"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        {short(address)}
        <ChevronDown
          size={13}
          className={`text-[#888] transition-transform duration-300 group-hover:text-white ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-[#0a0a0a] border border-[#262626] shadow-[0_12px_40px_rgba(0,0,0,0.9)] z-30 p-4">
          <p className="text-[#666] text-[10px] font-mono uppercase tracking-[2px] mb-2">
            Connected Wallet
          </p>
          <p className="text-[#ccc] text-xs font-mono break-all mb-4 leading-relaxed">
            {address}
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={copy}
              className="flex items-center justify-center gap-2 border border-white/15 px-4 py-2.5 text-xs text-white uppercase tracking-[2px] transition-all duration-300 hover:border-white/40"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Address"}
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 border border-red-500/40 px-4 py-2.5 text-xs text-red-400 uppercase tracking-[2px] transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
