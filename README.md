# VulnGuard AI

**AI-Powered Solidity Smart Contract Vulnerability Scanner**

VulnGuard AI helps developers and auditors find security vulnerabilities in Ethereum smart contracts before they go live. Paste your Solidity code, click Scan, and receive a detailed vulnerability report powered by OpenRouter-hosted LLMs — complete with severity ratings, plain-English explanations, before/after fix code, and a downloadable PDF audit report.

---

## Features

- **AI-Powered Analysis** — Uses OpenRouter to detect 15+ vulnerability classes including reentrancy, integer overflow, access control issues, and more
- **Monaco Code Editor** — Full-featured Solidity editor with syntax highlighting and drag-and-drop `.sol` file support
- **Severity Ratings** — Every finding is rated CRITICAL / HIGH / MEDIUM / LOW with color-coded cards
- **Before / After Code** — Each vulnerability shows the vulnerable snippet alongside the fixed version
- **AI Deep Fix** — Generate an enhanced, detailed fix for any individual vulnerability
- **Severity Distribution Chart** — Visual pie chart summarizing your contract's risk profile
- **PDF Audit Report** — Download a professional PDF report with cover page, executive summary, and per-vulnerability detail
- **Example Contracts** — Built-in VulnerableBank, InsecureToken, and SafeBank examples to explore

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Monaco Editor |
| Backend | Node.js, Express 5, TypeScript |
| Database | Supabase Postgres + Drizzle ORM |
| AI | OpenRouter (`anthropic/claude-3.7-sonnet` by default) |
| API Contract | OpenAPI 3.0, Orval codegen, Zod validation |
| PDF | PDFKit |
| Charts | Recharts |
| Package Manager | pnpm (monorepo) |

---

## Project Structure

```
vulnguard-ai/
├── artifacts/
│   ├── api-server/          # Express backend (port 8080)
│   │   └── src/
│   │       └── routes/
│   │           └── vulnguard/
│   │               ├── scan.ts          # POST /api/scan
│   │               ├── generate-fix.ts  # POST /api/generate-fix
│   │               ├── report.ts        # GET  /api/report/:scanId
│   │               ├── store.ts         # In-memory scan store
│   │               └── prompts.ts       # LLM system prompts
│   └── vulnguard/           # React frontend (Vite)
│       └── src/
│           ├── pages/Home.tsx
│           ├── hooks/use-scanner.ts
│           └── components/
│               ├── VulnerabilityCard.tsx
│               └── SeverityChart.tsx
├── lib/
│   ├── api-spec/openapi.yaml            # OpenAPI 3.0 specification
│   ├── api-client-react/                # Generated React Query hooks
│   ├── api-zod/                         # Generated Zod validation schemas
│   └── integrations-anthropic-ai/      # OpenRouter client wrapper
├── .env.example                         # Environment variable template
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- An OpenRouter API key — get one at [openrouter.ai/keys](https://openrouter.ai/keys)

### 1. Clone the repository

```bash
git clone https://github.com/IamHammadDevX/VulnGaurd-AI.git
cd VulnGaurd-AI
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
OPENROUTER_API_KEY=sk-or-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-3.7-sonnet
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
PORT=8080
NODE_ENV=development
LOG_LEVEL=info
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 3. Install dependencies

```bash
pnpm install
```

### 4. Provision database schema (Supabase)

```bash
pnpm --filter @workspace/db run push
```

### 5. Run code generation

```bash
pnpm --filter @workspace/api-spec run codegen
```

### 6. Start the development servers

Open two terminals:

**Terminal 1 — API Server**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend**
```bash
pnpm --filter @workspace/vulnguard run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### `POST /api/scan`

Scan a Solidity smart contract for vulnerabilities.

**Request**
```json
{
  "code": "pragma solidity ^0.8.0; contract MyContract { ... }",
  "contractName": "MyContract"
}
```

**Response**
```json
{
  "success": true,
  "scanId": "uuid-v4",
  "contract_name": "MyContract",
  "total_vulnerabilities": 3,
  "risk_score": 72,
  "vulnerabilities": [
    {
      "id": 1,
      "type": "Reentrancy",
      "severity": "CRITICAL",
      "title": "Reentrancy in withdraw()",
      "description": "...",
      "technical_risk": "...",
      "vulnerable_code": "...",
      "fixed_code": "...",
      "recommendation": "..."
    }
  ],
  "summary": "...",
  "analysis_time_ms": 12500,
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### `POST /api/generate-fix`

Generate an enhanced AI fix for a specific vulnerability.

**Request**
```json
{
  "vulnerability": { ... },
  "contractCode": "pragma solidity ..."
}
```

**Response**
```json
{
  "success": true,
  "original_code": "...",
  "fixed_code": "...",
  "explanation": "...",
  "resources": ["https://..."]
}
```

### `GET /api/report/:scanId`

Download the PDF audit report for a completed scan.

**Response** — `application/pdf` binary stream

---

## Vulnerability Types Detected

| Category | Examples |
|----------|---------|
| **Reentrancy** | Single-function, cross-function, cross-contract |
| **Arithmetic** | Integer overflow/underflow, division by zero |
| **Access Control** | Missing modifiers, tx.origin usage |
| **Logic Errors** | Race conditions, front-running, TOD |
| **Bad Randomness** | block.timestamp, blockhash misuse |
| **Denial of Service** | Gas limit issues, push payment patterns |
| **Flash Loan** | Price manipulation, oracle attacks |
| **Unchecked Calls** | Return value ignored, low-level calls |
| **Self-Destruct** | Unprotected selfdestruct |
| **Timestamp Dependence** | Miner-manipulable timestamps |

---

## Running on Replit

This project is built to run natively on [Replit](https://replit.com). Add your OpenRouter credentials as environment variables.

1. Fork or import the repo on Replit
2. Add `OPENROUTER_API_KEY` and optional `OPENROUTER_MODEL` in Secrets
3. Click **Run** — all three services start automatically

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase Postgres connection string used by Drizzle and API runtime |
| `SUPABASE_DB_URL` | No | Fallback DB URL if `DATABASE_URL` is not set |
| `SUPABASE_URL` | Yes (for auth) | Supabase project URL used by API auth verification |
| `SUPABASE_ANON_KEY` | Yes (for auth) | Supabase anon/publishable key used by frontend auth |
| `VITE_SUPABASE_URL` | Yes (frontend auth) | Vite-exposed Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (frontend auth) | Vite-exposed Supabase anon/publishable key |
| `OPENROUTER_API_KEY` | Yes | Your OpenRouter API key |
| `OPENROUTER_BASE_URL` | No | OpenRouter base URL (default: `https://openrouter.ai/api/v1`) |
| `OPENROUTER_MODEL` | No | OpenRouter model ID (default: `anthropic/claude-3.7-sonnet`) |
| `OPENROUTER_HTTP_REFERER` | No | Optional referer header sent to OpenRouter |
| `OPENROUTER_APP_NAME` | No | Optional app title header sent to OpenRouter |
| `PORT` | No | API server port (default: `8080`) |
| `NODE_ENV` | No | `development` or `production` |
| `LOG_LEVEL` | No | Pino log level (default: `info`) |

For a full setup walkthrough, see `docs/SUPABASE_SETUP.md`.

---

## Security Notes

- API keys are read exclusively from environment variables — never hardcoded
- `.env` is listed in `.gitignore` and must never be committed
- AI responses are validated against Zod schemas before use — malformed model output returns HTTP 502 instead of propagating bad data
- Contract code is limited to 50KB per request to prevent abuse
- All scan data is stored in-memory only (no database) — data is cleared on server restart

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [OpenRouter](https://openrouter.ai/) — LLM gateway and routing
- [OpenZeppelin](https://docs.openzeppelin.com/) — Security patterns and references
- [SWC Registry](https://swcregistry.io/) — Smart contract weakness classification
- [Secureum](https://secureum.substack.com/) — Solidity security knowledge base
