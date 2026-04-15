import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

const candidateEnvFiles = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", "..", ".env"),
];

for (const envFile of candidateEnvFiles) {
  loadEnv({ path: envFile, override: false });
}

const databaseUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL (or SUPABASE_DB_URL) must be set. Use your Supabase Postgres connection string.",
  );
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
