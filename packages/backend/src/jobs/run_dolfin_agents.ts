import { CronJob } from "cron";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { agentConfigTable } from "../db/schema.js";
import { agentManager } from "../modules/dolfin-agent/agent-manager.js";
import { logStep } from "../utils/logger.js";

const CRON = process.env.DOLFIN_AGENT_CRON ?? "0 * * * *";

// Run every enabled agent on a schedule (cadence from DOLFIN_AGENT_CRON, default hourly).
// Each run is wrapped in its own try/catch so one bad config can't starve the others.
export const runDolfinAgents = new CronJob(CRON, async () => {
  logStep("TICK", `Cron tick start (schedule=${CRON})`);
  const rows = await db
    .select({
      userId: agentConfigTable.user_id,
      smartAccount: agentConfigTable.smart_account,
    })
    .from(agentConfigTable)
    .where(eq(agentConfigTable.enabled, true));

  if (rows.length === 0) {
    logStep("IDLE", "No enabled agents, nothing to run this tick");
  }

  for (const row of rows) {
    try {
      const { runId } = await agentManager.run(row.userId, row.smartAccount, row.smartAccount);
      logStep("DONE", `Agent run ok runId=${runId} user=${row.userId}`);
    } catch (e) {
      logStep("ERROR", `Agent run failed user=${row.userId} smartAccount=${row.smartAccount}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const next = runDolfinAgents.nextDate()?.toISO() ?? "unknown";
  logStep("TICK", `Cron tick done count=${rows.length} nextRun=${next}`);
});

export function logDolfinAgentsSchedule(): void {
  const next = runDolfinAgents.nextDate()?.toISO() ?? "unknown";
  logStep("CRON", `Dolfin agents scheduled (schedule=${CRON}) nextRun=${next}`);
}
