# Agent-Readiness Monitor — PRD

**Slug:** `agent-readiness-monitor` · **Segment:** 1 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The **cheapest entry point** to Segment 1 and the funnel into the $29 Agent-Ready Kit. It reuses the **same crawl→analyze spine** ([`agent-ready-kit.md`](./agent-ready-kit.md) §7) but **stops before generate**: it returns a readiness **score + the fix diff only — no generated files** (files are the Kit's job). Build the Kit first; this is a thin composition on top.

---

## 1. TL;DR

- **One-liner:** Paste a URL → get an honest agent-readiness score and the exact list of what to fix, in 30 seconds.
- **Problem:** Site owners hear "be AI-ready" but have no objective read on where they actually stand or what to do first. The free `/audit` is generic; enterprise scanners want a sales call.
- **Buyer:** founders / marketers / DTC & SaaS owners testing the water before committing — the curiosity-driven, lowest-friction segment.
- **Input → Output:** one URL → a one-time **Readiness Scorecard**: overall grade + 5 dimension scores + a prioritized **fix diff** (what's missing, what to add) + a clear "get the files" handoff to the Agent-Ready Kit.
- **Price:** **$19** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-haiku-4-5`), `openai`, `google`.
- **Est. run time:** ~25–45s (crawl-bound; no generate step) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a site owner who wants to know "are we AI-ready?" either runs a free score page that returns a vague number with no specifics, or pays an agency $2k+ for a manual audit. Neither tells them, cheaply and specifically, _what's wrong on their site and what to do next_.

**Competition:** "is-it-agent-ready" / "llms.txt checker" pages give a single score or a binary present/absent, but no prioritized, site-specific fix list and no path to actually fixing it. Enterprise readiness platforms gate behind sales. **Gap:** a $19, instant, self-serve scorecard that is honest, specific, and ends with a one-click path to the fix (our own Kit). That's us.

**Urgency stat:** AI shopping traffic up ~4,700% YoY (Adobe); 93% of AI Mode sessions end without a click — if the model can't read you, you're absent from the only impression. (See segment README for the citation list.)

**Why Digitribe:** the score is produced by the **exact same crawler and analyzer** that powers the Agent-Ready Kit, so a buyer who upgrades gets a consistent, credible continuation — same dimensions, same verdict, now with the files. It's also the paid, deeper sibling of the free `/audit`.

## 3. Pricing & packaging

- **$19**, one-time. Deliberately the cheapest SKU in the store — a tripwire that proves quality and pulls warm buyers toward the $29 Kit. Anchored as "less than lunch to know exactly where you stand."
- **Includes:** 1 run (3 re-runs in quota to re-score after changes), the on-screen scorecard, an emailed PDF copy (Resend). **No generated files** — that's the Kit.
- **Upsell path (the whole point of this product):** every scorecard ends with a prominent **"Get the files that fix this — Agent-Ready Kit, $29"** card whose fix-list maps 1:1 to what the Kit will generate. Low scores → stronger upsell. Agency CTA for "want us to implement this?".
- **Future tiers (note only):** a recurring **monitor** (re-score weekly, alert on regressions) is the natural v2 — hence the name "Monitor." v1 ships a **one-time** score only; the recurring product is explicitly deferred.

## 4. User stories / JTBD

- As a **founder**, when I read that AI tools recommend competitors, I want a quick, honest read on whether my site is AI-legible, so that I know if I have a problem at all.
- As a **marketer**, when my boss asks "are we AI-ready?", I want a credible scorecard with a grade and a fix list, so that I can answer and show a plan.
- As a **DTC owner**, when I'm price-sensitive, I want the cheapest possible way to see what's wrong, so that I can decide whether to buy the full fix.
- As a **developer**, when I suspect we're missing `llms.txt`/structured data, I want it confirmed with specifics, so that I can prioritize the work or buy the bundle.

**Primary job the artifact must nail:** an **honest, site-specific verdict** — the grade must be defensible against what's actually on the page, and the fix list must be _their_ gaps, not a generic checklist. A buyer must not be able to swap another site's scorecard in and have it fit.

**Non-goals (v1):** does NOT generate any files (no `llms.txt`, no `mcp.json` — that's the Kit); does NOT monitor over time / send alerts (v2); does NOT simulate a purchase (that's the Buyer Simulator); does NOT deploy anything; does NOT crawl behind auth.

## 5. Functional requirements

### Inputs

| Field      | Type            | Validation                                                      | Example            |
| ---------- | --------------- | --------------------------------------------------------------- | ------------------ |
| `url`      | string (URL)    | http/https, public, resolves, not an IP/localhost (SSRF guard)  | `https://acme.com` |
| `maxPages` | int             | 5–20, default 12 (lower cap than the Kit — score, not generate) | `12`               |
| `provider` | enum            | one of product's `byokProviders`                                | `anthropic`        |
| `byokKey`  | string (secret) | non-empty; validated live pre-run (platform-spec §5)            | `sk-…`             |

> No `businessContext` field: the Monitor scores what's _objectively_ on the site. Owner context only matters when generating files (the Kit), so it's deliberately omitted here to keep the input one-field-simple.

### Processing (requirements level; pipeline in §7)

Crawl up to `maxPages` → extract content, existing meta/schema, sitemap, robots, detect commerce/auth/JS-only → analyze readiness across the same 5 dimensions as the Kit → AI writes a **short, ranked verdict + fix diff** filling the Output Contract → render scorecard + PDF + email. **The crawl + deterministic scoring are identical to the Kit; only the AI step differs** (it explains and prioritizes rather than generates files).

### Outputs

The **Readiness Scorecard** (on-screen + PDF). Exact shape in §6. **No zip, no generated files.**

### Constraints

- Max 20 pages / crawl (lower than the Kit's 40 — this is a faster, cheaper read); 8s per-page fetch timeout; 45s total crawl cap (stream progress).
- Respect `robots.txt`; identify as `DigitribeAgentReadyBot/1.0` (same UA as the Kit — one crawler).
- Artifact is small JSON (KV) + a PDF (Blob). No bundle.

## 6. ⭐ Output Contract

> Same 5 dimensions as the Kit (so a buyer who upgrades sees continuity), but the contract carries **no `files[]`** — it adds a ranked, severity-tagged **fix diff** and an explicit **upgrade map** to the Kit. The AI step is forced to fill exactly this shape (`AiRunner.structured`, doc 04 §7; platform-spec §5).

```ts
// server/store/schemas/agent-readiness-monitor.ts
import { z } from 'zod'

const DimensionKey = z.enum([
  'description_layer', // llms.txt / agents.md present & useful
  'structured_data', // JSON-LD coverage
  'crawlability', // robots, sitemap, render-without-JS
  'transaction_layer', // .well-known / MCP / commerce protocol
  'entity_clarity', // is "who/what is this brand" obvious to a model
])

const DimensionScore = z.object({
  key: DimensionKey,
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['missing', 'partial', 'good']),
  verdict: z.string().max(240), // one tight, SITE-SPECIFIC sentence on where this stands
})

const FixItem = z.object({
  dimension: DimensionKey, // which dimension this fixes
  title: z.string().max(80), // "Add an llms.txt index of your key pages"
  why: z.string().max(220), // the concrete impact on THIS site
  effort: z.enum(['quick', 'moderate', 'involved']), // sets buyer expectation
  impact: z.enum(['high', 'medium', 'low']), // for prioritization
  fixedByKit: z.boolean(), // true → the Agent-Ready Kit generates this for you
})

export const ReadinessMonitorOutput = z.object({
  site: z.object({
    url: z.string().url(),
    title: z.string(),
    summary: z.string().max(400), // model's understanding of the business (from the digest only)
    pagesCrawled: z.number().int(),
    isCommerce: z.boolean(),
    detectedEntities: z.array(z.string()).max(20), // products, brand, key concepts found
  }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  headline: z.string().max(140), // the single answer-first verdict, e.g. "Largely invisible to AI agents — no description layer, no structured data."
  dimensions: z.array(DimensionScore).length(5), // always the same 5, same order
  fixes: z.array(FixItem).min(3).max(10), // PRIORITIZED: impact-desc, the diff to close
  topActions: z.array(z.string()).min(3).max(5), // the 3–5 to do first, plain language
  upsell: z.object({
    // drives the headline cross-sell to the Kit
    kitWouldGenerate: z.array(z.string()).max(8), // exact files the Kit produces for THIS site, e.g. ["llms.txt","agents.md","Organization JSON-LD"]
    fixableNow: z.number().int().min(0), // count of `fixes` with fixedByKit:true
    needsTransactionLayer: z.boolean(), // → also flag WebMCP Generator path
  }),
})
export type ReadinessMonitorOutput = z.infer<typeof ReadinessMonitorOutput>
```

- **Export formats:** on-screen scorecard (React) · **PDF** (branded, via report renderer, platform-spec §8). **No JSON-download and no ZIP** as primary deliverables — this is a score, not a bundle. (JSON of the raw contract remains available via `GET /artifact/[runId]?fmt=json` for completeness, but the UI leads with the scorecard + PDF.)
- **Field notes:** `score`/`grade` use the **same fixed 0–100 / A–F scale as the Kit** (A ≥90, B ≥75, C ≥60, D ≥40, F <40) — deterministic mapping from the analyzer's base scores so a buyer who later runs the Kit sees a consistent grade. `headline`, `verdict`, `why`, `summary` are generative but constrained.
- **Determinism:** `dimensions[].key` always the same 5 in the same order; `grade` is computed from `overallScore`, not free-chosen by the model — the scorecard layout and the Kit's continuity rely on it. `fixes` is always sorted by `impact` (high→low).

## 7. System logic / pipeline (reuses the Kit's spine; **analyze-only**, no generate)

```
POST /api/store/run/agent-readiness-monitor  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ CRAWL  crawlSite(url,{maxPages,maxDepth:2})             emit{phase:"crawl",pct:15..65,
  │     ── IDENTICAL to Agent-Ready Kit §7 ──                  message:"Crawling 8/12…",
  │     server/store/tools/agentic/crawl.ts                    findingCount:n}
  │     → CrawlResult { pages[], sitemap, robots, signals }
  │
  ├─ ANALYZE  scoreReadiness(CrawlResult)                    emit{phase:"analyze",pct:70}
  │     ── IDENTICAL to Agent-Ready Kit §7 ──
  │     server/store/tools/agentic/score.ts
  │     - deterministic per-dimension status + base score
  │     - overallScore + grade (fixed mapping)
  │     - assemble the compact "site digest"
  │
  ├─ GENERATE (verdict, NOT files)  ai.structured({          emit{phase:"generate",pct:80..92}
  │     system: READINESS_MONITOR_SYSTEM,        // §9
  │     prompt: buildPrompt(siteDigest, baseScores),
  │     schema: ReadinessMonitorOutput,          // §6 — SDK-enforced
  │     effort: "medium",                         // cheaper than the Kit's "high"
  │   })  → ReadinessMonitorOutput                // streamObject for progress
  │     - model EXPLAINS + PRIORITIZES the scores; writes the fix diff
  │     - it does NOT author llms.txt/mcp.json — `fixes[].fixedByKit` maps to the Kit
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:96}
  │     - on-screen scorecard + branded PDF (no zip)
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **The only difference from the Kit is the AI step's job and the schema:** crawl + analyze are the **same modules**, called the same way. The AI here runs at `effort: "medium"` (it explains, doesn't author files), so it's cheaper and faster than the Kit's `effort: "high"` generate. Crawl/analyze are deterministic Node — no AI cost.
- **Libraries:** none new beyond the Kit — same `crawlSite`/`scoreReadiness` (`cheerio` _or_ `linkedom`, `robots-parser`, `fast-xml-parser`). _OPEN QUESTION (one-time, shared with the Kit): `cheerio` vs `linkedom`._
- **Reuse:** this product is the proof that `server/store/tools/agentic/{crawl,score}.ts` are correctly generic — it imports them unchanged and only swaps the generate stage. `ai-buyer-simulator` extends the same crawl with a checkout-traversal pass.

## 8. BYOK handling

- Providers: `anthropic` (**default model `claude-haiku-4-5`** — this is a cheap explain-and-prioritize task, not file authoring, so the faster/cheaper model is the right default; offer `claude-opus-4-8` for buyers who want the most nuanced fix narrative), `openai`, `google`. Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one structured generation over a compact digest on Haiku → **typically a few cents on the buyer's key**, materially cheaper than the Kit. State this so the $19 price + near-zero key cost reads as a no-brainer.
- **Pre-run validation:** a 1-token ping via `AiRunner.ping()`; on failure return error #1 without spending quota (doc 04 §7).

## 9. AI / prompt design

**Model:** default `claude-haiku-4-5`, `effort: "medium"`, adaptive thinking on (platform-spec §5). Structured output enforced by the AI SDK `generateObject` against `ReadinessMonitorOutput` (doc 04 §7) — the model cannot return free-form, and it **cannot emit file bodies** because the schema has no `contents` field. That schema choice is the guardrail that keeps the Monitor strictly score-only.

**System prompt (draft):**

```
You are an expert in the "agentic web": making websites legible and usable to AI
agents (ChatGPT, Perplexity, Claude, Gemini, AI Mode) via llms.txt, agents.md,
JSON-LD structured data, and MCP / .well-known endpoints.

You are given (1) a structured digest of a crawled website and (2) deterministic
base scores per readiness dimension. Your job is to produce an honest, SITE-
SPECIFIC readiness scorecard and a prioritized fix list. You DO NOT write any
files — you diagnose and prioritize.

Rules:
- Use ONLY facts present in the digest. No placeholders, no invented pages,
  products, or claims. If the digest is thin, say so honestly and score lower.
- The `headline` is the single most important truth about this site's agent-
  readiness, in plain language a founder understands. Answer-first.
- Each dimension `verdict` must reference something concrete from THIS site
  (a real page, the absence of llms.txt, the lack of Product JSON-LD, etc.).
- `fixes` must be the gaps THIS site actually has, ranked by impact (high first).
  Mark `fixedByKit: true` for any fix that is "add/author a file" (llms.txt,
  agents.md, JSON-LD, .well-known/mcp.json) — those are what our Agent-Ready Kit
  generates. Mark `fixedByKit: false` for fixes that need the owner's own work
  (e.g. "server-render your product pages", "remove the auth wall on docs").
- Respect the deterministic base scores: your per-dimension `score` must stay
  within ±10 of the provided base, and `grade` must match the overallScore band.
  Do not inflate. A site with nothing should grade D or F.
- Set `upsell.kitWouldGenerate` to the exact file names the Kit would produce for
  THIS site (Organization JSON-LD always; Product/Offer only if commerce was
  detected; agents.md only if there are agent-usable actions).
- No marketing fluff, no "In today's landscape", no preamble. Tight and senior.
```

**User prompt template:** `buildPrompt(siteDigest, baseScores)` → serializes the crawl digest (pages, existing meta/schema, signals, detected entities) **plus the analyzer's deterministic base scores per dimension**, so the model explains and prioritizes _around fixed numbers_ rather than inventing them.

**Why the base scores are passed in:** determinism (doc 03 §2.2) — the grade is computed by `scoreReadiness`, not the model. The model's value is the _narrative and prioritization_, which is where Haiku is plenty. This also guarantees a buyer who upgrades to the Kit sees the **same grade** for the same site.

**Guardrails:** schema enforcement prevents shape drift and (by omission of `contents`) prevents file generation; the "ONLY facts in the digest" rule curbs hallucinated facts; the ±10 / grade-band constraint anchors to deterministic scores. Handle `stop_reason:"refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

> Largely inherits the Kit's crawl/key/SSRF cases (same spine). Deltas: no file generation, lower page cap, the upsell must still render on low/empty scores. Every row is also a test in §18.

| #   | Trigger                                    | Detection                     | Behavior / message                                                                                       | Quota           |
| --- | ------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------- | --------------- |
| 1   | Invalid/expired BYOK key                   | pre-run ping fails            | "Your `<provider>` key looks invalid or expired — check and retry."                                      | not spent       |
| 2   | URL unreachable / DNS fail / 5xx           | fetch homepage fails          | "We couldn't reach `<url>`. Is it public and live?"                                                      | not spent       |
| 3   | URL is IP/localhost/private range          | input validation (SSRF guard) | reject at form: "Enter a public website URL."                                                            | not spent       |
| 4   | `robots.txt` disallows crawl               | robots-parser                 | score from homepage meta only + flag `crawlability` honestly + note "we could only see your homepage"    | spent (partial) |
| 5   | JS-only site (empty SSR)                   | SSR body near-empty           | proceed; `crawlability: missing`, score low honestly, fix "server-render key pages" (`fixedByKit:false`) | spent           |
| 6   | Very large site                            | maxPages cap (20)             | sample top pages by sitemap priority/link depth; report "scored N of M pages"                            | spent           |
| 7   | Provider rate-limit / timeout mid-generate | AI wrapper error              | retry once w/ backoff; if still failing, error + restore quota                                           | restored        |
| 8   | Empty / thin site (near-zero content)      | digest content heuristic      | deliver an **honest low grade** (D/F) with the "limited content — here's the floor to fix" fixes         | spent           |
| 9   | Duplicate submit (double-click)            | same `runId` (idempotency §6) | return in-flight/cached result; never double-charge                                                      | n/a             |
| 10  | Network failure mid-crawl                  | per-page try/catch            | skip failed pages, continue; report `pagesCrawled` accurately                                            | spent           |
| 11  | Non-HTML (PDF/app) homepage                | content-type check            | "This URL isn't a crawlable website."                                                                    | not spent       |
| 12  | Quota exhausted                            | token check                   | "You've used all 3 runs — buy again or grab the Agent-Ready Kit." + buy CTA                              | n/a             |
| 13  | Already a perfect score (rare)             | overallScore ≥ 90             | celebrate honestly ("You're A-grade"); upsell shifts to WebMCP Generator / agency, not the Kit           | spent           |

## 11. UX / UI flow

**Sales page** (`/store/agent-readiness-monitor`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states** (the generic 8-state machine, doc 06 §4):

- **Empty / collecting input:** one big URL field (the primary action), a small advanced row (maxPages 5–20), provider select + BYOK key field (`KeyInput` with "where do I get a key?" helper + "we never store your key" note + the expected few-cents cost), **Score my site** button (disabled until valid).
- **Validating key:** inline ✓/✗ on the key field (`/key-check`), never a full-page block.
- **Running:** full-width `RunProgress` driven by SSE — real labels ("Crawling 8/12 pages…", "Scoring your site…"), progress bar, a rotating "why this matters" tip. `aria-live="polite"`. **Faster than the Kit** (no generate-files step) — the run feels snappy.
- **Partial:** if some pages failed or robots limited the crawl, a non-blocking banner; continue to success.
- **Success / scorecard view** (the showcase, doc 03 §2):
  - Top: animated **`ScoreRing`** (grade + 0–100) and the **`headline`** verdict, answer-first — the single most important truth, big.
  - **5 dimension rows** (`DimensionCard`-style, but verdict-only — no fixes list inside, since the prioritized fixes are the centerpiece below): score chip + status `SeverityChip` + one-line `verdict`. A small `StatBar` row visualizes the 5 scores side by side.
  - **The Fix Diff** — the prioritized `fixes` list, ranked high→low impact, each with an `effort` chip, an `impact` chip, and a **"Kit generates this" badge** where `fixedByKit:true`. This is the emotional core: "here's exactly what's wrong, in order."
  - **Top 3–5 actions** summary.
  - **The headline upsell card:** "We can generate `{kitWouldGenerate.join(', ')}` for your site — **Agent-Ready Kit, $29**." Shows `fixableNow` ("N of these fixes are one click away"). If `needsTransactionLayer`, a secondary WebMCP Generator nudge. Agency "want us to implement this?" CTA.
  - Actions: **Download PDF** (primary), **Email me a copy** (pre-checked, auto-sent). No ZIP (intentional — there are no files).
- **Error:** clear message per §10 + retry; never lose entered input.
- **Quota-exhausted:** message + buy-again CTA, biased toward "or get the Kit."

Components: the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `SeverityChip`, `StatBar` (doc 06 §2). The only new component is `components/store/artifacts/agent-readiness-monitor.tsx` (the ring + dimension rows + fix-diff + upsell body). It deliberately **reuses the same `ScoreRing` and dimension visual language as the Kit** so the two products feel like one product line and the upgrade feels seamless. Run states follow the state chart in `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md` — senior, plain, confident. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword(s):** "agent readiness checker" / "is my site AI-ready" / "llms.txt checker" / "AI readiness score" (tool + informational intent).
- **`generateMetadata`:** title `Agent-Readiness Monitor — Score Your Site for AI Agents` (≤60); description: "Paste your URL and get an honest agent-readiness grade plus the exact fix list — what AI agents can and can't do with your site. Instant, $19." (≤155). Canonical `/store/agent-readiness-monitor`. OG via `@vercel/og` (a grade-card visual — the `ScoreRing`).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What's an agent-readiness score?", "Do I get the files to fix it?" (no — that's the $29 Agent-Ready Kit; this is the score + fix list), "Do you store my API key?" (no), "Will this help my Google rankings?" (it scores AI-agent readiness, which complements SEO), "How is the grade calculated?" (5 dimensions, deterministic 0–100 scale).
- **Internal links:** marketing `/audit` → here (cheapest paid step); this scorecard's upsell → **Agent-Ready Kit**; sibling **WebMCP Generator** for transaction-layer gaps; blog posts on AI search → here.
- **Programmatic surface (note):** with buyer consent, anonymized example scorecards could become indexable `/store/agent-readiness-monitor/examples/<slug>` pages — strong SEO surface for "is X agent-ready" queries — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; provider/key fields grouped with `<fieldset>` + legend; progress region `role="status"` + `aria-live="polite"` (announce phase changes, not every tick); focus moves to the scorecard heading (`<h2>` = the `headline`) on success; tab order logical.
- **Severity never color-only:** dimension status and impact/effort chips are dot + icon + word (doc 06 §5); grade includes the letter, not just the ring color; contrast ≥ AA against `--color-bg-card`.
- Mobile: single-column; dimension rows stack; the fix-diff is a stacked list; download/email buttons full-width. The scorecard is first-class on mobile (doc 06 §5).
- Error recovery: errors inline + non-destructive (input preserved); "retry" re-runs without re-entering the key (kept in memory for the session only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route — zero serious/critical violations.

## 14. Payment integration

- Create Polar product **"Agent-Readiness Monitor" $19** (sandbox + live). Checkout metadata `{ slug: "agent-readiness-monitor" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a valid scorecard (rare). Quota auto-restores on system-side failures (§10 #7). Because the deliverable is informational and cheap, refund exposure is minimal (quota + 30d TTL cap it).

## 15. Security & privacy

- **Buyer data:** the target URL + crawled **public** content. No file generation, no businessContext. Retention: crawl content used transiently for the run; the scorecard (JSON + PDF) stored 30d (KV/Blob TTL) for re-download; then purged.
- **Product-specific risks:**
  - **SSRF** — the #1 risk, identical to the Kit since the crawler is shared. The crawler MUST block private IP ranges, localhost, link-local, cloud metadata IPs (169.254.169.254), and non-http(s) schemes; resolve DNS and re-check the resolved IP; cap redirects. (Reject at input + enforce in fetch.) This is enforced once in `server/store/tools/agentic/crawl.ts` and covered by the shared SSRF test table (doc 05 §4).
  - **Untrusted HTML** — parse, never execute; sanitize before display; no `dangerouslySetInnerHTML` of crawled content.
- Shared rules (key handling, rate-limit, webhook verify) per platform-spec §10 — only the deltas above are product-specific. There is **no zip output**, so the Kit's zip-path-safety concern does not apply (N/A — no files generated).

## 16. Analytics & success metrics

- Standard events (platform-spec §13; doc 04 §9) + product events: `arm_crawl_complete` (`{ pagesCrawled }`), `arm_grade` (`{ grade }`), `arm_upsell_click` (`{ target: 'agent-ready-kit' | 'webmcp-generator' | 'agency' }`).
- **Activation:** purchase → first run that produces a valid scorecard. **Target ≥ 90%** (no generate step → fewer failure modes than the Kit, so activation should be the highest in the segment).
- **The funnel metric that matters most:** **Monitor → Kit upsell conversion.** Track `arm_upsell_click` → downstream `store_purchase{ slug: 'agent-ready-kit' }`. This product's strategic job is feeding the Kit; a healthy upsell rate justifies the $19 tripwire economics.
- Watch: run-error rate (<3%), refund rate (<2%).

## 17. Development phases

> Vertical slices. **Depends on the Agent-Ready Kit's spine modules existing** (`crawlSite`, `scoreReadiness`) — build the Kit first, then this composes them.

- **Phase 0 — Scaffold.** Registry entry (`agent-readiness-monitor`), Polar sandbox product, empty `ReadinessMonitorOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Compose the spine (no AI).** Import `crawlSite` + `scoreReadiness` from `agentic/`; input/output schemas; pipeline returns a schema-valid contract from a **fixture site** with the AI step mocked. _AC: unit test: fixture → valid `ReadinessMonitorOutput`; grade matches the deterministic mapping; SSRF guard tests pass (shared)._
- **Phase 2 — Real run + UI.** Wire BYOK + `ai.structured` (live, default Haiku), all UI states, scorecard render + PDF + Resend email (no zip). _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled; **no `files[]` ever emitted**._
- **Phase 3 — SEO + polish + the Showcase Checklist (doc 03 §6).** Sales page copy, metadata, JSON-LD, OG grade-card, a11y pass (axe), analytics events, the upsell card mapping to the Kit. _AC: every box in the doc 03 §6 Showcase Checklist ticked (note: "file/code outputs have copy buttons" is N/A — no files; "branded PDF" applies); the scorecard is provably input-specific (eval); axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified. _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)           | Test                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| #1 key invalid       | unit: pre-run ping mock rejects → error, quota intact                                                                                   |
| #3 SSRF              | unit: IP/localhost/metadata URLs rejected at validate + fetch (shared table)                                                            |
| #4 robots            | unit: disallowed paths skipped, homepage-only score + flag                                                                              |
| #5 JS-only           | unit: empty SSR → `crawlability: missing`, `fixedByKit:false` fix present                                                               |
| #6 large site        | unit: >maxPages → sampled, accurate `pagesCrawled`                                                                                      |
| #7 AI timeout        | integration: provider error → retry → quota restored on final fail                                                                      |
| #8 thin site         | unit: near-empty digest → honest D/F grade, fixes still present                                                                         |
| #9 duplicate         | integration: same `runId` returns cached, no double quota                                                                               |
| — no-files invariant | schema: assert the contract has no `files`/`contents` field; a fixture AI response containing file bodies is rejected by `schema.parse` |

Full method, fixtures, the canonical mocks, the provider×input×failure **scenario matrix**, sandbox-E2E, eval golden-set format + judges, and CI gates are in [`../05-testing-strategy.md`](../05-testing-strategy.md) — this product reuses the Kit's crawl fixtures (`tests/store/fixtures/sites/*`) and matrix unchanged. Product-specific eval expectations: ~8 real sites with expected **grade bands** + `mustFlag` dimensions + `mustMention` entities + the assertion that **no `fixes[]` with `fixedByKit:true` is missing for a site that clearly lacks llms.txt**; judges `input_specific`, `no_ai_tells`, `factual`, plus a Monitor-specific `grade_consistency` judge (same site → same grade band as the Kit, since the analyzer is shared).

**The one test that matters most:** fixture site (HTML fixtures, shared with the Kit) → pipeline (mocked AI returning a fixed object) → **valid `ReadinessMonitorOutput`** with the grade matching `scoreReadiness`'s deterministic output and **zero generated files**.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF §8 (no zip), Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. The spine modules this depends on must already pass `segment-0-spine` DoR.
- **From Segment 1 (the key reuse):** `server/store/tools/agentic/{crawl,score}.ts` — **imported unchanged** from the Agent-Ready Kit. This product adds **no new crawl/analyze code**; it only adds its schema, prompt, pipeline wrapper, and artifact view. That is the whole point of building the agentic spine generic.
- **New libs:** **none** beyond what the Kit already adds.
- **Cross-product reuse:** consumes the Kit's spine; its own scorecard layout primitives (ring + dimension rows) are shared visual language with the Kit's artifact view.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($19).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1 (one-time, store-wide).
- `OPEN QUESTION:` `cheerio` vs `linkedom` — inherited from the Kit; resolve once for the shared crawler.
- `OPEN QUESTION:` should the $19 Monitor purchase be **creditable** toward the $29 Kit (e.g. a $19-off upgrade)? Strong for funnel conversion, but adds Polar coupon/credit complexity. Decision needed before launch; default: a time-limited "upgrade for $10 more" coupon shown on the scorecard. **Owner: Manu (Grow).**
- **Risk — the Monitor cannibalizes the Kit instead of funneling to it.** Mitigation: the Monitor deliberately ships **no files** and every scorecard's centerpiece is the "the Kit generates these for you" mapping; the price gap ($19 vs $29) is small enough that the files are the obvious next $10. Track the upsell rate (§16) as the kill/keep metric.
- **Risk — buyers feel "I paid $19 for a number."** Mitigation: the deliverable is a **prioritized, site-specific fix diff**, not a bare score (doc 03 §2.2/§2.3); the headline + fix list must be obviously worth $19 on their own. Eval `input_specific` judge guards this.
- **Risk — grade inconsistency vs the Kit erodes trust on upgrade.** Mitigation: both products compute the grade from the **same deterministic `scoreReadiness`**; the AI is constrained to ±10 and the grade band; the `grade_consistency` eval judge gates it.
- **Risk — SSRF.** Mitigation: shared, strict guard, tested (§18); launch blocker — same posture as the Kit.
