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
- [x] DB deps: `kysely`, `postgres` + `kysely-postgres-js` (Bun), `dotenv` (dev). Add `kysely-supabase` (dev) for Supabase type bridge.
- [ ] Guardrails deps: HTTP client (`undici` or fetch), types for Presidio/Llama Guard.
- [x] UI deps: `tailwindcss` (v4), `clsx`, `@radix-ui/*` (via shadcn), `lucide-react`.
- [x] shadcn namespace registries: configure namespaces `ui`, `kibo`, `ai` per link.
- [x] Add `components.json` in each UI package with `namespace`; CLI initialization pending.
 - [x] Install shadcn components in `ui/ui` via CLI/registry (core, overlay, nav, feedback) and ensure build + lint pass.
 - [x] Install Kibo UI components in `ui/kibo` (snippet, announcement, banner, pill, marquee, status, theme-switcher, tree) and ensure build + lint pass.
 - [x] Normalize exports: root package exports for `@alphagate/ui` and `@alphagate/kibo`.
 - [ ] Finalize Tailwind integration across apps; current dev route serves `ui/ui` CSS in Dashboard (`/styles/ui.css`).

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

## Milestone 1 — MVP E2E (Auth → Endpoint Studio → Publish/Consume)

Goal: A developer can sign up/sign in, create and publish an endpoint (workflow/app) with policies, and another developer can sign up/sign in, install it, get an API key, and call it via the OpenAI Responses interface. Prioritize Screentime (vision-screencast-evaluator) using Qwen-VL on Alpha Gate pods (RunPod/vLLM via Portkey OSS gateway).

Execution Order (2-week MVP sprint)
1) Contracts: Admin DTOs + OpenAI Responses Zod; generate typed client for Console.
2) Data: Kysely migrations for orgs/users/memberships/api_keys/endpoints/endpoint_versions/endpoint_models/policies/audit_log; seed defaults.
3) Main app (minimal internal/admin): `/internal/auth-key`, `/internal/endpoint-config`; `/admin/keys` (create/list) and `/admin/endpoints` (create/list/publish) minimal.
4) Edge auth + resolve: validate API key, resolve endpoint config, map to provider, proxy to Portkey, unify errors.
5) Edge SSE keep-alive: inject comments every ~10–20s while streaming.
6) Edge quotas (skeleton): DO counters per (org,key,endpoint); enforce 429 once wired; behind flag.
7) Console v0: API Keys page (create/copy), Endpoints list/create (identity/routing/schema/policies minimal), Publish & Install flows.
8) Screentime preset: `vision-screencast-evaluator` template with schema + routing to Qwen‑VL.
9) Deploy + smoke: wrangler dev → CF; main-app local; non-stream + stream e2e scripts; fix.
10) A11y & docs: Button type defaults; Next metadata; README + plan refresh done.

Foundations
- [x] Route: `/v1/responses` on edge (Hono @ CF Workers) wired to Portkey.
- [x] Request/response types in `packages/contracts` aligned with OpenAI Responses (for Admin API + UI typing).
- [x] HMAC API key auth: prefix lookup + `secret_hash` compare; map to (org, key) in main DB (`/internal/auth-key`).
- [x] Config fetch: edge fetches endpoint config from main app; [ ] KV cache key `org:endpoint:version` with TTL; invalidate on publish.

Quota & SSE
- [ ] Durable Object counters per (org, key, endpoint) with TTL windows.
- [ ] Rolling windows: hour/day/month; exceed behavior → 429 or soft-limit flag.
- [x] Keep-alive SSE: send comment lines `:\n` every 10–20s during provider streams.

Routing
- [x] Edge proxy wired to Portkey OSS gateway (env: `PORTKEY_GATEWAY_URL`, `PORTKEY_ORG_TOKEN`).
- [x] Endpoint config mapping: model: "{endpointName}" → provider target (e.g., `qwen-vl` on RunPod/vLLM) with failover/policies.
- [x] Consistent error mapping `{ code, message, details }`.
- [ ] (Defer) Emit `usage_event` (queue/ingest) — not required for MVP.

Config & deploy
- [ ] `wrangler.toml` with KV, DO bindings, Queues.
- [ ] Local dev: `wrangler dev` streaming path works.
- [ ] Deploy to Cloudflare and smoke test.

Acceptance
- [ ] Dev A creates endpoint; Dev B installs; Requests to `/v1/responses` stream responses; structured JSON validates.

Auth & Tenancy (Better Auth + Supabase/Kysely)
- [ ] Better Auth minimal setup (email/password) in `packages/auth` and consume in Dashboard + Main App.
- [ ] Session cookies configured from env (`AUTH_URL`, `AUTH_SECRET`, secure flags in prod).
- [ ] Tenancy bootstrap: on first signup create a personal org; store user/org/role.

Console (Dashboard) — Framework: Next.js 15 (App Router)
- [ ] Endpoints page: list + create/edit wizard (Identity, Routing, Policies, Quotas, Structured Output JSON schema, Prompt template, Test harness).
- [ ] API Keys page: create/revoke/rotate; copy snippets.
- [ ] Organization page: members/roles (basic), org settings (grade band defaults, retention).
- [ ] Policies page: presets (grade bands, PII redaction toggle, retention days).
- [ ] Publish toggle: mark endpoint Public; appear in Catalog list.
- [ ] Catalog: list public endpoints; "Install" clones into consumer org.

Admin API (Main App, Hono)
- [ ] `/orgs`, `/users` (authn/authz), `/endpoints` (CRUD + publish), `/keys` (CRUD), `/policies` (CRUD).
- [x] `/internal/endpoint-config` (edge fetch): resolve (org, endpointName) → config JSON + version.
- [x] `/internal/auth-key` (edge fetch): resolve API key → (org_id, api_key_id, scopes).
- [ ] BYOK store (encrypted in DB; optional for MVP if using pooled RunPod token).

Data Model & Migrations (MVP scope)
- [x] Tables & indexes (Kysely migrations): `organizations`, `users`, `memberships`, `api_keys`, `endpoints`, `endpoint_versions`, `policies`, `audit_log`.
- [ ] Seed: create default policy presets; create Screentime template endpoint.

Screentime (Qwen-VL on Alpha Gate pods)
- [ ] Deploy/attach Qwen-VL model on RunPod/vLLM (Alpha Gate pod) — configure provider in Portkey gateway.
- [ ] Endpoint template: `vision-screencast-evaluator` with structured JSON schema (use §6 in integration guide).
- [ ] Wizard preset for Screentime: prefill routing to Qwen-VL, policies (PII on, retention 24h), JSON schema.
- [ ] Developer usage snippet/docs: OpenAI Responses example (non-stream + SSE) referencing endpoint name.

Files/Uploads (defer full service)
- [ ] (Defer) Signed URL upload service; for MVP, accept external URLs or base64 in tests.

Out of scope for this milestone
- [ ] ClickHouse analytics (defer to later milestone).
- [ ] Events API ingestion & correlation (optional later).

Backend plumbing
- [x] Env loader (Zod) in `apps/main-app/src/config/env.ts`.
- [x] Kysely client with `postgres` + `kysely-postgres-js` (Bun) `apps/main-app/src/services/db.ts`.
- [x] ClickHouse client (HTTP) `apps/main-app/src/services/clickhouse.ts`.
- [x] AWS KMS decrypt stub `apps/main-app/src/services/kms.ts`.
- [x] Better Auth: installed; setup stub added; configure adapter/store next.
- [ ] Supabase client wiring for non-SQL features (optional now).
- [x] Install dev: `kysely-supabase` and generate Supabase types.
- [x] Generate types: `npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID`.

---

## Milestone 2 — Main App Skeleton (Bun + Hono)

APIs & Services
- [ ] Hono routes: `/orgs`, `/users`, `/endpoints`, `/keys`, `/policies`, `/catalog`.
- [ ] `/internal/endpoint-config` for edge lookup.
- [ ] BYOK decrypt service interface (AWS KMS stub).
- [ ] Policy services orchestrator interface (Presidio/Llama Guard clients stubbed).

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
- [x] Kysely Bun client in main-app using PostgresJS dialect.
- [ ] Migration scripts: `bun db:migrate`, `bun db:generate`.
- [x] Supabase types bridge (`kysely-supabase`) wired in `apps/main-app/src/types/db.ts`.

Acceptance
- [ ] Migrations apply cleanly to a Supabase instance; types compile.

---

## Milestone 4 — Dashboard (Console)

Structure
- [ ] Choose SSR: Hono SSR (default) or Next.js; document choice.
- [ ] Tailwind v4 + shadcn/ui base (`ui/ui`), Kibo tables (`ui/kibo`), ai-sdk elements (`ui/ai`).

Pages
- [ ] Auth pages: Sign in / Sign up (Better Auth)
- [ ] Overview
- [ ] Endpoints (wizard + playground with image+JSON sample)
- [ ] API Keys
- [ ] Organization
- [ ] Policies (presets)
- [ ] Catalog (browse/install)

Auth
- [ ] Better Auth wired; sessions; protected routes; org context switcher.

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

---

## Handoff to Next Agent — MVP E2E Snapshot (Sep 2025)

Context
- Goal: A developer can sign up/sign in, create and publish an endpoint (workflow/app) with policies, and another developer can sign up/sign in, install it, get an API key, and call it via the OpenAI Responses interface.
- Focus workflow: Screentime vision (Qwen‑VL on RunPod via Portkey OSS), OpenAI Responses-compatible surface.

What’s implemented (dev-ready)
- Edge Worker (CF + Hono):
  - `/v1/responses` OpenAI-compatible proxy → Portkey.
  - Validates AlphaGate API key with main-app; resolves endpoint config; rewrites `model` to provider model; streams with keep‑alive comments.
  - File: `apps/edge-worker/src/index.ts`. Vars used: `MAIN_APP_URL`, `PORTKEY_GATEWAY_URL`, `PORTKEY_ORG_TOKEN`.
- Main App (Bun + Hono):
  - Internal APIs: `POST /internal/auth-key` (API key → org/key), `POST /internal/endpoint-config` (org+endpoint → routing/policies/quotas/schema).
  - Admin APIs: `GET/POST /admin/keys`, `GET/POST /admin/endpoints`, `POST /admin/endpoints/:id/publish`, `POST /admin/endpoints/:id/install`, `GET /admin/catalog`.
  - Kysely migrations + runner + seed script. Seed creates a dev org, default API key, Screentime endpoint template.
  - Files: `apps/main-app/src/routes/*`, `apps/main-app/src/db/migrations/0001-init.ts`, `apps/main-app/src/db/migrate.ts`, `apps/main-app/src/db/seed.ts`.
- Contracts (Zod):
  - OpenAI Responses request and streaming event schemas; admin/internal DTOs.
  - File: `packages/contracts/src/index.ts`.
- Console (Next.js 15 + React 19):
  - `/keys`: list + create keys (token returned via API; not persisted in UI).
  - `/endpoints`: list + create minimal endpoints; publish action.
  - `/catalog`: list public endpoints; install into org.
  - Files: `apps/dashboard/app/{keys,endpoints,catalog}/page.tsx`.
- A11y/Next fixes: Next metadata API; default `type="button"` in shared UI buttons.

Environment & local run (dev)
1) Database and seed
   - `cd apps/main-app && bun run db:migrate && bun run db:seed`
   - Seed output: `apps/main-app/.tmp/seed-output.json` (contains `org_id` and `api_key_token`).
2) Main App
   - `cd apps/main-app && bun run dev` (default http://localhost:3001)
3) Portkey Gateway (OSS)
   - `npx @portkey-ai/gateway` → gateway `http://localhost:8787/v1`, console `http://localhost:8787/public/`
   - Configure route to RunPod vLLM OpenAI endpoint for Qwen‑VL; have workspace token available.
4) Edge Worker (local)
   - `cd apps/edge-worker`
   - `wrangler dev --port 8788 \
      --var MAIN_APP_URL=http://localhost:3001 \
      --var PORTKEY_GATEWAY_URL=http://localhost:8787 \
      --var PORTKEY_ORG_TOKEN=<your_portkey_token>`
5) Console (Next.js)
   - In `.env`, set:
     - `NEXT_PUBLIC_MAIN_APP_URL=http://localhost:3001`
     - `NEXT_PUBLIC_DEFAULT_ORG_ID=<org_id from seed>`
   - `cd apps/dashboard && bun run dev` (default http://localhost:3000)
6) E2E call
   - Use the seeded `api_key_token` as `Authorization: Bearer` when calling `http://localhost:8788/v1/responses`.
   - Payload shape from `.docs/integration-guide.md` (model: `vision-screencast-evaluator`, multimodal parts). Verify stream + structured JSON.

Remaining for MVP (high priority)
1) Console (Endpoint wizard polish)
   - Add fields to paste JSON schema and tweak policy presets (grade band, PII on/off, retention days).
   - Show last active version and simple status labels (draft/public).
2) Admin API enhancements
   - `POST /admin/endpoints/:id/promote` (optional for MVP) to formalize version promotion.
   - Ensure `install` enforces visibility (allow only public or same‑org installs).
3) Edge cache + quotas (skeleton acceptable for MVP)
   - KV read‑through cache for `/internal/endpoint-config` with TTL; invalidate on publish.
   - Durable Object `QuotaCounters` per (org,key,endpoint) with hourly/day windows; return 429 on exceed (behind a feature flag).
4) Basic auth (post‑MVP polish, or minimal now)
   - Wire Better Auth for Console + Admin routes; bootstrap personal org on signup.
5) Docs & DX
   - Add a Portkey example config (RunPod vLLM target + retry: 3) and curl examples into README.

Acceptance criteria (MVP)
- Developer A can create an endpoint (with JSON schema and policies), publish it public, and see it in the Catalog.
- Developer B can install that endpoint into their org, create an API key, and call `/v1/responses` via the Edge Worker (OpenAI SDK), receiving streamed output and passing schema validation.
- Edge enforces auth, resolves config, injects SSE keep‑alive, maps endpoint to provider model, and normalizes errors.

Notes
- BYOK and Stripe billing are out of scope for the MVP; pooled provider keys in Portkey are assumed.
- Analytics (ClickHouse) is deferred; minimal structured logging exists.
