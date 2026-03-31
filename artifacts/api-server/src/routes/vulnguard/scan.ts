import { Router, type IRouter } from "express";
import { createHash } from "crypto";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { OPENROUTER_MODEL } from "@workspace/integrations-anthropic-ai";
import { ScanContractBody } from "@workspace/api-zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";
import { storeScan } from "./store.js";
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
      res.status(500).json({ error: "Unexpected response from AI" });
      return;
    }

    let rawParsed: unknown;
    try {
      const text = content.text.trim();
      
      req.log.info({rawResponseLength: text.length, rawPreview: text.slice(0, 500)}, "Raw AI response received");
      
      // Strategy 1: Try direct JSON parse first (if response_format worked)
      try {
        rawParsed = JSON.parse(text);
        req.log.info("Successfully parsed raw response as JSON");
      } catch (e1) {
        req.log.warn(`Direct JSON parse failed: ${String(e1)}, trying extraction strategies`);
        
        // Strategy 2: Extract JSON from markdown code blocks (```json ... ```)
        let jsonStr = text;
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
          req.log.info("Extracted JSON from markdown code block");
        } else {
          // Strategy 3: Try to find JSON object by matching braces
          let braceCount = 0;
          let jsonStart = -1;
          let jsonEnd = -1;
          
          for (let i = 0; i < text.length; i++) {
            if (text[i] === "{") {
              if (braceCount === 0) jsonStart = i;
              braceCount++;
            } else if (text[i] === "}") {
              braceCount--;
              if (braceCount === 0 && jsonStart !== -1) {
                jsonEnd = i;
                break;
              }
            }
          }
          
          if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = text.slice(jsonStart, jsonEnd + 1);
            req.log.info("Extracted JSON from brace matching");
          } else {
            // Strategy 4: Try to parse from last { to last }
            const lastBraceStart = text.lastIndexOf("{");
            const lastBraceEnd = text.lastIndexOf("}");
            if (lastBraceStart !== -1 && lastBraceEnd > lastBraceStart) {
              jsonStr = text.slice(lastBraceStart, lastBraceEnd + 1);
              req.log.info("Extracted JSON from last braces");
            } else {
              throw new Error("Could not find JSON structure in response");
            }
          }
        }
        
        rawParsed = JSON.parse(jsonStr);
        req.log.info("Successfully parsed extracted JSON");
      }
      
      // Validate it has expected fields
      if (!rawParsed || typeof rawParsed !== 'object') {
        throw new Error("Parsed JSON is not an object");
      }
    } catch (jsonError) {
      req.log.error(
        { rawFull: content.text.slice(0, 2000), error: String(jsonError) },
        "Failed to parse AI response as JSON"
      );

      const analysis_time_ms = Date.now() - startTime;
      const scanData = {
        success: true,
        contract_name: contractName ?? "Unknown Contract",
        code_hash: createHash("sha256").update(code).digest("hex"),
        total_vulnerabilities: 0,
        risk_score: 0,
        vulnerabilities: [],
        summary: "AI returned an unstructured response. Please retry scan for a detailed structured report.",
        analysis_time_ms,
        timestamp: new Date().toISOString(),
      };

      const scanId = storeScan(scanData);
      res.json({ ...scanData, scanId });
      return;
    }

    const aiResult = AIResponseSchema.safeParse(rawParsed);
    if (!aiResult.success) {
      req.log.warn({ issues: aiResult.error.issues, parsed: rawParsed }, "AI response schema validation failed, using partial data");
      
      // Instead of failing, try to extract useful data from the partial response
      const partial = rawParsed as Record<string, unknown>;
      const analysis_time_ms = Date.now() - startTime;
      const scanData = {
        success: true,
        contract_name: (partial.contract_name as string) || contractName || "Unknown Contract",
        code_hash: createHash("sha256").update(code).digest("hex"),
        total_vulnerabilities: (partial.total_vulnerabilities as number) || 0,
        risk_score: (partial.risk_score as number) || 0,
        vulnerabilities: Array.isArray(partial.vulnerabilities) ? 
          (partial.vulnerabilities as VulnerabilityAIType[]).filter(v => v && typeof v === 'object') 
          : [],
        summary: (partial.summary as string) || "Scan completed with partial results.",
        analysis_time_ms,
        timestamp: new Date().toISOString(),
      };

      const scanId = storeScan(scanData);
      res.json({ ...scanData, scanId });
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
    req.log.error({ err }, "Error calling OpenRouter API");
    const resolved = resolveAiError(err);
    res.status(resolved.status).json({ error: resolved.message });
  }
});

export default router;
