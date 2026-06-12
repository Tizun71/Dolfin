import { ActionType, type Address, type TradeDecision } from "@dolfin/onchain";
import { formatUnits } from "viem";
import { eq } from "drizzle-orm";
import db from "../../db/index.js";
import { agentActionTable, agentRunTable } from "../../db/schema.js";
import type { AdvisorState, PortfolioSnapshot, RiskReport } from "./state.js";
import { ADDRESSES, type TokenInfo, type OnchainConfig } from "./config/onchain-config.js";

export interface RunRecordInput {
  id?: string;
  userId: string;
  smartAccount: string;
  wallet: string;
  startedAt: Date;
  state: AdvisorState;
}

export interface PersistedAction {
  runId: string;
  actionType: string;
  actionLabel: string;
  protocol: string;
  assetSymbol: string | null;
  assetAddress: string | null;
  amountRaw: string;
  amountUsd: number | null;
  transactionHash: string | null;
  details: Record<string, unknown>;
}

function protocolNameFor(address: string, cfg: OnchainConfig): string {
  if (address.toLowerCase() === cfg.aave.pool.toLowerCase()) return "AAVE";
  if (address.toLowerCase() === ADDRESSES.aavePool.toLowerCase()) return "AAVE";
  return address;
}

const ACTION_VERB: Record<number, string> = {
  [ActionType.SWAP]: "Swap",
  [ActionType.SUPPLY]: "Supply",
  [ActionType.WITHDRAW]: "Withdraw",
  [ActionType.BORROW]: "Borrow",
  [ActionType.REPAY]: "Repay",
  [ActionType.OPEN_PERP]: "Open perp",
  [ActionType.CLOSE_PERP]: "Close perp",
};

const ACTION_TYPE_NAME: Record<number, string> = {
  [ActionType.SWAP]: "SWAP",
  [ActionType.SUPPLY]: "SUPPLY",
  [ActionType.WITHDRAW]: "WITHDRAW",
  [ActionType.BORROW]: "BORROW",
  [ActionType.REPAY]: "REPAY",
  [ActionType.OPEN_PERP]: "OPEN_PERP",
  [ActionType.CLOSE_PERP]: "CLOSE_PERP",
};

function findTokenInfo(addr: Address, cfg: OnchainConfig): TokenInfo | undefined {
  const lower = addr.toLowerCase();
  return Object.values(cfg.tokens).find((t) => t.address.toLowerCase() === lower);
}

function formatAmount(amount: bigint, token: TokenInfo | undefined): string {
  if (!token) return amount.toString();
  return formatUnits(amount, token.decimals);
}

// e.g. "Supply 100 USDC to AAVE".
export function labelAction(decision: TradeDecision, cfg: OnchainConfig): string {
  const verb = ACTION_VERB[decision.actionType] ?? "Act";
  const token = findTokenInfo(decision.tokenIn, cfg);
  const symbol = token?.symbol ?? "tokens";
  const amount = formatAmount(decision.amount, token);
  const protocol = protocolNameFor(decision.protocol, cfg);
  return `${verb} ${amount} ${symbol} to ${protocol}`;
}

function amountUsd(amount: bigint, token: TokenInfo | undefined): number | null {
  if (!token) return null;
  const human = Number(formatUnits(amount, token.decimals));
  return human * token.priceUsd;
}

// Zip validDecisions with the parallel userOpHashes and transactions arrays. A decision
// with no hash is still recorded with transactionHash = null.
export function buildActionRecords(
  runId: string,
  state: AdvisorState,
  cfg: OnchainConfig,
): PersistedAction[] {
  const decisions = state.validDecisions ?? [];
  const hashes = state.userOpHashes ?? [];
  const txs = state.transactions ?? [];
  return decisions.map((decision, i) => {
    const token = findTokenInfo(decision.tokenIn, cfg);
    const label = labelAction(decision, cfg);
    return {
      runId,
      actionType: ACTION_TYPE_NAME[decision.actionType] ?? `ACTION_${decision.actionType}`,
      actionLabel: label,
      protocol: protocolNameFor(decision.protocol, cfg),
      assetSymbol: token?.symbol ?? null,
      assetAddress: decision.tokenIn,
      amountRaw: decision.amount.toString(),
      amountUsd: amountUsd(decision.amount, token),
      transactionHash: txs[i] ?? null,
      details: {
        reason: decision.reason ?? null,
        userOpHash: hashes[i] ?? null,
        tokenOut: decision.tokenOut,
        protocol: decision.protocol,
        adapter: decision.adapter,
      },
    };
  });
}

function pickPortfolioSnapshot(state: AdvisorState): PortfolioSnapshot | undefined {
  return state.portfolio;
}

function pickRisk(state: AdvisorState): RiskReport | undefined {
  return state.risk;
}

export async function createRunRecord(input: RunRecordInput): Promise<string> {
  const { userId, smartAccount, wallet, startedAt, state } = input;
  const portfolio = pickPortfolioSnapshot(state);
  const risk = pickRisk(state);
  const inserted = await db
    .insert(agentRunTable)
    .values({
      user_id: userId,
      smart_account: smartAccount,
      wallet,
      started_at: startedAt,
      status: "running",
      portfolio_snapshot: portfolio ?? null,
      risk_level: risk?.level ?? null,
      risk_score: risk?.score != null ? String(risk.score) : null,
    })
    .returning({ id: agentRunTable.id });
  return inserted[0].id;
}

export async function finalizeRunRecord(
  runId: string,
  result: AdvisorState,
  finishedAt: Date,
  error?: unknown,
): Promise<void> {
  const status = error ? "failed" : "succeeded";
  const errMsg = error instanceof Error ? error.message : error ? String(error) : null;
  // Persist rejected decisions (amount bigint to string) so the dashboard can count
  // guardrail blocks, not just the live /run response.
  const rejected = (result.rejected ?? []).map((r) => ({
    decision: {
      actionType: r.decision.actionType,
      amount: r.decision.amount.toString(),
      tokenIn: r.decision.tokenIn,
      reason: r.decision.reason ?? null,
    },
    errors: r.errors,
  }));
  await db
    .update(agentRunTable)
    .set({
      finished_at: finishedAt,
      status,
      error: errMsg,
      advice: result.advice ?? null,
      risk_level: result.risk?.level ?? null,
      risk_score: result.risk?.score != null ? String(result.risk.score) : null,
      portfolio_snapshot: result.portfolio ?? null,
      rejected,
    })
    .where(eq(agentRunTable.id, runId));
}

export async function persistActions(records: PersistedAction[]): Promise<void> {
  if (records.length === 0) return;
  await db.insert(agentActionTable).values(
    records.map((r) => ({
      run_id: r.runId,
      action_type: r.actionType,
      action_label: r.actionLabel,
      protocol: r.protocol,
      asset_symbol: r.assetSymbol,
      asset_address: r.assetAddress,
      amount_raw: BigInt(r.amountRaw),
      amount_usd: r.amountUsd != null ? String(r.amountUsd) : null,
      transaction_hash: r.transactionHash,
      details: r.details,
    })),
  );
}
