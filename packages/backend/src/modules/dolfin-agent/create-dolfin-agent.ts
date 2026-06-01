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

function reqEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`missing env: ${key} (see smart_contract/.env.example)`);
  return v;
}

/**
 * Build a `DolfinAgent` for a single (userId, smartAccount) by loading the
 * per-user config from the database. Throws `AgentConfigNotFoundError` if no
 * row exists; callers (cron, API) should handle that by skipping.
 */
export async function createDolfinAgentForUser(args: {
  userId: string;
  smartAccount: string;
}): Promise<{ agent: DolfinAgent; onchain: OnchainConfig; tokens: Record<string, TokenInfo> }> {
  const row = await loadAgentConfigRow(args.userId, args.smartAccount);
  const sessionKey = (row.session_key ?? reqEnv("SESSION_KEY")) as `0x${string}`;
  const onchain = loadOnchainConfigFor({
    smartAccount: row.smart_account as Address,
    sessionKey,
    policyOverrides: row.policy,
  });

  const portfolioEngine = new PortfolioEngine(ChainId.ARBITRUM_SEPOLIA, Object.values(onchain.tokens));
  const riskEngine = new RiskEngineImplement([new LendingRiskAnalyzer()]);
  const discoveryEngine = new DiscoveryEngine();
  const agent = new DolfinAgent({ portfolioEngine, riskEngine, discoveryEngine, onchain });

  return { agent, onchain, tokens: onchain.tokens };
}
