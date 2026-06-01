import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { Action, AdvisorState } from "../state.js";

/**
 * Synthesizes portfolio + risk + market into human-readable advice and a list
 * of recommended actions. Transaction encoding is left to a downstream step.
 */
export class AdvisorNode {
  constructor(private readonly model = google("gemini-2.0-flash")) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    const actions = this.deriveActions(state);

    const { text } = await generateText({
      model: this.model,
      system:
        "You are Dolfin, a DeFi portfolio advisor. Give concise, actionable advice. " +
        "Reference concrete numbers from the data. Never invent positions that are not present.",
      prompt: this.buildPrompt(state, actions),
    });

    return { advice: text, actions };
  };

  private deriveActions(state: AdvisorState): Action[] {
    const recs = state.risk?.recommendations ?? [];
    const priority =
      state.risk && state.risk.score >= 60
        ? "HIGH"
        : state.risk && state.risk.score >= 30
          ? "MEDIUM"
          : "LOW";

    return recs.map((description) => ({
      type: "RISK_MITIGATION",
      description,
      priority,
    }));
  }

  private buildPrompt(state: AdvisorState, actions: Action[]): string {
    return [
      `Wallet: ${state.wallet}`,
      `Portfolio: ${JSON.stringify(state.portfolio ?? {})}`,
      `Risk: ${JSON.stringify(state.risk ?? {})}`,
      `Market: ${JSON.stringify(state.market ?? {})}`,
      `Candidate actions: ${JSON.stringify(actions)}`,
      "",
      "Explain the current risk level and recommend what to do next.",
    ].join("\n");
  }
}
