import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;

function getDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL (or SUPABASE_DB_URL) must be set before running RLS hardening.",
    );
  }
  return dbUrl;
}

function shouldUseSsl(connectionString) {
  return /supabase\.(co|com)/i.test(connectionString);
}

function normalizeConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("sslcert");
    url.searchParams.delete("sslkey");
    url.searchParams.delete("sslrootcert");
    return url.toString();
  } catch {
    return connectionString;
  }
}

async function main() {
  const sqlPath = path.resolve(import.meta.dirname, "..", "sql", "secure-rls.sql");
  const sql = await fs.readFile(sqlPath, "utf8");

  const rawConnectionString = getDatabaseUrl();
  const connectionString = normalizeConnectionString(rawConnectionString);
  const client = new Client({
    connectionString,
    ssl: shouldUseSsl(rawConnectionString)
      ? {
          rejectUnauthorized: false,
        }
      : false,
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log("RLS hardening applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to apply RLS hardening:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
