// Client for the backend Dolfin agent API (packages/backend, /agent/*). Keeps the
// autonomous cron agent in sync with on-chain session lifecycle: after each owner tx
// (create/rotate/revoke/edit) the FE pushes the session key + policy + enabled state here.
// Backend keys config on `userId:smartAccount`; userId = owner EOA address (lowercased).
import { type Address } from "viem";
import { type BackendAgentPolicy } from "./policy-to-backend";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

function base(): string {
  if (!BASE) throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
  return BASE.replace(/\/$/, "");
}

function configPath(owner: Address, account: Address): string {
  return `${base()}/agent/${owner.toLowerCase()}/${account.toLowerCase()}`;
}

async function expectOk(res: Response, action: string): Promise<unknown> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${action} failed (${res.status}): ${text}`);
  }
  return res.json().catch(() => ({}));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Retry transient failures (network down, 5xx). 4xx are caller/validation errors, so fail
// fast. The on-chain tx already committed by the time we sync, so a flaky backend must not
// silently leave the agent unconfigured.
async function putWithRetry(url: string, body: string, attempts = 3): Promise<void> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body,
      });
      if (res.ok) return;
      // Client error: no point retrying.
      if (res.status >= 400 && res.status < 500) {
        const text = await res.text().catch(() => "");
        throw new Error(`sync agent config failed (${res.status}): ${text}`);
      }
      lastErr = new Error(`sync agent config failed (${res.status})`);
    } catch (e) {
      lastErr = e;
    }
    if (i < attempts - 1) await sleep(300 * 3 ** i); // 300ms, 900ms
  }
  throw lastErr instanceof Error ? lastErr : new Error("sync agent config failed");
}

// Partial config update. Pass only what changed. sessionKey is a 0x 32-byte private key
// (or null to clear). Never log this object: it carries the private key.
export interface AgentConfigPatch {
  enabled?: boolean;
  sessionKey?: `0x${string}` | null;
  policy?: BackendAgentPolicy;
}

export async function syncAgentConfig(
  owner: Address,
  account: Address,
  patch: AgentConfigPatch,
): Promise<void> {
  await putWithRetry(`${configPath(owner, account)}/config`, JSON.stringify(patch));
}

export interface AgentConfigView {
  enabled: boolean;
  hasSessionKey: boolean;
  policy: unknown;
}

// Read current backend config. Returns null when none exists (404); reconciliation uses this
// to detect divergence (e.g. on-chain grant succeeded but a prior sync never landed).
export async function getAgentConfig(
  owner: Address,
  account: Address,
): Promise<AgentConfigView | null> {
  const res = await fetch(`${configPath(owner, account)}/config`);
  if (res.status === 404) return null;
  return (await expectOk(res, "get agent config")) as AgentConfigView;
}

// Delete the backend agent config (row + cached instance). 404 counts as success since the
// goal (no config) is already met. Other failures throw so the caller can surface them.
export async function deleteAgentConfig(owner: Address, account: Address): Promise<void> {
  const res = await fetch(`${configPath(owner, account)}/config`, { method: "DELETE" });
  if (res.ok || res.status === 404) return;
  const text = await res.text().catch(() => "");
  throw new Error(`delete agent config failed (${res.status}): ${text}`);
}

// Lending position mirrored from backend PortfolioSnapshot.lending.
export interface LendingView {
  collateralUsd: number;
  debtUsd: number;
  healthFactor: number;
}

// A strategy decision blocked by the client-side policy mirror (and the on-chain
// PolicyManager). `errors` are the human-readable reasons it was rejected.
export interface RejectedDecisionView {
  decision: { actionType: number; amount: string; tokenIn: string; reason?: string };
  errors: string[];
}

// Live state returned by POST /run, richer than the persisted session row: it carries
// `rejected`, which the DB history does not store.
export interface RunState {
  advice?: string;
  portfolio?: { lending?: LendingView };
  rejected?: RejectedDecisionView[];
  validDecisions?: { actionType: number; amount: string; reason?: string }[];
  transactions?: string[];
}

export interface RunResponse {
  runId: string;
  wallet: string;
  state: RunState;
}

export async function runAgent(owner: Address, account: Address): Promise<RunResponse> {
  const res = await fetch(`${configPath(owner, account)}/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  return (await expectOk(res, "run agent")) as RunResponse;
}

export async function getLatestSession(owner: Address, account: Address): Promise<unknown> {
  const res = await fetch(`${configPath(owner, account)}/sessions/latest`);
  return expectOk(res, "get latest session");
}

// One row in the paginated session list (mirrors the backend sessions list serializer).
export interface SessionListItem {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  advice: string | null;
  riskLevel: string | null;
  riskScore: string | null;
  actionCount: number;
  rejectedCount: number;
}

export interface SessionList {
  page: { pageIndex: number; pageSize: number };
  items: SessionListItem[];
}

export async function getSessions(
  owner: Address,
  account: Address,
  pageSize = 50,
): Promise<SessionList> {
  const res = await fetch(`${configPath(owner, account)}/sessions?pageSize=${pageSize}`);
  return (await expectOk(res, "get sessions")) as SessionList;
}

// Full detail for one run: the run row (incl. persisted `rejected`) plus its action rows.
// Mirrors the /sessions/latest shape.
export async function getSession(
  owner: Address,
  account: Address,
  runId: string,
): Promise<unknown> {
  const res = await fetch(`${configPath(owner, account)}/sessions/${runId}`);
  return expectOk(res, "get session");
}

// --- Cross-chain portfolio (read-only): DeFi (Arb) + tokenized equity (Robinhood) ---

interface ChainPortfolio {
  totalValueUsd: number;
  assets: { symbol: string; valueUsd: number }[];
  lending?: LendingView;
}

export interface CrossChainPortfolio {
  defi: { chainId: number; portfolio: ChainPortfolio };
  equity: { chainId: number; portfolio: ChainPortfolio };
  totalValueUsd: number;
  allocation: { stablePct: number; equityPct: number };
  advice?: string;
}

export async function getCrossChainPortfolio(
  owner: Address,
  account: Address,
): Promise<CrossChainPortfolio> {
  const res = await fetch(`${configPath(owner, account)}/portfolio/cross-chain`);
  return (await expectOk(res, "get cross-chain portfolio")) as CrossChainPortfolio;
}
