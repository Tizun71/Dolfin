import { eq, and } from "drizzle-orm";
import type { Address } from "viem";
import db from "../../db/index.js";
import { agentConfigTable } from "../../db/schema.js";
import { ChainId } from "../../configs/chain.js";
import { PortfolioEngine } from "../portfolio-engine/PortfolioEngine.js";
import { RiskEngineImplement } from "../risk-engine/RiskEngine.js";
import { LendingRiskAnalyzer } from "../risk-engine/analyzer/lending-risk.js";
import { DiscoveryEngine } from "../discovery-engine/DiscoveryEngine.js";
import {
  loadOnchainConfigFor,
  type OnchainConfig,
  type PolicyOverrides,
  type TokenInfo,
} from "./config/onchain-config.js";
import { DolfinAgent } from "./DolfinAgent.js";
import { decryptSessionKey } from "./session-key-crypto.js";

export interface AgentConfigRow {
  id: string;
  user_id: string;
  smart_account: string;
  enabled: boolean;
  session_key: string | null;
  policy: PolicyOverrides;
}

export class AgentConfigNotFoundError extends Error {
  constructor(userId: string, smartAccount: string) {
    super(`agent_config not found for user=${userId} smartAccount=${smartAccount}`);
    this.name = "AgentConfigNotFoundError";
  }
}

export interface StoredPolicy extends PolicyOverrides {
  agent?: Address;
  account?: Address;
}

async function loadAgentConfigRow(userId: string, smartAccount: string): Promise<AgentConfigRow> {
  const rows = await db
    .select()
    .from(agentConfigTable)
    .where(and(eq(agentConfigTable.user_id, userId), eq(agentConfigTable.smart_account, smartAccount)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AgentConfigNotFoundError(userId, smartAccount);
  return {
    id: row.id,
    user_id: row.user_id,
    smart_account: row.smart_account,
    enabled: row.enabled,
    session_key: row.session_key,
    policy: (row.policy ?? {}) as PolicyOverrides,
  };
}

// The DB stores allowedActions masks as strings (JSON has no bigint); coerce them back
// to bigint so the on-chain action whitelist is correct. Malformed values throw.
function normalizePolicyOverrides(policy: PolicyOverrides): PolicyOverrides {
  if (!policy.allowedActions) return policy;
  const allowedActions = Object.fromEntries(
    Object.entries(policy.allowedActions).map(([protocol, mask]) => [protocol, BigInt(mask as unknown as string)]),
  ) as PolicyOverrides["allowedActions"];
  return { ...policy, allowedActions };
}

// Build a DolfinAgent for one (userId, smartAccount) from its DB config. Throws
// AgentConfigNotFoundError if no row exists; callers skip on that.
export async function createDolfinAgentForUser(args: {
  userId: string;
  smartAccount: string;
}): Promise<{ agent: DolfinAgent; onchain: OnchainConfig; tokens: Record<string, TokenInfo> }> {
  const row = await loadAgentConfigRow(args.userId, args.smartAccount);
  // No env SESSION_KEY fallback: a shared key would execute on the wrong account, so a
  // config without its own session key is not runnable. Fail loud so the cron skips it.
  if (!row.session_key) {
    throw new Error(
      `agent has no session key, not runnable (user=${args.userId} smartAccount=${args.smartAccount})`,
    );
  }
  const sessionKey = decryptSessionKey(row.session_key) as `0x${string}`;
  const onchain = loadOnchainConfigFor({
    smartAccount: row.smart_account as Address,
    sessionKey,
    policyOverrides: normalizePolicyOverrides(row.policy),
  });

  const portfolioEngine = new PortfolioEngine(
    ChainId.ARBITRUM_SEPOLIA,
    Object.values(onchain.tokens),
    onchain.aave.pool,
  );
  const riskEngine = new RiskEngineImplement([new LendingRiskAnalyzer()]);
  const discoveryEngine = new DiscoveryEngine();
  const agent = new DolfinAgent({ portfolioEngine, riskEngine, discoveryEngine, onchain });

  return { agent, onchain, tokens: onchain.tokens };
}
