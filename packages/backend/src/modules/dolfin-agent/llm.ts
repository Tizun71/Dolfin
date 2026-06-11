import { ChatOpenAI } from "@langchain/openai";

// Single source of truth for the agent's LLM client. Routes through OpenRouter
// (OpenAI-compatible API). Swap the model via OPENROUTER_MODEL without code changes.
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "google/gemini-2.0-flash-lite-001";

export type AgentLlm = ChatOpenAI;

export function createLlm(): AgentLlm {
  return new ChatOpenAI({
    model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: { baseURL: OPENROUTER_BASE_URL },
  });
}
