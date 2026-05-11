import { bigserial, pgTable, timestamp, jsonb, varchar, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const poolTable = pgTable("pool", {
  id: bigserial({ mode: "bigint" }).primaryKey(),
  symbol: varchar().notNull(),
  address: varchar().notNull().unique(),
  name: varchar().notNull(),
  image_url: varchar().notNull(),
});

export const poolHistoryTable = pgTable("pool_history", {
  id: uuid().primaryKey().defaultRandom(),
  pool_id: bigserial({ mode: "bigint" })
    .notNull()
    .references(() => poolTable.id, { onDelete: "cascade" }),
  data: jsonb().notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const poolRelations = relations(poolTable, ({ many }) => ({
  history: many(poolHistoryTable),
}));

export const poolHistoryRelations = relations(poolHistoryTable, ({ one }) => ({
  pool: one(poolTable, {
    fields: [poolHistoryTable.pool_id],
    references: [poolTable.id],
  }),
}));
