import process from "node:process";
import pg from "pg";

const { Client } = pg;

function getDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL (or SUPABASE_DB_URL) must be set before checking RLS status.",
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
    const rlsStatus = await client.query(`
      SELECT
        c.relname AS tablename,
        c.relrowsecurity AS rowsecurity,
        c.relforcerowsecurity AS forcerowsecurity,
        COUNT(p.policyname)::int AS policy_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_policies p
        ON p.schemaname = n.nspname
       AND p.tablename = c.relname
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
      GROUP BY c.relname, c.relrowsecurity, c.relforcerowsecurity
      ORDER BY c.relname;
    `);

    const policyStatus = await client.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);

    console.log("RLS status by table:");
    console.table(rlsStatus.rows);

    console.log("Policies in public schema:");
    console.table(policyStatus.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to check RLS status:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
