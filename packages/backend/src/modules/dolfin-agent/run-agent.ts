// Manual end-to-end runner for the Dolfin agent (autonomous Aave flow).
//
// Usage:
//   npm run agent:run                                                  # uses DEV_USER_ID + DEV_SMART_ACCOUNT from env
//   npm run agent:run -- <wallet>                                     # override wallet, use env smart-account/user
//   npm run agent:run -- <wallet> <smartAccount> <userId>             # full override
//
// Requires an `agent_config` row to exist for (userId, smartAccount).
// Seed one with:
//   curl -X PUT http://localhost:8080/agent/<userId>/<smartAccount>/config \
//     -H 'content-type: application/json' \
//     -d '{"enabled": true, "policy": {}}'

import "dotenv/config";
import { ADDRESSES } from "./config/onchain-config.js";
import { agentManager } from "./agent-manager.js";
import { AgentConfigNotFoundError } from "./create-dolfin-agent.js";
import { eq, and } from "drizzle-orm";
import db from "../../db/index.js";
import { agentActionTable, agentRunTable } from "../../db/schema.js";

const wallet = process.argv[2] ?? ADDRESSES.account;
const smartAccount = (process.argv[3] ?? process.env.DEV_SMART_ACCOUNT ?? ADDRESSES.account) as `0x${string}`;
const userId = process.argv[4] ?? process.env.DEV_USER_ID ?? "dev-user";

let result;
try {
  result = await agentManager.run(userId, smartAccount, wallet);
} catch (e) {
  if (e instanceof AgentConfigNotFoundError) {
    console.error(`\nNo agent_config row for user=${userId} smartAccount=${smartAccount}.`);
    console.error(`Seed one with:  PUT /agent/${userId}/${smartAccount}/config  body: {"enabled":true,"policy":{}}\n`);
    process.exit(1);
  }
  throw e;
}

console.log("\n=== Dolfin agent run ===");
console.log("userId        :", userId);
console.log("smartAccount  :", smartAccount);
console.log("wallet        :", wallet);
console.log("runId         :", result.runId);
console.log(
  "portfolio     :",
  JSON.stringify(result.state.portfolio ?? {}, bigintReplacer),
);
console.log(
  "risk          :",
  result.state.risk?.level,
  `(score ${result.state.risk?.score})`,
);
console.log(
  "decisions     :",
  JSON.stringify(result.state.decisions ?? [], bigintReplacer),
);
console.log(
  "validDecisions:",
  JSON.stringify(result.state.validDecisions ?? [], bigintReplacer),
);
console.log(
  "rejected      :",
  JSON.stringify(result.state.rejected ?? [], bigintReplacer),
);
console.log("userOpHashes  :", result.state.userOpHashes ?? []);
console.log("transactions  :", result.state.transactions ?? []);
console.log("\nadvice:\n" + (result.state.advice ?? "(none)"));

const persisted = await db
  .select()
  .from(agentActionTable)
  .where(eq(agentActionTable.run_id, result.runId));
const run = (await db
  .select()
  .from(agentRunTable)
  .where(and(eq(agentRunTable.id, result.runId)))
  .limit(1))[0];

console.log("\n=== Persisted run ===");
console.log("status        :", run?.status);
console.log("startedAt     :", run?.started_at);
console.log("finishedAt    :", run?.finished_at);
console.log("actions       :", persisted.length);
for (const a of persisted) {
  console.log(`  • ${a.action_label}  (tx ${a.transaction_hash ?? "n/a"})`);
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}
