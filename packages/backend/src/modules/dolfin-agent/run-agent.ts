// Manual end-to-end runner for the Dolfin agent (autonomous Aave flow).

import "dotenv/config";
import { createDolfinAgent } from "./create-dolfin-agent.js";
import { ADDRESSES } from "./config/onchain-config.js";

const wallet = process.argv[2] ?? ADDRESSES.account;

//TODO: Create API for running individual agent
/**
 * Concept:
 * 1. User create Dolfin Agent with config
 * 2. Create a class AgentManager to manage instances of Dolfin Agent use Map<`userAddress:userAccountAddress`, DolfinAgentInstance>, and run the agent with user account address
 * Ex: userAddress:userAccountAddress = 0x02Ca485F8a1c8B532F7EA5121723588f6a25AAE0:0xF1D11915cb461C9B2d375a69C0A969b78cFA9808
 * 3. Every ? hour agent will execute agent.run(wallet) ( create a constant to easy to setup)
 * 4. When running session, if they execute an action, it will store a record of action in database
 * 5. Create a api to list a logs of current sesssion
 * Ex: When agent run, it supply 100 USDC to Aave, Swap 10 USDC to ETH on Uniswap, ..
 * ->
 * [
 * {
  *  "timestamp": "2024-01-01T00:00:00Z",
  *  "action": "Supply 100 USDC to AAVE",
  * "details": {
  *    "asset": "USDC",
  *    "amount": "100",
  *   "protocol": "AAVE",
  * "transactionHash": "0x123abc..."
  * },
 * },
 * {
  *  "timestamp": "2024-01-01T00:00:00Z",
  *  "action": "Swap 10 USDC to ETH",
  * "details": {
  *    "asset": "USDC",
  *    "amount": "10",
  *   "protocol": "UNISWAP",
  * "transactionHash": "0x123abc..."
  * },
 * }
 * ]
 * 6. Create a api to list of history of runned session
 */
const agent = createDolfinAgent();
const result = await agent.run(wallet);

console.log("\n=== Dolfin agent run ===");
console.log("wallet        :", wallet);
console.log(
  "portfolio     :",
  JSON.stringify(result.portfolio ?? {}, bigintReplacer),
);
console.log(
  "risk          :",
  result.risk?.level,
  `(score ${result.risk?.score})`,
);
console.log(
  "decisions     :",
  JSON.stringify(result.decisions ?? [], bigintReplacer),
);
console.log(
  "validDecisions:",
  JSON.stringify(result.validDecisions ?? [], bigintReplacer),
);
console.log(
  "rejected      :",
  JSON.stringify(result.rejected ?? [], bigintReplacer),
);
console.log("userOpHashes  :", result.userOpHashes ?? []);
console.log("\nadvice:\n" + (result.advice ?? "(none)"));

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}
