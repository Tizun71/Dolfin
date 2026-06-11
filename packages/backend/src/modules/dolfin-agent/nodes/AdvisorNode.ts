import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { AdvisorState } from "../state.js";

const SYSTEM_PROMPT =
  "You are Dolfin, a DeFi portfolio advisor. Explain the situation and the recommended " +
  "actions that were already decided by the rule engine. Always cite concrete numbers from " +
  "the data (health factor, debt USD, collateral USD, APY, trade sizes). Never invent positions " +
  "or actions not present in the data. Answer in exactly three short labelled parts:\n" +
  "Situation: <portfolio + risk in numbers>\n" +
  "Actions: <what was executed / rejected, with sizes>\n" +
  "Why: <one-sentence rationale tied to the numbers>";

// Explain-only sink: narrates portfolio, risk, market and the rule-engine decisions into
// human-readable advice. It does not author actions or execute anything.
export class AdvisorNode {
  private model?: ChatGoogleGenerativeAI;

  constructor(model?: ChatGoogleGenerativeAI) {
    this.model = model;
  }

  // Lazy-init the LLM client. The constructor throws when GOOGLE_API_KEY is missing, so
  // deferring it to here (inside execute's try/catch) keeps a config issue from killing
  // the pipeline before the run is persisted.
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
      // Narration runs after execution and is non-critical, so never fail the pipeline on it.
      const reason = err instanceof Error ? err.message : String(err);
      return { advice: `${this.fallbackAdvice(state)}\n\n(LLM narration unavailable: ${reason})` };
    }
  };

  // Deterministic summary when the LLM is unavailable.
  private fallbackAdvice(state: AdvisorState): string {
    const done = (state.validDecisions ?? []).map((d) => d.reason ?? d.actionType).join("; ") || "no actions";
    const dropped = (state.rejected ?? []).length;
    return `Risk ${state.risk?.level ?? "?"}. Executed: ${done}. Rejected: ${dropped}.`;
  }

  private buildPrompt(state: AdvisorState): string {
    const lending = state.portfolio?.lending;
    const lendingLine = lending
      ? `Lending: healthFactor=${lending.healthFactor}, collateralUsd=${lending.collateralUsd}, debtUsd=${lending.debtUsd}`
      : "Lending: no Aave position";
    return [
      `Wallet: ${state.wallet}`,
      `Portfolio: ${JSON.stringify(state.portfolio ?? {})}`,
      lendingLine,
      `Risk: ${JSON.stringify(state.risk ?? {})}`,
      `Market: ${JSON.stringify(state.market ?? {})}`,
      `Executed actions: ${JSON.stringify(state.validDecisions ?? [], bigintReplacer)}`,
      `Rejected actions (blocked by policy): ${JSON.stringify(state.rejected ?? [], bigintReplacer)}`,
      "",
      "Explain in the Situation/Actions/Why format. Cite the health factor and trade sizes explicitly.",
    ].join("\n");
  }
}

// TradeDecision.amount is a bigint; make it JSON-serializable for the prompt.
function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}
