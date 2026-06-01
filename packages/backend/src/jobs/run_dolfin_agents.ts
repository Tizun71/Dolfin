import { CronJob } from "cron";
import { getLogger } from "@logtape/logtape";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { agentConfigTable } from "../db/schema.js";
import { agentManager } from "../modules/dolfin-agent/agent-manager.js";

const logger = getLogger(["cron", "dolfin-agents"]);

/**
 * Run every enabled Dolfin agent on a schedule. Cadence is controlled by
 * DOLFIN_AGENT_CRON (default: hourly). Failures on one agent do not stop
 * the loop — each is wrapped in its own try/catch so a bad config can't
 * starve the others.
 */
export const runDolfinAgents = new CronJob(
  process.env.DOLFIN_AGENT_CRON ?? "0 * * * *",
  async () => {
    logger.info("dolfin agents tick start");
    const rows = await db
      .select({
        userId: agentConfigTable.user_id,
        smartAccount: agentConfigTable.smart_account,
      })
      .from(agentConfigTable)
      .where(eq(agentConfigTable.enabled, true));

    for (const row of rows) {
      try {
        const { runId } = await agentManager.run(row.userId, row.smartAccount, row.smartAccount);
        logger.info("dolfin agent run ok runId={runId} user={userId}", { runId, userId: row.userId });
      } catch (e) {
        logger.error(
          "dolfin agent run failed user={userId} smartAccount={smartAccount}: {error}",
          { userId: row.userId, smartAccount: row.smartAccount, error: e },
        );
      }
    }
    logger.info("dolfin agents tick done count={count}", { count: rows.length });
  },
);
