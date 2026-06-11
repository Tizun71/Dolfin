import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { actionBit, type ActionType, type TradeDecision } from "@dolfin/onchain";
import type { OnchainConfig } from "../config/onchain-config.js";
import type { AdvisorState } from "../state.js";
import { makeAaveDecision, resolveAction, resolveToken, type AaveActionName } from "./decision-factory.js";

// The LLM picks only action, token and size; protocol/adapter/encoding stay in code.
const AiDecisionSchema = z.object({
  actions: z
    .array(
      z.object({
        action: z.enum(["SUPPLY", "WITHDRAW", "BORROW", "REPAY"]),
        token: z.string().describe("token symbol, must be in the allowed list"),
        amountUsd: z.number().positive().describe("USD notional, must be <= maxTradePerTxUsd"),
        reason: z.string().describe("one short sentence justifying the action from the data"),
      }),
    )
    .describe("Aave actions to ADD on top of the rule-engine decisions; empty if nothing to do"),
});

const SYSTEM_PROMPT =
  "You are Dolfin's Aave strategist. Propose ONLY Aave actions that improve the portfolio " +
  "(yield, health factor, risk) and that fit strictly within the policy limits given. " +
  "Do not duplicate actions the rule engine already took. Use only allowed actions and tokens. " +
  "Each action's amountUsd must not exceed maxTradePerTxUsd. If nothing is worth doing, return an empty list.";

function allowedActionNames(cfg: OnchainConfig): AaveActionName[] {
  const mask = cfg.userPolicy.allowedActions[cfg.aave.pool] ?? 0n;
  const all: AaveActionName[] = ["SUPPLY", "WITHDRAW", "BORROW", "REPAY"];
  return all.filter((name) => (mask & actionBit(resolveAction(name) as ActionType)) !== 0n);
}

function allowedTokenSymbols(cfg: OnchainConfig): string[] {
  const allowed = new Set(cfg.userPolicy.allowedTokens.map((a) => a.toLowerCase()));
  return Object.values(cfg.tokens)
    .filter((t) => allowed.has(t.address.toLowerCase()))
    .map((t) => t.symbol);
}

function buildPrompt(state: AdvisorState, cfg: OnchainConfig, ruleDecisions: TradeDecision[]): string {
  const p = cfg.userPolicy;
  const taken = ruleDecisions.map((d) => `${d.actionType}:${d.tokenIn}`).join(", ") || "none";
  return [
    `Wallet: ${state.wallet}`,
    `Portfolio: ${JSON.stringify(state.portfolio ?? {})}`,
    `Risk: ${JSON.stringify(state.risk ?? {})}`,
    "",
    "POLICY LIMITS (hard caps, stay within these):",
    `- allowed actions: ${allowedActionNames(cfg).join(", ") || "none"}`,
    `- allowed tokens: ${allowedTokenSymbols(cfg).join(", ") || "none"}`,
    `- maxTradePerTxUsd: ${p.maxTradePerTxUsd}`,
    `- maxDailyVolumeUsd: ${p.maxDailyVolumeUsd}`,
    `- maxExposureUsd: ${p.maxExposureUsd}`,
    "",
    `Rule engine already decided (do NOT duplicate): ${taken}`,
    "",
    "Propose additional Aave actions within the limits, or an empty list.",
  ].join("\n");
}

// Rules win over AI proposals that collide on (actionType, tokenIn).
function isDuplicate(d: TradeDecision, ruleDecisions: TradeDecision[]): boolean {
  return ruleDecisions.some((r) => r.actionType === d.actionType && r.tokenIn === d.tokenIn);
}

// LLM-authored decisions, re-checked by ValidationNode and the on-chain PolicyManager.
// Any failure returns [] so the rule engine still drives the pipeline.
export async function deriveAiDecisions(
  state: AdvisorState,
  cfg: OnchainConfig,
  ruleDecisions: TradeDecision[],
  model?: ChatGoogleGenerativeAI,
): Promise<TradeDecision[]> {
  try {
    const llm =
      model ??
      new ChatGoogleGenerativeAI({ model: "gemini-2.0-flash-lite", apiKey: process.env.GOOGLE_API_KEY });
    const structured = llm.withStructuredOutput(AiDecisionSchema);
    const out = await structured.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(state, cfg, ruleDecisions) },
    ]);

    const decisions: TradeDecision[] = [];
    for (const a of out.actions) {
      const actionType = resolveAction(a.action);
      const token = resolveToken(a.token, cfg);
      // Skip tokens outside the registry; cap size at the per-tx limit.
      if (actionType === undefined || !token || a.amountUsd <= 0) continue;
      const amountUsd = Math.min(a.amountUsd, cfg.userPolicy.maxTradePerTxUsd);
      const d = makeAaveDecision(actionType, token, amountUsd, cfg, `[AI] ${a.reason}`);
      if (!isDuplicate(d, ruleDecisions)) decisions.push(d);
    }
    return decisions;
  } catch {
    return [];
  }
}
