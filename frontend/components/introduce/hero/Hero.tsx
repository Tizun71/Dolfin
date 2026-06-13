"use client";

import { useRouter } from "next/navigation";
import { useHeroAnimation } from "./hooks/useHeroAnimation";
import { GLSLHills } from "../../shared/glsl-hill";

export default function Hero() {
  const router = useRouter();
  const { getStyle } = useHeroAnimation();

  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-end text-center px-6 pt-24 pb-16 min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 -top-24 z-0 w-full h-[calc(100%+6rem)] overflow-hidden pointer-events-none touch-none bg-[#0a0a0a]">
        <GLSLHills width="100%" height="100%" cameraZ={125} planeSize={256} speed={0.35} />
      </div>

      {/* Grain + bottom fade to next section — adds depth, hides hard shader edge */}
      <div className="grain-overlay z-[1]" />
      <div className="absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <p
          className="text-yellow-400/80 text-[11px] md:text-xs font-mono font-semibold uppercase tracking-[0.22em] mb-6"
          style={getStyle(100)}
        >
          Policy-Governed AI Portfolio on Arbitrum
        </p>

        <h1
          className="text-6xl md:text-8xl lg:text-9xl font-mono font-semibold uppercase tracking-tight leading-none mb-6 text-brand-gradient transition-transform duration-500 hover:scale-105 cursor-default"
          style={getStyle(200)}
        >
          Dolfin
        </h1>

        <div className="w-20 h-px bg-yellow-500/40 mb-8" style={getStyle(400)} />

        <p
          className="text-neutral-200 text-lg md:text-2xl font-mono max-w-2xl mb-12 leading-snug text-pretty"
          style={getStyle(600)}
        >
          Autonomous yield optimization that trades only inside the on-chain
          rules you set.
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
            Launch App
          </button>
        </div>
      </div>
    </main>
  );
}
