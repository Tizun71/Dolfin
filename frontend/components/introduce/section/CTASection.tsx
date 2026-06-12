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

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition disabled:opacity-50"
          >
            Go to app
          </button>
        </div>
      </div>
    </section>
  );
}
