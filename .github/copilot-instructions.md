# Project Guidelines

## Build And Test
- Package manager: pnpm only. Do not use npm or yarn.
- Install dependencies: pnpm install
- Root build: pnpm run build
- Root typecheck: pnpm run typecheck
- API dev server: pnpm --filter @workspace/api-server run dev
- Frontend dev server: pnpm --filter @workspace/vulnguard run dev
- Database schema push: pnpm --filter @workspace/db run push
- API code generation: pnpm --filter @workspace/api-spec run codegen
- There is no dedicated automated test suite in this workspace. Use typecheck plus targeted manual scripts in repo root (for example test-scan.ps1) when validating scan flows.

## Architecture
- Monorepo with pnpm workspaces.
- Main runtime apps:
  - artifacts/api-server: Express 5 + TypeScript backend (default port 8080)
  - artifacts/vulnguard: React 19 + Vite frontend (default port 5173)
- Shared libraries:
  - lib/db: Drizzle ORM schema and DB connection
  - lib/api-spec: OpenAPI source and codegen config
  - lib/api-zod: generated zod validators
  - lib/api-client-react: generated React Query client
  - lib/integrations-anthropic-ai: AI provider client integration
  - lib/replit-auth-web: frontend auth hook
- For deeper architecture and API flow details, read README.md and replit.md first before changing structural behavior.

## Conventions
- TypeScript is strict and ESM-oriented across packages. Preserve existing module style and package exports.
- Prefer root-level typecheck before finishing changes to catch cross-package reference issues.
- Keep API contracts aligned with generated clients:
  - If OpenAPI changes, run pnpm --filter @workspace/api-spec run codegen.
- Validate input with generated zod schemas where available rather than hand-rolled runtime checks.
- Avoid introducing new conventions unless already present in the nearest package.

## Environment And Runtime
- Use .env.example as the source of truth for required environment variables.
- API loads .env from multiple candidate locations; preserve this behavior when editing startup/bootstrap logic.
- Frontend expects API at /api via Vite proxy to http://localhost:8080 in local dev.

## Windows And Local Dev Gotchas
- Keep install and run scripts cross-platform (avoid shell-only sh/bash patterns in package scripts).
- Frontend package includes explicit Windows native dependencies for rollup/lightningcss/tailwind oxide; do not remove these without a verified replacement.
- Ensure PORT values are numeric and positive for both API and frontend configs.

## Link First, Do Not Duplicate
- Setup and runbook: README.md
- Detailed architecture and route overview: replit.md
- Env variable reference: .env.example
- If a change needs deeper policy documentation, add or update a focused doc and link to it here instead of expanding this file heavily.
