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

export const strategyInstanceTable = pgTable("strategy", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: text()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  enabled: boolean().notNull().default(false),
  logs: jsonb().notNull().default([]),
});

export const poolRelations = relations(poolTable, ({ many }) => ({
  history: many(poolHistoryTable),
}));

export const userRelations = relations(userTable, ({ many }) => ({
  strategyInstances: many(strategyInstanceTable),
}));

export const poolHistoryRelations = relations(poolHistoryTable, ({ one }) => ({
  pool: one(poolTable, {
    fields: [poolHistoryTable.pool_id],
    references: [poolTable.id],
  }),
}));

export const strategyRelations = relations(strategyInstanceTable, ({ one }) => ({
  user: one(userTable, {
    fields: [strategyInstanceTable.user_id],
    references: [userTable.id],
  }),
}));
