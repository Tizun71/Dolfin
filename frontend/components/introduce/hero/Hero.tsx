"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeroButton from "./HeroButton";
import { useHeroAnimation } from "./hooks/useHeroAnimation";
import { useShaderBackground } from "../../shared/animated-shader-hero";

export default function Hero() {
  const router = useRouter();
  const { getStyle } = useHeroAnimation();
  const canvasRef = useShaderBackground();

  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center text-center p-8 pt-32 min-h-screen">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none touch-none"
        style={{ background: "black" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <p
          className="text-yellow-300 text-xs font-mono uppercase tracking-[5px] mb-6"
          style={getStyle(0)}
        >
          AI-Powered DeFi Intelligence
        </p>

        <h1
          className="text-7xl md:text-8xl lg:text-9xl font-light uppercase tracking-[0.08em] leading-none mb-6 bg-linear-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent"
          style={getStyle(200)}
        >
          Dolfin
        </h1>

        <div
          className="w-20 h-px bg-yellow-500/40 mb-8"
          style={getStyle(400)}
        />

        <p
          className="text-yellow-100/80 text-base md:text-lg font-light uppercase tracking-[0.03em] max-w-2xl mb-12 leading-relaxed"
          style={getStyle(600)}
        >
          Autonomous Yield Optimization Across Every Chain. Powered by AI.
        </p>

        <HeroButton
          onClick={() => router.push("/dashboard")}
          style={getStyle(800)}
        />
      </div>
    </main>
  );
}
