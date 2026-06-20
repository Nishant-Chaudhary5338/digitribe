# Segment 0 — The Spine (build this FIRST)

> **No product can be built until the spine exists.** This is the build plan for the shared platform layer (`lib/store/*`, `api/store/*`, the generic tool UI). Every product PRD's "Phase 0" assumes the modules here are done and tested.
>
> Contracts are defined in [`04-implementation-contracts.md`](../04-implementation-contracts.md) — this doc is the **order + acceptance criteria** to implement them. Build top to bottom; each block depends only on the ones above it.

---

## Definition of Ready (before writing ANY product)

The spine is "ready to host products" when all of these are true:

- [ ] `lib/store/env.ts` validates; all env vars present in Vercel (sandbox values OK).
- [ ] `types.ts`, `errors.ts`, `events.ts`, `kv.ts` implemented per doc 04.
- [ ] `access.ts` mint/verify/quota round-trips in a unit test.
- [ ] `byok.ts` validate/encrypt/decrypt round-trips; key never logged.
- [ ] `ai.ts` `makeAiRunner` works against all 3 providers with a real test key (structured + stream + ping).
- [ ] `polar.ts` checkout + webhook verify work against Polar **sandbox**.
- [ ] `runner.ts` executes a trivial demo pipeline end-to-end and streams `RunEvent`s.
- [ ] `report.ts` renders a sample contract to on-screen JSON + PDF + zip(Blob).
- [ ] Generic tool UI (`use/[token]`) drives a demo product through all 8 states (doc 06).
- [ ] One **demo product** ("Hello Store" — echoes input through the AI as a one-field artifact) is live in sandbox and passes the full E2E (buy→token→key→run→artifact→download). This is the spine's acceptance test.

When the demo product works end-to-end, the spine is done and product PRDs can begin.

## Build order (modules, with acceptance criteria)

### S0 · Project setup

- Add deps: `@polar-sh/sdk` `@polar-sh/nextjs`, `drizzle-orm` + driver, `@vercel/blob`, parser libs as needed. (KV, AI SDK, Resend, Zod already present.)
- Create the `(store)` route group + `lib/store/` + `server/store/` skeleton (doc 04 §1).
- **AC:** app builds; `/store` renders an empty storefront.

### S1 · Types, errors, events, env (`types.ts`, `errors.ts`, `events.ts`, `env.ts`)

- Implement doc 04 §2–§5, §8 verbatim.
- **AC:** typecheck passes; `storeEnv` throws clearly on a missing var; `StoreErr` maps to the right HTTP status via a `toResponse(err)` helper.

### S2 · KV layer (`kv.ts`)

- Typed helpers for namespaces `tok:`, `run:`, `rl:`, `idem:` (doc 04 §3, §10). Fixed-window rate-limit helper.
- **AC:** unit tests (mock KV) for set/get/TTL, rate-limit window, `SETNX` idempotency lock.

### S3 · Data model (Drizzle) (`server/store/db/`)

- Tables `Purchase`, `Run`, optional `Account`, `SavedKey` (platform-spec §7).
- **AC:** migration applies; a `Purchase` + `Run` can be created/read.

### S4 · Access tokens (`access.ts`)

- `mintToken` / `verifyToken` / `decrementQuota` / `restoreQuota` (doc 04 §3). HMAC signing + KV quota.
- **AC:** mint→verify returns payload + runsRemaining; tamper → `invalid`; expired → `expired`; quota hits 0 → `exhausted`; restore works.

### S5 · BYOK vault (`byok.ts`)

- `validateKey(provider,key)` (via AI runner ping), `encryptKey`/`decryptKey` (AES-256-GCM, `KEY_VAULT_SECRET`).
- **AC:** encrypt→decrypt round-trips; ciphertext ≠ plaintext; a thrown error never contains the key; invalid key → `KEY_INVALID`.

### S6 · AI runner (`ai.ts`)

- `makeAiRunner(provider,key)` → `structured` / `structuredStream` / `ping` (doc 04 §7) on the Vercel AI SDK with per-provider packages.
- Provider-error → `StoreErr` mapping; Anthropic refusal/empty handling; redaction.
- **AC:** with a real test key, `structured` fills a sample Zod schema; `structuredStream` emits partials; bad key → `KEY_INVALID`; forced 429 → `KEY_RATE_LIMITED`. (Mock the SDK for CI; one manual live check documented.)

### S7 · Polar (`polar.ts`) + checkout/webhook routes

- Client, `createCheckout(slug)`, `verifyWebhook(req)`; routes per doc 04 §6.
- Webhook is the source of truth: `order.paid` → Purchase + mintToken; `refund` → revoke.
- **AC:** sandbox checkout opens; sandbox `order.paid` → token minted + Purchase row; bad signature → 400; duplicate order ignored.

### S8 · Job runner (`runner.ts`) + `run/[product]` route

- `runProduct({ slug, token, byokKey, input, runId })`: the fixed pipeline order (verify token+quota → validate input → key ping → `pipeline()` with `emit` → persist → email → decrement quota). SSE stream of `RunEvent`. Idempotency + concurrency lock + rate limit (doc 04 §10).
- **AC:** a demo pipeline streams events; quota decrements once; same `runId` returns cached; system failure restores quota; all `StoreErr`s surface as terminal error events.

### S9 · Report renderer (`report.ts`) + `artifact/[runId]` route + email

- `buildArtifact(contract, productMeta)` → on-screen JSON, branded **PDF** (react-email/print or html-to-pdf), **zip** of generated files to Blob. Resend email with artifact links + receipt.
- **AC:** sample contract → all three formats; email delivered (sandbox); PDF is branded (tokens from doc 06), not a screenshot.

### S10 · Generic tool UI (`use/[token]`) + shared components

- The 8-state machine (doc 06 §state-chart), driven by registry + SSE. Shared components: `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer`, `ScoreRing` (doc 06).
- Per-product artifact body is a lazy `components/store/artifacts/<slug>.tsx`; everything else generic.
- **AC:** demo product runs through empty→…→success with real streamed progress; a11y (axe) clean; mobile works.

### S11 · Storefront + sales-page shell + SEO/analytics scaffold

- `/store` grid from registry (showcase cards, doc 03 §1); `/store/[product]` shell with `generateMetadata` + JSON-LD helpers (`schema-dts`); `track()` wired (doc 04 §9); store-level `llms.txt`/`agents.md`.
- **AC:** storefront lists live products; a sales page renders server-side with metadata + Product/Offer/FAQ JSON-LD; events fire in Plausible.

### S12 · Demo product "Hello Store" (the spine acceptance test)

- A throwaway `byok-finite` product: input `{ text }` → AI returns `{ echoStyled }` → rendered + downloadable. Proves the entire loop.
- **AC:** the Definition of Ready checklist (top of this doc) is fully green.

## What the spine guarantees to products

Once S0–S12 pass, a product author gets, for free: payments, tax, tokens, quota, BYOK validation + inference, streaming progress UI, all 8 UI states, artifact rendering (screen/PDF/zip), email delivery, rate-limiting, idempotency, analytics, SEO scaffolding, and the error envelope. A product is then _only_ its input schema + Output Contract + pipeline + prompt + sales copy + artifact view (doc 04 §11).

## Open questions for the spine (resolve during S0–S3)

- `OPEN QUESTION:` Postgres host — Supabase (gives Auth) vs Neon. Default: Supabase.
- `OPEN QUESTION:` PDF approach — react-email→print vs a html-to-pdf lib on Vercel. Pick during S9.
- `OPEN QUESTION:` Sentry for error tracking — confirm or use Vercel's built-in.
- Record answers in `DECISIONS.md` (to be created).
