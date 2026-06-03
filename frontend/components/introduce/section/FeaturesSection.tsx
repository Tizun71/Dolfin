"use client";

import { FEATURES_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";
import { Bot, Zap, LineChart } from "lucide-react";
import { useMemo } from "react";

// Static icon map - optimized
const ICON_MAP = {
  bot: Bot,
  zap: Zap,
  chart: LineChart,
} as const;

// Memoize delay calculations
const getFeatureDelays = (isVisible: boolean, index: number) => ({
  delay: isVisible ? `${200 + index * 150}ms` : "0ms",
  iconDelay: isVisible ? `${400 + index * 150}ms` : "0ms",
});

export default function FeaturesSection() {
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
          Core Capabilities
        </p>
        <h2 className="text-4xl md:text-5xl font-light uppercase tracking-[0.08em] text-white text-center mb-4 leading-tight">
          Features that Empower
        </h2>
        <p className="text-yellow-100/70 text-base md:text-lg font-light uppercase tracking-[0.03em] text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Leverage cutting-edge AI and DeFi infrastructure to maximize your
          capital efficiency and trading performance.
        </p>
      </div>

      {/* Features Grid with stagger animation */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES_ITEMS.map((feature, index) => {
          const IconComponent = ICON_MAP[feature.icon as keyof typeof ICON_MAP];
          const { delay, iconDelay } = getFeatureDelays(isVisible, index);

          return (
            <div
              key={feature.title}
              className={`group relative flex flex-col gap-6 overflow-hidden rounded-xl border border-[#1a1a1a] p-8 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              } hover:bg-[#0a0a0a] hover:border-yellow-500/30`}
              style={{ transitionDelay: delay }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Icon with scale animation */}
              <div
                className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-[#222] bg-[#0d0d0d] transition-all duration-300 group-hover:border-yellow-500/50 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] ${
                  isVisible ? "scale-100" : "scale-0"
                }`}
                style={{ transitionDelay: iconDelay }}
              >
                <IconComponent
                  className="h-8 w-8 text-yellow-400 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                  strokeWidth={1.5}
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="mb-3 text-xl font-mono uppercase tracking-[2px] text-white group-hover:text-yellow-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-[#888] group-hover:text-[#aaa] transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
