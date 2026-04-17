import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const handler = (_req: any, res: any) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
};

// Main health endpoint
router.get("/healthz", handler);

// Alias for typos/convenience
router.get("/health", handler);
router.get("/healths", handler);

export default router;
