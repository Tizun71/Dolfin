import Link from "next/link";
import { FOOTER_LINKS } from "./constants";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1a1a1a] bg-[#0e0e0e] relative z-20">
      <div className="px-6 py-8 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold text-white uppercase tracking-[0.2em]">
            Dolfin
          </span>
          <span className="text-xs text-[#999] tracking-[0.15em] font-mono">
            © 2026 Dolfin Protocol. Terminal v1.0.4 — Latency: 24ms
          </span>
        </div>

        <div className="flex gap-8">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative text-[#999] hover:text-white text-xs uppercase tracking-[0.2em] no-underline transition-colors duration-200 group"
            >
              {link.name}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300 ease-in-out" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
