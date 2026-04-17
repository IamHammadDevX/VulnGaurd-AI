import { logger } from "./logger.js";

/**
 * Self-pinging keep-alive for Render free tier.
 * Prevents backend from spinning down due to inactivity.
 * Only activates if ENABLE_KEEP_ALIVE=true is set.
 */
export function startKeepAlive(baseUrl: string) {
  const enabled = process.env["ENABLE_KEEP_ALIVE"]?.toLowerCase() === "true";
  
  if (!enabled) {
    logger.info("Keep-alive disabled. Use ENABLE_KEEP_ALIVE=true to enable self-pinging.");
    return;
  }

  if (!baseUrl) {
    logger.warn("ENABLE_KEEP_ALIVE=true but no base URL available. Skipping keep-alive.");
    return;
  }

  const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
  const healthUrl = `${baseUrl}/api/healthz`;

  logger.info({ interval: `${interval / 1000}s`, url: healthUrl }, "Starting keep-alive pinger");

  setInterval(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(healthUrl, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        logger.debug("Keep-alive ping successful");
      } else {
        logger.warn({ status: response.status }, "Keep-alive ping returned non-200 status");
      }
    } catch (err) {
      logger.warn({ err: String(err) }, "Keep-alive ping failed");
    }
  }, interval);
}
