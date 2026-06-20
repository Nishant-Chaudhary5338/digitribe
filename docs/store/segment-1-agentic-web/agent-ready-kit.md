# Agent-Ready Kit — PRD

**Slug:** `agent-ready-kit` · **Segment:** 1 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> This is the **reference PRD** and the **reference implementation** of Segment 1's crawl→analyze→generate spine. Build it first. Other agentic-web products compose its pieces.

---

## 1. TL;DR

- **One-liner:** Paste a URL → get the file bundle that makes your site readable and usable by AI agents.
- **Problem:** AI agents (ChatGPT, Perplexity, Claude, Gemini) can't reliably read or act on most sites; the fix files (`llms.txt`, `agents.md`, structured data, an MCP stub) exist as standards but almost nobody generates them for you.
- **Buyer:** founders / marketers / DTC & SaaS site owners who've heard "AI is sending traffic" and want in, without hiring a consultant.
- **Input → Output:** one URL → a downloadable **Agent-Ready Bundle** (`llms.txt`, `llms-full.txt`, `agents.md`, JSON-LD snippets, `.well-known/` MCP stub, an install README) + an on-screen readiness report.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~45–90s (crawl-bound) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a site owner who wants to be "AI-ready" must read a dozen blog posts about `llms.txt`/`agents.md`/UCP/ACP, hand-author markdown summaries of their whole site, write JSON-LD, and stand up an MCP endpoint. Almost none do it. Agencies charge $2k+ to do it manually.

**Competition:** "is-it-agent-ready" style pages give a _score_ but not the _files_; enterprise platforms (NLWeb, commerce-protocol vendors) target large retailers with sales calls. **Gap:** no instant, affordable, self-serve tool that hands you the actual generated bundle. That's us.

**Urgency stat:** AI shopping traffic up ~4,700% YoY (Adobe); 93% of AI Mode sessions end without a click — if the model can't read you, you're absent from the only impression. (See segment README for the citation list.)

**Why Digitribe:** we build MCP servers and Claude/AI-SDK agents — we can credibly generate a _correct_ MCP stub and agent-facing docs, not a generic template. It's also the paid upgrade to the existing free `/audit`.

## 3. Pricing & packaging

- **$29**, one-time. Anchored below an hour of consulting; impulse-range for a founder.
- **Includes:** 1 run (3 re-runs in quota to fix typos in input / re-crawl after site changes), the full bundle download (zip), the on-screen report, an emailed copy of both (Resend).
- **Upsell path:** report's "transaction layer: missing" finding → **WebMCP Endpoint Generator** ($149); "score-only" curiosity buyers come from the **$19 Monitor**; agency CTA for "want us to implement + maintain this?" → Digitribe services.
- **Future tiers (note only):** multi-site / re-scan subscription is a v2 idea; v1 is one SKU.

## 4. User stories / JTBD

- As a **SaaS founder**, when I read that AI tools are recommending competitors, I want my site to be AI-legible, so that models include me in answers.
- As a **DTC owner**, when AI shopping traffic is rising, I want agents to understand my catalog, so that I don't lose the new channel.
- As a **marketer**, when my boss asks "are we AI-ready?", I want a credible artifact + report, so that I can act and show progress.
- As a **developer at a small company**, when I know `llms.txt` exists but lack time, I want correct files generated, so that I just commit them.

**Primary job the artifact must nail:** produce **correct, site-specific, immediately-committable files** — not generic boilerplate. The `llms.txt` must actually summarize _their_ site.

**Non-goals (v1):** does NOT deploy anything for the buyer; does NOT build a live MCP server (that's WebMCP Generator); does NOT guarantee rankings; does NOT crawl behind auth.

## 5. Functional requirements

### Inputs

| Field             | Type                          | Validation                                                     | Example              |
| ----------------- | ----------------------------- | -------------------------------------------------------------- | -------------------- |
| `url`             | string (URL)                  | http/https, public, resolves, not an IP/localhost (SSRF guard) | `https://acme.com`   |
| `maxPages`        | int                           | 5–40, default 20                                               | `20`                 |
| `businessContext` | string (optional, ≤500 chars) | free text the owner adds ("we sell X to Y")                    | "B2B invoicing SaaS" |
| `provider`        | enum                          | one of product's `byokProviders`                               | `anthropic`          |
| `byokKey`         | string (secret)               | non-empty; validated live pre-run (platform-spec §5)           | `sk-…`               |

### Processing (requirements level; pipeline in §7)

Crawl up to `maxPages` → extract content, existing meta/schema, sitemap, robots, detect commerce/auth → analyze readiness across dimensions → AI generates the bundle filling the Output Contract → render report + zip + email.

### Outputs

The **Agent-Ready Bundle** (zip) + on-screen **Readiness Report**. Exact shape in §6.

### Constraints

- Max 40 pages / crawl; 8s per-page fetch timeout; 60s total crawl cap (stream progress).
- Respect `robots.txt`; identify as `DigitribeAgentReadyBot/1.0`.
- Total artifact ≤ a few MB (text files); store JSON in KV, zip in Vercel Blob.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/agent-ready-kit.ts
import { z } from 'zod'

const Dimension = z.object({
  key: z.enum([
    'description_layer', // llms.txt / agents.md present & useful
    'structured_data', // JSON-LD coverage
    'crawlability', // robots, sitemap, render-without-JS
    'transaction_layer', // .well-known / MCP / commerce protocol
    'entity_clarity', // is "who/what is this brand" obvious to a model
  ]),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['missing', 'partial', 'good']),
  findings: z.array(z.string()).max(8), // what's wrong/right, specific
  fixes: z.array(z.string()).max(8), // prioritized, actionable
})

const GeneratedFile = z.object({
  path: z.string(), // e.g. "llms.txt", ".well-known/mcp.json", "agents.md"
  language: z.enum(['markdown', 'json', 'text']),
  contents: z.string(), // the actual file body, committable as-is
  rationale: z.string().max(280), // why this file looks the way it does
})

export const AgentReadyOutput = z.object({
  site: z.object({
    url: z.string().url(),
    title: z.string(),
    summary: z.string().max(600), // model's understanding of the business
    pagesCrawled: z.number().int(),
    isCommerce: z.boolean(),
    detectedEntities: z.array(z.string()).max(20), // products, brand, key concepts
  }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  dimensions: z.array(Dimension).length(5),
  files: z.array(GeneratedFile).min(3), // llms.txt, agents.md, json-ld at minimum
  topActions: z.array(z.string()).min(3).max(5), // the 3–5 things to do first
  upsell: z.object({
    // drives in-app cross-sell
    needsTransactionLayer: z.boolean(), // → WebMCP Generator
    reason: z.string(),
  }),
})
export type AgentReadyOutput = z.infer<typeof AgentReadyOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded, via report renderer, platform-spec §8) · **JSON** (the raw contract) · **ZIP** (the `files[]` written to their real paths + the install README).
- **Field notes:** `score`/`grade` use the fixed 0–100 / A–F scale (deterministic mapping: A ≥90, B ≥75, C ≥60, D ≥40, F <40). `summary`, `findings`, `fixes`, `contents` are generative but constrained to the schema.
- **Determinism:** `dimensions[].key` always the same 5, always length 5 — the report layout can rely on it.

## 7. System logic / pipeline (the Segment-1 reference spine)

```
POST /api/store/run/agent-ready-kit  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ CRAWL  crawlSite(url,{maxPages,maxDepth:2})             emit{phase:"crawl",pct:15..55,
  │     - fetch homepage, parse sitemap.xml, robots.txt        message:"Crawling 12/20…"}
  │     - BFS internal links up to maxPages (SSRF-guarded)
  │     - per page: extract title, headings, readable text,
  │       existing <script type=ld+json>, meta, canonical
  │     - detect: commerce signals (cart/price/checkout),
  │       auth walls, JS-only render (empty SSR body)
  │     → CrawlResult { pages[], sitemap, robots, signals }
  │
  ├─ ANALYZE  scoreReadiness(CrawlResult)                    emit{phase:"analyze",pct:60}
  │     - deterministic checks → per-dimension status + base score
  │     - assemble a compact "site digest" for the AI step
  │
  ├─ GENERATE  runStructured({                               emit{phase:"generate",pct:70..92}
  │     provider, apiKey, model,
  │     system: AGENT_READY_SYSTEM,            // §9
  │     prompt: buildPrompt(siteDigest, businessContext),
  │     schema: AgentReadyOutput,              // §6 — SDK-enforced
  │     effort: "high",
  │   })  → AgentReadyOutput                    // streamObject for progress
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:95}
  │     - on-screen JSON, PDF, zip(files[] + README) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` (quality matters; this is the artifact). Crawl/analyze are deterministic Node — cheap, fast, no AI cost to the buyer.
- **Libraries:** fetch + a lightweight HTML parser (`cheerio` — OPEN QUESTION: confirm add; or `linkedom`), `robots-parser`, `fast-xml-parser` for sitemaps. JSON-LD detection via existing `schema-dts` types for validation.
- **Reuse:** this `crawlSite`/`scoreReadiness` pair IS the shared Segment-1 spine and is **reused by `agent-readiness-monitor` (score only, no generate) and `ai-buyer-simulator` (adds a headless checkout pass)**. Build it generic in `server/store/tools/agentic/`.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at producing correct, well-structured docs), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (faster, ~good enough for small sites). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one run is a single structured generation over a compact site digest (~few K input tokens) → typically **well under $0.10 on the buyer's key**. Set expectation so they're not surprised.
- **Pre-run validation:** a 1-token ping via the AI wrapper; on failure return error #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject` against `AgentReadyOutput` — the model cannot return free-form.

**System prompt (draft):**

```
You are an expert in the "agentic web": making websites legible and usable to AI
agents (ChatGPT, Perplexity, Claude, Gemini, AI Mode) via llms.txt, agents.md,
JSON-LD structured data, and MCP / .well-known endpoints.

You are given a structured digest of a crawled website. Produce a complete,
SITE-SPECIFIC Agent-Ready Bundle. Rules:
- Every generated file must be correct and committable as-is. No placeholders,
  no "TODO", no invented facts. Use ONLY information present in the digest plus
  the owner's businessContext.
- llms.txt must follow the llms.txt convention: an H1 site name, a blockquote
  summary, then curated sections of key links with one-line descriptions.
- agents.md must describe what actions an agent can take and key entities.
- Generate JSON-LD appropriate to the detected type (Organization always;
  Product/Offer only if commerce was detected).
- The .well-known/mcp.json must be a valid stub declaring intended tools
  (search, etc.) WITHOUT fabricating endpoints that don't exist — mark them as
  "proposed" so the owner wires them up (or upsell WebMCP Generator).
- Score each dimension honestly against what the digest shows. Do not inflate.
- Keep prose tight and professional. No marketing fluff in the files.
```

**User prompt template:** `buildPrompt(siteDigest, businessContext)` → serializes the crawl digest (pages, existing meta/schema, signals, detected entities) + the owner's optional context.

**Guardrails:** schema enforcement prevents shape drift; the "ONLY info in the digest" rule curbs hallucinated facts; honest-scoring instruction + deterministic base scores from §7 anchor the grades. Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                     | Detection                     | Behavior / message                                                                                  | Quota           |
| --- | ------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- | --------------- |
| 1   | Invalid/expired BYOK key                    | pre-run ping fails            | "Your `<provider>` key looks invalid or expired — check and retry."                                 | not spent       |
| 2   | URL unreachable / DNS fail / 5xx            | fetch homepage fails          | "We couldn't reach `<url>`. Is it public and live?"                                                 | not spent       |
| 3   | URL is IP/localhost/private range           | input validation (SSRF guard) | reject at form: "Enter a public website URL."                                                       | not spent       |
| 4   | `robots.txt` disallows crawl                | robots-parser                 | crawl only allowed paths; if homepage disallowed, generate from homepage meta only + warn in report | spent (partial) |
| 5   | JS-only site (empty SSR)                    | SSR body near-empty           | proceed with what's renderable; flag `crawlability: missing` with the fix; lower score honestly     | spent           |
| 6   | Very large site                             | maxPages cap                  | crawl top `maxPages` by sitemap priority/link depth; note "sampled N of M pages"                    | spent           |
| 7   | Provider rate-limit / timeout mid-generate  | AI wrapper error              | retry once w/ backoff; if still failing, error + DO refund the run (quota restored)                 | restored        |
| 8   | Model returns low-confidence / thin summary | `summary` length / heuristic  | still deliver, but report flags "limited content found — add more pages?"                           | spent           |
| 9   | Duplicate submit (double-click)             | same `runId` (idempotency §6) | return in-flight/cached result; never double-charge                                                 | n/a             |
| 10  | Network failure mid-crawl                   | per-page try/catch            | skip failed pages, continue; report `pagesCrawled` accurately                                       | spent           |
| 11  | Non-HTML (PDF/app) homepage                 | content-type check            | "This URL isn't a crawlable website."                                                               | not spent       |
| 12  | Quota exhausted                             | token check                   | "You've used all 3 runs — buy again or contact us." + buy CTA                                       | n/a             |

## 11. UX / UI flow

**Sales page** (`/store/agent-ready-kit`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** URL field (big, primary), advanced (maxPages slider, businessContext textarea), provider select + BYOK key field (with "where do I get a key?" helper + "we never store your key" note), **Run** button (disabled until valid).
- **Validating key:** inline spinner on the key field → ✓/✗.
- **Running:** full-width **live progress** driven by SSE events — real labels ("Crawling 12/20 pages…", "Generating your bundle…"), a progress bar, and a rotating "did you know" about agent-readiness. `aria-live="polite"`.
- **Partial:** if some pages failed, a non-blocking banner; continue to success.
- **Success / artifact view:**
  - Top: **overall grade + score** (big), site summary, "N of M pages analyzed."
  - **5 dimension cards** (score, status chip, findings, fixes).
  - **Top 3–5 actions** list.
  - **Generated files**: tabbed viewer (llms.txt / agents.md / JSON-LD / mcp.json) with copy-button per file; **Download ZIP** (primary), **Download PDF**, **Email me a copy** (pre-checked, auto-sent).
  - **Upsell card** if `upsell.needsTransactionLayer` → WebMCP Generator; agency "want us to implement this?" CTA.
- **Error:** clear message per §10 + retry; never lose entered input.
- **Quota-exhausted:** message + buy-again CTA.

Components: use the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `DimensionCard`, `FileViewer` (see [`../06-ui-kit.md`](../06-ui-kit.md) §2). The only new component is `components/store/artifacts/agent-ready-kit.tsx` (the grade + dimensions + files body). Run states follow the state chart in `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md` — senior, plain, confident. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword:** "make your website AI-agent ready" / "llms.txt generator" / "agents.md generator" (informational + tool intent).
- **`generateMetadata`:** title `Agent-Ready Kit — Make Your Site Readable by AI Agents` (≤60); description: "Paste your URL and get the llms.txt, agents.md, JSON-LD and MCP files that make AI agents understand and recommend your site. Instant, $29." (≤155). Canonical `/store/agent-ready-kit`. OG via `@vercel/og` (grade-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What is llms.txt?", "What's in the bundle?", "Do you store my API key?" (no), "Will this improve my Google rankings?" (it targets AI agents, complements SEO), "Can I edit the files after?" (yes, they're yours).
- **Internal links:** marketing `/audit` → here; blog posts on AI search → here; sibling **Monitor** (cheaper entry) and **WebMCP Generator** (upsell).
- **Programmatic surface (note):** with buyer consent, anonymized example reports could become indexable `/store/agent-ready-kit/examples/<slug>` pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; provider/key fields grouped with `<fieldset>`; progress region `aria-live="polite"` + `role="status"`; focus moves to the report heading on success; tab order logical; grade chips meet contrast (don't rely on color alone — include the letter + status word).
- Mobile: single-column; file viewer tabs become an accordion; download buttons full-width.
- Error recovery: errors are inline + non-destructive (input preserved); "retry" re-runs without re-entering the key (kept in memory for the session only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route.

## 14. Payment integration

- Create Polar product **"Agent-Ready Kit" $29** (sandbox + live). Checkout metadata `{ slug: "agent-ready-kit" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a valid bundle (rare). Quota auto-restores on system-side failures (§10 #7).

## 15. Security & privacy

- **Buyer data:** the target URL + crawled public content + optional businessContext. We crawl only **public** pages. Retention: crawl content used transiently for the run; artifact (files + report) stored 30d (KV/Blob TTL) for re-download; then purged.
- **Product-specific risks:**
  - **SSRF** — the #1 risk. The crawler MUST block private IP ranges, localhost, link-local, cloud metadata IPs (169.254.169.254), and non-http(s) schemes; resolve DNS and re-check the resolved IP; cap redirects. (Reject at input + enforce in fetch.)
  - **Untrusted HTML** — parse, never execute; sanitize before display; no `dangerouslySetInnerHTML` of crawled content.
  - **Zip safety** — generated files are our own text; still set safe paths (no `../`).
- Shared rules (key handling, rate-limit, webhook verify) per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `ark_crawl_complete` (pagesCrawled), `ark_grade` (grade), `ark_zip_download`, `ark_upsell_click`.
- **Activation:** purchase → first run that produces a valid bundle. **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), upsell CTR.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`agent-ready-kit`), Polar sandbox product, routes, empty `AgentReadyOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Spine + contract (no AI).** `crawlSite` + `scoreReadiness` + input/output schemas; pipeline returns a schema-valid contract from a **fixture site** with the AI step mocked. _AC: unit test: fixture → valid `AgentReadyOutput`; SSRF guard tests pass._
- **Phase 2 — Real run + UI.** Wire BYOK + `runStructured` (live AI), all UI states, report render + PDF + ZIP(Blob) + Resend email. _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled._
- **Phase 3 — SEO + polish.** Sales page copy, metadata, JSON-LD, OG card, a11y pass (axe), analytics events, upsell card. _AC: axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified, `llms.txt`/`agents.md` for the store itself shipped. _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)     | Test                                                               |
| -------------- | ------------------------------------------------------------------ |
| #1 key invalid | unit: pre-run ping mock rejects → error, quota intact              |
| #3 SSRF        | unit: IP/localhost/metadata URLs rejected at validate + fetch      |
| #4 robots      | unit: disallowed paths skipped                                     |
| #5 JS-only     | unit: empty SSR → `crawlability: missing`, still delivers          |
| #6 large site  | unit: >maxPages → sampled, accurate `pagesCrawled`                 |
| #7 AI timeout  | integration: provider error → retry → quota restored on final fail |
| #9 duplicate   | integration: same `runId` returns cached, no double quota          |

Full method, fixtures, the canonical mocks, the provider×input×failure **scenario matrix**, sandbox-E2E, eval golden-set format + judges, and CI gates are in [`../05-testing-strategy.md`](../05-testing-strategy.md). The table above and the matrix in `05` §3 (Agent-Ready Kit is the worked example there) are this product's plan. Product-specific eval expectations: ~8 real sites with expected grade bands + `mustFlag` dimensions + `mustMention` entities; judges `input_specific`, `no_ai_tells`, `factual`, `format_valid` (generated `llms.txt`/JSON-LD/`mcp.json` must parse).

**The one test that matters most:** fixture site (HTML fixtures) → pipeline (mocked AI returning a fixed object) → **valid `AgentReadyOutput`** + correct ZIP paths.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. The spine modules this depends on must already pass `segment-0-spine` DoR.
- **New libs (minimal):** `cheerio` _(or `linkedom`)_ for HTML parse, `robots-parser`, `fast-xml-parser`. _OPEN QUESTION: confirm `cheerio` vs `linkedom` (lean to `cheerio` for familiarity)._ Vercel Blob for the zip (already available on Vercel).
- **Cross-product reuse:** `server/store/tools/agentic/{crawl,score}.ts` are shared with `agent-readiness-monitor` and `ai-buyer-simulator` — design them generic now.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` `cheerio` vs `linkedom`.
- **Risk — artifact quality on thin/JS-only sites:** mitigation = honest scoring + "add more pages/context" guidance + the businessContext field; eval golden-set guards regressions.
- **Risk — buyer expects Google-ranking gains:** mitigation = FAQ + report copy clearly scope this to AI agents, complementary to SEO.
- **Risk — SSRF (security):** mitigation = strict guard, tested (§18); treat as a launch blocker.
- **Risk — buyer surprised by their own API cost:** mitigation = show expected per-run cost in UI (§8).
