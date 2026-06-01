"use client";

import { useRouter } from "next/navigation";
import FloatingLines from "../../shared/FloatingLines";
import HeroButton from "./HeroButton";
import { useHeroAnimation } from "./hooks/useHeroAnimation";

export default function Hero() {
  const router = useRouter();
  const { getStyle } = useHeroAnimation();

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 pt-32 min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-0 overflow-hidden mix-blend-screen opacity-75">
        <FloatingLines
          linesGradient={["#f97316", "#000000", "#fbbf24"]}
          animationSpeed={1}
          interactive
          bendRadius={8}
          bendStrength={-2}
          mouseDamping={0.05}
          parallax
          parallaxStrength={0.2}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p
          className="text-[#bbb] text-xs font-mono uppercase tracking-[5px] mb-8"
          style={getStyle(0)}
        >
          AI-Powered DeFi Intelligence
        </p>

        <h1
          className="hero-title text-brand-gradient text-[10rem] font-light uppercase tracking-[0.15em] leading-none mb-8 hover:scale-110 transition-transform duration-300"
          style={getStyle(200)}
        >
          Dolfin
        </h1>

        <div className="w-24 h-px bg-[#333] mb-8" style={getStyle(400)} />

        <p
          className="text-[#bbb] text-base font-mono uppercase tracking-[3px] max-w-xl mb-16 leading-relaxed"
          style={getStyle(600)}
        >
          Autonomous yield optimization across every chain. Powered by AI.
        </p>

        <HeroButton
          onClick={() => router.push("/dashboard")}
          style={getStyle(800)}
        />
      </div>
    </main>
  );
}
