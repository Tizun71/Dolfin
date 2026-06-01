// Manual end-to-end runner for the Dolfin agent (autonomous Aave flow).

import "dotenv/config";
import { createDolfinAgent } from "./create-dolfin-agent.js";
import { ADDRESSES } from "./config/onchain-config.js";

const wallet = process.argv[2] ?? ADDRESSES.account;

const agent = createDolfinAgent();
const result = await agent.run(wallet);

console.log("\n=== Dolfin agent run ===");
console.log("wallet        :", wallet);
console.log("portfolio     :", JSON.stringify(result.portfolio ?? {}, bigintReplacer));
console.log("risk          :", result.risk?.level, `(score ${result.risk?.score})`);
console.log("decisions     :", JSON.stringify(result.decisions ?? [], bigintReplacer));
console.log("validDecisions:", JSON.stringify(result.validDecisions ?? [], bigintReplacer));
console.log("rejected      :", JSON.stringify(result.rejected ?? [], bigintReplacer));
console.log("userOpHashes  :", result.userOpHashes ?? []);
console.log("\nadvice:\n" + (result.advice ?? "(none)"));

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}
