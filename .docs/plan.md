Alpha Gate — Canonical Plan (v1)
AlphaGate Integration Guide
ScreenTime Product Plan
AlphaGate Business Model

0) North Star & Guardrail
North Star: Alpha Gate is an OpenAI-Responses-compatible routing platform for education. It gives parents, educators, and developers a fast, safe, reliable way to use closed models (GPT, Claude, Gemini), open models we host (vLLM/TGI on RunPod), and private/custom models (fine-tuned, quantized) with built-in guardrails, RBAC, quotas/billing, observability, and BYOK.
Guardrail: Simplicity is earned. We expose the fewest primitives that match how people think and work (named endpoints/capabilities), and we keep the path open to the full vision (workflows, marketplace, private hosting).

1) Primitives & Relations
Nouns (minimal)
Organization — tenant boundary (school, district, edtech company). Billing/governance scope.


User — human in an org (admin, developer; later teacher, student, parent).


Role — RBAC permissions.


API Key — credential for apps (prefix + hashed secret). Scoped to org.


Endpoint — semantic capability handle developers call via model: (e.g. history-tutor, vision-screencast-evaluator).


Model — provider target (GPT/Claude/Gemini), open-source host (Llama/Qwen via vLLM/TGI), or private fine-tune.


Guardrail — policy module (PII redaction, grade band safety, retention).


Request / Response — payloads compliant with OpenAI /v1/responses (incl. streaming/SSE).


Quota — usage limits at org/key/endpoint.


Usage Event (Log) — append-only record (tokens, cost, latency, model, violations).


Bill — aggregated usage and margin.


Workflow — composition of endpoints/policies for a use case (post-MVP).


Verbs
Route request → model(s) with failover.


Apply policies (safety, retention, grade band, RBAC).


Meter tokens/latency and cost with margins.


Observe logs, traces, analytics.


Manage orgs, endpoints, keys, roles, policies.


Relations (sketch)
[Organization] 1..* [User], [API Key], [Endpoint]
[Endpoint] --uses--> 1..* [Model] (primary, failover) --applies--> 0..* [Guardrail]
[Request] -> [Endpoint] -> [Model] -> [Response]
[Request] -> [Usage Event] -> [Bill]
[Quota] bound to (org, api_key, endpoint)


2) Conceptual Model (mental model alignment)
Developers call a named endpoint via the OpenAI Responses API (model: "essay-summarizer"). No key juggling, no failover logic, no policy plumbing.


Admins/Parents/Educators configure endpoints with models + guardrails + quotas; they view analytics and reports.


Products/Workflows (e.g., Screen Recorder → Vision Model (Qwen)) are built on these endpoints and can be private to an org or offered publicly.


Think pipes & filters with named capabilities:
“Call model: "vision-screencast-evaluator" → router enforces safety & quotas → streams → logs/bills.”

3) API: OpenAI Responses Compatibility
Public Surface
Path: POST /v1/responses


Headers:


Authorization: Bearer <ALPHAGATE_API_KEY>


X-AG-Org: <org_id> (optional if encoded in key)


X-AG-Endpoint: <endpoint_name> (optional; default to model field)


X-AG-BYOK: <ref> (optional reference to stored BYOK)


Body: mirror OpenAI Responses request/response exactly.


Streaming: SSE with keep-alive comments every ~10–20s (edge idle timeout protection).


Errors: { code, message, details? } (consistent mapping from downstream errors).


BYOK
BYOK secrets stored encrypted in Postgres (Supabase). Decrypt only in main app (AWS KMS). Edge never sees raw provider keys. Optionally mint short-lived scoped tokens for Portkey.



4) Architecture & Deployment
┌────────────────────────────────────── Cloudflare Edge (Workers + Hono) ───────────────────────────────────────┐
│  /v1/responses proxy (OpenAI-compatible)                                                                     │
│  - API key HMAC auth + org lookup (KV cache)                                                                 │
│  - Per-org/key quotas (Durable Objects counters)                                                             │
│  - SSE pass-through w/ keep-alive comments                                                                   │
│  - Lightweight pre-guardrails (allowlist/shape checks)                                                       │
│  - Emit usage_event → Cloudflare Queues                                                                      │
│  → Route to Portkey (regional pin)                                                                           │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                          ┌────────── Portkey Gateway (data plane) ──────────┐
                          │ - Routing/retries/failover (Responses-compatible)│
                          │ - Optional guardrail hooks/caching               │
                          └──────────────────────────────────────────────────┘
                                       │
                                       ▼
     ┌──────── OpenAI ────────┬──────── Anthropic ────────┬──────── Gemini ────────┬──── RunPod (vLLM/TGI) ───┐
     └────────────────────────┴────────────────────────────┴────────────────────────┴──────────────────────────┘

   Async & Control Plane (regional)
   ┌────────────────────────────────────────── Main App (Bun + Hono) ───────────────────────────────────────────┐
   │ - Admin APIs: Orgs, Endpoints, Keys, Policies, Pricing                                                     │
   │ - Better Auth (dashboard users)                                                                            │
   │ - Queue consumers (usage_event → Supabase + ClickHouse)                                                    │
   │ - Billing calculator (tokenization + cost tables + margins)                                                │
   │ - Policy services orchestrator (Presidio/Llama Guard now; NeMo later)                                      │
   │ - BYOK decrypt (AWS KMS) and short-lived provider tokens if needed                                         │
   └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                   │                            │                         │
                   ▼                            ▼                         ▼
            Supabase (Postgres)          ClickHouse Cloud               AWS KMS
            - OLTP & config             - usage/analytics              - BYOK

Default Hosting Choices
Edge: Cloudflare Workers + Hono.


Gateway: Portkey (SaaS data plane, regional).


Main app: Fly.io (MVP speed). (Alt later: Hetzner + Coolify for cost/control.)


State: Supabase (Postgres) for OLTP; ClickHouse Cloud for analytics.


GPU hosting: RunPod (vLLM/TGI).


Secrets: AWS KMS (BYOK), Secrets Manager.



5) Technology Decisions (final)
Language: TypeScript. Runtime: Bun (also as package manager).


Frameworks: Hono (Workers & Bun server).


Gateway: Portkey (TypeScript).


DB & Types: Supabase (Postgres) + Kysely (with codegen).


Contracts: Hono + Zod, generate OpenAPI; client types via openapi-typescript/orval.


Monorepo: Turborepo + Bun workspaces; Changesets for shared packages.


Auth:


Edge API: HMAC API keys (prefix + hashed secret).


Dashboard: Better Auth (stored in Supabase via Kysely).


Guardrails: Presidio (PII), Llama Guard (safety). NeMo Guardrails later.


Observability: OpenTelemetry; logs/metrics in Grafana Cloud/Datadog; product analytics in ClickHouse.


Streaming: Native Hono streaming (SSE). Add better-sse only if we need broadcast/multiple subscribers.


Billing: Internal cost tables; token counts from provider/Portkey (fallback to tiktoken/HF tokenizers). Stripe metered billing in Phase 2.


UI Libraries: Tailwind v4, shadcn/ui with namespaced registries, Kibo UI (tables), ai-sdk elements (AI chat/stream elements).



6) Data Model (initial schema)
organizations(id, name, tier, region, created_at)


users(id, org_id, email, role, password_hash|external_idp, created_at)


api_keys(id, org_id, name, prefix, secret_hash, status, last_used_at, rate_limit_json, created_at)


endpoints(id, org_id, name, visibility ENUM('private','public'), version, config_json, created_at)


config_json fields (see §7): primary model, failover chain, guardrails, quotas, retention, grade band, prompt templates, BYOK ref(s), adapters.


endpoint_models(id, endpoint_id, provider, model_name, priority, byok_ref, config_json)


guardrail_policies(id, org_id, name, type, config_json, created_at)


usage_events(id, org_id, endpoint_id, api_key_id, model, tokens_in, tokens_out, latency_ms, cost_cents, guardrail_flags_json, created_at)


cost_tables(provider, model, input_per_1k, output_per_1k, margin_bps, effective_from, PRIMARY KEY(provider, model, effective_from))


audit_log(id, org_id, actor_user_id, action, target, details_json, created_at)


Indexes: usage_events (org_id, created_at), api_keys(prefix), endpoints (org_id, name), endpoint_models(endpoint_id, priority).

7) Endpoint UX — Creation, Configuration, Visibility
Who configures endpoints?
Admins/Educators/Parents (org owners): create semantic endpoints for specific classroom or household needs (e.g., “K-5 Safe Tutor”, “Vision Screencast Evaluator”, “Essay Feedback Coach”).


Developers: can create endpoints, or consume existing ones via model:.


Visibility & reuse
Private endpoints (default): scoped to the org. Only the org’s API keys can call them.


Public endpoints: published to Alpha Gate Catalog (marketplace). Can be free or metered; consumers import to their org (“Install”), optionally fork to customize. We approve public publication to maintain safety/compliance.


Endpoint configuration (fields)
Identity: name (unique per org), description, tags, visibility (private/public), version.


Routing: primary model; failover chain (ordered list with retry policy); provider region pin.


Keys: BYOK bindings (per provider) or use pooled Alpha Gate keys.


Policies: grade band (K-5, 6-8, 9-12), PII redaction on/off, retention rules (duration), moderation thresholds.


Quotas: daily/monthly caps (org/key/endpoint); overage behavior (429 vs soft-limit with alert).


Prompts/Adapters: system prompt templates, input validators, output formatters, function/tool call policy.


Observability: redact rules, trace sampling rate, cost center tag.


Test Harness: inline prompt playground; streaming preview; safety test set (sample inputs) with pass/fail badges.


Creation Flow (UI)
New Endpoint Wizard


Step 1: Name, description, tags, visibility.


Step 2: Choose primary model (dropdown of GPT/Claude/Gemini/Open-source). Set failover (optional).


Step 3: Connect keys (BYOK or pooled).


Step 4: Policies (grade band, PII redaction, retention).


Step 5: Quotas (per day/month for org/key).


Step 6: Prompt template & sample test (run test, see stream).


Step 7: Save & generate usage snippet (OpenAI SDK example).


Versioning


Endpoints have semver. Editing creates draft vNext; “Promote” to prod; optional canary % rollout.


Publishing


Toggle to Public → submit for review → appears in Catalog with docs, examples, and safety badges.


Developer consumption
Use any OpenAI SDK, set baseURL to Alpha Gate, and set model to either raw provider (gpt-4o) or the semantic endpoint (vision-screencast-evaluator).


API keys: per-org HMAC keys; developers can issue scoped keys for specific endpoints.



8) Products/Workflows UX — Example: Screen Recorder → Vision Model (Qwen)
Use case: Parents/educators install Screen Recorder (browser extension or lightweight desktop app). It captures periodic screenshots or small clips (with consent), uploads to Alpha Gate’s Vision Screencast Evaluator endpoint (e.g., Qwen-VL), and produces progress insights.
Flow
Parent/Educator installs app from Products page; agrees to privacy/consent policy.


App authenticates with an org-scoped API key (or user token) and selects the vision endpoint (private or public catalog item installed into the org).


Client captures frames at configured intervals (e.g., every 15–30s) with on-device redaction options (blur PII areas).


App sends frames to /v1/responses with input_image[] and prompt template (grade band informs safety checks).


Alpha Gate streams back structured observations/tags (e.g., “working on math drills”, “needs help on fractions”).


Progress Dashboard aggregates per student: timelines, topic tags, highlights, guardrail flags, shareable reports.


Privacy/Safety
Opt-in consent, adjustable sampling rate, on-device blur/redact, retention policies (e.g., delete frames after 24h; store only derived tags in ClickHouse). Admin UI clearly displays retention.



9) Web App IA (Information Architecture) & UI System
Sites
Marketing Site (public)


Home — clear value prop; “OpenAI-compatible routing for education.”


Solutions — Parents, Educators, Developers; safety & compliance.


Products — showcase apps/workflows (Screen Recorder, Essay Coach, Reading Tutor, Image-to-Video explainer).


Models — Supported providers & regions; BYOK.


Custom Models — Fine-tuning/private hosting options.


Pricing — transparent per-token margins and OSS rates.


Docs — quickstart, API reference, tutorials.


Security & Trust — COPPA/FERPA, data retention, SOC posture.


Changelog / Blog


Sign up / Sign in


Console (after login)


Overview — usage snapshot, cost, violations, quick links, “Create Endpoint”.


Endpoints


List/table (Kibo UI table) with search, tags, visibility chips, version/status.


Create / Edit (wizard + advanced settings).


Detail page: config, models, policies, quotas, playground (ai-sdk elements), versions & canary toggles.


Models — provider connections & BYOK vault, region pinning, health.


Policies — grade bands, PII rules, retention presets, guardrail packs.


API Keys — create/revoke, scopes, last used, rotate; copy-paste snippets.


Usage & Analytics — charts (Recharts) from ClickHouse: tokens, latency, costs, violations by endpoint/time.


Billing — invoices, spend alerts, cost tables (effective dates).


Catalog (Marketplace) — browse/install public endpoints & workflows; safety badges, demo playgrounds.


Products — first-party apps (Screen Recorder, Essay Coach); per-org install/manage page.


Organization — members & roles, SSO (later), data residency, retention defaults.


Logs — searchable timeline of requests (redacted), trace links, download CSV.


Docs (embedded) — quickstart, examples, SDK snippets.


Support — tickets, Slack/Discord links.


UI System & Components
Tailwind v4 + shadcn/ui with namespaced registries


Namespaces: ui/* (shadcn base), kibo/* (tables, advanced data grids), ai/* (ai-sdk elements for chat/stream, message rendering).


Key Screens


Endpoint Wizard: stepper + guardrail presets + instant playground.


Playground: chat + file/image input (ai-sdk elements), streaming tokens, token/cost meter.


Usage: Kibo table + Recharts; drill-through to logs.



10) Developer Experience
Drop-in usage (OpenAI SDK):
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.ALPHAGATE_API_KEY,
  baseURL: "https://api.alphagate.ai/v1"
});

const response = await client.responses.create({
  model: "history-tutor", // or "gpt-4o" passthrough
  input: "Explain the causes of the American Revolution for a 5th grader."
});
console.log(response.output);

Streaming (SSE): same SDK; we proxy and send keep-alive comments to maintain edge connections.
Admin API: typed client from OpenAPI; create endpoints, rotate keys, set policies, pull analytics.
CLI (later):
ag endpoints create --name vision-screencast-evaluator --model qwen-vl
ag keys create --name classroom-a


11) Policies, Quotas, Billing
Policies (MVP): grade band rules (content categories), PII redaction (Presidio), retention (days), moderation thresholds; enforce pre/post request.


Quotas: DO counters for (org, key, endpoint), rolling windows; exceed → 429 or soft-limit with alert; periodic snapshots to Postgres.


Billing: cost tables per provider/model (input/output per 1k tokens) + margins (closed: +10%, OSS: +20–30%). Compute per usage_event; aggregate monthly bills. Stripe metered billing in Phase 2.



12) Observability & SLOs
Traces: OTel spans edge → Portkey → provider; correlation IDs in logs.


Metrics: latency, error rate, tokens/sec, guardrail hit rate.


Product Analytics: ClickHouse rollups by endpoint/org/time.


SLOs (MVP): p95 added edge latency < 60ms; stream TTFB < 2s (provider-dependent); 99.5% uptime.



13) Security & Compliance
BYOK: encrypted at rest (KMS); raw keys never leave main app.


Data Retention: per-org policy; defaults aligned to COPPA/FERPA; redaction before storage.


Networking: edge → Portkey endpoints only; main app outbound allowlist (providers/Supabase/ClickHouse/KMS).


Audit: admin actions in audit_log.



14) Roadmap
Phase 1 (MVP, 6–8 weeks)
Edge proxy (/v1/responses), auth, quotas, SSE keep-alives.


Portkey routing to OpenAI + RunPod (vLLM).


Supabase schema + Kysely migrations; usage_event consumer; cost compute.


Console pages: Overview, Endpoints (wizard+playground), API Keys, Usage, Logs (basic), Organization, Policies (presets).


Screen Recorder (beta) product tile; stub evaluator endpoint using Qwen-VL.


Presidio + Llama Guard minimal enforcement.


Phase 2 (0–6 months)
Add Anthropic + Gemini; endpoint-level failover policies; Stripe metered billing; richer analytics & alerts; RBAC expansion (teacher, student, parent); publish Catalog with public endpoints.


Phase 3 (6–18 months)
Fine-tuning-as-a-service; private model hosting per org; workflow builder; marketplace monetization.


Phase 4 (18–24+ months)
Proactive protection (prompt-injection, anomaly detection); automated model selection by task/cost/latency/quality; private VPC/hybrid deployments.



15) Monorepo Layout
/apps
  /edge-worker         # Cloudflare Workers (Hono) - /v1/responses proxy
  /main-app            # Bun + Hono (admin APIs, queue consumers, billing)
  /dashboard           # Web console (Hono SSR or Next.js if preferred)
/packages
  /contracts           # Zod schemas, OpenAPI generator, event types
  /db                  # Kysely client, migrations, codegen scripts
  /auth                # Better Auth setup (Supabase adapter)
  /billing             # Cost tables, tokenization helpers
  /guardrails          # Clients for Presidio/Llama Guard (HTTP)
/ui
  /ui                  # shadcn base (namespace: ui/*)
  /kibo                # Kibo UI components (namespace: kibo/*)
  /ai                  # ai-sdk elements (namespace: ai/*)

Tooling: Bun workspaces + Turborepo + Changesets; GitHub Actions (typecheck, lint, test, build, OpenAPI drift, deploy).

16) Marketing Site Structure
/ (Home) — hero, value prop, logos, CTA.


/solutions — Parents, Educators, Developers (safety + reliability).


/products — Screen Recorder, Essay Coach, Reading Tutor (cards → details → “Try”).


/models — Supported providers, regions, BYOK.


/custom-models — Fine-tuning/private hosting offering.


/pricing — per-token margins; OSS costs; education discounts.


/docs — Quickstart, Responses API, Admin API, Guardrails, BYOK, Quotas, Analytics, Billing, Webhooks, Marketplace, Hybrid.


/security — compliance, data retention, subprocessors.


/changelog & /blog


/signin / /signup



17) Copy-paste Implementation Notes (essentials)
Keep-alive SSE: send :\n comment every 10–20s while proxying provider stream.


KV config cache: endpoint config keyed by org:endpoint:version; invalidate on save via Queue → Worker pull.


Durable Object quotas: atomic counters with TTL windows; hourly/day/month rolling windows.


Queue consumer: enrich events with cost tables; write to Supabase + ClickHouse; reconcile DO snapshots nightly.


Docs generation: OpenAPI from Zod; publish API Reference; embed SDK snippets.



