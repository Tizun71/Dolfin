"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

// Active network indicator — app runs on Arbitrum Sepolia only (single supported chain for now).
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

const CHAINS = [{ id: 421614, name: "Arbitrum Sepolia", testnet: true }];

export default function ChainSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeId = 421614;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group flex items-center gap-2.5 cursor-pointer border px-4 py-2 text-xs text-white uppercase tracking-[2px] transition-all duration-300 ${
          open
            ? "border-[#f97316]/60 bg-white/5"
            : "border-white/15 hover:border-white/40 hover:bg-white/5"
        }`}
      >
        <ArbitrumIcon size={16} />
        <span>ARB Sepolia</span>
        <ChevronDown
          size={13}
          className={`text-[#888] transition-transform duration-300 group-hover:text-white ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-[#0a0a0a] border border-[#262626] shadow-[0_12px_40px_rgba(0,0,0,0.9)] z-30 p-1.5">
          <p className="text-[#666] text-[10px] font-mono uppercase tracking-[2px] px-3 py-2">
            Select Network
          </p>
          {CHAINS.map((c) => (
            <button
              key={c.id}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2.5">
                <ArbitrumIcon size={16} />
                <span className="text-xs text-white uppercase tracking-[1px]">{c.name}</span>
                {c.testnet && (
                  <span className="text-[9px] font-mono text-[#666] border border-[#333] px-1 py-px">Testnet</span>
                )}
              </span>
              {c.id === activeId && <Check size={14} className="text-[#f97316]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
