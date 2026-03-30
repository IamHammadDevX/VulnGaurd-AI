import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { teamsTable } from "./teams";

export const scansTable = pgTable(
  "scans",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    teamId: varchar("team_id").references(() => teamsTable.id, { onDelete: "cascade" }),
    contractName: varchar("contract_name").notNull(),
    contractCode: text("contract_code").notNull(),
    contractHash: varchar("contract_hash").notNull(),
    riskScore: integer("risk_score").notNull().default(0),
    status: varchar("status").notNull().default("completed"),
    vulnerabilities: jsonb("vulnerabilities").notNull().default(sql`'[]'::jsonb`),
    summary: text("summary"),
    executionTime: integer("execution_time"),
    modelUsed: varchar("model_used").default("anthropic/claude-3.7-sonnet"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_scans_user").on(table.userId),
    index("idx_scans_team").on(table.teamId),
    index("idx_scans_hash").on(table.contractHash),
  ],
);

export type Scan = typeof scansTable.$inferSelect;
export type InsertScan = typeof scansTable.$inferInsert;
