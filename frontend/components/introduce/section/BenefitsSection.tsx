"use client";

import { Check } from "lucide-react";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

const BENEFITS = [
  { title: "Open-Source Code", description: "Verify on GitHub" },
  { title: "Non-Custodial", description: "You control funds" },
  { title: "Built on Arbitrum", description: "Fast & secure" },
];

export default function BenefitsSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section ref={sectionRef} className="relative z-10 px-6 py-8 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {BENEFITS.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-start justify-center gap-3 transition-all duration-500 text-center ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : "0ms" }}
            >
              <Check className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-[#888]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
