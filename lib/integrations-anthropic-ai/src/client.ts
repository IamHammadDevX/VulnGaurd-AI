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
const OPENROUTER_MAX_RETRIES = Number(process.env.OPENROUTER_MAX_RETRIES ?? "3");
const OPENROUTER_RETRY_BASE_MS = Number(process.env.OPENROUTER_RETRY_BASE_MS ?? "1200");

export const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL?.trim() || "anthropic/claude-3.7-sonnet";

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY must be set.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;

  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && asNumber > 0) {
    return Math.ceil(asNumber * 1000);
  }

  const timestamp = Date.parse(value);
  if (!Number.isNaN(timestamp)) {
    const delta = timestamp - Date.now();
    return delta > 0 ? delta : null;
  }

  return null;
}

function toOpenRouterMessages(system: string | undefined, messages: ChatMessage[]) {
  const combined: Array<{ role: "user" | "assistant"; content: string }> = [
    ...messages,
  ];

  // Some free providers reject system/developer roles.
  if (system && system.trim().length > 0) {
    const systemPrefix = `System instructions:\n${system}\n\n`;
    const firstUserIndex = combined.findIndex((message) => message.role === "user");

    if (firstUserIndex >= 0) {
      combined[firstUserIndex] = {
        ...combined[firstUserIndex],
        content: `${systemPrefix}${combined[firstUserIndex].content}`,
      };
    } else {
      combined.unshift({
        role: "user",
        content: `${systemPrefix}Please follow the instructions above.`,
      });
    }
  }

  return combined;
}

async function requestOpenRouter(params: CreateMessageParams): Promise<string> {
  const selectedModel = OPENROUTER_MODEL || params.model;
  let lastError: OpenRouterError | null = null;

  for (let attempt = 0; attempt <= OPENROUTER_MAX_RETRIES; attempt++) {
    try {
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
            // Let OpenRouter switch providers for the same model when possible.
            allow_fallbacks: true,
          },
          messages: toOpenRouterMessages(params.system, params.messages),
        }),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        const err = new OpenRouterError(
          `OpenRouter request failed with status ${response.status}: ${responseBody}`,
          response.status,
        );
        lastError = err;

        const retryable = response.status === 429 || response.status === 502 || response.status === 503 || response.status === 504;
        if (!retryable || attempt >= OPENROUTER_MAX_RETRIES) {
          throw err;
        }

        const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
        const backoffMs = retryAfterMs ?? (OPENROUTER_RETRY_BASE_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 400));
        await sleep(backoffMs);
        continue;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = payload.choices?.[0]?.message?.content;

      if (typeof text !== "string") {
        throw new OpenRouterError("OpenRouter returned an unexpected response format.");
      }

      return text;
    } catch (error) {
      const isKnown = error instanceof OpenRouterError;
      const retryableNetwork = !isKnown;

      if (retryableNetwork && attempt < OPENROUTER_MAX_RETRIES) {
        const backoffMs = OPENROUTER_RETRY_BASE_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 400);
        await sleep(backoffMs);
        continue;
      }

      if (isKnown) throw error;
      throw new OpenRouterError(`OpenRouter network error: ${String(error)}`);
    }
  }

  throw lastError ?? new OpenRouterError("OpenRouter request failed after retries.");
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
