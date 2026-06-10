"use client";

import { useRouter } from "next/navigation";

interface AssetHeaderProps {
  symbol: string;
  name: string;
  icon: string;
  color: string;
}

export default function AssetHeader({ symbol, name, icon, color }: AssetHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-6 mb-10 border-b border-[#1a1a1a] pb-8">
      <button
        onClick={() => router.back()}
        className="text-[#444] hover:text-white transition text-xs uppercase tracking-[2px] font-mono"
      >
        ← Back
      </button>
      <div className="w-px h-6 bg-[#1a1a1a]" />
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg border"
          style={{ borderColor: `${color}44`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-[#444] text-xs uppercase tracking-[2px] font-mono">
            {symbol}
          </p>
          <h1 className="text-3xl font-light uppercase tracking-widest">
            {name}
          </h1>
        </div>
      </div>
    </div>
  );
}
