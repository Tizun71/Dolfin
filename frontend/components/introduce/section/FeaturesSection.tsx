"use client";

import { Check, X } from "lucide-react";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

type Row = {
  aspect: string;
  typical: string;
  dolfin: string;
};

const ROWS: Row[] = [
  {
    aspect: "Custody",
    typical: "Bot holds your funds",
    dolfin: "Non-custodial — scoped session key",
  },
  {
    aspect: "Risk Limits",
    typical: "None, or off-chain promises",
    dolfin: "Enforced on-chain, every tx",
  },
  {
    aspect: "Strategy",
    typical: "Black box you can't inspect",
    dolfin: "Readable agent pipeline",
  },
  {
    aspect: "On Failure",
    typical: "Your funds are exposed",
    dolfin: "Reverts + guardian kill-switch",
  },
  {
    aspect: "Your Capital",
    typical: "Deposited to their platform",
    dolfin: "Stays in your smart account",
  },
  {
    aspect: "Protocols",
    typical: "Closed or CEX-only",
    dolfin: "Aave on Arbitrum",
  },
];

export default function FeaturesSection() {
  const { isVisible, sectionRef } = useSectionAnimation();
  const reveal = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-8";

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-black">
      <div className="max-w-5xl mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${reveal}`}>
          <h2 className="text-5xl mb-6 uppercase tracking-tight font-mono font-semibold text-brand-gradient">
            What makes us different
          </h2>
          <p className="text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Most AI trading bots take custody and run a black box. Dolfin keeps you in control.
          </p>
        </div>

        {/* Comparison */}
        <div
          className={`overflow-hidden rounded-2xl border border-neutral-800 transition-all duration-700 ${reveal}`}
          style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
        >
          {/* Column headers */}
          <div className="grid grid-cols-1 md:grid-cols-12 bg-neutral-900/40 border-b border-neutral-800">
            <div className="hidden md:block md:col-span-3 px-6 py-4" />
            <div className="md:col-span-4 px-6 py-4 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Typical AI Bot
            </div>
            <div className="md:col-span-5 px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/[0.04] border-l border-yellow-500/30">
              Dolfin
            </div>
          </div>

          {ROWS.map((row) => (
            <div
              key={row.aspect}
              className="grid grid-cols-1 md:grid-cols-12 border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/20 transition-colors duration-300"
            >
              <div className="md:col-span-3 px-6 pt-4 md:py-5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {row.aspect}
              </div>
              <div className="md:col-span-4 px-6 py-3 md:py-5 flex items-start gap-2 text-sm text-neutral-500">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" />
                <span>{row.typical}</span>
              </div>
              <div className="md:col-span-5 px-6 py-3 md:py-5 flex items-start gap-2 text-sm text-neutral-200 bg-yellow-500/[0.04] border-l border-yellow-500/30">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                <span>{row.dolfin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
