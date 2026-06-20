# Decisions Log (ADRs)

> Settled decisions for the store. Each is locked — don't reopen without a new dated entry that supersedes it. Pending decisions live in [`OPEN-QUESTIONS.md`](./OPEN-QUESTIONS.md); when one resolves, append it here.
>
> Format: `D-n · date · decision · why · supersedes?`

---

## D-1 · 2026-06-20 · Mount the store inside `digitribe-web`, not a separate app

The store is a `(store)` route group in the existing `digitribe-web` Next.js 16 app, deployed on the same Vercel project at **digitribe.world/store**.
**Why:** same modern stack; the app already has the AI SDK (Digibot), Vercel KV, OG, Resend, Zod; the existing free `/audit` becomes the store funnel; one brand, one deploy. Route-group isolation keeps the transactional code separate from marketing pages.

## D-2 · 2026-06-20 · Payments via Polar (Merchant of Record)

**Why:** Polar is the legal seller-of-record and auto-collects/remits global VAT/sales tax — near-zero tax/legal burden for a 2-person team selling low-price digital products worldwide. First-class Next.js + webhook helpers. Tradeoff (~4–6% fee) accepted vs the compliance cost of Stripe-direct.

## D-3 · 2026-06-20 · Access model: frictionless token + optional account

Pay → instant magic-link/token to use the tool now (no signup wall); offer an optional lightweight account to save BYOK keys & re-run. **Why:** highest conversion + key reuse without a login wall. (Spine §4.)

## D-4 · 2026-06-20 · BYOK across every product; we never pay inference

Every AI product runs on the buyer's own provider key. **Why:** makes one-time/lifetime pricing margin-safe and unlimited-use viable; the product is the harness, not the tokens. (Spine §5.) Exception by design: `digibot-in-a-box` persists the buyer's runtime key (encrypted, with consent) because the widget calls AI at visitor-time — see S6-1.

## D-5 · 2026-06-20 · Every product is a finite deliverable with a locked Zod Output Contract

No open-ended chat loops. One input → one bounded artifact, schema-enforced via the AI SDK. **Why:** guarantees consistent, productized output and prevents "the model returned everything." (Spine §8, doc 03.)

## D-6 · 2026-06-20 · Build the spine (Segment 0) before any product

No product starts until the shared `lib/store/*` + `api/store/*` + generic tool UI pass the Definition of Ready (a working demo product). **Why:** every PRD assumes the spine; building product-first causes rework. (`segment-0-spine/README.md`.)

## D-7 · 2026-06-20 · Documentation system: shared foundations + per-product PRDs

Six foundation docs (`01`–`06`) + `segment-0` are the single source of truth for stack, contracts, quality bar, UI, and testing; product PRDs reference them by section and never restate. **Why:** prevents drift/hallucination across ~27 products and keeps each PRD small.

## D-8 · 2026-06-20 · Default AI model `claude-opus-4-8`; cheaper tier `claude-haiku-4-5`

Per the `claude-api` skill. Exact IDs, no date suffixes. Products may override with a stated reason (e.g. the tool-permission auditor and agent-readiness-monitor default to Haiku). **Why:** quality-first default; BYOK still lets the buyer's key/provider drive cost.

## D-9 · 2026-06-20 · Six segments, BYOK micro-tools, two audiences

Segments 1 (Agentic Web), 2 (Compliance), 3 (MCP Security), 4 (Evals), 5 (Codebase, open-core from `mcp-toolkit`), 6 (Conversion, the agency's craft + Digibot). **Why:** each is rare/modern, sits on Digitribe's real edge, and avoids commodity AI-wrapper categories.

## D-10 · 2026-06-20 · Database = Supabase (resolves SW-1)

Postgres + Auth via Supabase. **Why:** founders already use it; Auth covers the optional magic-link accounts; one service.

## D-11 · 2026-06-20 · Digibot widget = we host it, multi-tenant (resolves S6-1)

A multi-tenant `/api/widget/[configId]/chat` route; the embed snippet carries only `configId`; the buyer's runtime AI key is stored **AES-256-GCM encrypted with explicit consent** + a per-widget monthly message cap. Adds `WIDGET_CONFIG_SECRET`. **Why:** one-paste install + best conversion; the one product that persists a BYOK key by design.

## D-12 · 2026-06-20 · Simulator = fetch-based heuristic for v1 (resolves S1-1)

"Can an AI buy from you?" uses a fetch-based heuristic traversal, not a headless browser. **Why:** serverless-safe; models how most AI agents read a store; a JS-only failure is itself a finding. Headless = later enhancement.

## D-13 · 2026-06-20 · Segment 5 ships as a downloadable LOCAL app, not cloud upload (resolves S5-1, supersedes the zip/OAuth assumption)

The codebase tools are delivered as a downloadable local tool the buyer runs on their own machine (`pnpm install && pnpm dev`, point it at any React/TS repo). Purchase grants a **license + download**; the deterministic `mcp-toolkit` engines + the paid AI narrative layer run **locally on the buyer's BYOK key**; results render in the local app. **Why:** the buyer's code never leaves their machine (eliminates untrusted-code-on-our-server risk), it fits the existing `mcp-toolkit` CLI, and it's a clean open-core upsell. **Implication:** Segment 5 does NOT use the in-browser run flow (spine §6); it uses a buy→license→download flow. The 3 Segment-5 PRDs + README need revision to this model (tracked as S5-NEW in OPEN-QUESTIONS). Also resolves S5-2 (engines run locally, not on Vercel).

## D-14 · 2026-06-20 · Segment 5 = three separate downloadable apps (resolves S5-NEW packaging)

Codebase Health, Blast-Radius Analyzer, and WCAG Audit each ship as their own standalone downloadable local app (not one bundle). **Why:** buyers pay only for the tool they want; each maps to a distinct `mcp-toolkit` engine.

## D-15 · 2026-06-20 · Segment 5 unlock = license key (resolves S5-NEW licensing)

Buy → license key + download link; the local app validates the key online once to unlock the paid AI layer, then runs on the buyer's BYOK key. **Why:** works for non-devs; harder to casually leak than a private repo.

## D-16 · 2026-06-20 · Segment 2 = ship a "lite" v1 (resolves S2 scope)

Visible badge + C2PA manifest signed with a **service cert**, honest "not certified / not legal advice," **no durable invisible watermark** in v1 (`watermarkMode: 'visible-only'`, `trustListStatus: 'service_cert'`). Real CA cert + commercial watermark = a later upgrade. **Why:** launch on the Aug 2026 deadline without blocking on cert procurement. S2-1 default stands (pin `contentauth/c2pa-js`); S2-2 (real cert) deferred, not a v1 blocker.

## D-17 · 2026-06-20 · Lock the suggested prices for v1 (resolves SW-2 pricing half)

Use the per-product prices in each segment README/registry as-is for launch; adjust in Polar anytime. Creating the Polar products themselves remains an action item (Manu).

---

## Pending (action items + minor defaults, in OPEN-QUESTIONS.md)

Action items (not design blockers): create Polar products (Manu), fill `research-sources.md` before any sales page (Manu), counsel review of Segment-2/WCAG legal copy. Minor technical defaults I will lock unless vetoed: SW-3 cheerio, SW-4 PDF approach, SW-5 error tracking, SW-6 spine multimodal (extend `AiRunner` with optional image parts), S1-3/S3-2 transports, S4-1 Vitest. Follow-up work: **revise the 3 Segment-5 PRDs + README to the local-app / license-key model (D-13/14/15).**
