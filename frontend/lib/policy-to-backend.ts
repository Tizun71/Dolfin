// Map the FE policy form (PolicySettings) to the backend agent `policy` body.
// Backend shape: packages/backend/src/modules/dolfin-agent/index.ts (policySchema).
// USD strings -> numbers; per-protocol action sets -> bitmask strings (JSON has no bigint);
// adapters keyed by protocol address. Only protocols with >=1 selected action are included
// (mirrors grantSession in dolfin-actions.ts).
import { PROTOCOLS, buildActionMask, type PolicySettings } from "@/constants/dolfin";

export interface BackendAgentPolicy {
  maxTradePerTxUsd: number;
  maxDailyVolumeUsd: number;
  maxExposureUsd: number;
  maxLossPerDayUsd: number;
  expiryDays: number;
  allowedTokens: string[];
  allowedActions: Record<string, string>;
  adapters: Record<string, string>;
}

export function policyToBackend(s: PolicySettings): BackendAgentPolicy {
  const selected = PROTOCOLS.filter((p) => (s.protocols[p.key] ?? []).length > 0);

  const allowedActions: Record<string, string> = {};
  const adapters: Record<string, string> = {};
  for (const p of selected) {
    allowedActions[p.protocol] = buildActionMask(s.protocols[p.key]).toString();
    adapters[p.protocol] = p.adapter;
  }

  return {
    maxTradePerTxUsd: Number(s.maxTradePerTx),
    maxDailyVolumeUsd: Number(s.maxDailyVolume),
    maxExposureUsd: Number(s.maxExposure),
    maxLossPerDayUsd: Number(s.maxLossPerDay),
    expiryDays: s.expiryDays,
    allowedTokens: s.tokens,
    allowedActions,
    adapters,
  };
}
