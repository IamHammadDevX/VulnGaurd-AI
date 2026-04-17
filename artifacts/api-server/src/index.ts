import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", "..", ".env"),
  path.resolve(import.meta.dirname, "..", "..", "..", ".env"),
  path.resolve(import.meta.dirname, "..", "..", "..", "..", ".env"),
];

for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const { default: app } = await import("./app");
const { logger } = await import("./lib/logger");
const { startKeepAlive } = await import("./lib/keepAlive.js");

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  
  // Start keep-alive pinger if enabled (Render free tier protection)
  const protocol = process.env["HTTPS"] === "true" ? "https" : "http";
  const host = process.env["RENDER_EXTERNAL_HOSTNAME"] || `localhost:${port}`;
  const baseUrl = `${protocol}://${host}`;
  startKeepAlive(baseUrl);
});
