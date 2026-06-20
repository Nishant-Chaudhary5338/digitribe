# Conversion Teardown — PRD

**Slug:** `conversion-teardown` · **Segment:** 6 · **Status:** draft
**Owner:** Manu (Grow) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The paid, instant upgrade to the marketing site's **free `/audit`**. It productizes the studio's actual CRO method — above-the-fold, clarity, friction, trust, CTA — scored, prioritized, DTC/SaaS-aware, with specific rewrites. **Reuses the Segment-1 crawl spine** to read the page; do not build a second crawler. This is the second-cheapest entry into the agency funnel and the densest warm-lead generator.

---

## 1. TL;DR

- **One-liner:** Paste a URL → get a senior CRO teardown: scored, prioritized, with the exact copy/layout rewrites to make it convert.
- **Problem:** Founders know their page "isn't converting" but get generic "10 CRO tips" lists, or pay $2,500 for a one-off audit. They need _their_ page torn down by someone who knows the difference between a DTC PDP and a SaaS pricing page — and told _what to change, in priority order_.
- **Buyer:** DTC and SaaS founders/marketers running paid traffic to a page that underperforms.
- **Input → Output:** one URL (+ optional DTC/SaaS toggle + conversion goal) → an on-screen + PDF **Conversion Teardown**: overall score/grade, 5 scored dimensions, a prioritized fix list, and specific rewrites.
- **Price:** **$29** one-time (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–60s · **Re-run quota:** 3.

## 2. Problem & market

**Today**, a founder whose page underperforms either (a) reads generic CRO blog posts that never reference _their_ page, (b) buys a $99 "AI audit" that returns vague schema-valid mush, or (c) pays an agency $2,500 for a real one — exactly Digitribe's _SEO Audit / Landing Page Sprint_ territory. The free `/audit` on this site does this manually as a lead magnet (a Loom + a prioritized punch list within 24h). **Conversion Teardown is that lead magnet, instant and self-serve** — and the artifact's cross-sell routes the serious buyers straight back into the paid `/audit` and Sprint.

**Competition:** generic "AI website graders" (a vanity score, no rewrites, audience-blind); enterprise CRO platforms (heatmaps/session-replay — a different, slower job). **Gap:** no instant tool gives a _prioritized, audience-aware teardown with the actual rewrites_. The method is the moat: this scores against how a senior CRO actually reads a page, and it knows DTC ≠ SaaS.

**Killer stat:** the gap between a median landing page (~2–6% conversion) and a well-optimized one is routinely 2–3× revenue on the _same_ traffic — the entire ROI case for fixing the page before buying more clicks. _(`OPEN QUESTION:` finalize the exact benchmark + citation in `../research-sources.md`; use a range.)_

**Why Digitribe:** this is literally Manu's paid-acquisition + CRO craft and Nishant's build-quality eye, encoded. We treat landing pages as conversion experiments (it's in the studio's own service copy). We can credibly tell a founder "your above-the-fold buries the offer," not "consider adding social proof."

## 3. Pricing & packaging

- **$29**, one-time. Anchored ~100× below a $2,500 agency CRO audit; impulse-range for a founder spending on ads. The _cheap_ version of the studio's most demanded judgment.
- **Includes:** 1 run (3 re-runs to re-audit after edits / fix a typo'd URL), the on-screen teardown, branded PDF (forwardable to a partner/dev), JSON, and an emailed copy (Resend).
- **Upsell / cross-sell path:**
  - In-artifact → if the teardown finds _structural_ problems (not just copy): "items 7–14 are a rebuild, not a tweak" → **Landing Page Sprint / Marketing Site** → free `/audit`.
  - Sibling store products: **Ad Message-Match** ($29, if they run paid to this page), **Digibot-in-a-Box** ($49, add an assistant to the page), **Shopify PDP Optimizer** / **SaaS Pricing Teardown** ($29, the page-type-specific deep dives).
- **Future tiers (note only):** multi-page site teardown, or a re-audit subscription — v2. v1 is one SKU, one page.

## 4. User stories / JTBD

- As a **DTC founder**, when my paid traffic isn't converting on a PDP/landing page, I want a teardown that knows DTC, so that I fix the page before scaling spend.
- As a **SaaS founder**, when my homepage/pricing page isn't converting demos, I want a teardown that knows SaaS, so that I sharpen clarity and CTA.
- As a **marketer**, when my boss asks "why isn't this page working?", I want a credible, prioritized artifact, so that I can act and show progress.
- As a **founder evaluating Digitribe**, when I want proof they know CRO before I book, I want to _see_ their thinking on my page, so that I trust them with a Sprint.

**Primary job the artifact must nail:** a **prioritized, page-specific** teardown — the 3 fixes that matter, then the rest — each with the _actual rewrite_ (not "improve your headline" but "replace `<current>` with `<suggested>`"). It must reference _this_ page's real copy and structure; a reader must not be able to swap another page's teardown in.

**Non-goals (v1):** does NOT run multivariate tests or heatmaps; does NOT crawl the whole site (one page, optionally a few linked ones); does NOT guarantee a conversion lift number (honest, not snake-oil); does NOT audit behind auth/paywall.

## 5. Functional requirements

### Inputs

| Field      | Type                   | Validation                                                       | Example                |
| ---------- | ---------------------- | ---------------------------------------------------------------- | ---------------------- |
| `url`      | string (URL)           | http/https, public, resolves, not IP/localhost (SSRF guard, §15) | `https://acme.com/lp`  |
| `audience` | enum `dtc\|saas\|auto` | default `auto` (resolver, segment README §shared-logic 2)        | `saas`                 |
| `goal`     | enum                   | `purchase \| signup \| book_demo \| lead \| subscribe \| auto`   | `book_demo`            |
| `context`  | string (opt, ≤500)     | free text ("cold Meta traffic, $60 AOV, returning visitors")     | "cold TikTok, $45 AOV" |
| `provider` | enum                   | one of product's `byokProviders`                                 | `anthropic`            |
| `byokKey`  | string (secret)        | non-empty; validated live pre-run (platform-spec §5)             | `sk-…`                 |

### Processing (requirements level; pipeline in §7)

Crawl the target page (extract above-the-fold structure, copy blocks, headings, CTAs, images-present, trust elements, forms) → resolve audience + goal → **AI scores the 5 CRO dimensions and writes prioritized fixes + rewrites** filling the Output Contract → render teardown + PDF + email.

### Outputs

The **Conversion Teardown**: overall score/grade, 5 scored dimensions (each with findings + prioritized fixes + rewrites), a top-priority list, the cross-sell. Exact shape in §6.

### Constraints

- Default 1 page; optional up to 3 linked pages (e.g. LP + checkout) via `maxPages ≤ 3` (advanced) — bounded for cost + speed.
- 8s per-page fetch timeout; respect `robots.txt`; identify as `DigitribeAgentReadyBot/1.0`.
- Rewrites are bounded (caps in §6) so the artifact stays prioritized, not a wall.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/conversion-teardown.ts
import { z } from 'zod'

/** A concrete, prioritized fix with the actual rewrite — never "improve your headline." */
const Fix = z.object({
  priority: z.number().int().min(1), // global rank across all fixes; 1 = do first
  effort: z.enum(['low', 'medium', 'high']), // dev/design effort (effort×impact, like the studio's audits)
  impact: z.enum(['low', 'medium', 'high']),
  problem: z.string().max(280), // what's wrong, citing THIS page
  currentText: z.string().nullable(), // the page's actual copy, if a copy fix (quoted from crawl)
  rewrite: z.string().nullable(), // the specific suggested replacement (null for non-copy fixes)
})

const Dimension = z.object({
  key: z.enum([
    'above_the_fold', // does the offer + value + CTA land in the first screen?
    'clarity', // is what-it-is / who-it's-for / why-care obvious & fast?
    'friction', // form length, steps, cognitive load, distractions
    'trust', // proof, guarantees, social proof, credibility signals
    'cta', // is the action obvious, singular, compelling, well-placed?
  ]),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['weak', 'ok', 'strong']), // severity map: weak→error, ok→warning, strong→success
  findings: z.array(z.string()).max(6), // specific to THIS page
  fixes: z.array(Fix).max(6),
})

export const ConversionTeardownOutput = z.object({
  page: z.object({
    url: z.string().url(),
    title: z.string(),
    audience: z.enum(['dtc', 'saas']), // resolved (never 'auto')
    detectedGoal: z.enum(['purchase', 'signup', 'book_demo', 'lead', 'subscribe', 'unknown']),
    aboveFoldSummary: z.string().max(400), // what a visitor sees/understands in the first screen
    confidence: z.enum(['high', 'medium', 'low']), // honest on thin/JS-only pages (doc 03 §2.5)
  }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']), // A≥90 B≥75 C≥60 D≥40 F<40 (fixed mapping)
  headlineVerdict: z.string().max(240), // the single most important thing (answer-first, doc 03 §2.2)
  dimensions: z.array(Dimension).length(5),
  topFixes: z.array(Fix).min(3).max(5), // the prioritized few — the heart of the artifact
  quickWins: z.array(z.string()).max(5), // low-effort/high-impact, callable out separately
  crossSell: z.object({
    // shared Segment-6 fragment (segment README §shared-logic 4)
    service: z.enum(['landing_page_sprint', 'marketing_site', 'meta_ads', 'google_ads']),
    isStructural: z.boolean(), // true → "this is a rebuild, not a tweak" → Sprint
    reason: z.string().max(280), // honest, input-specific
  }),
})
export type ConversionTeardownOutput = z.infer<typeof ConversionTeardownOutput>
```

- **Export formats:** on-screen report (React) · **branded PDF** (forwardable to a dev/partner — the studio's "punch list" as a designed artifact, platform-spec §8) · **JSON** (the raw contract). No zip (it's a report, not files).
- **Field notes:** `score`/`grade` use the fixed 0–100 / A–F scale. `status` maps to the shared severity tokens (doc 06 §1: weak→error, ok→warning, strong→success). `topFixes` is the answer-first hero — sorted by `priority`. `effort`/`impact` enable the effort×impact framing the studio's real audits use. `currentText`/`rewrite` are nullable so non-copy (layout/UX) fixes don't fabricate quotes.
- **Determinism:** always 5 dimensions, fixed keys; `topFixes` always 3–5; the layout relies on it. Findings/fixes/rewrites are generative but constrained to schema + input-only-facts (§9).

## 7. System logic / pipeline

```
POST /api/store/run/conversion-teardown  { token, byokKey, input }
  │
  ├─ [verify] token + quota                                 emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod, SSRF guard)      emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping                          emit{phase:"key",pct:12}
  │
  ├─ CRAWL  crawlSite(url,{maxPages:1..3,maxDepth:1})       emit{phase:"crawl",pct:15..45,
  │     [SHARED Segment-1 spine — tools/agentic/]             message:"Reading the page…"}
  │     - extract DOM-ORDER content (above-the-fold = first
  │       N blocks), headings, copy blocks, CTAs (buttons/
  │       links + their text), forms (field count), images
  │       present, trust elements (badges, testimonials,
  │       guarantees), price/cart signals
  │     → PageDigest  (extend the shared extractor with the
  │        above-the-fold + CTA + form fields — Segment 1 benefits)
  │
  ├─ RESOLVE audience + goal  resolveAudience(input, crawl) emit{phase:"analyze",pct:50}
  │     [SHARED Segment-6 helper] → 'dtc' | 'saas' + goal
  │
  ├─ GENERATE  ai.structuredStream({                        emit{phase:"generate",pct:55..92,
  │     system: TEARDOWN_SYSTEM,               // §9          partial: dimensions[] fill in,
  │     prompt: buildPrompt(pageDigest, audience, goal, ctx), findingCount: fixesSoFar}
  │     schema: ConversionTeardownOutput,      // §6 SDK-enforced
  │     effort: "high",
  │   })  → ConversionTeardownOutput
  │
  ├─ RENDER  report.build(output) (screen + PDF + JSON)     emit{phase:"render",pct:95}
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl } emit{phase:"done",pct:100}
```

- **AI is called once** (`effort: "high"` — the teardown _is_ the product). Crawl + audience/goal resolution are deterministic Node (no extra AI cost to the buyer).
- **Libraries:** the shared crawler (`cheerio`/`linkedom`, `robots-parser`) — _reused from Segment 1._ The only extension: a few extra extracted fields (above-the-fold block order, CTA text/position, form field count, trust-element presence) added to the **shared extractor** so Segment 1 also benefits — not a fork.
- **Reuse note:** crawl spine = `server/store/tools/agentic/`. Audience resolver + CRO dimension taxonomy + anti-AI-tell guardrails = the shared Segment-6 conversion scaffolding (`server/store/prompts/conversion/_shared.ts`, segment README §shared-logic 3). The CRO dimension backbone is shared with `shopify-pdp-optimizer` and `saas-pricing-teardown`.

## 8. BYOK handling

- Providers: `anthropic` (default `claude-opus-4-8` — best at the judgment + crisp rewrites), `openai`, `google`. Cheaper option in UI: `claude-haiku-4-5` (faster, fine for short pages).
- **Buyer cost expectation** (show in UI): one structured generation over a compact page digest (~few K tokens) → typically **well under $0.10** on the buyer's key. Set expectation; no surprise.
- **Pre-run validation:** 1-token ping; on failure → error #1, no quota spent.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on. Structured output enforced by AI SDK `generateObject`/`streamObject` against `ConversionTeardownOutput` (§6).

**System prompt (`TEARDOWN_SYSTEM`, draft):**

```
You are a senior conversion-rate-optimization specialist auditing ONE landing/product
page. You think like an operator who treats pages as conversion experiments, not as
visual preference. You are given a structured digest of a CRAWLED page and its audience
(DTC or SaaS) and goal.

Score five dimensions 0–100, honestly, against what the digest shows:
- above_the_fold: does the offer + core value + a clear CTA land in the first screen?
- clarity: is what-it-is / who-it's-for / why-it-matters obvious in seconds?
- friction: form length, steps, distractions, cognitive load.
- trust: proof, social proof, guarantees, credibility — present and believable?
- cta: is the action singular, obvious, compelling, well-placed?

Rules:
- Reference ONLY what is in the digest — quote the page's ACTUAL copy in `currentText`.
  Never invent copy, claims, numbers, or page elements that aren't there.
- Every fix is concrete and prioritized. For copy fixes, give the exact `rewrite`
  (the replacement text), not "improve the headline." For layout/UX fixes, rewrite=null.
- Prioritize ruthlessly: `topFixes` are the 3–5 that move the needle most. Rank ALL
  fixes by impact, weighting effort (a low-effort/high-impact fix outranks a hard one).
- Be DTC-aware vs SaaS-aware. DTC: offer clarity, urgency, shipping/returns trust,
  reviews, fast path to cart. SaaS: outcome clarity, who-it's-for, objection handling,
  social proof/logos, demo/trial CTA. The two reports must read differently.
- honest confidence: thin or JS-only pages → confidence:"low" and say so; don't
  invent findings to fill space.
- No filler, no "In today's digital landscape", no hype, no restated prompt. Senior
  operator voice — say what's wrong plainly.
- `crossSell.isStructural` is true only if the fixes are a rebuild (IA/design/build),
  not copy tweaks; reason must cite what you saw.
```

**User prompt template:** `buildPrompt(pageDigest, audience, goal, context)` → serializes the page digest (above-the-fold blocks in order, copy, headings, CTAs + text, form field count, trust elements, images/price signals) + resolved audience + goal + the buyer's optional context.

**How 2.1–2.5 (doc 03) are met:** input-only-facts + quoted `currentText` → input-specific (2.1); the schema's headline→dimensions→fixes hierarchy is answer-first + prioritized (2.2); rewrites + scores feed designed viz (2.3); the DTC/SaaS branch is explicit (2.4); the no-filler/honest-confidence rules kill AI-tells (2.5).

**Guardrails:** schema enforcement; "quote actual copy / invent nothing" curbs hallucination; honest confidence; refusal/empty per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                  | Detection                     | Behavior / message                                                                  | Quota     |
| --- | ---------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- | --------- |
| 1   | Invalid/expired BYOK key                 | pre-run ping fails            | "Your `<provider>` key looks invalid or expired — check and retry."                 | not spent |
| 2   | URL unreachable / DNS / 5xx              | fetch fails                   | "We couldn't reach `<url>`. Is it public and live?"                                 | not spent |
| 3   | URL is IP/localhost/private (SSRF)       | input validation guard        | reject at form: "Enter a public website URL."                                       | not spent |
| 4   | JS-only page (empty SSR)                 | SSR body near-empty           | proceed on what's renderable; `confidence:"low"`; flag it; lower scores honestly    | spent     |
| 5   | Page behind auth/paywall                 | login/paywall signal          | "This page needs a login — we can only audit public pages." (no quota if pre-crawl) | not spent |
| 6   | Non-HTML (PDF/app) URL                   | content-type check            | "This URL isn't an auditable web page."                                             | not spent |
| 7   | Provider rate-limit/timeout mid-generate | AI wrapper error              | retry once w/ backoff; if still failing, error + restore quota                      | restored  |
| 8   | Very long page                           | content cap                   | digest the above-the-fold + key blocks; note "audited the primary content"          | spent     |
| 9   | Model returns thin/low-confidence        | `confidence`/findings length  | still deliver; banner "limited content — add context or check the URL"              | spent     |
| 10  | Duplicate submit (double-click)          | same `runId` (idempotency §6) | return cached/in-flight result; never double-charge                                 | n/a       |
| 11  | Network failure mid-crawl                | per-page try/catch            | proceed with fetched content; report what was audited accurately                    | spent     |

## 11. UX / UI flow

**Sales page** (`/store/conversion-teardown`) → **Buy** → Polar → **success** → **tool UI** (`/store/use/[token]`). Sales page hero: a sanitized real teardown (the grade ring + top 3 fixes), and the line "this is the paid, instant version of our free `/audit`" (doc 03 §1).

**Tool UI states** (all 8, doc 06 §state-chart):

- **Empty / collecting:** URL (big, primary); `audience` toggle (DTC / SaaS / auto), `goal` select, `context` textarea, optional `maxPages` (advanced); provider + BYOK key (with "we never store your key"); **Teardown** button (disabled until valid).
- **Validating key:** inline ✓/✗.
- **Running:** live SSE progress — "Reading the page…", "Scoring above-the-fold…", "Found 4 friction points," with `findingCount`; dimension cards fill in progressively (`structuredStream`); rotating CRO micro-education. `aria-live="polite"`.
- **Partial:** non-blocking banner; continue.
- **Success / artifact view (`components/store/artifacts/conversion-teardown.tsx`):**
  - Top: **grade + score ring** (`ScoreRing`, animated) + the **headlineVerdict** (answer-first) + audience chip + confidence chip + above-the-fold summary.
  - **Top 3–5 fixes** — the hero list, each with priority badge, effort×impact chips, problem, and the **rewrite** in a copyable block (current → suggested, like a diff).
  - **Quick wins** strip (low-effort/high-impact).
  - **5 dimension cards** (`DimensionCard`): score, status chip (weak/ok/strong), findings, fixes with rewrites.
  - **Downloads:** **Download PDF** (primary — the forwardable punch list), **Download JSON**, **Email me a copy** (pre-checked).
  - **Cross-sell card:** if `isStructural` → Landing Page Sprint / Marketing Site; else copy tweaks they can do themselves + "want us to? → `/audit`." Sibling: Ad Message-Match if they run paid.
- **Error:** message per §10 + retry; input preserved.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `DimensionCard`, `SeverityChip` (doc 06 §2). Only new component: the artifact body. Density/tokens per doc 06 §1; copy senior per `PROJECT_VISION.md`.

## 12. SEO

- **Target keyword(s):** "landing page teardown," "conversion rate audit tool," "CRO audit," "why isn't my landing page converting" (tool + commercial intent).
- **`generateMetadata`:** title `Conversion Teardown — A Senior CRO Audit of Your Page` (≤60); description: "Paste your URL and get a scored, prioritized CRO teardown — above-the-fold, clarity, friction, trust, CTA — with the exact rewrites. DTC/SaaS-aware. $29." (≤155). Canonical `/store/conversion-teardown`. OG via `@vercel/og` (grade-ring visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs: "What does it check?" (above-the-fold, clarity, friction, trust, CTA), "Does it know DTC vs SaaS?" (yes), "Do you store my API key?" (no), "Is this like the free audit?" (yes — the instant, self-serve version), "Will it guarantee more conversions?" (no honest tool can — it gives prioritized, specific fixes), "Can I audit a page behind login?" (no — public pages only).
- **Internal links:** the marketing **free `/audit`** ↔ here (the core funnel tie); blog posts on CRO → here; siblings (Ad Message-Match, PDP Optimizer, Pricing Teardown).
- **Programmatic surface (note):** anonymized example teardowns as indexable `/store/conversion-teardown/examples/<slug>` — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: labeled inputs; provider/key `<fieldset>`; `RunProgress` `role="status"` + `aria-live="polite"`; focus moves to the artifact `<h2>` on success; grade/status chips never color-only (letter/word + icon); contrast ≥ AA on `--color-bg-card`.
- The rewrite blocks are real, copyable regions (copy announces "copied"); current→suggested presented as an accessible diff, not color-only.
- Mobile: single-column; dimension cards stack; rewrites wrap; downloads full-width.
- Error recovery: inline, non-destructive (input preserved); retry without re-entering the key (session memory only).
- Gate CI on `@axe-core/playwright`.

## 14. Payment integration

- Create Polar product **"Conversion Teardown" $29** (sandbox + live). Checkout metadata `{ slug: "conversion-teardown" }`. Else per platform-spec §9.
- **Refund stance:** one-click refund if the run never produced a valid teardown. Quota auto-restores on system-side failures (§10 #7).

## 15. Security & privacy

- **Buyer data:** the target URL + crawled public page content + optional context. Public pages only. Retention: crawl content transient; artifact (report) 30d for re-download, then purged.
- **Product-specific risks:**
  - **SSRF** — the shared crawler guard (block private IPs, localhost, link-local, metadata IP, non-http(s); re-check resolved IP; cap redirects). Launch blocker.
  - **Untrusted HTML** — parse, never execute; sanitize before display; no `dangerouslySetInnerHTML` of crawled copy (we quote it as text).
- Shared rules per platform-spec §10 — deltas above only.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `teardown_complete` (grade, audience), `teardown_pdf_download`, `teardown_crosssell_click` (service), `teardown_rewrite_copy` (which dimension's rewrite was copied — a strong intent signal).
- **Activation:** purchase → first run that produces a valid teardown. **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), cross-sell CTR to `/audit` + Sprint, rewrite-copy rate (engagement quality).

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`conversion-teardown`), Polar sandbox product, routes, empty `ConversionTeardownOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Pipeline core (no live AI).** Reuse shared crawler (+ the above-the-fold/CTA/form extension) + `resolveAudience`; input/output schemas; pipeline returns a schema-valid teardown from a **fixture page**, AI mocked. _AC: unit test: fixture → valid `ConversionTeardownOutput`; SSRF tests pass._
- **Phase 2 — Real run + UI.** Wire BYOK + `structuredStream` (live AI); all UI states; report render + PDF + Resend email; the rewrite/diff blocks. _AC: E2E activation green in sandbox with a test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6, gates "live"):**
  - [ ] Sample asset: an anonymized real teardown on the sales page + storefront card.
  - [ ] Artifact leads with grade + `headlineVerdict` (answer-first) and `topFixes` prioritized.
  - [ ] Input-specific (eval: "could this teardown belong to another page? if yes → FAIL"; quoted `currentText` must match the page).
  - [ ] Designed data-viz: the score ring + per-dimension bars (not raw numbers).
  - [ ] Branded PDF (forwardable punch list), not a screenshot.
  - [ ] Rewrite blocks have copy buttons + current→suggested framing.
  - [ ] Running state streams real phases + `findingCount`.
  - [ ] All 8 UI states designed; no bare spinners.
  - [ ] "We never store your key" + retention + expected cost visible.
  - [ ] AI-tells absent (eval); DTC vs SaaS reports provably differ (eval check on `audience` branch).
  - [ ] Senior copy; `impeccable`/`taste` on artifact + sales page; `ui-ux-pro` + axe on tool UI; mobile first-class.
  - _AC: every box checked; Lighthouse ≥90; events fire._
- **Phase 4 — Launch.** Live Polar product, monitoring, refund verified, `/audit` ↔ store cross-links live. _AC: platform-spec §15 DoD all checked._

## 18. Testing strategy

| Edge (§10)     | Test                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| #1 key invalid | unit: pre-run ping mock rejects → error, quota intact                      |
| #3 SSRF        | unit: IP/localhost/metadata URLs rejected at validate + fetch              |
| #4 JS-only     | unit: empty SSR → `confidence:"low"`, still delivers                       |
| #5 auth wall   | unit: paywall signal → clean "public pages only," no quota                 |
| #7 AI timeout  | integration: provider error → retry → quota restored on final fail         |
| #10 duplicate  | integration: same `runId` returns cached, no double quota                  |
| DTC≠SaaS       | eval: same page with `audience:dtc` vs `saas` → materially different fixes |

**The one test that matters most:** fixture page → pipeline (mocked AI returning a fixed object) → **valid `ConversionTeardownOutput`** whose `currentText` quotes match the fixture's actual copy.

**Eval golden set:** ~10 real pages (DTC + SaaS) with expected grade bands, dimensions that _must_ be flagged (`mustFlag`), and copy that must be quoted accurately; judges `input_specific`, `no_ai_tells`, `factual` (every quoted line + claim traces to the page), `format_valid`. Full method, fixtures, mocks, scenario matrix, sandbox-E2E, CI gates: [`../05-testing-strategy.md`](../05-testing-strategy.md).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI §5, runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Import the canonical contracts ([`../04-implementation-contracts.md`](../04-implementation-contracts.md)) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`.
- **Reused from Segment 1:** the crawl spine (`server/store/tools/agentic/`), extended with above-the-fold/CTA/form fields (shared, not forked).
- **Reused from Segment 6:** `resolveAudience` + the CRO dimension taxonomy + anti-AI-tell scaffolding (`server/store/prompts/conversion/_shared.ts`) — shared with `shopify-pdp-optimizer` and `saas-pricing-teardown`.
- **New libs:** none beyond the shared crawler's (`cheerio`/`linkedom`, `robots-parser`).
- **Cross-product reuse:** the CRO dimension backbone is the shared spine for the two page-type-specific teardowns.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` exact conversion benchmark + citation for sales copy (`../research-sources.md`) — use a range.
- `OPEN QUESTION:` do we offer optional multi-page (LP + checkout) in v1 or defer? (lean: allow `maxPages ≤ 3` advanced).
- **Risk — generic output (the core doc-03 risk):** mitigation = input-only-facts + quoted `currentText` + the `input_specific` eval judge (auto-reject if a teardown could fit another page).
- **Risk — buyer expects a guaranteed lift number:** mitigation = FAQ + copy scope it to prioritized, specific fixes; no fabricated lift %.
- **Risk — thin/JS-only pages → weak teardown:** mitigation = honest `confidence:"low"` + the `context` field + "check the URL / add context" guidance.
- **Risk — SSRF:** mitigation = strict shared guard, tested (§18); launch blocker.
- **Risk — buyer surprised by their own API cost:** mitigation = show expected per-run cost in UI (§8).
