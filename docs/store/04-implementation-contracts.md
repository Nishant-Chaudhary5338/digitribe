# 04 · Implementation Contracts

> **The canonical, copy-pasteable contracts every product and the spine share.** When an agent needs a type, an API shape, an error code, an event, an env var, or an analytics payload — it comes from HERE, verbatim. Do not redefine these per product. If you change one, change it here and update consumers.
>
> Read after [`01-platform-spec.md`](./01-platform-spec.md). These types live in `lib/store/types.ts` unless noted. All code is TypeScript strict.

---

## 1. Canonical folder structure (authoritative)

```
app/(store)/
  layout.tsx
  store/
    page.tsx                         # storefront
    [product]/page.tsx               # sales page (SEO)
    checkout/success/page.tsx
    use/[token]/page.tsx             # tool UI
    account/page.tsx                 # optional
  api/store/
    checkout/route.ts                # POST
    webhook/route.ts                 # POST (Polar)
    run/[product]/route.ts           # POST (SSE stream)
    artifact/[runId]/route.ts        # GET
    key-check/route.ts               # POST (validate BYOK key, no quota)
lib/store/
  types.ts            # §2–§6 here
  products.ts         # PRODUCT_REGISTRY
  access.ts           # mintToken / verifyToken / decrementQuota
  byok.ts             # validateKey / encryptKey / decryptKey
  ai.ts               # runStructured / streamStructured
  runner.ts           # runProduct (the SSE engine)
  report.ts           # buildArtifact (json/pdf/zip)
  polar.ts            # client + verifyWebhook
  kv.ts               # typed KV helpers + key namespaces
  errors.ts           # StoreError + codes (§5)
  events.ts           # RunEvent helpers (§4)
  analytics.ts        # track() + event payloads (§9)
  env.ts              # Zod-validated env (§8)
server/store/
  schemas/<slug>.ts   # one Output Contract per product
  tools/<slug>.ts     # one pipeline per product: ProductPipeline
  tools/agentic/      # shared Segment-1 crawl+score spine
  prompts/<slug>.ts   # system + buildPrompt per AI product
```

**Naming:** files kebab-case; types PascalCase; the product `slug` is the single key linking registry ↔ schema ↔ pipeline ↔ prompt ↔ route (`/run/[product]` where `product === slug`).

## 2. Core domain types

```ts
// lib/store/types.ts
import { z } from 'zod'

export type AiProvider = 'anthropic' | 'openai' | 'google'
export type ProductModel = 'byok-finite'
export type Segment = 1 | 2 | 3 | 4 | 5 | 6
export type ProductStatus = 'draft' | 'beta' | 'live'

export interface ProductDef {
  slug: string
  name: string
  segment: Segment
  tagline: string
  priceUSD: number // DISPLAY ONLY — charge from Polar (platform-spec §3)
  polarProductId: string
  model: ProductModel
  byokProviders: AiProvider[]
  defaultModel: Partial<Record<AiProvider, string>> // e.g. { anthropic: "claude-opus-4-8" }
  estRunSeconds: number
  runsPerPurchase: number // quota; default 3
  status: ProductStatus
  // wired lazily to avoid circular imports:
  inputSchema: () => Promise<z.ZodTypeAny>
  outputSchema: () => Promise<z.ZodTypeAny>
  pipeline: () => Promise<ProductPipeline<any, any>>
}

export type ProductPipeline<I, O> = (ctx: {
  input: I
  ai: AiRunner // §7
  emit: (e: RunEvent) => void // §4
  signal: AbortSignal
}) => Promise<O>
```

## 3. Access token

```ts
export interface AccessTokenPayload {
  jti: string // token id (KV key suffix)
  purchaseId: string
  slug: string
  email: string
  iat: number // issued-at (epoch s)
  exp: number // iat + 30d
}

// access.ts signatures (impl in spine):
export function mintToken(p: Omit<AccessTokenPayload, 'jti' | 'iat' | 'exp'>): Promise<string>
export function verifyToken(
  token: string
): Promise<
  | { ok: true; payload: AccessTokenPayload; runsRemaining: number }
  | { ok: false; reason: 'invalid' | 'expired' | 'exhausted' }
>
export function decrementQuota(jti: string): Promise<number> // returns runsRemaining
export function restoreQuota(jti: string): Promise<number> // on system-side failure
```

- Token = `base64url(payload).hmacSHA256(ACCESS_TOKEN_SECRET)`. Verify HMAC + look up quota in KV.
- KV namespaces (§ kv.ts): `tok:{jti}` → `{ runsTotal, runsUsed }` (TTL 30d); `run:{runId}` → `RunResult` (TTL 30d); `rl:{scope}:{id}` → counter; `idem:{runId}` → in-flight lock.

## 4. Run events (SSE)

```ts
export type RunPhase =
  | 'auth'
  | 'validate'
  | 'key'
  | 'crawl'
  | 'analyze'
  | 'generate'
  | 'render'
  | 'persist'
  | 'done'
  | 'error'

export interface RunEvent {
  phase: RunPhase
  pct: number // 0–100, monotonic
  message: string // human label shown in UI ("Crawling 12/20…")
  partial?: unknown // optional streamed slice of the Output Contract
  findingCount?: number // optional "show the work" counter (doc 03 §3)
}
// SSE wire format: `data: ${JSON.stringify(RunEvent)}\n\n`
// Terminal events: phase "done" (with result ref) or "error" (with StoreError).
```

The runner MUST emit at least: `auth`(5) → `validate`(8) → `key`(12) → …product phases… → `done`(100). UI maps phases to labels; never invents pct.

## 5. Error envelope (one shape everywhere)

```ts
// lib/store/errors.ts
export type StoreErrorCode =
  | 'KEY_INVALID'
  | 'KEY_RATE_LIMITED'
  | 'KEY_REFUSED'
  | 'INPUT_INVALID'
  | 'INPUT_UNREACHABLE'
  | 'INPUT_BLOCKED' // SSRF/private
  | 'QUOTA_EXHAUSTED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'RUN_FAILED'
  | 'ARTIFACT_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'LICENSE_INVALID' // Segment 5 downloadable apps
  | 'LICENSE_EXHAUSTED' // no device activations left
  | 'INTERNAL'

export interface StoreError {
  code: StoreErrorCode
  userMessage: string // shown to buyer — human, no jargon, no key leakage
  retryable: boolean
  quotaSpent: boolean // did this consume a run?
  detail?: string // server-log only; NEVER includes the BYOK key
}

export class StoreErr extends Error {
  constructor(public payload: StoreError) {
    super(payload.code)
  }
}
```

**HTTP status mapping** (used by all routes):

| code(s)                                                | HTTP |
| ------------------------------------------------------ | ---- |
| `INPUT_INVALID`, `INPUT_BLOCKED`                       | 422  |
| `INPUT_UNREACHABLE`                                    | 400  |
| `KEY_INVALID`, `KEY_REFUSED`, `PROVIDER_*` (BYOK-side) | 400  |
| `TOKEN_INVALID`, `TOKEN_EXPIRED`                       | 403  |
| `LICENSE_INVALID`, `LICENSE_EXHAUSTED`                 | 403  |
| `QUOTA_EXHAUSTED`                                      | 402  |
| `RATE_LIMITED`                                         | 429  |
| `ARTIFACT_NOT_FOUND`                                   | 404  |
| `RUN_FAILED`, `INTERNAL`                               | 500  |

Error response body is always `{ error: StoreError }` (sans `detail`). On the SSE stream, a failure is a terminal `RunEvent{ phase:"error" }` whose `message` = `userMessage`, plus a final `data: { error }` frame.

## 6. API route contracts

### `POST /api/store/checkout`

```ts
// req
{
  slug: string
}
// res 200
{
  checkoutUrl: string
} // redirect the browser here (Polar-hosted)
// errors: INPUT_INVALID (unknown slug), INTERNAL
```

### `POST /api/store/webhook` (Polar → us; source of truth)

- Verify signature with `POLAR_WEBHOOK_SECRET` (`polar.verifyWebhook`). Reject → 400.
- `order.paid` → create `Purchase`, then **fulfil by `delivery` type** (from the product registry, §2):
  - `in-browser` → `mintToken`, store `checkout_id → token` in KV for the success page.
  - `download-license` (Segment 5) → `issueLicense()` (create a `License` row + key), email the **license key + download link** (Resend), store `checkout_id → { licenseKey, downloadUrl }` in KV for the success page. **No access token is minted.**
- `refund` → in-browser: `restoreQuota`→0 + delete token; download-license: revoke the `License`. Mark purchase refunded. Return 200.
- Idempotent on `polarOrderId` (ignore duplicates).

### `POST /api/store/key-check`

```ts
// req
{ provider: AiProvider, apiKey: string }
// res 200
{ valid: boolean }
// never logs apiKey; uses a 1-token ping (§7). Does NOT need a token/quota.
```

### `POST /api/store/run/[product]` (SSE)

```ts
// req
{ token: string, byokKey: string, input: <product inputSchema>, runId?: string }
// response: text/event-stream of RunEvent (§4); final frame carries { runId, artifactUrl } or { error }
// order of operations is fixed (platform-spec §6); quota only spent per the edge-case rules.
```

- Idempotency: client generates `runId` (uuid v4); server `SETNX idem:{runId}`. Re-POST with same id streams the cached/in-flight result, never double-charges.

### `GET /api/store/artifact/[runId]?fmt=json|pdf|zip`

```ts
// res: the artifact in the requested format (json inline; pdf/zip via Blob redirect or stream)
// errors: ARTIFACT_NOT_FOUND, TOKEN_INVALID (must present token query/header)
```

### `POST /api/store/license/validate` (Segment 5 downloadable apps only)

The local app calls this **once** to activate, then caches a signed receipt (offline default: valid 30 days, re-validate when next online — per the Segment-5 PRD open question). This endpoint **never receives the buyer's code** — only the key + a device id.

```ts
// req
{ licenseKey: string, deviceId: string, slug: string }
// res 200
{ valid: boolean, activationsRemaining: number, receipt?: string /* signed, for offline */, reason?: string }
// errors: LICENSE_INVALID (unknown/revoked), LICENSE_EXHAUSTED (no activations left)
// rate-limited like other public routes (§10); no BYOK key involved (inference stays local on the buyer's key).
```

```ts
// License domain types (lib/store/types.ts)
export interface License {
  key: string // shown to buyer; store a hash
  purchaseId: string
  slug: string
  email: string
  maxActivations: number // default 3 (Segment-5 PRD)
  revoked: boolean
  createdAt: number
}
export interface Activation {
  licenseKey: string
  deviceId: string
  activatedAt: number
}
// access.ts-adjacent: issueLicense(purchase) / validateLicense(key, deviceId, slug)
```

> **Scope:** the License/Activation module is **Segment-5-only** for now; promote it into the `segment-0` spine if other downloadable products appear. (Flagged from the Segment-5 PRD revision.)

## 7. AI runner (BYOK wrapper) — the only way products call AI

```ts
// lib/store/ai.ts
export interface AiRunner {
  /** Structured, schema-enforced generation. Throws StoreErr on key/provider issues. */
  structured<T>(opts: {
    system: string
    prompt: string
    schema: z.ZodSchema<T>
    effort?: 'low' | 'medium' | 'high'
    model?: string // defaults from ProductDef.defaultModel
    maxOutputTokens?: number // default 16000; cap per product for cost control
    images?: Array<{ mediaType: string; data: string | URL }> // optional multimodal input (SW-6) — e.g. ad screenshots (Segment 6). Requires a vision-capable model; all 3 providers' default models qualify.
  }): Promise<T>

  /** Same, but streams partial objects for progressive UI (doc 03 §3). */
  structuredStream<T>(opts: { /* …same… */ onPartial: (p: Partial<T>) => void }): Promise<T>

  /** 1-token liveness ping used by key-check + pre-run validation. */
  ping(): Promise<boolean>
}

// Construction (per run, BYOK):
export function makeAiRunner(provider: AiProvider, apiKey: string): AiRunner
```

**Implementation notes (canonical):**

- Built on the Vercel AI SDK: `generateObject` / `streamObject` with the provider package (`@ai-sdk/anthropic` | `@ai-sdk/openai` | `@ai-sdk/google`) constructed from the BYOK `apiKey`.
- Anthropic default model `claude-opus-4-8`; adaptive thinking on; map `effort` → AI SDK provider options. Cheaper option `claude-haiku-4-5` where a product offers it. (Model IDs exact — no date suffixes; per `01` §5.)
- **Map provider errors → `StoreErr`:** 401/invalid → `KEY_INVALID`; 429 → `KEY_RATE_LIMITED`; Anthropic `stop_reason:"refusal"` / empty → `KEY_REFUSED` (retry once, then surface); timeout → `PROVIDER_TIMEOUT`.
- **Never** log `apiKey`, prompts containing buyer secrets at info level, or full responses with PII. Redact `apiKey` from any thrown `detail`.

## 8. Environment (Zod-validated at boot)

```ts
// lib/store/env.ts
import { z } from 'zod'
export const storeEnv = z
  .object({
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_WEBHOOK_SECRET: z.string().min(1),
    POLAR_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
    ACCESS_TOKEN_SECRET: z.string().min(32),
    KEY_VAULT_SECRET: z.string().length(64), // 32 bytes hex for AES-256-GCM
    DATABASE_URL: z.string().url(),
    KV_REST_API_URL: z.string().url(),
    KV_REST_API_TOKEN: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    STORE_BASE_URL: z.string().url(), // for success_url / emails
  })
  .parse(process.env)
// NOTE: no AI provider keys — inference is BYOK.
```

## 9. Analytics event payloads (exact)

```ts
// lib/store/analytics.ts — Plausible custom events; payload = the `props`
type Events = {
  store_product_view: { slug: string }
  store_checkout_start: { slug: string }
  store_purchase: { slug: string; priceUSD: number; polarOrderId: string }
  store_run_start: { slug: string; provider: AiProvider }
  store_run_success: { slug: string; provider: AiProvider; ms: number }
  store_run_error: { slug: string; code: StoreErrorCode }
  store_artifact_download: { slug: string; fmt: 'json' | 'pdf' | 'zip' }
  store_rerun: { slug: string; runsRemaining: number }
  store_account_create: {}
}
export function track<K extends keyof Events>(name: K, props: Events[K]): void
```

Product-specific events extend this map in the product's module (e.g. `ark_grade: { grade }`), documented in that PRD §16.

## 10. Operational rules (non-functional, apply to all)

| Concern            | Rule                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rate limit**     | `run`: 10/min per token + 30/min per IP; `checkout`: 20/min per IP; `key-check`: 20/min per IP. KV fixed-window counters (`rl:` namespace). Exceed → `RATE_LIMITED` (429).        |
| **Idempotency**    | client `runId` (uuid v4); `SETNX idem:{runId}` (TTL = estRunSeconds×3).                                                                                                           |
| **Concurrency**    | one in-flight run per token (`idem` lock keyed also by jti); second concurrent run → friendly "a run is already in progress."                                                     |
| **Cost cap**       | each product sets `maxOutputTokens` + an input-size cap (crawl pages / file bytes / rows) so a buyer's key bill is bounded and predictable; show expected cost in UI (doc 03 §5). |
| **Timeout**        | per-phase soft timeouts; total run < Vercel function limit; long work streams + chunks.                                                                                           |
| **Logging**        | structured JSON logs; levels: info (phase transitions, no payloads), warn (handled edge), error (`StoreError.detail`). **Redact** `byokKey` always.                               |
| **Error tracking** | report `INTERNAL`/`RUN_FAILED` to Sentry (OPEN QUESTION: confirm Sentry) with `byokKey` scrubbed.                                                                                 |
| **Feature flags**  | `ProductDef.status`: `draft`/`beta` hidden from storefront (beta = direct-link only); only `live` is indexed/sold.                                                                |
| **Data retention** | artifacts/crawl content TTL 30d; BYOK keys never persisted unless account opt-in (encrypted).                                                                                     |

## 11. How a product wires in (the whole surface area of a new product)

To add product `X`, an agent creates exactly:

1. `lib/store/products.ts` → one `ProductDef` entry.
2. `server/store/schemas/x.ts` → `inputSchema` + `XOutput` (Output Contract).
3. `server/store/tools/x.ts` → the `ProductPipeline`.
4. `server/store/prompts/x.ts` → `system` + `buildPrompt` (if AI).
5. `app/(store)/store/x/page.tsx` → sales page (SEO).
6. The tool UI is **generic** (`use/[token]`) and renders from registry + the artifact; only a product-specific **ArtifactView** component is added under `components/store/artifacts/X.tsx`.
7. Polar product created (sandbox + live); id into the registry.

Nothing else in the spine changes. That invariant is the point of this doc.
