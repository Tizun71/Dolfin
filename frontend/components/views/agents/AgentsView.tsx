"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ActionType, TOKENS, type PolicySettings } from "@/constants/dolfin";
import { useCreateAgent } from "@/hooks/useCreateAgent";
import CreateAgent from "./CreateAgent";
import ManagePanel from "./components/ManagePanel";

const DEFAULT_SETTINGS: PolicySettings = {
  maxTradePerTx: "1000",
  maxDailyVolume: "5000",
  maxExposure: "5000",
  maxLossPerDay: "500",
  maxDrawdownBps: 5000,
  maxLeverageBps: 10000,
  expiryDays: 7,
  tokens: [TOKENS[0].address],
  protocols: {
    aave: [ActionType.SUPPLY, ActionType.WITHDRAW, ActionType.BORROW, ActionType.REPAY],
  },
};

export default function AgentsView() {
  const { authenticated, login } = usePrivy();
  const [settings, setSettings] = useState<PolicySettings>(DEFAULT_SETTINGS);
  const [forceCreate, setForceCreate] = useState(false);
  const agent = useCreateAgent(() => setForceCreate(false));

  const onChange = (patch: Partial<PolicySettings>) => setSettings((s) => ({ ...s, ...patch }));

  const hasAgent = agent.accountExists && !!agent.sessionKey;
  const showManage = hasAgent && !forceCreate;

  return (
    <div className="text-white font-sans">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-3xl font-normal uppercase tracking-[4px] text-white">AI Agent</h1>
          <p className="text-[#666] text-sm font-mono mt-3 tracking-wide">
            Deploy a smart account and grant a scoped, revocable trading session to the Dolfin AI.
          </p>
        </div>
        {authenticated && showManage && (
          <button
            onClick={() => setForceCreate(true)}
            className="px-6 py-3 text-xs uppercase tracking-[3px] font-mono border border-[#333] text-[#ccc] hover:border-[#555] hover:text-white transition"
          >
            + New Agent
          </button>
        )}
        {authenticated && !showManage && hasAgent && (
          <button
            onClick={() => setForceCreate(false)}
            className="px-6 py-3 text-xs uppercase tracking-[3px] font-mono border border-[#333] text-[#ccc] hover:border-[#555] hover:text-white transition"
          >
            ← Back to Manage
          </button>
        )}
      </div>

      {!authenticated ? (
        <div className="card-3d p-16 text-center">
          <p className="text-[#888] text-sm font-mono uppercase tracking-[2px] mb-6">
            Connect a wallet to continue
          </p>
          <button
            onClick={login}
            className="px-8 py-3 text-xs uppercase tracking-[3px] font-mono bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            Connect Wallet →
          </button>
        </div>
      ) : showManage ? (
        <ManagePanel
          owner={agent.owner}
          account={agent.account}
          sessionKey={agent.sessionKey}
          onSessionKeyChange={agent.setSessionKey}
        />
      ) : (
        <CreateAgent agent={agent} settings={settings} onChange={onChange} />
      )}
    </div>
  );
}
