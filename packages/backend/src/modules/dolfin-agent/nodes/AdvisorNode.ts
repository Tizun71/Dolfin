import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { AdvisorState } from "../state.js";

/**
 * Explain-only sink: narrates portfolio + risk + market + the rule-engine's decisions
 * into human-readable advice. It NEVER authors actions — those come from the Strategy node.
 * Transaction encoding/execution is handled by downstream Planner/Executor nodes.
 */
export class AdvisorNode {
  constructor(private readonly model = google("gemini-2.0-flash")) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    const { text } = await generateText({
      model: this.model,
      system:
        "You are Dolfin, a DeFi portfolio advisor. Explain the situation and the recommended " +
        "actions that were already decided by the rule engine. Reference concrete numbers from " +
        "the data. Never invent positions or actions that are not present in the provided data.",
      prompt: this.buildPrompt(state),
    });

    return { advice: text };
  };

  private buildPrompt(state: AdvisorState): string {
    return [
      `Wallet: ${state.wallet}`,
      `Portfolio: ${JSON.stringify(state.portfolio ?? {})}`,
      `Risk: ${JSON.stringify(state.risk ?? {})}`,
      `Market: ${JSON.stringify(state.market ?? {})}`,
      `Decided actions: ${JSON.stringify(state.validDecisions ?? [], bigintReplacer)}`,
      `Rejected actions: ${JSON.stringify(state.rejected ?? [], bigintReplacer)}`,
      "",
      "Explain the current risk level and why these actions are recommended.",
    ].join("\n");
  }
}

/** TradeDecision.amount is a bigint; make it JSON-serializable for the prompt. */
function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}
