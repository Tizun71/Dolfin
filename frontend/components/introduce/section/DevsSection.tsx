"use client";

import { ITEMS_DEVS } from "@/constants/common";
import Link from "next/link";
import Noise from "@/components/shared/Noise";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function DevsSection() {
  const { ref, getStyle } = useScrollAnimation();

  return (
    <section
      ref={ref}
      id="devs"
      className="relative z-10 px-0 py-24 border-t border-[#222] overflow-hidden"
    >
      <Noise patternAlpha={20} patternRefreshInterval={3} />
      <div className="devs-glow" />

      <div className="relative z-10">
        <p
          className="text-[#517ab3] text-xs font-mono uppercase tracking-[6px] mb-6 text-center"
          style={getStyle(0)}
        >
          Developers & Security
        </p>
        <h2
          className="text-6xl font-light uppercase tracking-widest text-white text-center mb-4"
          style={getStyle(200)}
        >
          Build on Dolfin
        </h2>
        <p
          className="text-[#888] text-sm font-mono text-center max-w-xl mx-auto mb-16 leading-relaxed"
          style={getStyle(400)}
        >
          Dolfin provides the intelligence layer which empowers developers to
          build the financial apps of tomorrow.
        </p>

        <div className="flex flex-col">
          {ITEMS_DEVS.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              style={getStyle(600 + i * 150)}
              className="flex items-center gap-8 border-t border-[#222] px-12 py-5 relative overflow-hidden transition-all duration-300 group hover:bg-[#0a0f1a] last:border-b last:border-b-[#222]"
            >
              <div className="absolute left-0 top-0 h-full w-0.5 bg-[#517ab3] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <span className="text-[#2a3a4a] text-5xl font-light font-mono group-hover:text-[#517ab3] transition-colors duration-500 w-16 shrink-0 select-none">
                {item.index}
              </span>
              <div className="flex-1">
                <p className="text-[#ddd] text-sm font-mono uppercase tracking-[3px] mb-1.5 group-hover:text-white transition-colors duration-300">
                  {item.title}
                </p>
                <p className="text-[#777] text-xs font-mono leading-relaxed group-hover:text-[#aaa] transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
              <span className="text-[#333] text-xs font-mono uppercase tracking-[2px] border border-[#2a2a2a] px-3 py-1 group-hover:border-[#517ab3] group-hover:text-[#517ab3] transition-all duration-300 shrink-0">
                {item.tag}
              </span>
              <span className="text-[#444] text-sm font-mono group-hover:text-white group-hover:translate-x-1 transition-all duration-300 ml-2 shrink-0">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
