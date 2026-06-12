"use client";

import { useRouter } from "next/navigation";
import { useHeroAnimation } from "./hooks/useHeroAnimation";
import { GLSLHills } from "../../shared/glsl-hill";

export default function Hero() {
  const router = useRouter();
  const { getStyle } = useHeroAnimation();

  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center text-center p-8 pt-20 min-h-screen overflow-hidden">
      <div className="absolute inset-0 -top-24 z-0 w-full h-[calc(100%+6rem)] overflow-hidden pointer-events-none touch-none bg-black">
        <GLSLHills width="100%" height="100%" cameraZ={125} planeSize={256} speed={0.35} />
      </div>

      <div className="absolute left-6 md:left-12 top-1/3 md:top-2/5 z-20 text-left" style={getStyle(100)}>
        <p className="text-yellow-400 text-xs md:text-sm font-mono font-semibold uppercase tracking-tight leading-relaxed opacity-80 hover:opacity-100 transition-opacity duration-300">
          Policy-Governed<br />
          AI<br />
          Portfolio
        </p>
      </div>

      <div className="absolute right-6 md:right-12 top-1/3 md:top-2/5 z-20 text-right" style={getStyle(150)}>
        <p className="text-yellow-300/70 text-xs md:text-sm font-mono font-semibold uppercase tracking-tight leading-relaxed opacity-80 hover:opacity-100 transition-opacity duration-300">
          Autonomous<br />
          Yield<br />
          Optimization
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center mt-auto mb-12">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-mono font-semibold uppercase tracking-tight leading-none mb-6 text-brand-gradient transition-transform duration-500 hover:scale-110 cursor-default" style={getStyle(200)}>
          Dolfin
        </h1>

        <div className="w-20 h-px bg-yellow-500/40 mb-8" style={getStyle(400)} />

        <p className="text-yellow-200/80 text-base md:text-lg font-mono font-semibold uppercase tracking-tight max-w-2xl mb-12 leading-relaxed" style={getStyle(600)}>
          Your Agent | Your Rules | Your Profit
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={async () => {
              try {
                await router.push("/dashboard");
              } catch (error) {
                console.error("Navigation failed:", error);
              }
            }}
            style={getStyle(800)}
            className="px-6 py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition disabled:opacity-50"
          >
            Get Started
          </button>
        </div>
      </div>
    </main>
  );
}
