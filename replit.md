# Workspace

## Overview

pnpm workspace monorepo using TypeScript. VulnGuard AI — an AI-powered Solidity smart contract vulnerability scanner with authentication, teams, and scan persistence.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (users, sessions, teams, scans, api_keys)
- **Auth**: Replit Auth (OIDC with PKCE) via `openid-client` v6
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenRouter-backed model access via `@workspace/integrations-anthropic-ai`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (scan, auth, teams, report routes)
│   └── vulnguard/          # React + Vite frontend (VulnGuard AI main app)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-anthropic-ai/  # Anthropic AI client (Replit AI Integrations)
│   └── replit-auth-web/    # Browser auth hook (useAuth)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- **users** — id, email, first_name, last_name, profile_image_url, timestamps
- **sessions** — sid, sess (JSONB with user + tokens), expire
- **teams** — id, name, slug, owner_id, timestamps
- **team_members** — id, team_id, user_id, role (admin/editor/viewer), unique(team_id, user_id)
- **scans** — id, user_id, team_id, contract_name, contract_code, contract_hash, risk_score, status, vulnerabilities (JSONB), summary, execution_time, model_used, timestamps
- **api_keys** — id, user_id, team_id, name, key, rate_limit, timestamps

## Auth Flow

- **Web**: Browser redirects to `/api/login` → Replit OIDC → `/api/callback` → session cookie → redirect back
- **Frontend**: `useAuth()` hook from `@workspace/replit-auth-web` handles user state, login/logout
- **Middleware**: `authMiddleware` loads user from session on every request, patches `req.isAuthenticated()`
- **Sessions**: Stored in PostgreSQL `sessions` table with 7-day TTL

## VulnGuard AI Features

- **Solidity code editor**: Monaco editor with syntax highlighting, drag-and-drop .sol file support
- **AI scanning**: OpenRouter model analyzes contracts for 15+ vulnerability types
- **SSE streaming**: Real-time vulnerability results via `/api/scan-stream`
- **Vulnerability detection**: Reentrancy, Access Control, Integer Overflow, Unchecked Calls, etc.
- **Severity scoring**: CRITICAL / HIGH / MEDIUM / LOW with risk score 0-100
- **Fix suggestions**: Before/after unified diff view with line numbers
- **PDF audit report**: Cover page, donut chart, vulnerability details via PDFKit
- **Scan persistence**: Authenticated scans are saved to PostgreSQL
- **Dashboard**: Scan history, stats (total scans, avg risk, high risk count)
- **Profile page**: User info, scan count, subscription tier display
- **Team management**: Create teams, invite members by email, role-based access (admin/editor/viewer)
- **User menu**: Dropdown with links to Dashboard, Profile, Teams, Log out
- **Example contracts**: VulnerableBank, InsecureToken, SafeBank preloaded

## API Endpoints

### Auth
- `GET /api/auth/user` — Get current authenticated user
- `GET /api/login` — Start OIDC login flow
- `GET /api/callback` — OIDC callback
- `GET /api/logout` — Logout and redirect

### Scanner
- `GET /api/healthz` — Health check
- `POST /api/scan` — Scan Solidity code (JSON response)
- `POST /api/scan-stream` — Scan with SSE streaming
- `POST /api/generate-fix` — Enhanced fix for a specific vulnerability
- `GET /api/report/:scanId` — Download PDF audit report

### User & Teams (require auth)
- `GET /api/user/profile` — Get user profile with scan count
- `GET /api/user/scans` — List user's scan history
- `GET /api/teams` — List teams user belongs to
- `POST /api/teams` — Create a new team
- `GET /api/teams/:teamId/members` — List team members
- `POST /api/teams/:teamId/members` — Invite member by email
- `PATCH /api/teams/:teamId/members/:memberId` — Update member role
- `DELETE /api/teams/:teamId/members/:memberId` — Remove member
- `DELETE /api/teams/:teamId` — Delete team (owner only)

## Frontend Routes

- `/` — Home page (scanner)
- `/dashboard` — Scan history dashboard (auth required)
- `/profile` — User profile (auth required)
- `/teams` — Team management (auth required)

## Key Files

- `artifacts/api-server/src/app.ts` — Express app setup with auth middleware
- `artifacts/api-server/src/routes/auth.ts` — OIDC auth routes
- `artifacts/api-server/src/routes/teams.ts` — Teams + user profile/scans API
- `artifacts/api-server/src/lib/auth.ts` — Session CRUD, OIDC config
- `artifacts/api-server/src/middlewares/authMiddleware.ts` — Auth middleware
- `artifacts/api-server/src/routes/vulnguard/scan-stream.ts` — SSE scan endpoint
- `lib/db/src/schema/auth.ts` — Users + sessions schema
- `lib/db/src/schema/teams.ts` — Teams, members, API keys schema
- `lib/db/src/schema/scans.ts` — Scans schema
- `lib/replit-auth-web/src/use-auth.ts` — Frontend auth hook
- `artifacts/vulnguard/src/components/UserMenu.tsx` — User dropdown menu
- `artifacts/vulnguard/src/pages/Dashboard.tsx` — Dashboard page
- `artifacts/vulnguard/src/pages/Profile.tsx` — Profile page
- `artifacts/vulnguard/src/pages/Teams.tsx` — Team management page
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json`. The root `tsconfig.json` lists all lib packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types from OpenAPI spec

## Notes

- Scans are stored both in-memory (for PDF report access) and in PostgreSQL (for authenticated users)
- Anthropic AI uses Replit AI Integrations (no user API key needed)
- Auth uses Replit OIDC — no custom login forms
- Team member mutations are scoped by both teamId and memberId (IDOR-safe)
- GitHub repo: https://github.com/IamHammadDevX/VulnGaurd-AI.git
