"use client";

interface Capability {
  label: string;
  desc: string;
}

interface AIAgentPanelProps {
  symbol: string;
  icon: string;
  color: string;
  isRunning: boolean;
  onRun: () => void;
  capabilities: Capability[];
  automatedActions: string[];
  walletAddress?: string;
}

export default function AIAgentPanel({
  symbol,
  icon,
  color,
  isRunning,
  onRun,
  capabilities,
  automatedActions,
  walletAddress,
}: AIAgentPanelProps) {
  return (
    <div className="border border-[#1a1a1a] bg-[#050505] p-8 flex flex-col">
      <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] mb-8">
        AI Agent
      </h2>

      <div
        className="flex items-center justify-between border px-5 py-4 mb-6"
        style={{
          borderColor: `${color}22`,
          backgroundColor: `${color}05`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm border"
            style={{ borderColor: `${color}44`, color }}
          >
            {icon}
          </div>
          <span className="text-white font-light tracking-widest text-base uppercase">
            {symbol}
          </span>
        </div>

        {!isRunning ? (
          <button
            onClick={onRun}
            className="px-6 py-2 text-xs uppercase tracking-[3px] font-mono btn-brand transition-all duration-300"
          >
            Run
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 border border-yellow-600 bg-yellow-600/10">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-yellow-500 text-xs uppercase tracking-[3px] font-mono">
              Running
            </span>
          </div>
        )}
      </div>

      <div className="mb-8">
        <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono mb-4">
          Agent Capabilities
        </p>
        <div className="space-y-3">
          {capabilities.map((cap) => (
            <div
              key={cap.label}
              className="flex items-start gap-3 border border-[#111] p-4"
            >
              <div
                className="w-1 min-h-8 shrink-0 mt-1 opacity-60"
                style={{ backgroundColor: color }}
              />
              <div>
                <p className="text-white text-sm font-light tracking-wider">
                  {cap.label}
                </p>
                <p className="text-[#444] text-xs font-mono mt-1">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <p className="text-[#333] text-xs uppercase tracking-[2px] font-mono mb-4">
          Automated Actions
        </p>
        <div className="grid grid-cols-2 gap-3">
          {automatedActions.map((action) => (
            <div key={action} className="border border-[#111] p-3">
              <p className="text-[#555] text-xs font-mono leading-relaxed">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {walletAddress && (
        <div className="mt-6 border-t border-[#1a1a1a] pt-4">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-1">
            Connected Wallet
          </p>
          <p className="text-white text-sm font-mono truncate">{walletAddress}</p>
        </div>
      )}
    </div>
  );
}
