"use client";

import { useRouter } from "next/navigation";
import HeroButton from "./HeroButton";
import { useHeroAnimation } from "./hooks/useHeroAnimation";
import { useShaderBackground } from "../../shared/animated-shader-hero";

export default function Hero() {
  const router = useRouter();
  const { getStyle } = useHeroAnimation();
  const canvasRef = useShaderBackground();

  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center text-center p-8 pt-32 min-h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none touch-none"
        style={{ background: "black" }}
      />

      {/* Left side tagline */}
      <div
        className="absolute left-6 md:left-12 top-1/3 md:top-2/5 z-20 text-left"
        style={getStyle(100)}
      >
        <p className="text-yellow-300 text-xs md:text-sm font-mono uppercase tracking-[3px] md:tracking-[5px] leading-relaxed opacity-80 hover:opacity-100 transition-opacity duration-300">
          AI-Powered<br />
          DeFi<br />
          Intelligence
        </p>
      </div>

      {/* Right side tagline */}
      <div
        className="absolute right-6 md:right-12 top-1/3 md:top-2/5 z-20 text-right"
        style={getStyle(150)}
      >
        <p className="text-yellow-100/70 text-xs md:text-sm font-mono uppercase tracking-[3px] md:tracking-[5px] leading-relaxed opacity-80 hover:opacity-100 transition-opacity duration-300">
          Autonomous<br />
          Yield<br />
          Optimization
        </p>
      </div>

      {/* Bottom section - Main content */}
      <div className="relative z-10 flex flex-col items-center mt-auto mb-12">
        <h1
          className="text-6xl md:text-8xl lg:text-9xl font-light uppercase tracking-[0.08em] leading-none mb-6 bg-linear-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent"
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
