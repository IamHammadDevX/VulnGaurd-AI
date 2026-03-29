import { Router, type IRouter } from "express";
import { createHash } from "crypto";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { ScanContractBody } from "@workspace/api-zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";
import { storeScan } from "./store.js";
import * as zod from "zod";

const router: IRouter = Router();

// ── Zod schema for AI response ────────────────────────────────────────────────
const VulnerabilityAI = zod.object({
  id: zod.number().optional(),
  type: zod.string(),
  severity: zod.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  swc_id: zod.string().nullable().optional(),
  line_number: zod.number().nullable().optional(),
  affected_lines: zod.string().nullable().optional(),
  affected_functions: zod.string().nullable().optional(),
  title: zod.string(),
  description: zod.string(),
  technical_risk: zod.string(),
  attack_scenario: zod.string().nullable().optional(),
  impact: zod.string().nullable().optional(),
  gas_impact: zod.string().nullable().optional(),
  vulnerable_code: zod.string().nullable().optional(),
  fixed_code: zod.string().nullable().optional(),
  recommendation: zod.string(),
});

const AIResponseSchema = zod.object({
  contract_name: zod.string().optional(),
  total_vulnerabilities: zod.number().optional(),
  risk_score: zod.number().optional(),
  vulnerabilities: zod.array(VulnerabilityAI).optional(),
  summary: zod.string().optional(),
});

// ── SSE helpers ───────────────────────────────────────────────────────────────
function sseWrite(res: import("express").Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ── Scanning stage messages (shown while Claude processes) ────────────────────
const STAGES = [
  { ms: 0,    msg: "Parsing Solidity abstract syntax tree..." },
  { ms: 3000, msg: "Checking access control patterns..." },
  { ms: 6000, msg: "Analyzing reentrancy attack vectors..." },
  { ms: 9000, msg: "Scanning arithmetic for overflows..." },
  { ms: 12000, msg: "Evaluating external call safety..." },
  { ms: 16000, msg: "Inspecting oracle & flash loan risks..." },
  { ms: 20000, msg: "Checking storage layout & proxy patterns..." },
  { ms: 25000, msg: "Running final comprehensive audit..." },
  { ms: 30000, msg: "Claude is deep-auditing the contract..." },
  { ms: 40000, msg: "Almost there — finalizing analysis..." },
];

// ── POST /scan-stream ─────────────────────────────────────────────────────────
router.post("/scan-stream", async (req, res) => {
  const startTime = Date.now();

  const parseResult = ScanContractBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { code, contractName } = parseResult.data;

  if (!code || code.trim().length === 0) {
    res.status(400).json({ error: "Solidity code is required" });
    return;
  }

  if (code.length > 50000) {
    res.status(400).json({ error: "Contract code too large (max 50KB)" });
    return;
  }

  // ── SSE setup ──
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // ── Stage progress timer ──
  const stageTimers: ReturnType<typeof setTimeout>[] = [];
  let completed = false;

  for (const stage of STAGES) {
    const t = setTimeout(() => {
      if (!completed) {
        sseWrite(res, "stage", { message: stage.msg });
      }
    }, stage.ms);
    stageTimers.push(t);
  }

  const clearTimers = () => stageTimers.forEach(clearTimeout);

  try {
    // ── Claude API call with streaming ──
    const claudeStream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(code, contractName ?? undefined) }],
    });

    const fullText = await claudeStream.finalText();
    clearTimers();
    completed = true;

    // ── Parse JSON ──
    let rawParsed: unknown;
    try {
      const text = fullText.trim();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text;
      rawParsed = JSON.parse(jsonStr);
    } catch {
      sseWrite(res, "error", { message: "Failed to parse AI analysis. Please try again." });
      res.end();
      return;
    }

    const aiResult = AIResponseSchema.safeParse(rawParsed);
    if (!aiResult.success) {
      sseWrite(res, "error", { message: "AI returned an unexpected format. Please try again." });
      res.end();
      return;
    }

    const parsed = aiResult.data;
    const vulnerabilities = (parsed.vulnerabilities ?? []).map((v, idx) => ({
      id: v.id ?? idx + 1,
      type: v.type,
      severity: v.severity,
      swc_id: v.swc_id ?? null,
      line_number: v.line_number ?? null,
      affected_lines: v.affected_lines ?? null,
      affected_functions: v.affected_functions ?? null,
      title: v.title,
      description: v.description,
      technical_risk: v.technical_risk,
      attack_scenario: v.attack_scenario ?? null,
      impact: v.impact ?? null,
      gas_impact: v.gas_impact ?? null,
      vulnerable_code: v.vulnerable_code ?? null,
      fixed_code: v.fixed_code ?? null,
      recommendation: v.recommendation,
    }));

    const analysis_time_ms = Date.now() - startTime;
    const scanData = {
      success: true,
      contract_name: parsed.contract_name ?? contractName ?? "Unknown Contract",
      code_hash: createHash("sha256").update(code).digest("hex"),
      total_vulnerabilities: parsed.total_vulnerabilities ?? vulnerabilities.length,
      risk_score: parsed.risk_score ?? 0,
      vulnerabilities,
      summary: parsed.summary ?? "Analysis complete.",
      analysis_time_ms,
      timestamp: new Date().toISOString(),
    };

    // ── Store for PDF report ──
    const scanId = storeScan(scanData);

    // ── Stream each vulnerability with a small delay ──
    sseWrite(res, "meta", {
      contract_name: scanData.contract_name,
      total_vulnerabilities: scanData.total_vulnerabilities,
      risk_score: scanData.risk_score,
      summary: scanData.summary,
      analysis_time_ms,
      scanId,
    });

    for (let i = 0; i < vulnerabilities.length; i++) {
      await new Promise<void>((resolve) => setTimeout(resolve, 180));
      sseWrite(res, "vulnerability", vulnerabilities[i]);
    }

    // ── Final complete event ──
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    sseWrite(res, "complete", { ...scanData, scanId });
    res.end();

  } catch (err: unknown) {
    clearTimers();
    completed = true;
    req.log.error({ err }, "Error calling Anthropic API");
    const status = (err as { status?: number }).status;
    if (status === 429) {
      sseWrite(res, "error", { message: "Rate limit exceeded. Please wait a moment and try again." });
    } else {
      sseWrite(res, "error", { message: "Failed to analyze contract. Please try again." });
    }
    res.end();
  }
});

export default router;
