import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL (or SUPABASE_DB_URL) must be set. Add your Supabase Postgres connection string.",
    );
  }
  return dbUrl;
}

function shouldUseSsl(connectionString: string): boolean {
  return /supabase\.(co|com)/i.test(connectionString);
}

const connectionString = getDatabaseUrl();

export const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
