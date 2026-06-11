"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Play,
  Briefcase,
  Database,
  Cpu,
  Layers,
  Terminal,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { HOW_IT_WORKS_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1500);
  const [simLogs, setSimLogs] = useState<string[]>([
    "[SYSTEM] Agent initialization ready...",
  ]);
  const { isVisible, sectionRef } = useSectionAnimation();

  // Memoize simulation logs cache to prevent unnecessary re-renders
  const simulationLogsCache = useMemo(
    () => ({
      0: [
        "[GATEWAY] Wallet connection established.",
        "[AUTH] Signature verified successfully.",
        "[SESSION] User authenticated and ready.",
      ],
      1: [
        "[DEPLOY] Creating ERC-4337 Smart Account...",
        "[CONTRACT] Agent smart contract deployed on Arbitrum.",
        "[SECURITY] Multi-signature security framework initialized.",
      ],
      2: [
        "[FUNDING] ETH liquidity pool detected.",
        "[BALANCE] Agent account funded and verified.",
        "[READY] Trading capital secured and confirmed.",
      ],
      3: [
        "[ARIMA] Market analysis engine activated.",
        "[PREDICTION] Real-time trend detection in progress.",
        "[EXECUTION] Opportunity identified. Trade executed successfully.",
      ],
    } as Record<number, string[]>),
    [],
  );

  const steps = [
    {
      id: "CONNECT",
      title: "Connect Wallet",
      subtitle: "AUTHENTICATION",
      icon: <Briefcase className="w-5 h-5" />,
      detail: HOW_IT_WORKS_ITEMS[0].description,
      color: "border-amber-500 text-amber-400",
    },
    {
      id: "DEPLOY",
      title: "Deploy Agent",
      subtitle: "SMART ACCOUNT",
      icon: <Cpu className="w-5 h-5" />,
      detail: HOW_IT_WORKS_ITEMS[1].description,
      color: "border-blue-500 text-blue-400",
    },
    {
      id: "FUND",
      title: "Fund Your Agent",
      subtitle: "LIQUIDITY",
      icon: <Database className="w-5 h-5" />,
      detail: HOW_IT_WORKS_ITEMS[2].description,
      color: "border-violet-500 text-violet-400",
    },
    {
      id: "EXECUTE",
      title: "AI Predicts & Executes",
      subtitle: "AUTOMATION",
      icon: <Layers className="w-5 h-5" />,
      detail: HOW_IT_WORKS_ITEMS[3].description,
      color: "border-emerald-500 text-emerald-400",
    },
  ];

  // Simulation effect loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isSimulating) {
      intervalId = setInterval(() => {
        setActiveStep((prev) => {
          const next = (prev + 1) % steps.length;

          // Append log for simulation progress
          const stepLogs = simulationLogsCache[next] || [];
          setSimLogs((prevLogs) => {
            const consolidated = [...prevLogs, ...stepLogs];
            // Keep latest 20 lines
            if (consolidated.length > 20) {
              return consolidated.slice(consolidated.length - 20);
            }
            return consolidated;
          });

          return next;
        });
      }, simulationSpeed);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating, simulationSpeed, steps.length]);

  const handleStepClick = (idx: number) => {
    setIsSimulating(false);
    setActiveStep(idx);

    // Set matching logs instantly
    const stepLogs = simulationLogsCache[idx] || [];
    setSimLogs([`[INSPECT] Selected state: ${steps[idx].id}`, ...stepLogs]);
  };

  const triggerManualSimulation = () => {
    setSimLogs([
      `[SYSTEM] Manual simulation initialized. Core systems warming...`,
      `[SIM-RUN] Cycling through all 4 workflow stages in sequence.`,
    ]);
    setActiveStep(0);
    setIsSimulating(true);
  };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative z-10 bg-[#131313] text-white py-24 overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-20">
        {/* Header - consistent with other sections */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-yellow-300 text-sm font-mono font-semibold uppercase tracking-tight mb-4">
            WORKFLOW
          </p>
        <h2 className="text-5xl mb-6 uppercase tracking-tight font-mono font-semibold text-brand-gradient">
          How It Works
        </h2>
          <p className="text-yellow-100/70 text-base md:text-lg font-mono font-semibold uppercase tracking-tight max-w-2xl mx-auto leading-relaxed">
            Connect your wallet. Deploy an AI agent. Fund it. Watch ARIMA
            execute automatically.
          </p>
        </div>

        {/* Flow overview - consistent spacing */}
        <div className={`mb-16 hidden xl:block transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}>
          <div className="p-6 bg-[#0f0f0f] border border-yellow-500/30 rounded-lg shadow-lg">
            <div className="flex items-center justify-between gap-4">
              {steps.map((st, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div key={st.id} className="flex-1 flex items-center">
                    <button
                      onClick={() => handleStepClick(idx)}
                      className={`relative flex flex-col items-center p-3 rounded-lg border transition-all duration-300 w-full cursor-pointer ${
                        isActive
                          ? "bg-yellow-500/10 border-yellow-500/60 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
                          : "bg-black/50 border-yellow-500/20 hover:border-yellow-500/40"
                      }`}
                    >
                      <div
                        className={`p-2 rounded mb-2 transition-colors ${
                          isActive
                            ? "bg-yellow-500/30 text-yellow-400"
                            : "bg-neutral-900 text-neutral-400"
                        }`}
                      >
                        {st.icon}
                      </div>
                      <span className="font-mono text-xs font-semibold uppercase text-center">
                        {st.id}
                      </span>
                    </button>
                    {idx < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 shrink-0 mx-2 text-yellow-500/40" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main dashboard grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}>
          {/* Left panel: Steps list */}
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-tight text-yellow-400 mb-2">
              Workflow Steps
            </h3>
            {steps.map((st, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={st.id}
                  onClick={() => handleStepClick(idx)}
                  className={`text-left p-4 rounded-lg border transition-all duration-300 w-full cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? "border-yellow-500/60 bg-yellow-500/5 shadow-[0_0_15px_rgba(250,204,21,0.1)]"
                      : "border-yellow-500/20 bg-transparent hover:border-yellow-500/40"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                  )}

                  <div className="flex gap-4 items-start">
                    <div
                      className={`p-2 rounded border text-sm transition-all duration-300 shrink-0 ${
                        isActive
                          ? "bg-yellow-500/30 text-yellow-400 border-yellow-500"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800"
                      }`}
                    >
                      {st.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs tracking-wide text-neutral-400 font-semibold uppercase">
                          Step {idx + 1} • {st.subtitle}
                        </span>
                        {isActive && (
                          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-mono font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h3
                        className={`text-base font-semibold tracking-tight transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-neutral-300"
                        }`}
                      >
                        {st.title}
                      </h3>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right panel: Console & controls */}
          <div className="flex flex-col gap-6">
            {/* Controls */}
            <div className="p-6 bg-[#0f0f0f] border border-yellow-500/30 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-yellow-500/20">
                <span className="font-mono text-xs tracking-widest text-yellow-400 uppercase font-semibold">
                  Controls
                </span>
              </div>

              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                Simulate the complete workflow. Watch how your agent connects,
                deploys, gets funded, and begins automatic execution.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                <button
                  onClick={triggerManualSimulation}
                  disabled={isSimulating}
                  className="py-2 px-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-mono font-semibold text-xs tracking-wide uppercase rounded transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-black" />
                  RUN
                </button>

                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`py-2 px-3 font-mono font-semibold text-xs tracking-wide uppercase rounded transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isSimulating
                      ? "bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {isSimulating ? "PAUSE" : "RESUME"}
                </button>

                <button
                  onClick={() => {
                    setIsSimulating(false);
                    setActiveStep(0);
                    setSimLogs(["[SYSTEM] Workflow reset. Ready to begin..."]);
                  }}
                  className="col-span-2 sm:col-span-1 py-2 px-3 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 font-mono font-semibold text-xs tracking-wide uppercase rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  RESET
                </button>
              </div>

              <div className="pt-4 border-t border-yellow-500/20 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs text-neutral-400 font-semibold">
                  Speed:
                </span>
                <div className="flex gap-2">
                  {[
                    { speed: 2500, label: "SLOW" },
                    { speed: 1200, label: "NORMAL" },
                    { speed: 600, label: "FAST" },
                  ].map(({ speed, label }) => (
                    <button
                      key={speed}
                      onClick={() => setSimulationSpeed(speed)}
                      className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                        simulationSpeed === speed
                          ? "bg-yellow-500 text-black"
                          : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Console */}
            <div className="flex-1 min-h-[320px] rounded-lg border border-yellow-500/30 bg-[#0f0f0f] p-5 font-mono text-xs flex flex-col justify-between shadow-lg">
              <div className="pb-3 border-b border-yellow-500/20 mb-3 flex justify-between items-center text-neutral-400 text-xs">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-yellow-400" />
                  DIAGNOSTICS
                </span>
              </div>

              {/* Active step detail */}
              <div className="mb-4 p-4 rounded-lg border border-yellow-500/30 bg-black/60 relative overflow-hidden">
                <span className="font-mono text-xs tracking-wider text-yellow-400 font-semibold uppercase">
                  Step {activeStep + 1} • {steps[activeStep].subtitle}
                </span>
                <h4 className="text-sm font-semibold text-white mt-1 uppercase">
                  {steps[activeStep].title}
                </h4>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  {steps[activeStep].detail}
                </p>
              </div>

              {/* System logs */}
              <div className="flex-1 overflow-y-auto max-h-[120px] flex flex-col gap-1 text-xs text-neutral-400 pr-1">
                <span className="text-neutral-600 text-xs pb-1 border-b border-yellow-500/20">
                  // LOGS:
                </span>
                {simLogs.map((log, index) => {
                  let color = "text-neutral-400";
                  if (log.startsWith("[SYSTEM]")) color = "text-yellow-500 font-semibold";
                  else if (log.includes("successfully")) color = "text-green-400";
                  else if (log.includes("[EXECUTION]")) color = "text-yellow-400";
                  return (
                    <div
                      key={index}
                      className={`leading-relaxed transition-all duration-300 ${color}`}
                    >
                      {"> "}{log}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-4 border-t border-yellow-500/20">
                <div className="flex justify-between items-center text-xs text-neutral-400 font-semibold mb-2 uppercase">
                  <span>Progress</span>
                  <span>
                    {Math.round(((activeStep + 1) / steps.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                    style={{
                      width: `${((activeStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
