# Alpha Gate — Execution Tracker

Single source of truth for delivery. Check off tasks as completed. Milestone 0 focuses on repo scaffolding, dependencies, and GitHub initial push.

How to use
- [ ] Maintain this doc as you go; keep items granular.
- [ ] When scope changes, append tasks instead of rewriting history.
- [ ] Link PRs next to tasks like: (PR: #123)

Owner Roles (initial)
- Tech lead: TBD
- Infra/CI: TBD
- Backend: TBD
- Edge/Workers: TBD
- Frontend: TBD
- Data (Supabase/ClickHouse): TBD

---

## Milestone 0 — Repo Bootstrap, Dependencies, GitHub (Target: day 1–2)

Environment prerequisites
- [x] Install `git` (latest) and authenticate with GitHub CLI (`gh auth login`) or SSH keys.
- [x] Install `bun` (>= 1.1) and add to PATH.
- [x] Install Node.js LTS (for tooling compatibility), `corepack enable` if using pnpm/yarn occasionally.
- [ ] Install `just` (optional task runner) and `jq` (scripts/utilities).

Initialize repo & workspace
- [x] Create monorepo folders per plan:
  - [x] `apps/edge-worker`
  - [x] `apps/main-app`
  - [x] `apps/dashboard`
  - [x] `packages/contracts`
  - [x] `packages/db`
  - [x] `packages/auth`
  - [x] `packages/billing`
  - [x] `packages/guardrails`
  - [x] `ui/ui`
  - [x] `ui/kibo`
  - [x] `ui/ai`
- [x] Add root `.gitignore` (Node/Bun/coverage/build/artifacts/.env.local, etc.).
- [x] Add `.editorconfig` (2 spaces, LF, utf-8, trim trailing whitespace).
- [x] Add `README.md` with quickstart and repo layout.
- [ ] Add `LICENSE` (choose SPDX: MIT/Apache-2.0/BSL etc.).

Package management & workspaces
- [x] Create root `package.json` with Bun workspaces:
  - [x] `"packageManager": "bun@<latest>"`
  - [x] `"workspaces": ["apps/*", "packages/*", "ui/*"]`
  - [x] Scripts: `build`, `dev`, `lint`, `typecheck`, `test`, `format`, `turbo`.
- [ ] Add `bunfig.toml` for workspace settings (if needed).
- [x] Add `tsconfig.base.json` with common compiler options.

Tooling: Turborepo + Changesets + Biome/Ultracite
- [x] Add Turborepo: `bun add -D turbo` and root `turbo.json` tasks (build, lint, typecheck, test).
- [ ] Add Changesets: `bun add -D @changesets/cli` and run `bun changeset init` → `.changeset/config.json`.
- [x] Add Biome + Ultracite preset: `bun add -D @biomejs/biome ultracite`; root `biome.json` extends `ultracite`; scripts `lint`/`format` use Ultracite.
- [ ] Add `simple-git-hooks` + `lint-staged` (optional) for pre-commit formatting.

Baseline TypeScript and testing
- [x] Add TypeScript: `bun add -D typescript` at root; per-package `tsconfig.json` extends base.
- [x] Add test runner: Vitest — `bun add -D vitest @vitest/ui @vitest/coverage-v8` and root `vitest.config.ts`.

App/package skeletons (empty, compile-ready)
- [x] `apps/edge-worker`: `package.json`, `tsconfig.json`, `wrangler.toml`, `src/index.ts` with minimal Hono app.
- [x] `apps/main-app`: `package.json`, `tsconfig.json`, `src/index.ts` with Hono server bootstrap.
- [x] `apps/dashboard`: Hono SSR minimal page + React render stream.
- [x] `packages/contracts`: `package.json`, `src/index.ts` (Zod schema placeholder).
- [x] `packages/db`: `package.json`, `src/index.ts` (Kysely client factory placeholder).
- [x] `packages/auth`: `package.json`, `src/index.ts` (Better Auth adapter placeholder).
- [x] `packages/billing`: `package.json`, `src/index.ts` (cost tables/types placeholder).
- [x] `packages/guardrails`: `package.json`, `src/index.ts` (Presidio/Llama Guard client placeholders).
- [x] `ui/ui`, `ui/kibo`, `ui/ai`: `package.json`, `src/index.tsx` with namespaces.

Initial dependencies (minimal to build/run stubs)
- [x] Root dev deps: `typescript`, `turbo`, `@changesets/cli`, `@biomejs/biome`, `vitest`, `ultracite`.
- [ ] Edge Worker deps: `hono`, `@cloudflare/workers-types` (dev), `wrangler` (dev for local dev/deploy script).
- [ ] Main App deps: `hono`, `hono/cors`, `zod`.
- [ ] Dashboard deps: `hono`, `zod`, `tailwindcss` (v4), `@tanstack/react-router` or Hono SSR utilities (if chosen), `react`, `react-dom`.
- [ ] Contracts deps: `zod`, `openapi-typescript` (dev) or `orval` (dev) for client generation.
- [ ] DB deps: `kysely`, `pg` (or `postgres` driver), `dotenv` (dev), `drizzle-kit` (optional) if used for migration scaffolding.
- [ ] Guardrails deps: HTTP client (`undici` or fetch), types for Presidio/Llama Guard.
- [x] UI deps: `tailwindcss` (v4), `clsx`, `@radix-ui/*` (via shadcn), `lucide-react`.
- [x] shadcn namespace registries: configure namespaces `ui`, `kibo`, `ai` per link.
- [x] Add `components.json` in each UI package with `namespace`; CLI initialization pending.

Configuration files
- [x] Root `turbo.json` with tasks for `build`, `dev`, `lint`, `typecheck`, `test`.
- [ ] Root `.changeset/config.json` and a placeholder changeset.
- [x] Root `.vscode/extensions.json` and `settings.json` (recommended extensions).
- [x] Root `.env.example` with placeholders: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLICKHOUSE_URL`, `PORTKEY_API_KEY`, `AWS_REGION`, `AWS_KMS_KEY_ID`.

GitHub: repo connection and CI
- [x] `git init` and set default branch to `main`.
- [x] `git remote add origin` and push to `github.com/MitchForest/alphagate.git` (commit: 6dec7cd).
- [x] `.github/workflows/ci.yml`: checkout, setup-bun, install, build, test, lint (Ultracite).
- [ ] (Optional) Add `openapi-drift.yml` workflow placeholder (runs generation and checks diff on PRs).
- [ ] (Optional) Add `deploy-preview.yml` for Workers preview on PRs.
- [x] Initial commits: bootstrap + configs + fixes.
- [x] Push: `main` branch up to origin.
- [ ] Protect `main` in GitHub (require status checks, linear history).

Acceptance criteria
- [x] `bun install` at repo root completes without errors.
- [x] `bun run build` succeeds for all packages/apps (stubs compile).
- [ ] CI passes on GitHub for the initial push (awaiting run on origin).

---

## Milestone 1 — Edge Proxy MVP (Cloudflare Workers + Hono)

Foundations
- [ ] Choose region/route: `/v1/responses` (OpenAI-compatible).
- [ ] Define request/response types aligned with OpenAI Responses (reuse schemas from `packages/contracts`).
- [ ] Implement HMAC API key auth: prefix lookup and `secret_hash` compare; org + key resolution.
- [ ] KV cache for org/endpoint config: key = `org:endpoint:version`.

Quota & SSE
- [ ] Durable Object counters per (org, key, endpoint) with TTL windows.
- [ ] Rolling windows: hour/day/month; exceed behavior → 429 or soft-limit flag.
- [ ] Keep-alive SSE: send comment lines `:\n` every 10–20s during provider streams.

Routing
- [ ] Integrate Portkey client; configure regional pin.
- [ ] Map Alpha Gate request → Portkey → provider; consistent error mapping `{ code, message, details }`.
- [ ] Emit `usage_event` to Cloudflare Queues on completion.

Config & deploy
- [ ] `wrangler.toml` with KV, DO bindings, Queues.
- [ ] Local dev: `wrangler dev` streaming path works.
- [ ] Deploy to Cloudflare and smoke test.

Acceptance
- [ ] OpenAI SDK request with `baseURL` pointing to Worker returns valid response & supports stream.

---

## Milestone 2 — Main App Skeleton (Bun + Hono)

APIs & Services
- [ ] Hono app bootstrap with routes: `/orgs`, `/endpoints`, `/keys`, `/policies`, `/pricing` (stubs returning 200 + types).
- [ ] BYOK decrypt service interface (AWS KMS stub).
- [ ] Policy services orchestrator interface (Presidio/Llama Guard clients stubbed).
- [ ] Queue consumer endpoint for `usage_event` ingestion.

Infra wiring
- [ ] Config loader (`.env`) and typed config.
- [ ] Health endpoints and request logging (OTel hooks stub).

Acceptance
- [ ] `bun run dev` serves and endpoints respond with typed payloads.

---

## Milestone 3 — Data Layer (Supabase + Kysely + Migrations)

Schema & migrations
- [ ] Define tables: `organizations`, `users`, `api_keys`, `endpoints`, `endpoint_models`, `guardrail_policies`, `usage_events`, `cost_tables`, `audit_log`.
- [ ] Create Kysely migrations; generate types.
- [ ] Add indexes as per plan.

Connections & codegen
- [ ] Kysely client factory in `packages/db` with connection pooling.
- [ ] Migration scripts: `bun db:migrate`, `bun db:generate`.

Acceptance
- [ ] Migrations apply cleanly to a Supabase instance; types compile.

---

## Milestone 4 — Dashboard Skeleton (Console)

Structure
- [ ] Choose SSR: Hono SSR (default) or Next.js; document choice.
- [ ] Tailwind v4 + shadcn/ui base (`ui/ui`), Kibo tables (`ui/kibo`), ai-sdk elements (`ui/ai`).

Pages (stubs)
- [ ] Overview
- [ ] Endpoints (wizard + playground shell)
- [ ] API Keys
- [ ] Usage
- [ ] Logs (basic)
- [ ] Organization
- [ ] Policies (presets)

Auth
- [ ] Better Auth wired to Supabase via `packages/auth`.

Acceptance
- [ ] Can navigate between stubs; basic state flows work.

---

## Milestone 5 — Guardrails (Minimal)

Clients
- [ ] `packages/guardrails`: HTTP clients for Presidio (PII) and Llama Guard (safety), env-configurable endpoints.
- [ ] Add adapter interfaces and DTOs.

Integration
- [ ] Edge lightweight allowlist/shape checks.
- [ ] Main app pre/post request policy application.

Acceptance
- [ ] Toggle policies per endpoint; see flags in `usage_event.guardrail_flags_json`.

---

## Milestone 6 — Analytics & Observability

Pipelines
- [ ] Main app consumer enriches `usage_event` with cost tables and writes to Supabase + ClickHouse.
- [ ] Nightly reconciliation of DO snapshots.

Telemetry
- [ ] OTel spans edge → Portkey → provider.
- [ ] Dashboards for latency, error rate, tokens/sec.

Console
- [ ] Usage & Analytics charts (Recharts) pulling from ClickHouse.

Acceptance
- [ ] p95 added edge latency < 60ms; stream TTFB < 2s (provider-dependent).

---

## Milestone 7 — Product Stub: Screen Recorder (Beta Tile)

- [ ] Dashboard “Products” tile for Screen Recorder with install CTA.
- [ ] Stub evaluator endpoint using Qwen-VL; sample response fixture for UI demo.
- [ ] Privacy/consent copy and retention settings surfaced.

---

## Milestone 8 — Docs & DX

- [ ] OpenAPI generation from Zod (`packages/contracts`) and publish typed clients.
- [ ] Quickstart guides (OpenAI SDK compatible), examples, and SDK snippets.
- [ ] Add `docs:` CI job to verify no OpenAPI drift in PRs.

---

## Backlog (Phase 2+ per plan)

- [ ] Providers: Anthropic + Gemini integration; endpoint-level failover policies.
- [ ] Billing: Stripe metered billing and invoices.
- [ ] RBAC expansion: teacher, student, parent roles; SSO.
- [ ] Catalog: publish public endpoints; install/fork flows.
- [ ] Private model hosting; fine-tuning-as-a-service.
- [ ] Marketplace monetization; workflow builder.
- [ ] Proactive protection (prompt-injection, anomaly detection); auto model selection by task/cost/latency/quality.

---

## Command Snippets (for Milestone 0)

Initialize git & push
```bash
git init -b main
git remote add origin git@github.com:MitchForest/alphagate.git
git add .
git commit -m "chore: bootstrap monorepo (turbo + changesets + stubs)"
git push -u origin main
```

Install core tooling (root)
```bash
bun add -D turbo @changesets/cli typescript @biomejs/biome vitest @vitest/ui @vitest/coverage-v8
```

Changesets init
```bash
bun x changeset init
```

CI skeleton (workflows/ci.yml) — steps
- actions/checkout@v4
- oven-sh/setup-bun@v1
- bun install
- bun x turbo run lint typecheck test build --cache-dir=.turbo
