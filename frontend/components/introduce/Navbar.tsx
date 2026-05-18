"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
          <svg
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:rotate-12"
          >
            <path
              d="M4 20C4 20 6 10 14 8C18 7 22 9 24 6"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M7 24C7 24 10 16 17 14C21 13 24 14 26 12"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
            />
            <circle cx="24" cy="6" r="2" fill="white" />
          </svg>

          <span className="text-white text-base font-normal uppercase tracking-[5px] group-hover:tracking-[7px] transition-all duration-300">
            Dolfin
          </span>
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-10">
          <a
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
          </a>
          <a
            href="#"
            className="text-[#666] text-sm font-mono uppercase tracking-[4px] hover:text-white transition-colors duration-300"
          >
            Docs
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[#555] text-xs font-mono uppercase tracking-[2px]">
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
