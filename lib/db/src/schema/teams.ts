import { sql } from "drizzle-orm";
import { index, integer, pgTable, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const teamsTable = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  image: varchar("image"),
  ownerId: varchar("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const teamMembersTable = pgTable(
  "team_members",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    teamId: varchar("team_id")
      .notNull()
      .references(() => teamsTable.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: varchar("role").notNull().default("viewer"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_team_members_team").on(table.teamId),
    index("idx_team_members_user").on(table.userId),
    unique("uq_team_members_team_user").on(table.teamId, table.userId),
  ],
);

export const apiKeysTable = pgTable(
  "api_keys",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    teamId: varchar("team_id").references(() => teamsTable.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    key: varchar("key").unique().notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    rateLimit: integer("rate_limit").notNull().default(1000),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [index("idx_api_keys_user").on(table.userId)],
);

export type Team = typeof teamsTable.$inferSelect;
export type InsertTeam = typeof teamsTable.$inferInsert;
export type TeamMember = typeof teamMembersTable.$inferSelect;
export type InsertTeamMember = typeof teamMembersTable.$inferInsert;
export type ApiKey = typeof apiKeysTable.$inferSelect;
