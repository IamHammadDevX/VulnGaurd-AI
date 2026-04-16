import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { OPENROUTER_MODEL } from "@workspace/integrations-anthropic-ai";
import { GenerateFixBody } from "@workspace/api-zod";
import { generateFixLimiter } from "../../middlewares/rateLimitMiddleware.js";
import * as zod from "zod";

const router: IRouter = Router();

const GENERATE_FIX_SYSTEM = `You are an expert Solidity security auditor. You will be given a vulnerability description and the original smart contract code.

Your task: Generate an improved, detailed fix for the specific vulnerability.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "original_code": "string (the vulnerable snippet, can be null if not applicable)",
  "fixed_code": "string (the corrected code snippet)",
  "explanation": "string (clear explanation of what was changed and why)",
  "resources": ["url1", "url2"] (2-3 relevant security references, e.g. OpenZeppelin docs, SWC Registry, Secureum)
}`;

const AIFixSchema = zod.object({
  original_code: zod.string().nullable().optional(),
  fixed_code: zod.string(),
  explanation: zod.string(),
  resources: zod.array(zod.string()).optional(),
});

const DEFAULT_RESOURCES = [
  "https://docs.openzeppelin.com/contracts/",
  "https://swcregistry.io/",
  "https://secureum.substack.com/",
];

router.post("/generate-fix", generateFixLimiter, async (req, res) => {
  const parseResult = GenerateFixBody.safeParse(req.body);
  if (!parseResult.success) {
    req.log.error({ issues: parseResult.error.issues }, "Invalid request body for generate-fix");
    res.status(400).json({ error: "Invalid request body", details: parseResult.error.issues });
    return;
  }

  const { vulnerability, contractCode } = parseResult.data;

  try {
    const message = await anthropic.messages.create({
      model: OPENROUTER_MODEL,
      max_tokens: 8192,
      system: GENERATE_FIX_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Generate a detailed fix for this vulnerability:

Vulnerability Type: ${vulnerability.type}
Severity: ${vulnerability.severity}
Title: ${vulnerability.title}
Description: ${vulnerability.description}
Technical Risk: ${vulnerability.technical_risk}
Vulnerable Code: ${vulnerability.vulnerable_code ?? "N/A"}

Full Contract Code:
\`\`\`solidity
${contractCode}
\`\`\`

Provide the fix with explanation and resources.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      req.log.error({ contentType: content.type }, "Unexpected content type from AI");
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
    } catch (parseErr) {
      req.log.error({ parseErr }, "Failed to parse AI response as JSON");
      res.status(500).json({ error: "Failed to parse fix response" });
      return;
    }

    const aiResult = AIFixSchema.safeParse(rawParsed);
    if (!aiResult.success) {
      req.log.error({ issues: aiResult.error.issues }, "AI fix response did not match expected schema");
      res.status(502).json({ error: "AI returned an unexpected format. Please try again." });
      return;
    }

    const parsed = aiResult.data;

    res.json({
      success: true,
      original_code: parsed.original_code ?? vulnerability.vulnerable_code ?? null,
      fixed_code: parsed.fixed_code,
      explanation: parsed.explanation,
      resources: parsed.resources?.length ? parsed.resources : DEFAULT_RESOURCES,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    req.log.error({ err, errMsg }, "Error generating AI fix");
    
    // More detailed error for debugging
    if (errMsg.includes("401") || errMsg.includes("Unauthorized")) {
      res.status(401).json({ error: "OpenRouter API authentication failed. Check OPENROUTER_API_KEY." });
    } else if (errMsg.includes("rate")) {
      res.status(429).json({ error: "Rate limited by AI service. Please wait before retrying." });
    } else {
      res.status(500).json({ error: `Failed to generate fix: ${errMsg}` });
    }
  }
});

export default router;
