"use client";

import { SUPPORT_ITEMS } from "@/constants/common";
import Link from "next/link";
import Image from "next/image";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

const getSupportDelays = (isVisible: boolean, index: number) => ({
  cardDelay: isVisible ? `${200 + index * 150}ms` : "0ms",
  logoDelay: isVisible ? `${400 + index * 150}ms` : "0ms",
});

export default function SupportSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section
      id="resources"
      ref={sectionRef}
      className="relative z-10 px-6 py-24 bg-[#0f0f0f] border-y border-yellow-500/5"
    >
      <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <p className="text-yellow-300 text-sm font-mono uppercase tracking-[5px] mb-6 text-center">
          Open Source & Network
        </p>
        <h2 className="text-4xl md:text-5xl font-light uppercase tracking-[0.08em] text-white text-center mb-4 leading-tight">
          Built in the Open
        </h2>
        <p className="text-yellow-100/70 text-base md:text-lg font-light uppercase tracking-[0.03em] text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Open-source code. Arbitrum network. No black boxes. Verify everything.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUPPORT_ITEMS.map((item, index) => {
          const { cardDelay, logoDelay } = getSupportDelays(isVisible, index);

          return (
            <Link
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col items-center gap-6 overflow-hidden rounded-xl border border-[#1a1a1a] px-8 py-10 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} hover:bg-[#0a0a0a] hover:border-yellow-500/30`}
              style={{ transitionDelay: cardDelay }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className={`relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-[#222] bg-[#0d0d0d] transition-all duration-300 group-hover:border-yellow-500/50 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] ${isVisible ? "scale-100" : "scale-0"}`} style={{ transitionDelay: logoDelay }}>
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  width={48}
                  height={48}
                  className={`transition-opacity duration-300 opacity-80 group-hover:opacity-100 ${item.name === "GitHub" ? "invert" : ""}`}
                />
              </div>
              <div className="relative z-10 text-center">
                <h3 className="mb-2 text-xl font-mono uppercase tracking-[3px] text-white group-hover:text-yellow-400 transition-colors duration-300">
                  {item.name}
                </h3>
                <p className="text-sm font-mono leading-relaxed text-[#777] group-hover:text-[#999] transition-colors duration-300">
                  {item.description}
                </p>
              </div>
              <span className="text-base font-mono text-[#555] transition-all duration-300 group-hover:translate-x-1 group-hover:text-yellow-400">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
