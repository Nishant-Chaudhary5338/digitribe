# 01 · Platform Spec — the shared spine

> **The single source of truth for everything products share.** Product PRDs reference this file by section number (e.g. "BYOK: platform-spec §5") and never restate it. If a rule here conflicts with a product PRD, **this file wins** unless the PRD explicitly says "overrides platform-spec §X, reason: …".
>
> Audience: engineering agents building any store product. Assume no prior context beyond [`00-overview.md`](./00-overview.md).

---

## 1. Tech stack (grounded in the real `digitribe-web` repo)

Do **not** introduce alternatives to these without an ADR. Versions are what the repo actually uses today.

| Layer           | Choice                                                                       | Notes                                                           |
| --------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Framework       | **Next.js 16** (App Router)                                                  | Server Components by default; `'use client'` only at leaves     |
| Runtime         | Node.js (Vercel Functions, Fluid Compute)                                    | Default function timeout 300s — fine for tool runs              |
| Language        | TypeScript **strict**                                                        | no `any`, no `@ts-ignore`; `unknown` + narrow                   |
| UI              | React **19**                                                                 |                                                                 |
| Styling         | Tailwind CSS **v4**                                                          | extend config, no arbitrary values; `cn()` for >5-class strings |
| Components      | shadcn-style primitives + `@radix-ui/react-slot`, `class-variance-authority` | already in repo                                                 |
| Animation       | `motion` (Framer Motion v12)                                                 | already in repo                                                 |
| AI inference    | **Vercel AI SDK** (`ai`, `@ai-sdk/react`)                                    | provider-agnostic → enables BYOK across providers (§5)          |
| Validation      | **Zod**                                                                      | every boundary: form input, API I/O, tool output contract, env  |
| Forms           | `react-hook-form` + `@hookform/resolvers` (zod)                              |                                                                 |
| Email           | `resend` + `react-email`                                                     | artifact delivery + receipts                                    |
| Ephemeral store | `@vercel/kv`                                                                 | access tokens, rate limits, run status (§4, §7)                 |
| OG images       | `@vercel/og`                                                                 | per-product social cards                                        |
| SEO schema      | `schema-dts`                                                                 | typed JSON-LD (§13 of each PRD)                                 |
| Analytics       | Plausible                                                                    | privacy-first, already wired; add custom events (§ each PRD)    |
| Deploy          | **Vercel**                                                                   | same project as the marketing site                              |

### To ADD for the store (not yet in repo)

| Need                     | Recommended                                             | Why                                                                                                  |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Payments / MoR           | **Polar** (`@polar-sh/sdk`, `@polar-sh/nextjs`)         | merchant-of-record handles global VAT/sales tax; first-class Next.js + webhook helpers               |
| Durable DB               | **Postgres via Drizzle ORM** (Supabase or Neon)         | purchases, optional accounts, BYOK key vault. Matches the founders' TribeHQ stack (Drizzle+Supabase) |
| Auth (optional accounts) | **magic-link** (Supabase Auth or Resend-sent OTP)       | only for the optional "save my key" account; purchase itself needs no login                          |
| Key encryption           | Node `crypto` AES-256-GCM with a `KEY_VAULT_SECRET` env | encrypt BYOK keys at rest (§5)                                                                       |

> **OPEN QUESTION (one-time, resolve before build #1):** Supabase vs Neon for Postgres. Default recommendation: **Supabase** (founders already use it; gives Auth for free). Record the decision in an ADR.

---

## 2. Routing & file layout

The store is one route group. Keep it isolated from marketing groups.

```
app/(store)/
  layout.tsx                      # store shell: nav, footer, theme (sibling of (neutral))
  store/
    page.tsx                      # storefront — product grid
    [product]/
      page.tsx                    # product landing/sales page (SEO target)
    checkout/
      success/page.tsx            # post-Polar redirect → mints access token
    use/
      [token]/page.tsx            # the actual tool UI, gated by access token (§4)
    account/                      # optional: saved keys, purchase history (magic-link)
      page.tsx
  api/store/
    checkout/route.ts             # creates Polar checkout session
    webhook/route.ts              # Polar webhook → record purchase, grant access
    run/[product]/route.ts        # the job runner (§6) — streams progress
    artifact/[runId]/route.ts     # download a produced artifact
lib/store/
  products.ts                     # PRODUCT REGISTRY (§3) — single config list
  access.ts                       # token mint/verify (§4)
  byok.ts                         # key intake, validation, encryption (§5)
  ai.ts                           # AI SDK wrapper, model defaults, structured output (§5)
  runner.ts                       # job runner core (§6)
  report.ts                       # locked-schema → artifact renderer (§8)
  polar.ts                        # Polar client + webhook verification
server/store/
  schemas/                        # one Zod output-contract file per product
  tools/                          # one pipeline module per product
```

Each new product = (a) one entry in `lib/store/products.ts`, (b) one Zod schema in `server/store/schemas/`, (c) one pipeline in `server/store/tools/`, (d) one landing page MDX/section. Nothing else in the spine changes.

---

## 3. Product registry

One typed array is the source of truth for the storefront, pricing, routing, and Polar mapping. Products never hardcode their own metadata elsewhere.

```ts
// lib/store/products.ts
import { z } from 'zod'

export type ProductModel = 'byok-finite' // v1 only ships this model

export interface ProductDef {
  slug: string // URL + registry key, e.g. "agent-ready-kit"
  name: string
  segment: 1 | 2 | 3 | 4 | 5
  tagline: string // one line, sales page hero
  priceUSD: number // display price; Polar product is source of truth for charging
  polarProductId: string // maps to a Polar product/price
  model: ProductModel
  byokProviders: AiProvider[] // which keys this tool accepts (§5)
  inputSchema: z.ZodTypeAny // validates the buyer's input before a run
  outputSchemaRef: string // path to the locked output contract
  estRunSeconds: number // for progress UX + timeout budget
  status: 'live' | 'beta' | 'draft'
}
```

**Pricing rule:** the `priceUSD` in the registry is for _display/SEO only_. The actual charge is whatever the linked **Polar product** says. Never charge from the registry number — always create the checkout against `polarProductId`.

---

## 4. Access model — frictionless token + optional account

Decision (locked): **pay → instant token, no signup wall; offer an optional account to save BYOK keys & re-run.**

### Flow

1. Buyer clicks **Buy** on a product page → `POST /api/store/checkout` creates a Polar checkout session for `polarProductId`, with `metadata: { slug }`.
2. Polar hosts payment. On success Polar redirects to `/store/checkout/success?checkout_id=…`.
3. The **webhook** (`/api/store/webhook`, §9) is the source of truth: on `order.paid`, we (a) persist a `Purchase` row, (b) mint an **access token**.
4. Success page exchanges `checkout_id` → access token → redirects to `/store/use/[token]`.

### Access token

- Opaque, signed (HMAC with `ACCESS_TOKEN_SECRET`), stored in **KV** with the purchase id, product slug, and a **run quota**.
- **Quota:** one purchase = **N runs** of that tool (default `N=3` re-runs to absorb honest mistakes; per-product override in registry). Decrement per successful run. Display remaining runs in the UI.
- **TTL:** token valid **30 days** from purchase for re-use (KV TTL). After expiry, an account holder can re-mint from purchase history; anonymous buyers get a "re-send my link" via email (Resend).
- **Anti-share:** tokens are bearer credentials; quota + TTL bound abuse. Do not over-engineer DRM — these are low-price tools.

### Optional account

- Magic-link (email). Purpose: persist BYOK keys (encrypted, §5) and list past purchases / re-mint tokens.
- **Never required to buy or use.** Purely a convenience offered post-purchase.

---

## 5. BYOK — Bring Your Own Key (the core of the business model)

**We never pay for inference.** The buyer enters their own provider key; we use it for that run only.

### Supported providers (v1)

Driven by the AI SDK's provider packages. A product declares which it accepts via `byokProviders`.

```ts
export type AiProvider = 'anthropic' | 'openai' | 'google'
```

- **Anthropic** (`@ai-sdk/anthropic`) — default/recommended for reasoning-heavy tools. Default model **`claude-opus-4-8`** (Claude Opus 4.8). For cheaper/faster steps offer **`claude-haiku-4-5`**.
- **OpenAI** (`@ai-sdk/openai`).
- **Google** (`@ai-sdk/google`) — already in repo (Digibot).

> Model IDs above are exact and current (per the `claude-api` skill). **Never append date suffixes** (`claude-opus-4-8`, not `…-20251114`). Default to Opus 4.8 unless a product PRD justifies otherwise.

### Key handling rules (MUST)

1. **Never log a key.** Not in server logs, not in analytics, not in error reports. Redact in any thrown error.
2. **Never persist a key unless** the buyer has an account and explicitly opts to save it → then **AES-256-GCM encrypt** with `KEY_VAULT_SECRET` before the DB.
3. For anonymous runs, the key lives only in the request body and in memory for the duration of the run. Not written to KV, not to disk.
4. **Validate the key before charging a run against quota** — make a 1-token ping (or a `models.list`) to confirm it's live; surface "invalid/expired key" cleanly without consuming a run.
5. Transport: key is sent from the client tool UI to `/api/store/run/...` over HTTPS only. The tool UI page is the only place that collects it.

### AI wrapper

```ts
// lib/store/ai.ts — every tool calls AI through this, never the SDK directly
export async function runStructured<T>(opts: {
  provider: AiProvider
  apiKey: string // BYOK
  model?: string // defaults per provider
  system: string
  prompt: string
  schema: z.ZodSchema<T> // the locked output contract
  effort?: 'low' | 'medium' | 'high'
}): Promise<T>
```

- Uses the AI SDK's `generateObject` with the Zod schema → **structured output is enforced by the SDK**, so the model can't "return everything." This is how every Output Contract is guaranteed.
- For Anthropic models, adaptive thinking is on by default; set `effort` per step (`low` for cheap classification, `high` for the main reasoning artifact).
- Stream long runs (`streamObject`) so the progress UI (§6) updates and we don't hit timeouts.

---

## 6. Job runner

Every tool run is one POST to `/api/store/run/[product]`. The runner is uniform; only the _pipeline_ differs per product.

```
client tool UI
  └─ POST /api/store/run/[product]  { token, byokKey, input }
       1. verify access token + remaining quota (§4)        → 402/403 on fail
       2. validate input against product.inputSchema (zod)  → 422 on fail
       3. validate BYOK key (live ping, §5)                 → 400 on fail (no quota spent)
       4. run product.pipeline(input, ai)  ── streams progress events (SSE)
       5. persist artifact (KV short-term + optional email) → returns runId
       6. decrement quota; return artifact + download URL
```

- **Streaming/progress:** runner emits typed SSE events `{ phase, pct, message }` so the UI shows real steps ("Crawling 12/40 pages…"), never a dead spinner.
- **Idempotency:** a `runId` (uuid) per attempt; re-POST with same `runId` returns the in-flight/cached result, never double-charges quota.
- **Timeout budget:** keep pipelines under the Vercel function limit; for long crawls, chunk and stream. Record `estRunSeconds` in the registry for UX.
- **Pipelines are pure-ish:** `(input, aiWrapper, emit) => Promise<OutputContract>`. No global state. Easy to unit-test by mocking `aiWrapper`.

---

## 7. Data model (minimum)

```
Purchase      id, polarOrderId, productSlug, email, priceUSD, createdAt, runsTotal, runsUsed
Run           id, purchaseId, productSlug, status, startedAt, finishedAt, artifactKey, error?
Account?      id, email, createdAt                         (optional)
SavedKey?     id, accountId, provider, ciphertext, iv, tag (optional, encrypted §5)
License?      id, purchaseId, productSlug, email, keyHash, maxActivations, revoked, createdAt   (Segment-5 downloadable apps; see contracts §6)
Activation?   id, licenseKey, deviceId, activatedAt                                              (Segment-5)
```

- Purchases/Runs in Postgres (durable, for receipts/support/refunds).
- Access tokens + run-status + rate-limit counters in **KV** (ephemeral, fast).
- Artifacts: small JSON in KV (TTL 30d) + optional file (Vercel Blob) for large bundles/zips.

---

## 8. Output Contract & report renderer

The thing that makes these _products_, not chatbots.

- Each product defines a **Zod schema** = its locked output. The AI step (`runStructured`) is forced to fill exactly that shape.
- `lib/store/report.ts` renders a validated contract into the deliverable: an on-screen report (React), a **branded PDF** (`@react-email` → HTML → print, or `@vercel/og`-style), and/or a downloadable bundle (zip of generated files via Vercel Blob).
- Export formats per product are declared in the PRD's Output Contract section. Common: **on-screen + PDF + JSON + (file bundle where relevant)**.
- A copy is emailed via Resend so the buyer never loses the artifact.

---

## 9. Payment integration (Polar / Merchant of Record)

- **Why Polar:** acts as legal seller-of-record → auto-collects & remits global VAT/sales tax; we don't register in every jurisdiction. Native Next.js helpers + webhooks.
- **Checkout:** `POST /api/store/checkout` → Polar Checkout Session for `polarProductId` with `metadata.slug` and a `success_url` back to `/store/checkout/success`.
- **Webhook** (`/api/store/webhook`): verify signature (`POLAR_WEBHOOK_SECRET`). On `order.paid`, create a `Purchase`, then fulfil by the product's `delivery` type: **`in-browser`** → mint an access token; **`download-license`** (Segment 5) → issue a `License` (key) + email a download link, **no token** (contracts §6). Handle `refund` → revoke token _or_ license, mark purchase refunded. **The webhook, not the redirect, is the source of truth** (redirects can be lost).
- **Refunds/abuse:** quota + TTL cap exposure; one-click refund via Polar dashboard revokes access on the `refund` event.
- **Test mode:** Polar sandbox keys in preview; live keys only in production env.

---

## 10. Security & privacy (applies to all products)

1. BYOK keys: never logged, encrypted only if saved, redacted in errors (§5).
2. Buyer input may contain a URL/repo/file — treat as untrusted; sanitize before use; never `eval`; sandbox any code execution.
3. Rate-limit `run` and `checkout` per IP/token via KV.
4. Webhooks: always verify signatures.
5. Secrets via Vercel env only; never in client bundles. Env validated with Zod at boot (`lib/env.ts`).
6. Data retention: artifacts auto-expire (KV TTL 30d / Blob lifecycle). Document per-product retention in PRD §15.
7. Don't store buyer source content longer than the run needs unless the product explicitly requires it (then disclose).

---

## 11. Design system & UX baseline

- **Reuse the existing digitribe-web design system** (`PROJECT_VISION.md`, `styles/`, `docs/redesign/`). Manrope (display) + Inter (body). The `(store)` group is a **sibling theme of `(neutral)`** — same DNA, slightly more "product/utility" density than the marketing pages.
- Every tool UI implements all states: **empty / collecting input / validating key / running (live progress) / partial / success (artifact) / error / quota-exhausted.** No dead spinners — show the runner's progress events.
- Density principle (from TribeHQ brand): this is a tool. Inputs `h-9`, buttons `h-9` primary / `h-8` secondary, cards `p-4`. `py-4` not `py-24`.
- Accessibility: WCAG 2.1 AA. Keyboard-navigable, labeled inputs, `aria-live` on the progress region, focus management on state changes. (The repo already uses `@axe-core/playwright` — gate on it.)

## 12. SEO baseline

- Each product gets a **static, server-rendered sales page** at `/store/[product]` — the SEO surface. Real copy, not a JS shell.
- `generateMetadata` per product (title ≤60 chars w/ keyword, meta description ≤155). OG card via `@vercel/og`.
- **JSON-LD** via `schema-dts`: `Product` + `Offer` + `FAQPage` + `BreadcrumbList`. (Per-product specifics in PRD §12.)
- The store dovetails with the agentic-web thesis: we ship our own `llms.txt`/`agents.md` describing the catalog so AI agents can recommend our tools (we eat our own dog food — see Segment 1).
- Internal links: marketing `/audit` → Agent-Ready Kit; blog posts → relevant tools.

## 13. Analytics & success metrics (events every product emits)

Plausible custom events, consistent names so funnels work across products:
`store_product_view`, `store_checkout_start`, `store_purchase` (revenue), `store_run_start`, `store_run_success`, `store_run_error`, `store_artifact_download`, `store_rerun`, `store_account_create`.

North-star per product: **purchase → first successful run ("activation") rate.** Target ≥ 80% (if buyers pay but can't get an artifact, the product is broken).

## 14. Testing baseline (every product)

| Layer           | Tool         | Must prove                                                                                                                     |
| --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Unit            | Vitest       | pipeline produces a schema-valid contract from a fixture input (mock `aiWrapper`); edge cases from PRD §10 each have a test    |
| Schema          | Vitest       | output contract rejects malformed AI output; input schema rejects bad input                                                    |
| Integration     | Vitest + MSW | runner: token verify → quota decrement → artifact persist; webhook: `order.paid` mints token, `refund` revokes                 |
| E2E             | Playwright   | buy (Polar sandbox) → token → enter key → run → see artifact → download; + a11y via `@axe-core/playwright`                     |
| Eval (AI tools) | golden set   | for products whose value is AI quality, a small labeled set + scoring so prompt changes don't regress (see Segment 4 patterns) |

Test behaviour, not implementation. Mock only at boundaries (the AI SDK, Polar, KV) — never internal modules.

## 15. Definition of Done (per product)

A product is shippable when:

1. Registry entry + Polar product live.
2. Input schema + Output Contract (Zod) implemented and tested.
3. Pipeline implemented; activation path green in E2E (sandbox).
4. Tool UI implements all states (§11) and is AA-accessible.
5. Sales page renders server-side with metadata + JSON-LD; OG card works.
6. Payment + webhook + token + quota + refund all verified.
7. BYOK key never logged/persisted (unless opted-in & encrypted); validated pre-run.
8. Analytics events fire; artifact emailed via Resend.
9. PRD's edge-case table (§10) all handled.

---

## 16. Environment variables (add to `lib/env.ts`, Zod-validated)

```
POLAR_ACCESS_TOKEN
POLAR_WEBHOOK_SECRET
ACCESS_TOKEN_SECRET           # HMAC for access tokens
KEY_VAULT_SECRET              # AES-256-GCM for saved BYOK keys
DATABASE_URL                  # Postgres (Supabase/Neon)
KV_*                          # Vercel KV (already present)
RESEND_API_KEY                # already present
# No provider AI keys here — inference is BYOK.
```
