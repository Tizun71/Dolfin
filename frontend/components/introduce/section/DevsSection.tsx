"use client";

import { ITEMS_DEVS } from "@/constants/common";
import Link from "next/link";

export default function DevsSection() {
  return (
    <section
      id="devs"
      className="relative z-10 px-6 py-32 border-t border-[#111]"
    >
      <p className="text-[#bbb] text-xm font-mono uppercase tracking-[6px] mb-6 text-center">
        Developers & Security
      </p>
      <h2 className="text-5xl font-light uppercase tracking-widest text-white text-center mb-4">
        Build on Dolfin
      </h2>
      <p className="text-[#999] text-sm font-mono text-center max-w-xl mx-auto mb-16 leading-relaxed">
        Dolfin provides the intelligence layer which empowers developers to
        build the financial apps of tomorrow.
      </p>

      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {ITEMS_DEVS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center gap-6 border border-[#222] p-8 hover:border-[#333] transition-all duration-300 group"
          >
            <span className="text-2xl w-10 text-center">{item.icon}</span>
            <div className="flex-1">
              <p className="text-white text-base font-mono uppercase tracking-[2px] mb-2">
                {item.title}
              </p>
              <p className="text-[#888] text-xs font-mono leading-relaxed">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
