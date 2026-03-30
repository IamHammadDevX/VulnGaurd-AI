type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type CreateMessageParams = {
  model: string;
  max_tokens: number;
  system?: string;
  messages: ChatMessage[];
};

type CreateMessageResult = {
  content: Array<{ type: "text"; text: string }>;
};

class OpenRouterError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
  }
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL?.trim() || "anthropic/claude-3.7-sonnet";

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY must be set.");
}

function toOpenRouterMessages(system: string | undefined, messages: ChatMessage[]) {
  const combined: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
  if (system && system.trim().length > 0) {
    combined.push({ role: "system", content: system });
  }
  for (const message of messages) {
    combined.push(message);
  }
  return combined;
}

async function requestOpenRouter(params: CreateMessageParams): Promise<string> {
  const selectedModel = OPENROUTER_MODEL || params.model;
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:5173",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "VulnGuard AI",
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: params.max_tokens,
      temperature: 0,
      provider: {
        allow_fallbacks: false,
      },
      messages: toOpenRouterMessages(params.system, params.messages),
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new OpenRouterError(
      `OpenRouter request failed with status ${response.status}: ${responseBody}`,
      response.status,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content;

  if (typeof text !== "string") {
    throw new OpenRouterError("OpenRouter returned an unexpected response format.");
  }

  return text;
}

export const anthropic = {
  messages: {
    async create(params: CreateMessageParams): Promise<CreateMessageResult> {
      const text = await requestOpenRouter(params);
      return { content: [{ type: "text", text }] };
    },
    stream(params: CreateMessageParams) {
      return {
        async finalText(): Promise<string> {
          return requestOpenRouter(params);
        },
      };
    },
  },
};
