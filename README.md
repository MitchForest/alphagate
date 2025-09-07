# Alpha Gate (Monorepo)

Alpha Gate is an OpenAI Responses–compatible routing layer for education. It gives developers, educators, and institutions a fast, safe way to use closed models (GPT/Claude/Gemini), open models we host (e.g., Qwen/Llama via vLLM/TGI), and private/tenant keys (BYOK) with guardrails, quotas, and observability built in.

## TL;DR
- Public API: OpenAI Responses–compatible (`POST /v1/responses`, streaming SSE, structured JSON output)
- Edge: Cloudflare Worker (Hono) proxy → Portkey OSS Gateway → providers (RunPod vLLM/TGI, etc.)
- Control plane: Bun + Hono (“main-app”) for Admin APIs, endpoint config, keys, policies
- Data: Supabase Postgres via Kysely (PostgresJS dialect); ClickHouse later
- Auth: Better Auth (sessions, org/membership bootstrap)
- MVP first workflow: Screentime (vision) using Qwen‑VL on Alpha Gate pods (RunPod/vLLM)

## Architecture (MVP)
- `apps/edge-worker`: Cloudflare Worker (Hono)
  - `/v1/responses`: forwards to Portkey OSS Gateway (`PORTKEY_GATEWAY_URL`, `PORTKEY_ORG_TOKEN`)
  - Will fetch endpoint config from main-app; KV cache; basic quotas (DO) later
- `apps/main-app`: Bun + Hono service
  - Admin APIs: orgs/users, endpoints (CRUD+publish), keys (create/rotate), policies, catalog
  - Internal: `/internal/endpoint-config` for edge to resolve (org, endpointName) → config JSON
  - Services: Kysely DB client, AWS KMS decrypt, ClickHouse client (deferred for MVP analytics)
- `apps/dashboard`: Next.js 15 + React 19 (App Router) console
  - Auth (Better Auth), Endpoint Studio, API Keys, Policies, Catalog (publish/install)
- Providers & routing
  - Portkey OSS Gateway → RunPod/vLLM (Qwen‑VL) and other providers
  - BYOK stored encrypted (KMS), pooled keys otherwise

## Monorepo layout
- Apps: `apps/edge-worker`, `apps/main-app`, `apps/dashboard`
- Packages: `packages/contracts`, `packages/db`, `packages/auth`, `packages/billing`, `packages/guardrails`
- UI: `ui/ui` (shadcn primitives), `ui/kibo` (Kibo components), `ui/ai` (ai elements)

## Tech stack
- Runtime/tooling: Bun, TypeScript, Turborepo, Ultracite/Biome, Vitest
- Web: Next.js 15, React 19
- Edge: Cloudflare Workers + Hono
- Backend: Hono (Bun), Kysely + `postgres` + `kysely-postgres-js`, Zod
- Auth: Better Auth
- Providers: Portkey (OSS gateway), RunPod (vLLM/TGI), AWS KMS for BYOK
- UI system: shadcn (namespaced), Kibo UI (both React peerDeps; no duplicate React)

## Environment
Copy `.env.example` → `.env` and fill keys. Important:
- Supabase DB: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Supabase types (already generated): `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`
- Portkey (OSS): `PORTKEY_GATEWAY_URL`, `PORTKEY_ORG_TOKEN`
- Auth (Better Auth): `AUTH_URL`, `AUTH_SECRET`, cookie flags
- Optional: ClickHouse (`CLICKHOUSE_*`), AWS KMS (`AWS_*`) for BYOK

## Getting started
- Prereqs: Bun, Node LTS, Supabase project (or local), Cloudflare account (for Worker), Docker (optional for ClickHouse later)
- Install: `bun install`
- Build all: `bun run build`
- Lint/format: `bun run lint` / `bun run format`
- Tests: `bun run test`

App targets:
- Dashboard (Next):
  - Dev: `cd apps/dashboard && bun run dev`
  - Build: `cd apps/dashboard && bun run build`
- Main app (Bun + Hono):
  - Dev: `cd apps/main-app && bun run dev` (uses `MAIN_APP_PORT`, default 3001)
- Edge Worker:
  - Local dev soon via `wrangler dev` (KV/DO bindings to be added in `wrangler.toml`)

Supabase types (already generated)
- Commands (if you need to regenerate):
  - Remote: `cd apps/main-app && bun run types:gen:remote`
  - Local: `cd apps/main-app && bun run types:gen:local`
Types live at `apps/main-app/src/types/supabase.ts` and feed Kysely via `apps/main-app/src/types/db.ts`.

## API surface (Responses compatibility)
- Public route (edge): `POST /v1/responses`
  - Headers: `Authorization: Bearer <ALPHAGATE_API_KEY>`
  - Body: OpenAI Responses request; supports multimodal `input_text` and `input_image.image_url`
  - Streaming: SSE; periodic keep‑alive comments
  - Structured JSON: `response_format.type = "json_schema"`
- Example and schema: see `.docs/integration-guide.md`

## MVP scope (what we’re building now)
- Auth + Tenancy: Better Auth; first signup creates a personal org; memberships/roles
- Endpoint Studio: identity, routing (Qwen‑VL), policies (grade band, PII, retention), quotas, JSON schema, prompts, test harness
- Publish/Install: publish endpoint to Catalog, install into another org
- API Keys: create/rotate/revoke; HMAC prefix + secret hashing
- Edge config fetch + KV cache; Proxy → Portkey OSS; consistent error mapping
- Screentime preset (vision): `vision-screencast-evaluator` → Qwen‑VL; JSON schema from docs

## Conventions & notes
- UI packages (`ui/*`) treat React/ReactDOM as peerDependencies to avoid duplicate React (Next uses React 19)
- Keep server secrets out of the edge; BYOK decrypt in main-app only
- Avoid direct `pg` driver in Bun; use `postgres` + `kysely-postgres-js`

## Scripts (selected)
- Root:
  - `bun run build`, `bun run lint`, `bun run test`
- apps/main-app:
  - `bun run types:gen:remote`, `bun run types:gen:local`

## Roadmap (abridged)
- MVP: edge proxy + Admin APIs + Console + Screentime preset (6–8 weeks)
- Phase 2: more providers (Anthropic/Gemini), Stripe, richer analytics, RBAC expansion, Catalog GA
- Later: fine‑tuning/private hosting, marketplace, proactive protection, VPC/hybrid

## Contributing (internal)
- Keep changes scoped; prefer typed contracts in `packages/contracts`
- Respect peerDeps for React in UI packages
- Run `bun run build` + `bun run lint` before PRs
