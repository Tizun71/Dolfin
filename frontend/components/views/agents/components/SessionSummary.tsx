"use client";

import { type Step } from "@/hooks/useCreateAgent";

const STEPS: { id: Exclude<Step, "idle">; label: string }[] = [
  { id: "provision", label: "Deploy smart account" },
  { id: "configure", label: "Grant scoped session" },
  { id: "done", label: "Agent live" },
];

const ORDER: Record<Step, number> = { idle: 0, provision: 0, configure: 1, done: 2 };

export default function SessionSummary({
  step,
  loading,
  error,
  accountExists,
  onSubmit,
}: {
  step: Step;
  loading: boolean;
  error: string;
  accountExists: boolean;
  onSubmit: () => void;
}) {
  const current = ORDER[step];
  const running = step !== "idle";

  return (
    <div className="card-3d p-8">
      <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc] mb-8 border-b border-[#262626] pb-4">
        Activate
      </h2>

      <div className="space-y-3 mb-8">
        {STEPS.map((s, i) => {
          const isDone = step === "done" || i < current;
          const isActive = running && i === current && step !== "done";
          return (
            <div
              key={s.id}
              className={`flex items-center gap-4 border p-3 transition-all ${
                isActive
                  ? "border-[#627EEA44] bg-[#627EEA08]"
                  : isDone
                    ? "border-[#1a1a1a] opacity-60"
                    : "border-[#111] opacity-30"
              }`}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center text-xs font-mono ${
                  isDone
                    ? "bg-green-600 text-white"
                    : isActive
                      ? "border border-[#627EEA] text-[#627EEA]"
                      : "border border-[#333] text-[#333]"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <p className="text-white text-sm font-light tracking-wider">{s.label}</p>
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-xs font-mono mb-4 break-words">{error}</p>}

      {step === "done" ? (
        <div className="flex items-center justify-center gap-2 py-3 border border-green-600 bg-green-600/10">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-green-500 text-xs uppercase tracking-[3px] font-mono">
            Agent Created
          </span>
        </div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3 text-xs uppercase tracking-[3px] font-mono bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
        >
          {loading
            ? "Processing…"
            : accountExists
              ? "Create Agent →"
              : "Deploy & Create Agent →"}
        </button>
      )}
    </div>
  );
}
