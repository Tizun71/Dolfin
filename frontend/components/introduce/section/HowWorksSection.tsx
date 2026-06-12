"use client";

import { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Database,
  Cpu,
  Layers,
  Terminal,
  ChevronRight,
} from "lucide-react";
import { HOW_IT_WORKS_ITEMS } from "@/constants/common";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

const STEPS = [
  {
    id: "CONNECT",
    title: "Connect Wallet",
    subtitle: "AUTHENTICATION",
    icon: <Briefcase className="w-5 h-5" />,
    detail: HOW_IT_WORKS_ITEMS[0].description,
  },
  {
    id: "DEPLOY",
    title: "Deploy Agent",
    subtitle: "SMART ACCOUNT",
    icon: <Cpu className="w-5 h-5" />,
    detail: HOW_IT_WORKS_ITEMS[1].description,
  },
  {
    id: "FUND",
    title: "Fund Your Agent",
    subtitle: "LIQUIDITY",
    icon: <Database className="w-5 h-5" />,
    detail: HOW_IT_WORKS_ITEMS[2].description,
  },
  {
    id: "EXECUTE",
    title: "AI Predicts & Executes",
    subtitle: "AUTOMATION",
    icon: <Layers className="w-5 h-5" />,
    detail: HOW_IT_WORKS_ITEMS[3].description,
  },
];

const LOG_CACHE: Record<number, string[]> = {
  0: [
    "[GATEWAY] Wallet connection established.",
    "[AUTH] Signature verified successfully.",
    "[SESSION] User authenticated and ready.",
  ],
  1: [
    "[DEPLOY] Creating ERC-4337 Smart Account...",
    "[CONTRACT] Agent smart contract deployed on Arbitrum.",
    "[SECURITY] Security framework initialized.",
  ],
  2: [
    "[FUNDING] ETH liquidity pool detected.",
    "[BALANCE] Agent account funded and verified.",
    "[READY] Trading capital secured.",
  ],
  3: [
    "[ARIMA] Market analysis engine activated.",
    "[PREDICTION] Real-time trend detection in progress.",
    "[EXECUTION] Opportunity identified. Trade executed.",
  ],
};

const STEP_DURATION = 2500; 
const MAX_LOGS = 25; // Maximum number of log lines to keep 

export default function HowItWorks() {
  const { isVisible, sectionRef } = useSectionAnimation();
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Initializing workflow automation...",
  ]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef(0);
  const isRunningRef = useRef(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom when new logs are added
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (isVisible) {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        startLoopingAnimation();
      }
    } else {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
      isRunningRef.current = false;
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      isRunningRef.current = false;
    };
  }, [isVisible]);

  const startLoopingAnimation = () => {
    const runStep = () => {
      if (!isRunningRef.current) return;

      // Get current step value
      const step = currentStepRef.current;

      // Update active step UI FIRST
      setActiveStep(step);
    
      // Update logs with CURRENT step
      const stepLogs = LOG_CACHE[step] || [];
      setLogs((prev) => {
        const newLogs = [
          ...prev,
          `[PROGRESS] Step 0${step + 1} • ${STEPS[step].subtitle}...`,
          ...stepLogs,
        ];
        // Keep only the last MAX_LOGS lines
        return newLogs.slice(-MAX_LOGS);
      });

      // THEN move to next step for next iteration
      currentStepRef.current = (step + 1) % STEPS.length;

      animationRef.current = setTimeout(runStep, STEP_DURATION);
    };

    runStep();
  };

  return (
    <section
      id="how"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative z-10 py-24 bg-[#131313] text-white"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-yellow-300 text-sm font-mono font-semibold uppercase tracking-tight mb-4">
            How It Works
          </p>
          <h2 className="text-4xl mb-4 uppercase tracking-tight font-mono font-semibold text-brand-gradient">
            Four-Step Workflow
          </h2>
          <p className="text-sm text-yellow-100/70 max-w-2xl mx-auto uppercase tracking-tight font-mono font-semibold leading-relaxed">
            Watch the automated workflow in action as it cycles through each step.
          </p>
        </div>

        {/* Top Flow Bar */}
        <div
          className={`mb-8 border border-neutral-800 rounded-lg p-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
        >
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-500 flex-1 ${
                      isActive
                        ? "border-yellow-500/60 bg-neutral-900/60"
                        : "border-neutral-800 bg-neutral-900/20"
                    }`}
                  >
                    <div
                      className={`p-2 rounded border transition-all duration-500 ${
                        isActive
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-tight">
                      {step.id}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-neutral-700 mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
        >
          {/* Left: Steps List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-yellow-300 mb-3">
              Workflow Steps
            </div>
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-all duration-500 ${
                    isActive
                      ? "border-yellow-500/40 bg-neutral-900/60 scale-105"
                      : "border-neutral-800 bg-neutral-900/20"
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className={`p-2 rounded border flex-shrink-0 transition-all duration-500 ${
                        isActive
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                          Step 0{idx + 1}
                        </span>
                        {isActive && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <h3
                        className={`font-mono font-semibold text-sm uppercase tracking-tight transition-colors duration-500 ${
                          isActive ? "text-white" : "text-neutral-400"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 font-mono uppercase tracking-tight">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Console Section */}
          <div className="lg:col-span-7 space-y-3">
            {/* Step Detail */}
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-400">
                    Step 0{activeStep + 1} •
                  </span>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 ml-1">
                    {STEPS[activeStep].subtitle}
                  </span>
                </div>
                <span className="text-base font-mono font-bold text-neutral-700">
                  #{activeStep + 1}
                </span>
              </div>
              <h4 className="font-mono font-semibold text-sm uppercase tracking-tight text-white mb-2">
                {STEPS[activeStep].title}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {STEPS[activeStep].detail}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="border border-neutral-800 rounded-lg p-3">
              <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                <span className="font-mono font-semibold uppercase tracking-tight">
                  Cycle Progress
                </span>
                <span className="font-mono">
                  Step {activeStep + 1} / {STEPS.length}
                </span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500"
                  style={{
                    width: `${((activeStep + 1) / STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Console */}
            <div className="border border-neutral-800 rounded-lg p-4 bg-black/30 h-[240px] flex flex-col">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
                <Terminal className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-yellow-300">
                  Diagnostics
                </span>
              </div>

              <div 
                ref={logsContainerRef}
                className="flex-1 overflow-y-auto space-y-1 text-xs font-mono pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scroll-smooth"
              >
                {logs.map((log, idx) => {
                  let logColor = "text-neutral-400";
                  if (log.startsWith("[PROGRESS]"))
                    logColor = "text-yellow-500 font-bold";
                  else if (log.startsWith("[SYSTEM]"))
                    logColor = "text-cyan-400";
                  else if (
                    log.includes("successfully") ||
                    log.includes("verified") ||
                    log.includes("secured")
                  )
                    logColor = "text-emerald-400";
                  else if (
                    log.includes("[ARIMA]") ||
                    log.includes("[EXECUTION]")
                  )
                    logColor = "text-yellow-400 font-semibold";

                  return (
                    <div key={idx} className={logColor}>
                      &gt; {log}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
