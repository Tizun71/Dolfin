"use client";

import { HOW_IT_WORKS_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";
import { useMemo } from "react";
import { Lock, Cpu, Wallet, TrendingUp } from "lucide-react";

// Static icon map - no need to memoize
const ICON_MAP = {
  lock: Lock,
  cpu: Cpu,
  wallet: Wallet,
  "trending-up": TrendingUp,
} as const;

// Memoize delay calculations outside
const getStepDelays = (isVisible: boolean, index: number) => ({
  cardDelay: isVisible ? `${200 + index * 150}ms` : "0ms",
  iconDelay: isVisible ? `${400 + index * 150}ms` : "0ms",
});

export default function HowItWorksSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section
      ref={sectionRef}
      className="relative z-10 px-6 py-24 border-t border-[#111]"
    >
      {/* Header with fade-in animation */}
      <div
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <p className="text-yellow-300 text-sm font-mono uppercase tracking-[5px] mb-6 text-center">
          Getting Started
        </p>
        <h2 className="text-4xl md:text-5xl font-light uppercase tracking-[0.08em] text-white text-center mb-4 leading-tight">
          How It Works
        </h2>
        <p className="text-yellow-100/70 text-base md:text-lg font-light uppercase tracking-[0.03em] text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Get your AI agent up and running in just 4 simple steps. From authentication
          to autonomous trading, Dolfin makes it seamless.
        </p>
      </div>

      {/* Timeline with vertical line */}
      <div className="max-w-3xl mx-auto relative">
        {/* Vertical connecting line */}
        <div
          className={`absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-500/0 via-yellow-500/30 to-yellow-500/0 transition-opacity duration-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: "translateX(-50%)" }}
        />

        {/* Steps */}
        <div className="space-y-12 md:space-y-16">
          {HOW_IT_WORKS_ITEMS.map((item, index) => {
            const IconComponent =
              ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const { cardDelay, iconDelay } = getStepDelays(isVisible, index);

            return (
              <div
                key={item.number}
                className={`group relative flex gap-6 md:gap-12 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: cardDelay }}
              >
                {/* Icon Circle (Left side) */}
                <div
                  className={`relative flex-shrink-0 w-16 h-16 rounded-full bg-[#0d0d0d] border-2 border-[#222] flex items-center justify-center transition-all duration-300 group-hover:border-yellow-500/50 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] ${
                    isVisible ? "scale-100" : "scale-0"
                  }`}
                  style={{ transitionDelay: iconDelay }}
                >
                  <IconComponent className="w-8 h-8 text-yellow-400 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                </div>

                {/* Content Card (Right side) */}
                <div className="flex-1 flex flex-col justify-center pb-4">
                  <div className="relative overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0d0d0d]/50 p-6 md:p-8 transition-all duration-300 group-hover:bg-[#0a0a0a] group-hover:border-yellow-500/30">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Number Badge */}
                    <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold font-mono text-black">
                      {item.number}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 pt-2">
                      <h3 className="mb-3 text-xl font-mono uppercase tracking-[2px] text-white group-hover:text-yellow-400 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-sm font-light leading-relaxed text-[#888] group-hover:text-[#aaa] transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
