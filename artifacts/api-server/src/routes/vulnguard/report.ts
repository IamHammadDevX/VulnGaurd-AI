import { Router, type IRouter } from "express";
import { GetReportParams } from "@workspace/api-zod";
import { getScan } from "./store.js";

const router: IRouter = Router();

router.get("/report/:scanId", (req, res) => {
  const parseResult = GetReportParams.safeParse(req.params);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid scan ID" });
    return;
  }

  const { scanId } = parseResult.data;
  const scan = getScan(scanId);

  if (!scan) {
    res.status(404).json({ error: "Scan not found. Reports are session-based and expire when the server restarts." });
    return;
  }

  res.json(scan);
});

export default router;
