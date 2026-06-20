# Open Questions Register

> Every unresolved decision across the store, in one place, so no agent re-litigates them mid-build. Each has a **default** (what we'll do absent a decision), a **priority**, and an **owner**. When resolved, move it to [`DECISIONS.md`](./DECISIONS.md) and update the referencing doc.
>
> Priority: 🔴 blocker (gates a build) · 🟠 resolve-before-launch · 🟡 nice-to-confirm.

---

## ✅ Resolved (2026-06-20 → see `DECISIONS.md`)

- **SW-1** Database → **Supabase** (D-10). **S6-1** Digibot → **we host, multi-tenant, encrypted key + consent** (D-11). **S1-1** Simulator → **fetch heuristic** (D-12). **S5-1 + S5-2** Segment 5 → **downloadable local apps, run locally** (D-13). **S5-NEW** → **3 separate apps** (D-14) + **license-key unlock** (D-15). **S2 scope** → **"lite" v1: visible badge + C2PA manifest, service cert, no durable watermark** (D-16). **SW-2 (pricing)** → **locked** (D-17); creating the Polar products remains an action item.
- **S2-4 regulatory figures** → **verified** (see `research-sources.md`): EU Art. 50 applies 2 Aug 2026, fines €15M / 3%; CA SB 942 delayed to 2 Aug 2026 by AB 853.

### Minor technical defaults — LOCKED (veto anytime)

`cheerio` (SW-3) · PDF via react-email→print, revisit if needed (SW-4) · Sentry (SW-5) · **`AiRunner` gains optional image parts for multimodal** (SW-6 — note in `04` §7 when building) · MCP transports = Streamable HTTP + SSE (S1-3/S3-2) · eval harness = Vitest + zero-dep runner (S4-1) · auditor ships degraded-not-refunded if AI rationale fails (S3-5).

### Resolved 2026-06-20 (later additions)

- **S2-1 (C2PA library/runtime) → RESOLVED:** the current package `@contentauth/c2pa-node-v2` signs via a **native Rust binary**, which is unreliable inside Vercel serverless functions. **Decision:** do NOT run signing in a Vercel function — run it as a **standalone C2PA signing micro-service** (thin wrapper around `c2pa-node-v2`/`c2patool`; ContentAuth ships `c2patool-service-example`) on a cheap container host (Fly/Render/Railway), called over HTTPS by Segment-2 products; the signing cert lives there. **Vercel Sandbox** is the stay-on-Vercel alternative. Update Segment-2 PRDs (`c2pa-stamper`, `bulk-watermark`) to this architecture when building. Browser WASM (`@contentauth/c2pa`) is read/verify only — never sign client-side (exposes the cert).

### Still open / action items

Polar product creation (Manu) · fill `research-sources.md` 🔴 rows before launch (Manu) · counsel review of `08-legal-drafts.md` · **S2-2** real CA signing cert (deferred past lite-v1; service/self-issued cert for v1) · pick the signing-service host (Fly/Render/Railway/Vercel Sandbox) when building Segment 2 · per-Segment-5 license activation model (in the revised PRDs).

---

## Store-wide (resolve once; affects many products)

| #    | Question                                                                                                                                        | Default                                                                                                        | Pri              | Owner   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------- | ------- |
| SW-1 | Postgres host: Supabase vs Neon                                                                                                                 | **Supabase** (founders use it; gives Auth)                                                                     | 🔴               | Nishant |
| SW-2 | Polar product IDs + final prices for all ~27 products                                                                                           | create in sandbox as each product reaches Phase 0; prices per registry                                         | 🔴 (per product) | Manu    |
| SW-3 | Shared crawler HTML parser: `cheerio` vs `linkedom`                                                                                             | **cheerio**                                                                                                    | 🟠               | Nishant |
| SW-4 | PDF rendering approach (spine S9)                                                                                                               | decide in S9: react-email→print first, html-to-pdf lib if needed                                               | 🟠               | Nishant |
| SW-5 | Error tracking: Sentry vs Vercel built-in                                                                                                       | confirm in S1                                                                                                  | 🟡               | Nishant |
| SW-6 | **Spine `AiRunner` multimodal support** — `04` §7 `structured()` may need optional image parts (Segment 6 ad-screenshot, and useful elsewhere). | extend `AiRunner` with optional `images?: ImagePart[]`; all 3 default providers' default models are multimodal | 🟠               | Nishant |
| SW-7 | `research-sources.md` citation register — several PRDs cite market/legal stats that must be sourced before sales copy ships                     | create + fill before any sales page goes live; **never ship an unsourced legal/market number**                 | 🟠               | Manu    |

## Segment 1 — Agentic Web

| #    | Question                                                                                                | Default                                                                                                                                   | Pri |
| ---- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --- |
| S1-1 | AI Buyer Simulator: real headless browser (Playwright-in-serverless) vs fetch-based heuristic traversal | **fetch heuristic for v1** (serverless-safe; JS-only failure is itself a finding); headless = flagged enhancement, resolve before Phase 4 | 🔴  |
| S1-2 | WebMCP `validateBundle` parser: `typescript.transpileModule` syntax-check vs `@babel/parser`            | TS transpileModule                                                                                                                        | 🟡  |
| S1-3 | WebMCP default MCP transport in the generated server: Streamable HTTP vs stdio                          | confirm against current MCP guidance before locking template                                                                              | 🟠  |
| S1-4 | Monitor ($19): is the purchase creditable toward the $29 Kit?                                           | funnel copy only for v1 (no Polar coupon complexity)                                                                                      | 🟡  |

## Segment 2 — Compliance & Provenance

| #    | Question                                                                                                                                                                                    | Default                                                                                                                                | Pri                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| S2-1 | **C2PA signing library** — `c2pa-node`/`c2pa-node-v2` archived; work moved to `contentauth/c2pa-js` monorepo. Confirm exact package + that its native binary runs on Vercel Node functions. | pin maintained `contentauth/c2pa-js` pkg; **fallback: Vercel Sandbox or a separate signing service** if the binary won't run on Vercel | 🔴 (gates the whole segment) |
| S2-2 | Production signing certificate — C2PA interim-Trust-List CA (DigiCert/SSL.com) + KMS/HSM-backed signing                                                                                     | v1 honest state `trustListStatus: 'service_cert'`; real cert before launch                                                             | 🔴 (launch blocker)          |
| S2-3 | Durable invisible watermark engine (Digimarc/SynthID-class is commercial/closed)                                                                                                            | **v1 = visible badge + C2PA manifest only, `watermarkMode: 'visible-only'`**; never claim durability we can't deliver                  | 🟠                           |
| S2-4 | Regulatory figures — SB 942 operative date moved to **Aug 2 2026** (AB 853, Oct 2025); EU Art. 50 transparency penalties sit in the **€15M / 3%** tier (not €7.5M/1%).                      | use corrected figures everywhere; **confirm with counsel** before sales copy                                                           | 🟠                           |
| S2-5 | Safe-unzip lib + batch model for large/video zips (`bulk-watermark`)                                                                                                                        | `yauzl` streaming + zip-bomb/path-traversal guards; in-function for small, Vercel Sandbox/async for heavy                              | 🟠                           |

## Segment 3 — MCP & Agent Security

| #    | Question                                                                                                                         | Default                                                                                                                                                 | Pri                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| S3-1 | Safely scanning a buyer's **live** MCP server                                                                                    | resolved in-doc: read-only `initialize`/`tools/list` only, never `tools/call`; SSRF resolved-IP/redirect recheck; quarantine all target strings as data | 🔴 (resolved — keep enforced) |
| S3-2 | Which MCP transports v1 supports                                                                                                 | Streamable HTTP + SSE; stdio = source-mode only; auth-gated endpoint scanning → v2                                                                      | 🟠                            |
| S3-3 | Static-analysis approach: purpose-built AST walk vs reuse slimmed `@mcp-toolkit/code-indexer`                                    | confirm in build                                                                                                                                        | 🟡                            |
| S3-4 | Supported frameworks/formats (hardening middleware targets, injection-suite harness langs, auditor config formats)               | confirm we emit idiomatic output before listing                                                                                                         | 🟠                            |
| S3-5 | Tool-permission auditor: if AI rationale step fails, ship degraded (valid deterministic report, no prose) and charge, or refund? | **ship degraded** (deterministic report still valuable)                                                                                                 | 🟡                            |

## Segment 4 — Reliability & Evals

| #    | Question                                                                       | Default                                                                                                                 | Pri                  |
| ---- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------- |
| S4-1 | Which test framework(s) the harness emits                                      | **Vitest + a zero-dep Node runner**; framework-neutral contract enables Pytest/Promptfoo later                          | 🟠                   |
| S4-2 | How a generated harness scores without us running the buyer's agent            | 3-tier: deterministic assertions (free) + opt-in LLM-judge (buyer key) + a buyer-filled `runAgent()` seam we never call | 🟠 (resolved — keep) |
| S4-3 | `json_schema` assertion: inline a zero-dep validator vs assume buyer's zod/ajv | inline zero-dep                                                                                                         | 🟡                   |
| S4-4 | `runAgent()` seam behavior in CI when unfilled                                 | **fail loudly** (unfilled guard must not be silently green)                                                             | 🟠                   |
| S4-5 | Golden-dataset row cap + optional dataset-card PDF; v1 CI target               | cap 100 rows; GitHub Actions first                                                                                      | 🟡                   |

## Segment 5 — Codebase Intelligence

| #    | Question                                                                                                     | Default                                                                                                                                                | Pri |
| ---- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| S5-1 | Repo ingest: GitHub OAuth (read-only App) vs zip upload                                                      | **v1 = zip + public-GitHub-URL**; private-repo GitHub App → v2                                                                                         | 🔴  |
| S5-2 | How the deterministic mcp-toolkit engines run on Vercel                                                      | **bundle into the function** for v1 (pure Node + ts-morph, never executes target code); measure cold-start/memory in Phase 2; Vercel Sandbox if needed | 🟠  |
| S5-3 | Open-core boundary: import the published npm engine vs vendor its source into `server/store/tools/codebase/` | import npm package; vendor only if patching needed                                                                                                     | 🟡  |
| S5-4 | Unsourced market stats (maintenance-cost %, ADA-lawsuit volume)                                              | trace in `research-sources.md`; never ship unsourced                                                                                                   | 🟠  |

## Segment 6 — Conversion & Growth

| #    | Question                                                                                                                                                     | Default                                                                                                                                                                                                                                                                                     | Pri |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| S6-1 | **Digibot widget architecture** — where visitor chat runs + where the buyer's runtime key lives. This is the ONE product that persists a BYOK key by design. | **Option A (recommended):** we host multi-tenant `/api/widget/[configId]/chat`; embed carries only `configId`; buyer runtime key stored **AES-256-GCM with explicit consent**; add `WIDGET_CONFIG_SECRET`; per-config monthly message cap. Option B (self-host route) as power-user export. | 🔴  |
| S6-2 | Widget loader host: same Vercel project vs `widget.digitribe.world` subdomain                                                                                | decide in build                                                                                                                                                                                                                                                                             | 🟡  |
| S6-3 | Ad-screenshot input → vision: require a vision-capable BYOK model vs OCR fallback                                                                            | require vision model when a screenshot is given (defaults are multimodal) + `tesseract.js`/paste-text fallback; depends on SW-6                                                                                                                                                             | 🟠  |
| S6-4 | Shopify enrichment via Admin/Storefront API                                                                                                                  | **v1 = public PDP crawl only**; API enrichment → v2                                                                                                                                                                                                                                         | 🟡  |
| S6-5 | Pricing-table parsing robustness (toggles/sliders/calculators)                                                                                               | v1 targets 3-column card pattern; be honest when unparseable                                                                                                                                                                                                                                | 🟡  |
| S6-6 | DTC email push to Klaviyo/ESP                                                                                                                                | **v1 = plain platform-agnostic copy**; `delayHours` kept in contract to enable v2 push                                                                                                                                                                                                      | 🟡  |
| S6-7 | Positioning generator: apply literal Studio/Garden accent tones to the two columns                                                                           | gate on taste + a11y contrast                                                                                                                                                                                                                                                               | 🟡  |

---

## How to use this file

1. Before starting a product, scan its segment block + the store-wide block.
2. If a 🔴 affecting your product is unresolved, resolve it (with the owner) **before** building — don't guess.
3. When resolved, append to `DECISIONS.md` with the date + rationale and update the PRD that referenced it.
