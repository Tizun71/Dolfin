"use client";

import { SUPPORT_ITEMS } from "@/constants/common";
import Link from "next/link";
import Image from "next/image";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

export default function SupportSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section
      ref={sectionRef}
      className="relative z-10 px-6 py-24 border-t border-[#111]"
    >
      {/* Header with fade-in animation */}
      <div
        className={`transition-all duration-700 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <p className="text-yellow-300 text-sm font-mono uppercase tracking-[5px] mb-6 text-center">
          Open Source & Network
        </p>
        <h2 className="text-4xl md:text-5xl font-light uppercase tracking-[0.08em] text-white text-center mb-4 leading-tight">
          Built in the Open
        </h2>
        <p className="text-yellow-100/70 text-base md:text-lg font-light uppercase tracking-[0.03em] text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Dolfin is open-source and deployed on Arbitrum, bringing transparency
          and security to DeFi automation.
        </p>
      </div>

      {/* Cards with stagger animation */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUPPORT_ITEMS.map((item, index) => (
          <Link
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center gap-6 border border-[#1a1a1a] rounded-xl px-8 py-10 relative overflow-hidden transition-all duration-500 group hover:bg-[#0a0a0a] hover:border-yellow-500/30 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
            style={{
              transitionDelay: isVisible ? `${200 + index * 150}ms` : "0ms",
            }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:via-yellow-500/0 group-hover:to-yellow-500/5 transition-all duration-500" />

            {/* Logo with scale animation */}
            <div
              className={`relative w-20 h-20 flex items-center justify-center rounded-2xl bg-[#0d0d0d] border border-[#222] group-hover:border-yellow-500/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] ${
                isVisible ? "scale-100" : "scale-0"
              }`}
              style={{
                transitionDelay: isVisible ? `${400 + index * 150}ms` : "0ms",
              }}
            >
              <Image
                src={item.logo}
                alt={`${item.name} logo`}
                width={48}
                height={48}
                className={`opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${
                  item.name === "GitHub" ? "invert" : ""
                }`}
              />
            </div>

            {/* Content */}
            <div className="text-center relative z-10">
              <h3 className="text-xl font-mono uppercase tracking-[3px] mb-2 text-white group-hover:text-yellow-400 transition-colors duration-300">
                {item.name}
              </h3>
              <p className="text-[#666] text-xs font-mono leading-relaxed group-hover:text-[#888] transition-colors duration-300">
                {item.description}
              </p>
            </div>

            {/* Arrow indicator */}
            <span className="text-[#444] text-sm font-mono group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
