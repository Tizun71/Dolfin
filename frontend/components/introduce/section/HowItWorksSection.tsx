"use client";

import { HOW_IT_WORKS_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";
import { AnimatedGridBackground } from "@/components/shared/animated-grid-background";
import { FloatingOrbsBackground } from "@/components/shared/floating-orbs-background";
import { Lock, Cpu, Wallet, TrendingUp } from "lucide-react";

const ICON_MAP = {
  lock: Lock,
  cpu: Cpu,
  wallet: Wallet,
  "trending-up": TrendingUp,
} as const;

const getStepDelays = (isVisible: boolean, index: number) => ({
  delay: isVisible ? `${150 + index * 100}ms` : "0ms",
});

export default function HowItWorksSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative z-10 px-6 py-24 overflow-hidden"
    >
      <FloatingOrbsBackground
        orbCount={4}
        colors={[
          "rgba(250, 204, 21, 0.08)",
          "rgba(251, 191, 36, 0.07)",
        ]}
      >
        <AnimatedGridBackground
          gridColor="rgba(250, 204, 21, 0.05)"
          glowColor="rgba(250, 204, 21, 0.15)"
        >
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="mb-16">
            <p className="text-yellow-300 text-sm font-mono uppercase tracking-[5px] mb-6 text-center">
              Getting Started
            </p>
            <h2 className="text-4xl md:text-5xl font-light uppercase tracking-[0.08em] text-white text-center mb-4 leading-tight">
              How It Works
            </h2>
            <p className="text-yellow-100/70 text-base md:text-lg font-light uppercase tracking-[0.03em] text-center max-w-2xl mx-auto leading-relaxed">
              Get your AI agent up and running in just 4 simple steps. From authentication to autonomous trading, Dolfin makes it seamless.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {HOW_IT_WORKS_ITEMS.map((item, index) => {
              const IconComponent =
                ICON_MAP[item.icon as keyof typeof ICON_MAP];
              const { delay } = getStepDelays(isVisible, index);

              return (
                  <div key={item.number} className={`group relative transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`} style={{ transitionDelay: delay }}>
                  <div className="relative h-full overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#0d0d0d]/80 via-[#0a0a0a]/60 to-black/80 p-6 backdrop-blur-xl transition-all duration-500 group-hover:border-yellow-500/60 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.25)] group-hover:scale-[1.03]">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-amber-500/0 to-orange-500/0 opacity-0 transition-all duration-700 group-hover:from-yellow-500/10 group-hover:via-amber-500/5 group-hover:to-orange-500/10 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent opacity-0 -translate-x-full group-hover:translate-x-full group-hover:opacity-100 transition-all duration-1000" />
                    <div className="absolute -top-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-sm font-bold font-mono text-black shadow-lg shadow-yellow-500/50 group-hover:shadow-yellow-500/80 transition-shadow duration-300">
                      {item.number}
                    </div>
                    {index < HOW_IT_WORKS_ITEMS.length - 1 && (
                      <div className="hidden lg:block absolute top-6 -right-3 w-6 h-0.5 bg-gradient-to-r from-yellow-500/50 to-transparent" />
                    )}
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/10 transition-all duration-500 group-hover:from-yellow-500/50 group-hover:to-amber-600/30 group-hover:rotate-12 group-hover:scale-110">
                        <IconComponent className="h-7 w-7 text-yellow-400 transition-all duration-500 group-hover:text-yellow-300 group-hover:drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
                      </div>
                      <h3 className="text-lg font-mono uppercase tracking-[2px] text-white group-hover:text-yellow-300 transition-all duration-300 group-hover:neon-glow">
                        {item.title}
                      </h3>
                      <p className="text-sm font-light leading-relaxed text-[#aaa] group-hover:text-yellow-100/80 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                    <div className="absolute inset-0 rounded-2xl border border-yellow-400/0 transition-all duration-300 group-hover:border-yellow-400/30 pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </AnimatedGridBackground>
      </FloatingOrbsBackground>
    </section>
  );
}
