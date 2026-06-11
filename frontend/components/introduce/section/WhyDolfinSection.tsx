"use client";

import { VALUE_PROPOSITION_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";
import { Clock, TrendingUp, Shield } from "lucide-react";

const ICON_MAP = {
  clock: Clock,
  "trending-up": TrendingUp,
  shield: Shield,
} as const;

const getValueDelays = (isVisible: boolean, index: number) => ({
  delay: isVisible ? `${200 + index * 100}ms` : "0ms",
});

export default function WhyDolfinSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section
      id="why-dolfin"
      ref={sectionRef}
      className="relative z-10 px-6 py-24 bg-[#131313]"
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`transition-all duration-700 text-center mb-16 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-yellow-300 text-sm font-mono uppercase tracking-[5px] mb-6">
            The Dolfin Advantage
          </p>
          <h2 className="text-4xl md:text-5xl font-light uppercase tracking-[0.08em] text-white mb-4 leading-tight">
            Why Dolfin?
          </h2>
          <p className="text-yellow-100/70 text-base md:text-lg font-light uppercase tracking-[0.03em] max-w-2xl mx-auto leading-relaxed">
            Smart market predictions. Automated arbitrage. No capital risk.
            Non-custodial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VALUE_PROPOSITION_ITEMS.map((item, index) => {
            const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const { delay } = getValueDelays(isVisible, index);

            return (
              <div
                key={item.title}
                className={`group transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: delay }}
              >
                <div className="flex flex-col h-full p-8 border border-yellow-500/30 bg-linear-to-br from-[#0f0f0f] to-[#0a0a0a] hover:border-yellow-500/60 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent opacity-0 -translate-x-full group-hover:translate-x-full group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center bg-yellow-500/20 group-hover:bg-yellow-500/40 transition-colors duration-300">
                      <IconComponent className="h-6 w-6 text-yellow-400" />
                    </div>
                    <span className="text-lg font-mono font-bold text-yellow-400/60 group-hover:text-yellow-400 transition-colors duration-300">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold uppercase tracking-wider text-white mb-3 group-hover:text-yellow-300 transition-colors duration-300 relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#999] group-hover:text-[#bbb] transition-colors duration-300 grow relative z-10">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
