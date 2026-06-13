"use client";

import { useRouter } from "next/navigation";
import { SUPPORT_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

const GITHUB_URL = SUPPORT_ITEMS[0].href;

export default function CTASection() {
  const router = useRouter();
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-32 bg-[#0d0d0d] overflow-hidden"
    >
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_60%)]" />
      {/* Grain texture for depth */}
      <div className="grain-overlay" />

      <div
        className={`relative z-10 max-w-3xl mx-auto px-6 text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <p className="text-yellow-300 text-sm font-mono font-semibold uppercase tracking-tight mb-4">
          Join with Us
        </p>
        <h2 className="text-5xl md:text-6xl font-mono font-semibold uppercase tracking-tight text-brand-gradient mb-6">
          Easy DeFi with Dolfin
        </h2>

        <p className="text-neutral-300 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed text-pretty">
          Set your rules once. The agent scans markets, scores risk, and trades
          only inside the on-chain limits you control. Your keys, your capital.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition disabled:opacity-50"
          >
            Launch App
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[2px] font-mono text-neutral-400 hover:text-yellow-400 transition-colors duration-300 underline-offset-4 hover:underline"
          >
            Read the docs →
          </a>
        </div>
      </div>
    </section>
  );
}
