import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { GenerateFixBody } from "@workspace/api-zod";

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

router.post("/generate-fix", async (req, res) => {
  const parseResult = GenerateFixBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { vulnerability, contractCode } = parseResult.data;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
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
      res.status(500).json({ error: "Unexpected response from AI" });
      return;
    }

    let parsed: {
      original_code?: string | null;
      fixed_code?: string;
      explanation?: string;
      resources?: string[];
    };
    try {
      const text = content.text.trim();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text;
      parsed = JSON.parse(jsonStr);
    } catch {
      res.status(500).json({ error: "Failed to parse fix response" });
      return;
    }

    res.json({
      success: true,
      original_code: parsed.original_code ?? vulnerability.vulnerable_code ?? null,
      fixed_code: parsed.fixed_code ?? vulnerability.fixed_code ?? "",
      explanation: parsed.explanation ?? vulnerability.recommendation,
      resources: parsed.resources ?? [
        "https://docs.openzeppelin.com/contracts/",
        "https://swcregistry.io/",
        "https://secureum.substack.com/",
      ],
    });
  } catch (err) {
    req.log.error({ err }, "Error generating fix");
    res.status(500).json({ error: "Failed to generate fix. Please try again." });
  }
});

export default router;
