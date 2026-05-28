"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { name: "GITHUB", href: "#" },
  { name: "DISCORD", href: "#" },
  { name: "SECURITY", href: "#" },
  { name: "STATUS", href: "#" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1a1a1a] bg-[#0e0e0e] relative z-20">
      <div className="px-6 py-8 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold text-white uppercase tracking-[0.2em]">
            DOLFIN
          </span>
          <span className="text-xs text-[#999] tracking-[0.15em] font-mono">
            © 2026 DOLFIN PROTOCOL. TERMINAL v1.0.4 — LATENCY: 24MS
          </span>
        </div>

        <div className="flex gap-8">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[#999] hover:text-white text-xs uppercase tracking-[0.2em] no-underline transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
