import { Router, type IRouter } from "express";
import { createHash } from "crypto";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { OPENROUTER_MODEL } from "@workspace/integrations-anthropic-ai";
import { ScanContractBody } from "@workspace/api-zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";
import { storeScan } from "./store.js";
import { analyzeContractFallback, type FallbackVulnerability } from "./fallback-analyzer.js";
import * as zod from "zod";

const router: IRouter = Router();

function resolveAiError(err: unknown): { status: number; message: string } {
  const status = (err as { status?: number })?.status;
  const message = (err as { message?: string })?.message ?? "";

  if (status === 429) {
    return { status: 429, message: "AI rate limit reached. Please wait 30-60 seconds and retry." };
  }
  if (status === 401 || status === 403) {
    return {
      status: 502,
      message: "AI provider authentication failed. Verify OPENROUTER_API_KEY in backend environment.",
    };
  }
  if (status === 402) {
    return {
      status: 502,
      message: "AI provider quota/billing issue. Check OpenRouter credits and model access.",
    };
  }
  if (status === 400) {
    return {
      status: 502,
      message: "AI request rejected. Check OPENROUTER_MODEL and provider compatibility.",
    };
  }
  if (status && status >= 500) {
    return {
      status: 502,
      message: "AI provider is temporarily unavailable. Please retry shortly.",
    };
  }

  if (/timeout|timed out|abort/i.test(message)) {
    return {
      status: 504,
      message: "AI request timed out. Please retry with a smaller contract or try again shortly.",
    };
  }

  return {
    status: 500,
    message: "Failed to analyze contract. Please try again.",
  };
}

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
  technical_risk: zod.string().optional(),
  attack_scenario: zod.string().nullable().optional(),
  impact: zod.string().nullable().optional(),
  vulnerable_code: zod.string().nullable().optional(),
  fixed_code: zod.string().nullable().optional(),
  recommendation: zod.string().optional(),
});

type VulnerabilityAIType = zod.infer<typeof VulnerabilityAI>;

const AIResponseSchema = zod.object({
  contract_name: zod.string().optional(),
  total_vulnerabilities: zod.number().optional(),
  risk_score: zod.number().optional(),
  vulnerabilities: zod.array(VulnerabilityAI).optional(),
  summary: zod.string().optional(),
});

function vulnKey(v: { type: string; line_number: number | null | undefined; title: string }): string {
  return `${v.type}|${v.line_number ?? -1}|${v.title}`;
}

function normalizeFallbackVulns(vulns: FallbackVulnerability[]): Array<Record<string, unknown>> {
  return vulns.map((v) => ({
    id: v.id,
    type: v.type,
    severity: v.severity,
    swc_id: v.swc_id,
    line_number: v.line_number,
    affected_lines: v.affected_lines,
    affected_functions: v.affected_functions,
    title: v.title,
    description: v.description,
    technical_risk: v.technical_risk,
    attack_scenario: v.attack_scenario,
    impact: v.impact,
    vulnerable_code: v.vulnerable_code,
    fixed_code: v.fixed_code,
    recommendation: v.recommendation,
  }));
}

function mergeVulnerabilities(
  aiVulns: Array<Record<string, unknown>>,
  fallbackVulns: FallbackVulnerability[],
): Array<Record<string, unknown>> {
  const merged = [...aiVulns];
  const seen = new Set(
    aiVulns.map((v) =>
      vulnKey({
        type: String(v.type ?? ""),
        line_number: typeof v.line_number === "number" ? v.line_number : null,
        title: String(v.title ?? ""),
      }),
    ),
  );

  for (const f of fallbackVulns) {
    const key = vulnKey(f);
    if (seen.has(key)) continue;
    merged.push(...normalizeFallbackVulns([f]));
    seen.add(key);
  }

  return merged;
}

function tryParseAiJson(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with extraction strategies.
  }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }

  let braceCount = 0;
  let jsonStart = -1;
  let jsonEnd = -1;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === "{") {
      if (braceCount === 0) jsonStart = i;
      braceCount++;
    } else if (trimmed[i] === "}") {
      braceCount--;
      if (braceCount === 0 && jsonStart !== -1) {
        jsonEnd = i;
        break;
      }
    }
  }

  if (jsonStart !== -1 && jsonEnd !== -1) {
    return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
  }

  const lastOpen = trimmed.lastIndexOf("{");
  const lastClose = trimmed.lastIndexOf("}");
  if (lastOpen !== -1 && lastClose > lastOpen) {
    return JSON.parse(trimmed.slice(lastOpen, lastClose + 1));
  }

  throw new Error("Could not find JSON structure in AI response");
}

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

  const fallback = analyzeContractFallback(code, contractName ?? undefined);

  try {
    const message = await anthropic.messages.create({
      model: OPENROUTER_MODEL,
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
      const analysis_time_ms = Date.now() - startTime;
      const scanData = {
        success: true,
        contract_name: contractName ?? "Unknown Contract",
        code_hash: createHash("sha256").update(code).digest("hex"),
        total_vulnerabilities: fallback.vulnerabilities.length,
        risk_score: fallback.risk_score,
        vulnerabilities: normalizeFallbackVulns(fallback.vulnerabilities),
        summary: `${fallback.summary} (AI returned unexpected content type.)`,
        analysis_time_ms,
        timestamp: new Date().toISOString(),
      };
      const scanId = storeScan(scanData);
      res.json({ ...scanData, scanId });
      return;
    }

    let rawParsed: unknown;
    try {
      rawParsed = tryParseAiJson(content.text);
    } catch (jsonError) {
      req.log.warn({ err: String(jsonError) }, "AI JSON parse failed, using fallback analysis");
      const analysis_time_ms = Date.now() - startTime;
      const scanData = {
        success: true,
        contract_name: contractName ?? "Unknown Contract",
        code_hash: createHash("sha256").update(code).digest("hex"),
        total_vulnerabilities: fallback.vulnerabilities.length,
        risk_score: fallback.risk_score,
        vulnerabilities: normalizeFallbackVulns(fallback.vulnerabilities),
        summary: `${fallback.summary} (AI response was unstructured.)`,
        analysis_time_ms,
        timestamp: new Date().toISOString(),
      };

      const scanId = storeScan(scanData);
      res.json({ ...scanData, scanId });
      return;
    }

    const aiResult = AIResponseSchema.safeParse(rawParsed);
    const analysis_time_ms = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    if (!aiResult.success) {
      req.log.warn({ issues: aiResult.error.issues }, "AI schema validation failed, merging with fallback");
      const partial = rawParsed as Record<string, unknown>;
      const aiVulns = Array.isArray(partial.vulnerabilities)
        ? (partial.vulnerabilities as VulnerabilityAIType[]).map((v, idx) => ({
            id: v?.id ?? idx + 1,
            type: v?.type ?? "unknown",
            severity: v?.severity ?? "LOW",
            swc_id: v?.swc_id ?? null,
            line_number: v?.line_number ?? null,
            affected_lines: v?.affected_lines ?? null,
            affected_functions: v?.affected_functions ?? null,
            title: v?.title ?? "Vulnerability",
            description: v?.description ?? "Potential issue detected.",
            technical_risk: v?.technical_risk ?? "",
            attack_scenario: v?.attack_scenario ?? null,
            impact: v?.impact ?? null,
            vulnerable_code: v?.vulnerable_code ?? null,
            fixed_code: v?.fixed_code ?? null,
            recommendation: v?.recommendation ?? "Review and patch this issue.",
          }))
        : [];

      const merged = mergeVulnerabilities(aiVulns as Array<Record<string, unknown>>, fallback.vulnerabilities);

      const scanData = {
        success: true,
        contract_name: (partial.contract_name as string) || contractName || "Unknown Contract",
        code_hash: createHash("sha256").update(code).digest("hex"),
        total_vulnerabilities: merged.length,
        risk_score: Math.max((partial.risk_score as number) || 0, fallback.risk_score),
        vulnerabilities: merged,
        summary: (partial.summary as string) || `${fallback.summary} (AI response partial.)`,
        analysis_time_ms,
        timestamp,
      };

      const scanId = storeScan(scanData);
      res.json({ ...scanData, scanId });
      return;
    }

    const parsed = aiResult.data;
    const aiVulns = (parsed.vulnerabilities ?? []).map((v: VulnerabilityAIType, idx: number) => ({
      id: v.id ?? idx + 1,
      type: v.type,
      severity: v.severity,
      swc_id: v.swc_id ?? null,
      line_number: v.line_number ?? null,
      affected_lines: v.affected_lines ?? null,
      affected_functions: v.affected_functions ?? null,
      title: v.title,
      description: v.description,
      technical_risk: v.technical_risk ?? "",
      attack_scenario: v.attack_scenario ?? null,
      impact: v.impact ?? null,
      vulnerable_code: v.vulnerable_code ?? null,
      fixed_code: v.fixed_code ?? null,
      recommendation: v.recommendation ?? "Review and patch this issue.",
    }));

    const merged = mergeVulnerabilities(aiVulns as Array<Record<string, unknown>>, fallback.vulnerabilities);

    const scanData = {
      success: true,
      contract_name: parsed.contract_name ?? contractName ?? "Unknown Contract",
      code_hash: createHash("sha256").update(code).digest("hex"),
      total_vulnerabilities: merged.length,
      risk_score: Math.max(parsed.risk_score ?? 0, fallback.risk_score),
      vulnerabilities: merged,
      summary: parsed.summary ?? fallback.summary,
      analysis_time_ms,
      timestamp,
    };

    const scanId = storeScan(scanData);
    res.json({ ...scanData, scanId });
  } catch (err: unknown) {
    req.log.error({ err }, "Error calling OpenRouter API, using fallback analyzer");
    const resolved = resolveAiError(err);
    const analysis_time_ms = Date.now() - startTime;
    const scanData = {
      success: true,
      contract_name: contractName ?? "Unknown Contract",
      code_hash: createHash("sha256").update(code).digest("hex"),
      total_vulnerabilities: fallback.vulnerabilities.length,
      risk_score: fallback.risk_score,
      vulnerabilities: normalizeFallbackVulns(fallback.vulnerabilities),
      summary: `${fallback.summary} (AI unavailable: ${resolved.message})`,
      analysis_time_ms,
      timestamp: new Date().toISOString(),
    };

    const scanId = storeScan(scanData);
    res.json({ ...scanData, scanId });
  }
});

export default router;
