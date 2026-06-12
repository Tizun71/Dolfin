"use client";

import { Wallet, Cpu, Database, Bot } from "lucide-react";
import { HOW_IT_WORKS_ITEMS } from "@/constants/common";
import { useScrollSteps } from "./hooks/useScrollSteps";

const STEPS = [
  {
    id: "CONNECT",
    title: "Connect Wallet",
    subtitle: "Authentication",
    icon: Wallet,
    detail: HOW_IT_WORKS_ITEMS[0].description,
    chips: ["Google / MetaMask", "Privy auth"],
  },
  {
    id: "DEPLOY",
    title: "Deploy & Set Policy",
    subtitle: "Smart Account",
    icon: Cpu,
    detail: HOW_IT_WORKS_ITEMS[1].description,
    chips: ["ERC-4337", "PolicyManager", "Session key"],
  },
  {
    id: "FUND",
    title: "Fund Your Agent",
    subtitle: "Liquidity",
    icon: Database,
    detail: HOW_IT_WORKS_ITEMS[2].description,
    chips: ["ETH / USDC", "Smart account", "Non-custodial"],
  },
  {
    id: "AUTOMATE",
    title: "AI Plans & Executes",
    subtitle: "Agent Loop",
    icon: Bot,
    detail: HOW_IT_WORKS_ITEMS[3].description,
    chips: ["Scan market", "Risk score", "On-chain validate", "Execute"],
  },
];

export default function HowItWorks() {
  const { containerRef, activeStep, progress } = useScrollSteps(STEPS.length);
  const active = STEPS[activeStep];
  const ActiveIcon = active.icon;

  return (
    <section id="how" className="relative z-10 bg-[#0d0d0d] text-white">
      {/* Tall scroll track — one viewport of scroll per step */}
      <div ref={containerRef} style={{ height: `${STEPS.length * 100}vh` }} className="relative">
        {/* Pinned visual */}
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden px-6">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-5xl uppercase tracking-tight font-mono font-semibold text-brand-gradient">
                How It Works
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Vertical stepper */}
              <div className="lg:col-span-5">
                <div className="relative flex flex-col gap-7">
                  {/* Track */}
                  <div className="absolute left-6 top-2 bottom-2 w-px bg-neutral-800" />
                  <div
                    className="absolute left-6 top-2 w-px bg-gradient-to-b from-yellow-500 to-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-300 ease-out"
                    style={{ height: `calc(${progress * 100}% - 16px)` }}
                  />
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = activeStep === idx;
                    const isDone = idx < activeStep;
                    return (
                      <div key={step.id} className="relative z-10 flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                            isActive
                              ? "border-yellow-400 bg-yellow-500 text-black scale-110 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                              : isDone
                                ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-400"
                                : "border-neutral-700 bg-neutral-900 text-neutral-500"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className={`font-mono text-xs font-bold uppercase tracking-tight transition-colors duration-500 ${isActive ? "text-yellow-400" : "text-neutral-500"}`}>
                            Step 0{idx + 1}
                          </div>
                          <div className={`font-mono text-sm font-semibold uppercase tracking-tight transition-colors duration-500 ${isActive ? "text-white" : "text-neutral-500"}`}>
                            {step.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active step panel */}
              <div className="lg:col-span-7">
                <div key={activeStep} className="animate-step-enter rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#121212] to-[#0a0a0a] p-8 relative overflow-hidden">
                  <span className="pointer-events-none select-none absolute -top-8 left-3 font-mono font-bold leading-none text-[140px] text-white/[0.03]">
                    0{activeStep + 1}
                  </span>
                  {/* Big background icon */}
                  <ActiveIcon
                    strokeWidth={1}
                    className="pointer-events-none absolute -bottom-12 -right-10 h-80 w-80 text-yellow-500/[0.05]"
                  />
                  <div className="relative z-10">
                    <div className="mb-5 flex items-center gap-4">
                      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-yellow-400">
                        {active.subtitle}
                      </span>
                    </div>
                    <h3 className="mb-4 font-mono text-3xl font-semibold uppercase tracking-tight text-white">
                      {active.title}
                    </h3>
                    <p className="mb-6 max-w-xl text-base leading-relaxed text-neutral-300">
                      {active.detail}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {active.chips.map((chip) => (
                        <span key={chip} className="rounded-full border border-neutral-700/60 bg-neutral-900/60 px-3 py-1 font-mono text-xs text-neutral-300">
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
