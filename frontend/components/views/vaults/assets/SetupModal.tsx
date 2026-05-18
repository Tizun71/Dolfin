"use client";

import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";

type Step = "sign" | "approve" | "done";

export default function SetupModal({
  onComplete,
  onClose,
}: {
  onComplete: () => void;
  onClose: () => void;
}) {
  const { wallets } = useWallets();
  const [currentStep, setCurrentStep] = useState<Step>("sign");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSign = async () => {
    setLoading(true);
    setError("");
    try {
      const wallet = wallets[0]; // lấy ví đầu tiên đang connect
      const provider = await wallet.getEthereumProvider();
      await provider.request({
        method: "personal_sign",
        params: ["Authorize Dolfin flash loan strategy", wallet.address],
      });
      setCurrentStep("approve");
    } catch (e) {
      setError("Ký thất bại, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError("");
    try {
      //Chờ địa chỉ GMX Router contract
      await sendTransaction({
        to: "0xGMX_ROUTER_ADDRESS",
        data: "0x",
        value: "0x0",
      });
      setCurrentStep("done");
      setTimeout(() => onComplete(), 1000);
    } catch (e) {
      setError("Approve thất bại, thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      id: "sign",
      label: "Sign Authorization",
      desc: "Ký uỷ quyền offchain — miễn phí, không tốn gas",
    },
    {
      id: "approve",
      label: "Approve Token",
      desc: "Cho phép GMX Router dùng token — tốn gas nhỏ",
    },
    { id: "done", label: "Done", desc: "Hoàn tất, strategy sẵn sàng chạy" },
  ];

  const stepIndex = { sign: 0, approve: 1, done: 2 };

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
          {steps.map((step, i) => {
            const current = stepIndex[currentStep];
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
                  className={`w-6 h-6 flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5 ${
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
