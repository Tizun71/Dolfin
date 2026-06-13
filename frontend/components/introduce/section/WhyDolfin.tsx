"use client";

import type { LucideIcon } from "lucide-react";
import { Cpu, ShieldCheck, Activity, KeyRound } from "lucide-react";
import { useSectionAnimation } from "./hooks/useSectionAnimation";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";

type Accent = "gold" | "green";

type Module = {
  index: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  desc: string;
  metaLeft: string;
  metaRight: string;
  accent: Accent;
  bg: string;
};

const MODULES: Module[] = [
  {
    index: "01",
    icon: Cpu,
    eyebrow: "Module 01 • Strategy Engine",
    title: "AI Engine",
    desc: "A multi-step agent scans funding rates, scores the market, and plans allocations. All in one flow.",
    metaLeft: "Sources: Aave + GMX",
    metaRight: "Core",
    accent: "gold",
    bg: "from-[#121212] to-[#0a0a0a]",
  },
  {
    index: "02",
    icon: ShieldCheck,
    eyebrow: "Module 02 • On-Chain Policy",
    title: "You Set The Rules",
    desc: "Every defi action is checked against your on-chain policy: max trade size, daily loss, exposure, and leverage caps. No limits, no action.",
    metaLeft: "Enforced: Every Tx",
    metaRight: "On-Chain",
    accent: "gold",
    bg: "from-[#0f0f0f] to-[#080808]",
  },
  {
    index: "03",
    icon: Activity,
    eyebrow: "Module 03 • Risk Engine",
    title: "Risk-Scored Execution",
    desc: "Health factor, leverage, and drawdown are scored LOW to CRITICAL before any move. Risky actions are blocked, not gambled.",
    metaLeft: "Score: LOW → CRITICAL",
    metaRight: "Pre-Trade",
    accent: "gold",
    bg: "from-[#121212] to-[#0a0a0a]",
  },
  {
    index: "04",
    icon: KeyRound,
    eyebrow: "Module 04 • Non-Custodial",
    title: "Session Keys, Not Custody",
    desc: "The agent acts through a scoped session key on your ERC-4337 smart account. A guardian kill-switch can pause everything. Revoke anytime.",
    metaLeft: "Custody: You Only",
    metaRight: "ERC-4337",
    accent: "gold",
    bg: "from-[#0f0f0f] to-[#080808]",
  },
];

const ACCENT_BADGE: Record<Accent, string> = {
  gold: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  green: "border-green-400/30 bg-green-400/10 text-green-400",
};

function ModuleCard({ m }: { m: Module }) {
  const Icon = m.icon;
  return (
    <ScrollStackItem
      itemClassName={`bg-gradient-to-br ${m.bg} border border-yellow-500/15 rounded-2xl flex flex-col justify-between py-7 px-8 relative overflow-hidden group transition-colors duration-500 hover:border-yellow-500/40`}
    >
      {/* Top accent line */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
      {/* Hover radial glow */}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_60%)]" />

      {/* Big background icon */}
      <Icon
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-12 -right-10 h-72 w-72 text-yellow-500/[0.05] transition-all duration-500 group-hover:text-yellow-500/[0.08] group-hover:-rotate-6"
      />

      <div className="relative z-10 flex flex-col gap-3">
        <h3 className="mt-1 font-mono text-xl font-semibold uppercase tracking-tight text-white sm:text-2xl">
          {m.title}
        </h3>
        <p className="max-w-xl text-base leading-relaxed text-neutral-300">
          {m.desc}
        </p>
      </div>

      <div className="relative z-10 mt-4 flex items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider ${ACCENT_BADGE[m.accent]}`}
        >
          {m.metaRight}
        </span>
      </div>
    </ScrollStackItem>
  );
}

export default function WhySection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  const reveal = isVisible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-8";

  return (
    <section
      id="why-dolfin"
      ref={sectionRef}
      className="relative z-10 px-6 py-24 bg-[#0d0d0d]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-700 ${reveal}`}>
          <h2 className="text-5xl mb-6 uppercase tracking-tight font-mono font-semibold text-brand-gradient">
            Why Dolfin?
          </h2>
        </div>

        {/* Scroll Stack */}
        <div
          className={`transition-all duration-700 ${reveal}`}
          style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
        >

          <ScrollStack
            itemDistance={100}
            itemScale={0.035}
            itemStackDistance={32}
            stackPosition="20%"
            scaleEndPosition="10%"
            baseScale={0.86}
            rotationAmount={-1.5}
            blurAmount={1.2}
          >
            {MODULES.map((m) => (
              <ModuleCard key={m.index} m={m} />
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}
