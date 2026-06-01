"use client";

import { SETUP_STEPS, STEP_INDEX } from "@/constants/vaults";
import { useDolfinAccount } from "@/hooks/useDolfinAccount";

export default function SetupModal({
  onComplete,
  onClose,
}: {
  onComplete: () => void;
  onClose: () => void;
}) {
  const { currentStep, loading, error, handleSign, handleApprove } =
    useDolfinAccount(onComplete);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#050505] border border-[#1a1a1a] w-full max-w-md p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-mono uppercase tracking-[3px] text-white">
            Setup Strategy
          </h2>
          <button
            onClick={onClose}
            className="text-[#444] hover:text-white text-xs font-mono transition"
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {SETUP_STEPS.map((step, i) => {
            const current = STEP_INDEX[currentStep];
            const isDone = i < current;
            const isActive = i === current;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 border p-4 transition-all ${
                  isActive
                    ? "border-[#627EEA44] bg-[#627EEA08]"
                    : isDone
                      ? "border-[#1a1a1a] opacity-50"
                      : "border-[#111] opacity-30"
                }`}
              >
                {/* Step number */}
                <div
                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono mt-0.5 ${
                    isDone
                      ? "bg-green-600 text-white"
                      : isActive
                        ? "border border-[#627EEA] text-[#627EEA]"
                        : "border border-[#333] text-[#333]"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>

                <div>
                  <p className="text-white text-sm font-light tracking-wider">
                    {step.label}
                  </p>
                  <p className="text-[#444] text-xs font-mono mt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs font-mono mb-4">{error}</p>
        )}

        {/* Action button */}
        {currentStep === "sign" && (
          <button
            onClick={handleSign}
            disabled={loading}
            className="w-full py-3 text-xs uppercase tracking-[3px] font-mono bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
          >
            {loading ? "Đang ký..." : "Sign →"}
          </button>
        )}

        {currentStep === "approve" && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="w-full py-3 text-xs uppercase tracking-[3px] font-mono bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Approve Token →"}
          </button>
        )}

        {currentStep === "done" && (
          <div className="flex items-center justify-center gap-2 py-3 border border-green-600 bg-green-600/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-green-500 text-xs uppercase tracking-[3px] font-mono">
              Setup Complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
