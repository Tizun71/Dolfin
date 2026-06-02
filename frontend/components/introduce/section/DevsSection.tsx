import { ITEMS_DEVS } from "@/constants/common";
import Link from "next/link";

export default function DevsSection() {
  return (
    <section
      id="devs"
      className="relative z-10 px-6 py-24 border-t border-[#111]"
    >
      <p className="text-[#555] text-xs font-mono uppercase tracking-[6px] mb-4 text-center">
        Developers & Security
      </p>
      <h2 className="text-3xl font-light uppercase tracking-widest text-white text-center mb-3">
        Build on Dolfin
      </h2>
      <p className="text-[#666] text-xs font-mono text-center max-w-lg mx-auto mb-12 leading-relaxed">
        Dolfin provides the intelligence layer which empowers developers to
        build the financial apps of tomorrow.
      </p>

      <div className="max-w-3xl mx-auto flex flex-col">
        {ITEMS_DEVS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center gap-6 border-t border-[#1a1a1a] px-6 py-5 relative overflow-hidden transition-all duration-300 group hover:bg-[#0a0a0a] last:border-b"
          >
            <div className="absolute left-0 top-0 h-full w-0.5 bg-[#f97316] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
            <span className="text-[#444] text-xs font-mono group-hover:text-[#f97316] transition-colors duration-300 w-5 shrink-0">
              {item.index}
            </span>
            <div className="flex-1">
              <p className="text-[#ccc] text-sm font-mono uppercase tracking-[2px] mb-1 group-hover:text-white transition-colors duration-300">
                {item.title}
              </p>
              <p className="text-[#555] text-xs font-mono leading-relaxed group-hover:text-[#888] transition-colors duration-300">
                {item.desc}
              </p>
            </div>
            <span className="text-[#444] text-xs font-mono group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
