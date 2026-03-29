# Workspace

## Overview

pnpm workspace monorepo using TypeScript. VulnGuard AI — an AI-powered Solidity smart contract vulnerability scanner.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (available but not used for MVP; scans are in-memory)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Anthropic Claude via Replit AI Integrations (`@workspace/integrations-anthropic-ai`)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (scan, generate-fix, report routes)
│   └── vulnguard/          # React + Vite frontend (VulnGuard AI main app)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-anthropic-ai/  # Anthropic AI client (Replit AI Integrations)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## VulnGuard AI Features

- **Solidity code editor**: Monaco editor with syntax highlighting, drag-and-drop .sol file support
- **AI scanning**: Claude claude-sonnet-4-6 analyzes contracts for 15+ vulnerability types
- **Vulnerability detection**: Reentrancy, Access Control, Integer Overflow, Unchecked Calls, etc.
- **Severity scoring**: CRITICAL / HIGH / MEDIUM / LOW with risk score 0-100
- **Fix suggestions**: Before/after code comparison for each vulnerability
- **AI Deep Fix**: Enhanced fix generation via `/api/generate-fix`
- **Report download**: JSON report download per scan
- **Example contracts**: VulnerableBank, InsecureToken, SafeBank preloaded

## API Endpoints

- `GET /api/healthz` — Health check
- `POST /api/scan` — Scan Solidity code, returns vulnerabilities JSON
- `POST /api/generate-fix` — Enhanced fix for a specific vulnerability
- `GET /api/report/:scanId` — Retrieve stored scan result

## Key Files

- `artifacts/api-server/src/routes/vulnguard/scan.ts` — Main scan route (Claude integration)
- `artifacts/api-server/src/routes/vulnguard/prompts.ts` — System prompts and user prompt builder
- `artifacts/api-server/src/routes/vulnguard/store.ts` — In-memory scan store
- `artifacts/vulnguard/src/pages/Home.tsx` — Main app UI
- `artifacts/vulnguard/src/hooks/use-scanner.ts` — Scanner state and API hooks
- `artifacts/vulnguard/src/components/VulnerabilityCard.tsx` — Vulnerability display card
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types from OpenAPI spec

## Notes

- Scans are stored in memory only (session-based, not persisted to DB)
- Anthropic AI uses Replit AI Integrations (no user API key needed)
- GitHub integration (scan repos) is out of scope for MVP
