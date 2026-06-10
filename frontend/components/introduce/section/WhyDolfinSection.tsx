"use client";

import { VALUE_PROPOSITION_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";
import { ParticleNetworkBackground } from "@/components/shared/particle-network-background";
import { GradientMeshBackground } from "@/components/shared/gradient-mesh-background";
import { Clock, TrendingUp, Shield } from "lucide-react";

const ICON_MAP = {
  clock: Clock,
  "trending-up": TrendingUp,
  shield: Shield,
} as const;

const getValueDelays = (isVisible: boolean, index: number) => ({
  delay: isVisible ? `${200 + index * 150}ms` : "0ms",
});

export default function WhyDolfinSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section
      id="why-dolfin"
      ref={sectionRef}
      className="relative z-10 px-6 py-24 border-t border-[#111] overflow-hidden"
    >
      <GradientMeshBackground variant="mesh">
        <ParticleNetworkBackground
          particleCount={60}
          particleColor="rgba(250, 204, 21, 0.8)"
          lineColor="rgba(250, 204, 21, 0.15)"
          maxDistance={120}
        >
        {/* Header with fade-in animation */}
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-yellow-300 text-sm font-mono uppercase tracking-[5px] mb-6 text-center">
            The Dolfin Advantage
          </p>
          <h2 className="text-4xl md:text-5xl font-light uppercase tracking-[0.08em] text-white text-center mb-4 leading-tight">
            Why Dolfin?
          </h2>
          <p className="text-yellow-100/70 text-base md:text-lg font-light uppercase tracking-[0.03em] text-center max-w-2xl mx-auto mb-16 leading-relaxed">
            The most advanced AI-powered DeFi automation platform. Built for
            traders who demand efficiency, security, and control.
          </p>
        </div>

        {/* Value Cards Grid with stagger animation */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUE_PROPOSITION_ITEMS.map((item, index) => {
            const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const { delay } = getValueDelays(isVisible, index);

            return (
              <div
                key={item.title}
                className={`group relative transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: delay }}
              >
                {/* Enhanced Glassmorphism card with animations */}
                <div className="relative h-full overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#0d0d0d]/80 via-[#0a0a0a]/60 to-black/80 p-6 backdrop-blur-xl transition-all duration-500 group-hover:border-yellow-500/60 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] group-hover:scale-[1.02] animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                  {/* Enhanced Glow effect with pulse */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-pulse-glow" />
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer" />

                  {/* Number badge */}
                  <div className="absolute -top-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-sm font-bold font-mono text-black shadow-lg">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col gap-4">
                    {/* Icon with enhanced effects */}
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/10 transition-all duration-500 group-hover:from-yellow-500/50 group-hover:to-amber-600/30 group-hover:rotate-6 group-hover:scale-110">
                      <IconComponent className="h-7 w-7 text-yellow-400 transition-all duration-300 group-hover:text-yellow-300 group-hover:drop-shadow-[0_0_12px_rgba(250,204,21,1)]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-mono uppercase tracking-[2px] text-white group-hover:text-yellow-300 transition-colors duration-300">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm font-light leading-relaxed text-[#aaa] group-hover:text-yellow-100/80 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>

                  {/* Border glow on hover */}
                  <div className="absolute inset-0 rounded-2xl border border-yellow-400/0 transition-all duration-300 group-hover:border-yellow-400/30 pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
        </ParticleNetworkBackground>
      </GradientMeshBackground>
    </section>
  );
}
