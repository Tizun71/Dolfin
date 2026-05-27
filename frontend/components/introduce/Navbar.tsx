"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoDolfin from "@/components/shared/LogoDolfin";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-8 pt-5 pointer-events-none">
      <header
        className={`pointer-events-auto w-full max-w-7xl flex items-center justify-between px-8 py-4 rounded-2xl border transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-[#222] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            : "bg-[#0d0d0d]/70 backdrop-blur-md border-[#1a1a1a] shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Logo */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <LogoDolfin />

          <span className="text-white text-xl font-semibold uppercase tracking-[4px] group-hover:tracking-[6px] transition-all duration-300 ease-in-out">
            Dolfin
          </span>
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-10">
          <Link
            href="#devs"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("devs")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-[#666] text-sm font-mono uppercase tracking-[4px] hover:text-white transition-colors duration-300"
          >
            Devs
          </Link>

          <Link
            href="#"
            className="text-[#666] text-sm font-mono uppercase tracking-[4px] hover:text-white transition-colors duration-300"
          >
            Docs
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[#888] text-xs font-mono uppercase tracking-[2px]">
              System Active
            </span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-black text-xs font-mono uppercase tracking-[3px] px-6 py-2.5 rounded-xl hover:bg-[#e0e0e0] transition-all duration-300"
          >
            Launch App
          </button>
        </div>
      </header>
    </div>
  );
}
