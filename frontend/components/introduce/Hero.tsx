"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 pt-32">
      <p className="text-[#444] text-xs font-mono uppercase tracking-[5px] mb-8">
        AI-Powered DeFi Intelligence
      </p>
      <h1 className="text-[clamp(4rem,12vw,10rem)] font-light uppercase tracking-[0.15em] leading-none text-white mb-8">
        Dolfin
      </h1>
      <div className="w-24 h-px bg-[#333] mb-8" />
      <p className="text-[#555] text-sm font-mono uppercase tracking-[3px] max-w-md mb-16 leading-relaxed">
        Autonomous yield optimization across every chain. Powered by AI.
      </p>
      <button
        onClick={() => router.push("/dashboard")}
        className="group border border-[#333] px-16 py-5 text-xs font-mono uppercase tracking-[4px] text-[#888] hover:text-white hover:border-white transition-all duration-500 relative overflow-hidden"
      >
        <span className="relative z-10">Launch App</span>
        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <span className="absolute inset-0 flex items-center justify-center text-black text-xs font-mono uppercase tracking-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          Launch App
        </span>
      </button>
    </main>
  );
}
