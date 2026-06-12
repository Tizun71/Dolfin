"use client";

import { useState } from "react";
import LogoDolfin from "@/components/shared/LogoDolfin";
import Link from "next/link";
import { Menu, X } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
import NavActions from "./NavActions";
import { useNavScroll } from "./hooks/useNavScroll";
import { NAV_ITEMS } from "./constants";

export default function Navbar() {
  const { scrolled, scrollToTop, scrollToSection } = useNavScroll();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent,
    item: (typeof NAV_ITEMS)[number],
  ) => {
    if (!item.external && item.section) {
      e.preventDefault();
      try {
        scrollToSection(item.section);
      } catch (error) {
        console.warn(`Failed to scroll to section: ${item.section}`, error);
      }
    }
    setMobileOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 sm:px-6 pt-4 pointer-events-none">
      <header
        className={`pointer-events-auto w-full max-w-[1600px] flex items-center justify-between px-6 sm:px-8 py-2.5 rounded-xl border transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-yellow-500/20 shadow-[0_8px_32px_rgba(251,191,36,0.07)]"
            : "bg-black/40 backdrop-blur-md border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <LogoDolfin />
          <span className="text-brand-gradient text-xl font-mono font-semibold uppercase tracking-tight transition-colors duration-300">
            Dolfin
          </span>
          <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-yellow-400 leading-none">
            Beta
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="relative inline-flex items-center gap-1.5 text-gray-400 text-[13px] font-mono font-semibold uppercase tracking-tight hover:text-white transition-colors duration-300 group"
            >
              {item.external && <GithubIcon className="w-4 h-4" />}
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-yellow-400 to-yellow-500 group-hover:w-full transition-all duration-300 ease-in-out" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <NavActions />
        </div>

        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="md:hidden pointer-events-auto w-full max-w-[1600px] mt-2 rounded-xl border border-yellow-500/20 bg-black/90 backdrop-blur-xl p-6 flex flex-col gap-4 shadow-[0_8px_32px_rgba(251,191,36,0.07)]">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-gray-300 text-sm font-mono font-semibold uppercase tracking-tight hover:text-yellow-400 transition-colors duration-300"
            >
              {item.external && <GithubIcon className="w-4 h-4" />}
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#222]">
            <NavActions />
          </div>
        </div>
      )}
    </div>
  );
}
