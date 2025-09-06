Alpha Gate — Business Model & Packaging (v1)
0) Summary
Alpha Gate is a unified, OpenAI-Responses-compatible routing layer for education. We monetize in four complementary ways:
Direct usage (parents/educators) — pay for access to closed/open models with safety/guardrails built-in.


Developer platform — let app builders create and distribute endpoints/workflows; monetize via usage, platform fees, and marketplace revenue share.


Custom & managed (institutions, EdTech) — private hosting (BYOK/OSS/custom models), fine-tuning, SLAs, and hybrid/VPC deployment.


First-party apps — purpose-built products (e.g., Screentime), offered to families/schools, powered by Alpha Gate’s platform.


The underlying tech plan (Endpoints, Policies, BYOK, OSS hosting, Catalog/Marketplace, Observability, Quotas/Billing) fully supports all four from day one.

1) Customer Profiles → Value Propositions → Pricing Levers
A) Parents & Solo Educators (B2C micro-tenants)
Need: Safe, simple access to high-quality models; kid-appropriate outputs; visibility into usage/cost.
 Value props:
One account = all models (GPT/Claude/Gemini + curated OSS) with grade-band guardrails on by default.


Simple setup: use familiar OpenAI SDK in no-code/low-code tools or our apps (e.g., Screentime).


Safety & reporting: per-student activity summaries, retention controls, spend alerts.


Monetization (suggested):
Pay-as-you-go tokens: closed-source provider cost +10% margin; OSS per-token price with 20–30% margin baked in.


Starter bundles: e.g., $X/mo includes N images (VL) + NK tokens, then metered.


First-party app upsell: Screentime Family plan (monthly) with included model credits.


B) Teachers & Small Programs (B2B light)
Need: Same as above + team features (shared endpoints/keys, simple analytics).
 Value props:
Shared Endpoints (semantic capabilities) for classes/groups.


Quotas & spend caps to avoid runaway costs.


Dashboards: per-student/per-class usage and policy violation insights.


Monetization:
Team plan: per-org base fee (e.g., $Y/mo) + metered tokens; adds multi-user, team quotas, audit logs.


C) Schools/Districts & EdTech Companies (B2B pro/enterprise)
Need: Compliance, BYOK, hybrid/VPC options, custom models, SLAs.
 Value props:
Private model hosting (OSS/custom), BYOK for closed models, data residency/retention.


RBAC, SSO, observability (ClickHouse analytics), alerts.


Hybrid/VPC deployment path for stricter procurement.


Monetization:
Metered usage (same margins) + platform fee (per org or per request) for BYOK calls where we don’t pay the provider.


Seats (optional) for admin users / SSO.


Enterprise add-ons: dedicated VPC, private gateway, premium support, compliance reports.


D) App Developers (indie to mid-size EdTech)
Need: Ship faster; avoid infra for routing, safety, and observability; optional OSS hosting.
 Value props:
OpenAI-compatible Responses API: “change baseURL, keep coding.”


Endpoint Studio: configure routing/failover and guardrails without writing infra.


Catalog distribution: publish public endpoints/workflows; gain adoption inside schools.


Monetization:
Usage: metered tokens (closed +10%, OSS 20–30% margin).


Marketplace revenue share for paid public endpoints/apps (e.g., 85/15 or 80/20 in developer’s favor).


Platform fee for BYOK traffic: either a per-call fee ($/request) or a % of provider cost paid by the customer (choose one model and keep it simple).


E) Custom Solutions (managed services)
Need: Private apps/models and fine-tuning trained on proprietary data.
 Value props:
We handle data pipelines, LoRA/fine-tuning, evaluations, and deployment on dedicated GPUs.


Private endpoints w/ SLAs, observability, and compliance.


Monetization:
One-time project fee (model dev/fine-tune), plus


Managed hosting fee (per GPU hour or reserved capacity), plus


Usage-based tokens (if applicable).


F) First-Party Apps (e.g., Screentime)
Need: Consumer-friendly packaging; effortless onboarding; clear privacy posture.
 Value props:
Trusted Alpha Gate safety, structured outputs, and analytics already built in.


Simple plans for families and schools; optional integrations with LMS/SSO later.


Monetization:
Subscription (Family/School plans) that include a monthly credit pool + overage at metered rates.


Option to bundle additional endpoints/workflows over time.



2) Pricing Mechanics & Unit Economics (framework)
Closed-source model calls
Bill the customer provider cost + 10%.


If BYOK (customer pays provider directly), charge Platform Fee:


Option A: $ per request (predictable).


Option B: % of provider cost (transparent, aligns incentives).
 Pick one and keep it consistent.


Open-source model calls (on our GPUs)
Publish per-token rate that covers GPU + infra + 20–30% margin.


Offer capacity reservations (discounted) to institutions needing predictable throughput.


Storage & retention
Free tier for short-lived blobs (e.g., 24h screenshots).


Charge for extended retention or archival.


Support & SLAs
Standard (best effort), Business (next-business-day), Enterprise (24/7).


Price support tiers separately from usage to reduce margin volatility.


Marketplace
Revenue share (e.g., 85/15 in favor of developers initially to seed supply).


Monthly payouts once threshold met; refunds charge back proportionally.


Example P&L sanity check (framework)
For any workflow (e.g., Screentime Vision):
COGS = provider tokens (closed/OSS) + GPU time + storage + egress + observability + support share.


Gross margin = (Customer charge) − COGS.


Maintain blended GM target (e.g., 55–65%) across SKUs by tuning margins and add-ons.



3) Packaging (draft)
Platform Plans
Plan
Target
What’s included
Pricing ideas
Free
Devs kicking the tires
10K tokens/mo, 100 images, single org, basic logs
$0
Builder
Indie devs, small teachers
Metered usage, 3 endpoints, basic quotas, logs, Catalog install
$29/mo + usage
Team
Schools, small EdTech
All Builder + SSO (basic), advanced guardrails, analytics, spend caps
$199/mo + usage
Enterprise
Districts, mid/large EdTech
All Team + BYOK, private hosting options, SLAs, hybrid/VPC
Custom (commit + usage)

Marketplace
Public endpoints/workflows: free or paid.


Paid: developer sets price per 1K tokens / per request; Alpha Gate adds platform margin as needed and takes revenue share.


Managed / Custom
Model build (SOW) + hosting (GPU reservation or on-demand) + usage.


First-Party Apps
Screentime Family: $/month includes N images/day + summaries; overage priced per image or per 1K vision tokens.


Screentime School: per-student/month with tiered discounts + usage caps + centralized admin.



4) Does our current plan support all of this?
Yes. The primitives and infra already map to these business motions:
Endpoints as products: semantic, versioned, private/public.


Policies: grade bands, PII redaction, retention — on by default for EDU.


Quotas/billing: per org/key/endpoint; cost tables and margins; BYOK platform fees.


Observability: logs/usage in ClickHouse + admin dashboards.


Marketplace: Catalog for publishing/installing public endpoints; revenue share.


Custom hosting: OSS models on RunPod now; private/customer-specific endpoints; later VPC/hybrid.


First-party apps: built as “just another endpoint/workflow,” packaged with credits and simple setup.



5) GTM Narrative (how the motions reinforce each other)
Come for the app (e.g., Screentime) → families and teachers see value immediately.


Stay for the platform → schools and devs adopt the Endpoint Studio for broader AI needs.


Build on the marketplace → developers publish specialized workflows (e.g., “AP US History tutor”), creating supply and SEO.


Upgrade to managed/private → districts and EdTechs need compliance, custom models, and VPCs.


This creates a flywheel: first-party apps bring demand; marketplace grows supply; platform retains and expands larger accounts.

6) Policy & Compliance posture (to unlock EDU deals)
Default grade-band safety + PII redaction on all public endpoints.


Clear retention defaults (e.g., 24h for images, long-term for derived JSON).


BYOK + residency options; roadmap to hybrid/VPC for strict districts.


Transparent costs & logs to support audits and board approvals.



7) Risk & Mitigations (business)
Cost unpredictability → quotas, spend caps, alerts, and prepaid credit packs.


Provider changes/outages → Portkey failover & multiple vendors; publish deprecation/support windows.


Marketplace quality → curation, safety badges, runtime policy checks, and developer reputation.


Privacy sensitivity (Screentime) → explicit consent UX, on-device redaction, minimal retention, and clear parent controls.



8) Decisions to lock now (pricing governance)
Closed-source margin +10% (default).


OSS margin 20–30% baked into per-token price.


BYOK platform fee model: pick either $ per request or % of provider cost for consistency.


Marketplace revenue share target (e.g., 85/15 to seed supply).


EDU discounts (e.g., 10–20% for verified schools/districts).


Support tiers & response times (document in T&Cs).



9) “How to choose a plan” (internal guidance)
Parents/solo educators → Screentime Family or Free/Builder platform.


Teachers/small orgs → Team plan (SSO optional), plus add Screentime seats.


Districts/EdTech → Enterprise + BYOK; discuss private hosting and support SLAs.


Developers → Builder/Team; publish to Marketplace when ready; promote success stories.



10) Appendix: Quick calculators (frameworks)
A) Vision cost per student/day (Screentime)
Variables: frames/min (f), active minutes/day (m), tokens/frame (t), provider $/1K tokens (p), margin (α).


Cost/day ≈ f * m * t/1000 * p * (1 + α)


Tune f with delta caching and on-device heuristics.


B) BYOK platform fee
Per-request: requests * fee → predictable for budgeting.


% of provider cost: provider_cost * platform_pct → scalable with intensity.


Use these to set pricing bands that hit a target gross margin while remaining competitive.


