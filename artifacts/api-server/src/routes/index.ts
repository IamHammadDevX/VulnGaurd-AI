import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import scanRouter from "./vulnguard/scan.js";
import scanStreamRouter from "./vulnguard/scan-stream.js";
import generateFixRouter from "./vulnguard/generate-fix.js";
import reportRouter from "./vulnguard/report.js";
import teamsRouter from "./teams.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(scanRouter);
router.use(scanStreamRouter);
router.use(generateFixRouter);
router.use(reportRouter);
router.use(teamsRouter);

export default router;
