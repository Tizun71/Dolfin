"use client";

import { useRouter } from "next/navigation";
import FloatingLines from "../shared/FloatingLines";

export default function Hero() {
  const router = useRouter();

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 pt-32">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-0 overflow-hidden mix-blend-screen opacity-75">
        <div>
          <FloatingLines
            linesGradient={["#517ab3", "#000000", "#6a6a6a"]}
            animationSpeed={1}
            interactive
            bendRadius={8}
            bendStrength={-2}
            mouseDamping={0.05}
            parallax
            parallaxStrength={0.2}
          />
        </div>
      </div>
      <p className="text-[#bbb] text-xs font-mono uppercase tracking-[5px] mb-8">
        AI-Powered DeFi Intelligence
      </p>
      <h1 className="relative z-10 text-[10rem] font-light uppercase tracking-[0.15em] leading-none text-white mb-8 transition duration-300 ease-in-out hover:scale-110">
        Dolfin
      </h1>
      <div className="w-24 h-px bg-[#333] mb-8" />
      <p className="text-[#bbb] text-base font-mono uppercase tracking-[3px] max-w-xl mb-16 leading-relaxed">
        Autonomous yield optimization across every chain. Powered by AI.
      </p>
      <button
        onClick={() => router.push("/dashboard")}
        className="group border border-white px-16 py-5 text-xs font-mono uppercase tracking-[4px] text-white hover:text-black transition-all duration-500 relative overflow-hidden"
      >
        <span className="relative z-10">Launch App →</span>
        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <span className="absolute inset-0 flex items-center justify-center text-black text-xs font-mono uppercase tracking-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          Launch App →
        </span>
      </button>
    </main>
  );
}
