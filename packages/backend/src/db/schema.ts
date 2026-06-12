import {
  bigint,
  bigserial,
  text,
  pgTable,
  timestamp,
  jsonb,
  varchar,
  uuid,
  boolean,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  wallet_address: text("wallet_address").unique(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const poolTable = pgTable("pool", {
  id: bigserial({ mode: "bigint" }).primaryKey(),
  symbol: varchar().notNull(),
  address: varchar().notNull().unique(),
  name: varchar().notNull(),
  image_url: varchar().notNull(),
});

export const poolHistoryTable = pgTable("pool_history", {
  id: uuid().primaryKey().defaultRandom(),
  pool_id: bigint({ mode: "bigint" })
    .notNull()
    .references(() => poolTable.id, { onDelete: "cascade" }),
  data: jsonb().notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// One row per (userId, smartAccount): the per-user policy mirror plus the session key the
// agent signs UserOperations with. enabled = false skips the scheduler; API runs still work.
export const agentConfigTable = pgTable(
  "agent_config",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    smart_account: varchar("smart_account").notNull(),
    enabled: boolean().notNull().default(false),
    // Session key encrypted at rest (AES-GCM envelope). Null means the agent is not runnable.
    session_key: text("session_key"),
    // Mirrors on-chain UserPolicy: maxTradePerTxUsd, maxDailyVolumeUsd, etc.
    policy: jsonb().notNull(),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userAccountUnique: uniqueIndex("agent_config_user_smart_account_unique").on(
      t.user_id,
      t.smart_account,
    ),
  }),
);

// One row per DolfinAgent.run() invocation.
export const agentRunTable = pgTable(
  "agent_run",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    smart_account: varchar("smart_account").notNull(),
    wallet: varchar().notNull(),
    started_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    finished_at: timestamp({ withTimezone: true }),
    status: varchar().notNull().default("running"),
    error: text(),
    advice: text(),
    risk_level: varchar("risk_level"),
    risk_score: numeric("risk_score"),
    portfolio_snapshot: jsonb("portfolio_snapshot"),
    // Decisions blocked by the policy mirror this run: [{ decision, errors }].
    rejected: jsonb("rejected"),
  },
  (t) => ({
    userStartedIdx: index("agent_run_user_started_idx").on(
      t.user_id,
      t.smart_account,
      t.started_at,
    ),
  }),
);

// One row per on-chain action submitted during a run.
export const agentActionTable = pgTable(
  "agent_action",
  {
    id: uuid().primaryKey().defaultRandom(),
    run_id: uuid("run_id")
      .notNull()
      .references(() => agentRunTable.id, { onDelete: "cascade" }),
    timestamp: timestamp({ withTimezone: true }).notNull().defaultNow(),
    action_type: varchar("action_type").notNull(),
    action_label: text("action_label").notNull(),
    protocol: varchar().notNull(),
    asset_symbol: varchar("asset_symbol"),
    asset_address: varchar("asset_address"),
    amount_raw: bigint("amount_raw", { mode: "bigint" }).notNull(),
    amount_usd: numeric("amount_usd"),
    transaction_hash: varchar("transaction_hash"),
    details: jsonb(),
  },
  (t) => ({
    runIdx: index("agent_action_run_idx").on(t.run_id),
  }),
);

export const poolRelations = relations(poolTable, ({ many }) => ({
  history: many(poolHistoryTable),
}));

export const userRelations = relations(userTable, ({ many }) => ({
  agentConfigs: many(agentConfigTable),
  agentRuns: many(agentRunTable),
}));

export const poolHistoryRelations = relations(poolHistoryTable, ({ one }) => ({
  pool: one(poolTable, {
    fields: [poolHistoryTable.pool_id],
    references: [poolTable.id],
  }),
}));

export const agentConfigRelations = relations(agentConfigTable, ({ one }) => ({
  user: one(userTable, {
    fields: [agentConfigTable.user_id],
    references: [userTable.id],
  }),
}));

export const agentRunRelations = relations(agentRunTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [agentRunTable.user_id],
    references: [userTable.id],
  }),
  actions: many(agentActionTable),
}));

export const agentActionRelations = relations(agentActionTable, ({ one }) => ({
  run: one(agentRunTable, {
    fields: [agentActionTable.run_id],
    references: [agentRunTable.id],
  }),
}));
