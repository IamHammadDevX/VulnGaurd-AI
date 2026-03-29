import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { ScanContractBody } from "@workspace/api-zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";
import { storeScan } from "./store.js";

const router: IRouter = Router();

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

    let parsed: {
      contract_name?: string;
      total_vulnerabilities?: number;
      vulnerabilities?: unknown[];
      summary?: string;
      risk_score?: number;
    };
    try {
      const text = content.text.trim();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text;
      parsed = JSON.parse(jsonStr);
    } catch {
      req.log.error({ raw: content.text }, "Failed to parse AI JSON response");
      res.status(500).json({ error: "Failed to parse AI analysis. Please try again." });
      return;
    }

    const analysis_time_ms = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    const scanData = {
      success: true,
      contract_name: parsed.contract_name ?? contractName ?? "Unknown Contract",
      total_vulnerabilities: parsed.total_vulnerabilities ?? (parsed.vulnerabilities?.length ?? 0),
      risk_score: parsed.risk_score ?? 0,
      vulnerabilities: parsed.vulnerabilities ?? [],
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
