"use client";

import LogoDolfin from "@/components/shared/LogoDolfin";
import Link from "next/link";
import NavActions from "./NavActions";
import { useNavScroll } from "./hooks/useNavScroll";
import { NAV_ITEMS } from "./constants";

export default function Navbar() {
  const { scrolled, scrollToTop, scrollToSection } = useNavScroll();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-8 pt-5 pointer-events-none">
      <header
        className={`pointer-events-auto w-full max-w-7xl flex items-center justify-between px-8 py-4 rounded-2xl border transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-[#222] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            : "bg-[#0d0d0d]/70 backdrop-blur-md border-[#1a1a1a] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
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
        </button>

        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (!item.external && item.section) {
                  e.preventDefault();
                  try {
                    scrollToSection(item.section);
                  } catch (error) {
                    console.warn(`Failed to scroll to section: ${item.section}`, error);
                  }
                }
              }}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="relative text-gray-400 text-[13px] font-mono font-semibold uppercase tracking-tight hover:text-white transition-colors duration-300 group"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gradient-to-r from-yellow-400 to-yellow-500 group-hover:w-full transition-all duration-300 ease-in-out" />
            </Link>
          ))}
        </nav>

        <NavActions />
      </header>
    </div>
  );
}
