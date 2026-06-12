import { getLogger } from "@logtape/logtape";
import { eq } from "drizzle-orm";
import db from "../../db/index.js";
import { agentConfigTable } from "../../db/schema.js";
import { createDolfinAgentForUser } from "./create-dolfin-agent.js";
import {
  buildActionRecords,
  createRunRecord,
  finalizeRunRecord,
  persistActions,
} from "./persistence.js";
import type { AdvisorState } from "./state.js";
import { DolfinAgent } from "./DolfinAgent.js";
import { logStep } from "../../utils/logger.js";

const logger = getLogger(["dolfin", "agent-manager"]);

export interface RunOutcome {
  runId: string;
  state: AdvisorState;
}

interface CachedAgent {
  agent: DolfinAgent;
  onchain: Awaited<ReturnType<typeof createDolfinAgentForUser>>["onchain"];
}

// One DolfinAgent instance per userId:smartAccount. Cache invalidation is manual via
// remove() so we don't recreate the relayer clients on every tick.
class AgentManager {
  private instances = new Map<string, CachedAgent>();

  private key(userId: string, smartAccount: string): string {
    return `${userId}:${smartAccount.toLowerCase()}`;
  }

  async getOrCreate(userId: string, smartAccount: string): Promise<CachedAgent> {
    const k = this.key(userId, smartAccount);
    const cached = this.instances.get(k);
    if (cached) return cached;
    const { agent, onchain } = await createDolfinAgentForUser({ userId, smartAccount });
    const entry = { agent, onchain };
    this.instances.set(k, entry);
    return entry;
  }

  list(): Array<{ userId: string; smartAccount: string }> {
    return Array.from(this.instances.keys()).map((k) => {
      const [userId, smartAccount] = k.split(":");
      return { userId, smartAccount };
    });
  }

  remove(userId: string, smartAccount: string): void {
    this.instances.delete(this.key(userId, smartAccount));
  }

  // Run the full pipeline for one (user, smart account), persisting a run record and
  // one action row per submitted tx. On failure the run is marked failed, then rethrows.
  async run(userId: string, smartAccount: string, wallet: string): Promise<RunOutcome> {
    const startedAt = new Date();
    const { agent, onchain } = await this.getOrCreate(userId, smartAccount);
    const runId = await createRunRecord({
      userId,
      smartAccount,
      wallet,
      startedAt,
      state: { wallet },
    });

    logger.info(
      "dolfin agent run start user={userId} smartAccount={smartAccount} runId={runId}",
      { userId, smartAccount, runId },
    );
    logStep("RUN", `AI workflow started runId=${runId} wallet=${wallet}`);

    let result!: AdvisorState;
    let error: unknown;
    try {
      result = await agent.run(wallet);
      const records = buildActionRecords(runId, result, onchain);
      await persistActions(records);
      logStep("SUCCESS", `AI workflow completed runId=${runId}`);
    } catch (e) {
      error = e;
      logger.error("dolfin agent run failed runId={runId}: {error}", { runId, error });
      logStep("FAILED", `AI workflow failed runId=${runId}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      await finalizeRunRecord(runId, result ?? { wallet }, new Date(), error);
    }
    if (error) throw error;
    return { runId, state: result };
  }
}

export const agentManager = new AgentManager();
