import { Router, type IRouter } from "express";
import { createHash } from "crypto";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { ScanContractBody } from "@workspace/api-zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";
import { storeScan } from "./store.js";
import * as zod from "zod";

const router: IRouter = Router();

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
  vulnerable_code: zod.string().nullable().optional(),
  fixed_code: zod.string().nullable().optional(),
  recommendation: zod.string(),
});

type VulnerabilityAIType = zod.infer<typeof VulnerabilityAI>;

const AIResponseSchema = zod.object({
  contract_name: zod.string().optional(),
  total_vulnerabilities: zod.number().optional(),
  risk_score: zod.number().optional(),
  vulnerabilities: zod.array(VulnerabilityAI).optional(),
  summary: zod.string().optional(),
});

router.post("/scan", async (req, res) => {
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

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(code, contractName ?? undefined),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      res.status(500).json({ error: "Unexpected response from AI" });
      return;
    }

    let rawParsed: unknown;
    try {
      const text = content.text.trim();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text;
      rawParsed = JSON.parse(jsonStr);
    } catch {
      req.log.error({ raw: content.text }, "Failed to parse AI JSON response");
      res.status(500).json({ error: "Failed to parse AI analysis. Please try again." });
      return;
    }

    const aiResult = AIResponseSchema.safeParse(rawParsed);
    if (!aiResult.success) {
      req.log.error({ issues: aiResult.error.issues }, "AI response did not match expected schema");
      res.status(502).json({ error: "AI returned an unexpected format. Please try again." });
      return;
    }

    const parsed = aiResult.data;
    const analysis_time_ms = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    const vulnerabilities = (parsed.vulnerabilities ?? []).map((v: VulnerabilityAIType, idx: number) => ({
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
      vulnerable_code: v.vulnerable_code ?? null,
      fixed_code: v.fixed_code ?? null,
      recommendation: v.recommendation,
    }));

    const scanData = {
      success: true,
      contract_name: parsed.contract_name ?? contractName ?? "Unknown Contract",
      code_hash: createHash("sha256").update(code).digest("hex"),
      total_vulnerabilities: parsed.total_vulnerabilities ?? vulnerabilities.length,
      risk_score: parsed.risk_score ?? 0,
      vulnerabilities,
      summary: parsed.summary ?? "Analysis complete.",
      analysis_time_ms,
      timestamp,
    };

    const scanId = storeScan(scanData);

    res.json({ ...scanData, scanId });
  } catch (err: unknown) {
    req.log.error({ err }, "Error calling Anthropic API");
    const status = (err as { status?: number }).status;
    if (status === 429) {
      res.status(429).json({ error: "Rate limit exceeded. Please wait a moment and try again." });
    } else {
      res.status(500).json({ error: "Failed to analyze contract. Please try again." });
    }
  }
});

export default router;
