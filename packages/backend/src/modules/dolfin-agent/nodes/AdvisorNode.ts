import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AdvisorState } from "../state.js";

const SYSTEM_PROMPT =
  "You are Dolfin, a DeFi portfolio advisor. Explain the situation and the recommended " +
  "actions that were already decided by the rule engine. Reference concrete numbers from " +
  "the data. Never invent positions or actions that are not present in the provided data.";

/**
 * Explain-only sink: narrates portfolio + risk + market + the rule-engine's decisions
 * into human-readable advice. It NEVER authors actions — those come from the Strategy node.
 * Transaction encoding/execution is handled by downstream Planner/Executor nodes.
 */
export class AdvisorNode {
  private model?: ChatGoogleGenerativeAI;

  constructor(model?: ChatGoogleGenerativeAI) {
    this.model = model;
  }

  /**
   * Lazy-init the LLM client. Constructing ChatGoogleGenerativeAI throws when
   * GOOGLE_API_KEY is missing — doing it here (inside execute's try/catch) keeps
   * a config issue from killing the whole pipeline before the run is persisted.
   */
  private getModel(): ChatGoogleGenerativeAI {
    if (!this.model) {
      this.model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash-lite",
        apiKey: process.env.GOOGLE_API_KEY,
      });
    }
    return this.model;
  }

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    try {
      const response = await this.getModel().invoke([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: this.buildPrompt(state) },
      ]);
      return { advice: String(response.content) };
    } catch (err) {
      // Narration is non-critical and runs AFTER execution — never fail the pipeline on it.
      const reason = err instanceof Error ? err.message : String(err);
      return { advice: `${this.fallbackAdvice(state)}\n\n(LLM narration unavailable: ${reason})` };
    }
  };

  /** Deterministic summary when the LLM is unavailable. */
  private fallbackAdvice(state: AdvisorState): string {
    const done = (state.validDecisions ?? []).map((d) => d.reason ?? d.actionType).join("; ") || "no actions";
    const dropped = (state.rejected ?? []).length;
    return `Risk ${state.risk?.level ?? "?"}. Executed: ${done}. Rejected: ${dropped}.`;
  }

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
