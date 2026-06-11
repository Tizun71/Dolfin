import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { getLogger } from "@logtape/logtape";
import db from "../../db/index.js";
import { agentActionTable, agentConfigTable, agentRunTable, userTable } from "../../db/schema.js";
import { agentManager } from "./agent-manager.js";
import { AgentConfigNotFoundError } from "./create-dolfin-agent.js";
import { encryptSessionKey } from "./session-key-crypto.js";
import { readCrossChainPortfolio } from "./cross-chain-portfolio.js";
import type { Address } from "viem";

const logger = getLogger(["dolfin", "agent-api"]);

const agentModule = new Hono();

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address");

const userIdSchema = z
  .string()
  .min(1, "userId required")
  .max(128);

const policySchema = z
  .object({
    maxTradePerTxUsd: z.number().positive().optional(),
    maxDailyVolumeUsd: z.number().positive().optional(),
    maxExposureUsd: z.number().positive().optional(),
    maxLossPerDayUsd: z.number().positive().optional(),
    expiryDays: z.number().int().positive().max(365).optional(),
    allowedTokens: z.array(addressSchema).optional(),
    allowedActions: z.record(addressSchema, z.string()).optional(),
    adapters: z.record(addressSchema, addressSchema).optional(),
  })
  .partial();

const configBodySchema = z.object({
  enabled: z.boolean().optional(),
  sessionKey: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "sessionKey must be a 0x-prefixed 32-byte hex")
    .nullable()
    .optional(),
  policy: policySchema.optional(),
});

const runBodySchema = z
  .object({
    wallet: addressSchema.optional(),
  })
  .optional();

const paginationSchema = z.object({
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  pageIndex: z.coerce.number().int().min(0).default(0),
});

const paramsSchema = z.object({
  userId: userIdSchema,
  smartAccount: addressSchema,
});

const runParamsSchema = z.object({
  userId: userIdSchema,
  smartAccount: addressSchema,
  runId: z.string().uuid(),
});

// --- Config endpoints ---

agentModule.get(
  "/:userId/:smartAccount/config",
  zValidator("param", paramsSchema),
  async (c) => {
    const { userId, smartAccount } = c.req.valid("param");
    const rows = await db
      .select()
      .from(agentConfigTable)
      .where(and(eq(agentConfigTable.user_id, userId), eq(agentConfigTable.smart_account, smartAccount)))
      .limit(1);
    if (rows.length === 0) {
      return c.json({ error: "agent_config not found" }, 404);
    }
    const row = rows[0];
    return c.json({
      id: row.id,
      userId: row.user_id,
      smartAccount: row.smart_account,
      enabled: row.enabled,
      // sessionKey is a private key: never returned. `hasSessionKey` lets the FE know one is set.
      hasSessionKey: row.session_key != null,
      policy: row.policy,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  },
);

agentModule.put(
  "/:userId/:smartAccount/config",
  zValidator("param", paramsSchema),
  zValidator("json", configBodySchema),
  async (c) => {
    const { userId, smartAccount } = c.req.valid("param");
    const body = c.req.valid("json");
    // Encrypt the session key at rest (AES-GCM). null clears it; undefined leaves it untouched.
    const encryptedKey =
      body.sessionKey == null ? body.sessionKey : encryptSessionKey(body.sessionKey);
    // agent_config.user_id is a FK to user.id. userId here is the owner EOA address, so ensure a
    // matching user row exists before inserting the config (idempotent).
    await db
      .insert(userTable)
      .values({ id: userId, wallet_address: userId })
      .onConflictDoNothing();
    const existing = await db
      .select({ id: agentConfigTable.id })
      .from(agentConfigTable)
      .where(and(eq(agentConfigTable.user_id, userId), eq(agentConfigTable.smart_account, smartAccount)))
      .limit(1);

    if (existing.length === 0) {
      const inserted = await db
        .insert(agentConfigTable)
        .values({
          user_id: userId,
          smart_account: smartAccount,
          enabled: body.enabled ?? false,
          session_key: encryptedKey ?? null,
          policy: body.policy ?? {},
        })
        .returning();
      agentManager.remove(userId, smartAccount);
      return c.json({ id: inserted[0].id, created: true });
    }

    const updates: Partial<typeof agentConfigTable.$inferInsert> = {
      updated_at: new Date(),
    };
    if (body.enabled !== undefined) updates.enabled = body.enabled;
    if (body.sessionKey !== undefined) updates.session_key = encryptedKey;
    if (body.policy !== undefined) updates.policy = body.policy;
    await db
      .update(agentConfigTable)
      .set(updates)
      .where(eq(agentConfigTable.id, existing[0].id));
    agentManager.remove(userId, smartAccount);
    return c.json({ id: existing[0].id, created: false });
  },
);

agentModule.delete(
  "/:userId/:smartAccount/config",
  zValidator("param", paramsSchema),
  async (c) => {
    const { userId, smartAccount } = c.req.valid("param");
    const deleted = await db
      .delete(agentConfigTable)
      .where(and(eq(agentConfigTable.user_id, userId), eq(agentConfigTable.smart_account, smartAccount)))
      .returning({ id: agentConfigTable.id });
    // Drop the cached agent so the cron/manual run stops serving this (now gone) config.
    agentManager.remove(userId, smartAccount);
    if (deleted.length === 0) {
      return c.json({ error: "agent_config not found" }, 404);
    }
    return c.json({ id: deleted[0].id, deleted: true });
  },
);

// --- Cross-chain portfolio (read-only) ---

// Aggregates DeFi (Arb Sepolia) + tokenized equity (Robinhood Chain) for the same
// smart-account address. Pure read + allocation advice; no session key, no execution.
agentModule.get(
  "/:userId/:smartAccount/portfolio/cross-chain",
  zValidator("param", paramsSchema),
  async (c) => {
    const { smartAccount } = c.req.valid("param");
    try {
      const view = await readCrossChainPortfolio(smartAccount as Address);
      return c.json(view);
    } catch (e) {
      logger.error("cross-chain portfolio failed: {error}", { error: e });
      return c.json({ error: e instanceof Error ? e.message : "cross-chain read failed" }, 500);
    }
  },
);

// --- Run endpoints ---

agentModule.post(
  "/:userId/:smartAccount/run",
  zValidator("param", paramsSchema),
  zValidator("json", runBodySchema),
  async (c) => {
    const { userId, smartAccount } = c.req.valid("param");
    const body = c.req.valid("json") ?? {};
    const wallet = body.wallet ?? smartAccount;
    try {
      const outcome = await agentManager.run(userId, smartAccount, wallet);
      return c.json({
        runId: outcome.runId,
        wallet,
        state: serializeState(outcome.state),
      });
    } catch (e) {
      if (e instanceof AgentConfigNotFoundError) {
        return c.json({ error: e.message }, 404);
      }
      logger.error("agent run failed: {error}", { error: e });
      return c.json({ error: e instanceof Error ? e.message : "agent run failed" }, 500);
    }
  },
);

agentModule.get(
  "/:userId/:smartAccount/sessions/latest",
  zValidator("param", paramsSchema),
  async (c) => {
    const { userId, smartAccount } = c.req.valid("param");
    const runs = await db
      .select()
      .from(agentRunTable)
      .where(and(eq(agentRunTable.user_id, userId), eq(agentRunTable.smart_account, smartAccount)))
      .orderBy(desc(agentRunTable.started_at))
      .limit(1);
    if (runs.length === 0) return c.json({ run: null, actions: [] });
    const run = runs[0];
    const actions = await db.select().from(agentActionTable).where(eq(agentActionTable.run_id, run.id));
    return c.json({ run: serializeRun(run), actions: actions.map(serializeAction) });
  },
);

agentModule.get(
  "/:userId/:smartAccount/sessions",
  zValidator("param", paramsSchema),
  zValidator("query", paginationSchema),
  async (c) => {
    const { userId, smartAccount } = c.req.valid("param");
    const { pageSize, pageIndex } = c.req.valid("query");
    const offset = pageIndex * pageSize;
    const rows = await db
      .select({
        id: agentRunTable.id,
        wallet: agentRunTable.wallet,
        startedAt: agentRunTable.started_at,
        finishedAt: agentRunTable.finished_at,
        status: agentRunTable.status,
        advice: agentRunTable.advice,
        riskLevel: agentRunTable.risk_level,
        riskScore: agentRunTable.risk_score,
        actionCount: sql<number>`(SELECT COUNT(*) FROM ${agentActionTable} WHERE ${agentActionTable.run_id} = ${agentRunTable.id})`,
        rejectedCount: sql<number>`COALESCE(jsonb_array_length(${agentRunTable.rejected}), 0)`,
      })
      .from(agentRunTable)
      .where(and(eq(agentRunTable.user_id, userId), eq(agentRunTable.smart_account, smartAccount)))
      .orderBy(desc(agentRunTable.started_at))
      .limit(pageSize)
      .offset(offset);
    return c.json({
      page: { pageIndex, pageSize },
      items: rows.map((r) => ({
        id: r.id,
        wallet: r.wallet,
        startedAt: r.startedAt,
        finishedAt: r.finishedAt,
        status: r.status,
        advice: r.advice,
        riskLevel: r.riskLevel,
        riskScore: r.riskScore,
        actionCount: Number(r.actionCount),
        rejectedCount: Number(r.rejectedCount),
      })),
    });
  },
);

agentModule.get(
  "/:userId/:smartAccount/sessions/:runId",
  zValidator("param", runParamsSchema),
  async (c) => {
    const { userId, smartAccount, runId } = c.req.valid("param");
    const runs = await db
      .select()
      .from(agentRunTable)
      .where(and(
        eq(agentRunTable.id, runId),
        eq(agentRunTable.user_id, userId),
        eq(agentRunTable.smart_account, smartAccount),
      ))
      .limit(1);
    if (runs.length === 0) return c.json({ error: "run not found" }, 404);
    const run = runs[0];
    const actions = await db.select().from(agentActionTable).where(eq(agentActionTable.run_id, run.id));
    return c.json({ run: serializeRun(run), actions: actions.map(serializeAction) });
  },
);

// --- Serializers (BigInt → string for JSON) ---

type RunRow = typeof agentRunTable.$inferSelect;
type ActionRow = typeof agentActionTable.$inferSelect;

function serializeRun(row: RunRow) {
  return {
    id: row.id,
    userId: row.user_id,
    smartAccount: row.smart_account,
    wallet: row.wallet,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    error: row.error,
    advice: row.advice,
    riskLevel: row.risk_level,
    riskScore: row.risk_score,
    portfolioSnapshot: row.portfolio_snapshot,
    rejected: row.rejected ?? [],
  };
}

function serializeAction(row: ActionRow) {
  return {
    id: row.id,
    runId: row.run_id,
    timestamp: row.timestamp,
    action: row.action_label,
    actionType: row.action_type,
    details: {
      asset: row.asset_symbol,
      assetAddress: row.asset_address,
      amount: row.amount_raw.toString(),
      amountUsd: row.amount_usd,
      protocol: row.protocol,
      transactionHash: row.transaction_hash,
      extra: row.details,
    },
  };
}

function serializeState(state: import("./state.js").AdvisorState) {
  return {
    wallet: state.wallet,
    portfolio: state.portfolio,
    risk: state.risk,
    advice: state.advice,
    validDecisions: state.validDecisions?.map((d) => ({
      ...d,
      amount: d.amount.toString(),
    })),
    // Decisions dropped by the client-side policy mirror, with the reasons why.
    // Surfaced so the UI can show "executed vs rejected (+ reason)" side by side.
    rejected: state.rejected?.map((r) => ({
      decision: { ...r.decision, amount: r.decision.amount.toString() },
      errors: r.errors,
    })),
    userOpHashes: state.userOpHashes ?? [],
    transactions: state.transactions ?? [],
  };
}

export default agentModule;
