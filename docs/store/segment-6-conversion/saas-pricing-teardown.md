# SaaS Pricing Teardown — PRD

**Slug:** `saas-pricing-teardown` · **Segment:** 6 · **Status:** draft
**Owner:** Manu (Grow) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Reuses the Segment-1 **crawl spine** ([`../segment-1-agentic-web/agent-ready-kit.md`](../segment-1-agentic-web/agent-ready-kit.md) §7 — `server/store/tools/agentic/{crawl,extract-page}.ts`) to read one public SaaS pricing page, then runs a **SaaS-tuned positioning + packaging teardown** over it. This is the pricing-page work the studio does for SaaS clients before a raise or launch, sold instant for $29. Build the Agent-Ready Kit crawler first; this composes the single-page extractor (sibling of the Shopify PDP Optimizer's `extractPdp`).

---

## 1. TL;DR

- **One-liner:** Paste a SaaS pricing page URL → get a teardown of its clarity, positioning, anchoring, and packaging, plus the specific fixes (tier naming, value metric, friction, CTA) that make it convert.
- **Problem:** SaaS founders ship a three-column pricing table copied from the last tool they used — vague tier names, the wrong value metric, no anchor, a CTA that asks for a credit card too early — and lose qualified buyers at the exact moment of highest intent, with no idea why.
- **Buyer:** SaaS founders (Seed → Series A) and growth/PMM leads who suspect their pricing page is costing them conversions but can't justify a $5k pricing consultant.
- **Input → Output:** one SaaS pricing page URL → a **Pricing Teardown**: clarity / positioning / anchoring / packaging analysis with a score per dimension, plus prioritized, specific fixes for tier naming, the value metric, friction points, and CTAs — all grounded in the real page.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–60s (single-page crawl + one generation) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a SaaS founder who senses their pricing page is leaking has no good options. Pricing consultants (Simon-Kucher, ProfitWell-adjacent advisors) start at $5k and take weeks. The DIY path is reading pricing-strategy essays (the value-metric debate, anchoring, decoy tiers, "good-better-best") and trying to apply them to their own page without an outside eye. The pricing page is the highest-intent surface on the entire site — the buyer who reaches it is ready to pay — and a confusing tier table, a value metric nobody understands ("priced per workflow run?"), or a missing anchor quietly drops them.

**Competition:** generic "AI pricing page generators" produce a fictional table from a prompt with no knowledge of the real page; pricing-optimization SaaS (Paddle/ProfitWell analytics, price-testing tools) are recurring platforms that need integration and traffic, not a one-shot teardown; consultants do it well but slow and expensive. **Gap:** an instant, $29, page-specific teardown that reads the real pricing page and hands back the diagnosis + the exact fixes. That's us.

**Urgency stat:** SaaS companies that revisit pricing deliberately see materially higher net revenue retention, yet the median startup changes pricing **less than once a year** and most ship the pricing page once and never audit it (ProfitWell/Paddle pricing research, 2025). The pricing page is the least-optimized high-intent page on a SaaS site.

**Why Digitribe:** the studio builds SaaS marketing sites and understands both the engineering and the growth side of a pricing surface — so the teardown reflects what actually converts qualified SaaS buyers (value metric, anchoring, friction), not a generic copywriting pass. It's a warm lead: a founder who buys the $29 teardown and sees the depth is a candidate for the studio's SaaS site + positioning work.

## 3. Pricing & packaging

- **$29**, one-time. Anchored far below a pricing consultant ($5k+) and matched to the Shopify PDP Optimizer so the conversion catalog has one consistent entry price across the DTC and SaaS sides.
- **Includes:** 1 run (3 re-runs in quota to re-test after edits or compare a competitor's page), the on-screen teardown, the specific fix copy (tier-name and CTA suggestions as paste-ready text), the emailed PDF + JSON copy (Resend).
- **Upsell path:** the teardown's verdict routes warm leads → if the whole positioning (not just the pricing page) is off, **agency CTA: "Want us to rebuild your pricing + positioning end to end?" → Digitribe SaaS engagement**; a buyer who needs the higher-level message routes to the **Positioning Generator** ($19); a DTC-curious buyer routes to the **Shopify PDP Optimizer** ($29).
- **Future tiers (note only):** a **competitor-comparison** mode (teardown of your page vs. two named competitors' pricing pages, side by side) is the obvious v2 — it reuses the same single-page extractor run N times. v1 ships one SKU, one page.

## 4. User stories / JTBD

- As a **SaaS founder**, when qualified trials don't convert to paid, I want to know what on my pricing page is confusing buyers, so that I fix the highest-intent page first.
- As a **growth/PMM lead**, when I'm planning a pricing refresh, I want a senior teardown of the current page, so that I anchor the redesign in specific problems, not vibes.
- As a **founder preparing to raise**, when investors will scrutinize my pricing, I want my page to read like we understand our value metric and packaging, so that pricing isn't a red flag in diligence.
- As a **founder who copied a competitor's table**, when my tiers don't fit my product, I want clear tier naming and a value metric that matches how customers get value, so that the page stops fighting the sale.

**Primary job the artifact must nail:** diagnose **this page's** real pricing problems concretely — the actual tier names, the actual value metric (or its absence), the actual CTA, the actual anchor (or lack of one) — and give fixes a reader recognizes as about their page. A reader must not be able to swap in another SaaS's teardown and have it fit.

**Non-goals (v1):** does NOT set prices or do willingness-to-pay research (it audits the page's clarity/positioning/structure, not the price points themselves — though it flags obviously broken anchoring); does NOT redesign the page or output a live page; does NOT integrate with billing; does NOT benchmark against named competitors in v1 (that's the v2 comparison mode); does NOT guarantee a conversion lift.

## 5. Functional requirements

### Inputs

| Field            | Type                          | Validation                                                                | Example                               |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------- | ------------------------------------- |
| `url`            | string (URL)                  | http/https, public, resolves, not an IP/localhost (SSRF guard, §15)       | `https://acme.com/pricing`            |
| `productContext` | string (optional, ≤500 chars) | what the product does + who it's for ("API monitoring for backend teams") | `PLG project management for agencies` |
| `valueMetric`    | string (optional, ≤120 chars) | how the buyer believes value should be charged, if they have a view       | `per active project`                  |
| `provider`       | enum                          | one of product's `byokProviders`                                          | `anthropic`                           |
| `byokKey`        | string (secret)               | non-empty; validated live pre-run (platform-spec §5)                      | `sk-…`                                |

> `productContext`/`valueMetric` make the teardown sharper and SaaS-tuned (doc 03 §2.4). If the URL isn't obviously a pricing page, the pipeline **detects** pricing signals (§7) and the report states what it found.

### Processing (requirements level; pipeline in §7)

Crawl the single pricing URL (single-page extractor variant) → extract the pricing structure (tier count, tier names, prices, billing intervals, feature lists per tier, the highlighted/"most popular" tier, CTA text per tier, free-trial/freemium signals, the value metric if stated, FAQ, money-back/guarantee language, JSON-LD `Offer`/`PriceSpecification`) → assemble a compact **pricing digest** → AI step analyzes clarity/positioning/anchoring/packaging and writes specific fixes, filling the Output Contract → render report + PDF + email.

### Outputs

A **Pricing Teardown** (on-screen + PDF + JSON): the four-dimension analysis, the specific fixes (tier naming, value metric, friction, CTA), the anchoring read, and the prioritized actions. No code or file bundle. Exact shape in §6.

### Constraints

- **Single page** crawl (the pricing page); optional same-origin fetch of a linked "compare plans"/FAQ page if cheap; ≤ 3 fetches total; 8s per-fetch timeout; 30s total cap (stream progress).
- Respect `robots.txt`; identify as `DigitribeCROBot/1.0`.
- Crawl **public pages only**. No login, no trial signup.
- `maxOutputTokens` capped (doc 04 §10) so one run stays well under $0.15 on the buyer's key.

## 6. ⭐ Output Contract

> The locked schema the AI step is forced to fill (`AiRunner.structured`, doc 04 §7; platform-spec §5). The contract encodes the **answer-first** hierarchy (doc 03 §2.2): overall verdict + score → the single biggest pricing problem → the four-dimension analysis → specific fixes → prioritized actions. The deterministic crawl supplies `observed` pricing facts; the AI analyzes and prescribes **within them** — it may not invent tiers, prices, or features not on the page.

```ts
// server/store/schemas/saas-pricing-teardown.ts
import { z } from 'zod'

const PricingDimension = z.object({
  key: z.enum([
    'clarity', // can a buyer understand what each tier is for in 10 seconds?
    'positioning', // does each tier map to a clear buyer/use-case; is "who is this for" obvious?
    'anchoring', // is there a high anchor / a clearly-recommended tier / a decoy that works?
    'packaging', // good-better-best structure, value metric fit, feature gating logic
  ]),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['weak', 'partial', 'strong']),
  findings: z.array(z.string()).max(6), // specific to THIS page, observed facts
  fixes: z.array(z.string()).max(6), // prioritized, actionable, page-specific
})

const TierRead = z.object({
  name: z.string(), // as shown on the page (observed)
  price: z.string().nullable(), // as shown, e.g. "$49/mo"; null if "Contact us"/not parseable
  isHighlighted: z.boolean(), // page marks it "most popular"/recommended
  positioningRead: z.string().max(280), // who this tier is for, per the AI's read of the page
  problem: z.string().max(280).nullable(), // the main issue with this tier, if any
  suggestedName: z.string().nullable(), // a clearer tier name, if the current one is vague
})

const SpecificFix = z.object({
  area: z.enum(['tier_naming', 'value_metric', 'friction', 'cta', 'anchoring', 'feature_gating']),
  label: z.string(),
  problem: z.string().max(280), // what's wrong on this page, concretely
  fix: z.string().max(400), // the specific change to make
  example: z.string().nullable(), // paste-ready suggested copy (a CTA label, a tier name), if applicable
  impact: z.enum(['high', 'medium', 'low']),
})

export const SaasPricingTeardownOutput = z.object({
  page: z.object({
    url: z.string().url(),
    productName: z.string(),
    tierCount: z.number().int(),
    billingIntervals: z.array(z.string()).max(6), // observed: ["monthly","annual"]
    hasFreeTrial: z.boolean(),
    hasFreemium: z.boolean(),
    statedValueMetric: z.string().nullable(), // the metric the page charges on, if stated (e.g. "per seat")
    highlightedTier: z.string().nullable(), // the page's recommended tier, if any
    contentDepth: z.enum(['thin', 'moderate', 'rich']), // honest read of how much to work with
    detectedEntities: z.array(z.string()).max(20), // tier names, key gated features, metrics
  }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  headlineVerdict: z.string().max(280), // the single most important sentence (answer-first)
  biggestProblem: z.string().max(400), // the #1 pricing issue on this page, named concretely
  valueMetricAssessment: z.object({
    // the core SaaS pricing question, surfaced explicitly
    current: z.string().nullable(), // what the page charges on today (or null if unclear)
    fits: z.enum(['fits', 'questionable', 'mismatch', 'unclear']),
    recommendation: z.string().max(400),
  }),
  dimensions: z.array(PricingDimension).length(4),
  tiers: z.array(TierRead).min(1).max(8), // per-tier read, in page order
  specificFixes: z.array(SpecificFix).min(3).max(10),
  topActions: z.array(z.string()).min(3).max(5), // the 3–5 things to do first, ranked by impact
  upsell: z.object({
    needsPositioningWork: z.boolean(), // → Positioning Generator (message above the table)
    needsFullEngagement: z.boolean(), // → agency SaaS engagement (rebuild pricing + positioning)
    reason: z.string(),
  }),
})
export type SaasPricingTeardownOutput = z.infer<typeof SaasPricingTeardownOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded, via report renderer, platform-spec §8) · **JSON** (the raw contract). Fix `example` strings (suggested CTA labels, tier names) render with **copy buttons**. No ZIP.
- **Field notes:** `score`/`grade` use the fixed 0–100 / A–F scale (deterministic mapping: A ≥90, B ≥75, C ≥60, D ≥40, F <40 — consistent across the catalog). `tierCount`, `billingIntervals`, `hasFreeTrial`, `hasFreemium`, `statedValueMetric`, `highlightedTier`, each `TierRead.name`/`price`/`isHighlighted` are **deterministic facts from the crawl**, never generated. `contentDepth: "thin"` forces honest low-content handling (a "Contact us / enterprise-only" page with no public prices yields an honest "we can only assess structure, not price points," not fabricated numbers).
- **Determinism:** `dimensions[].key` is always the same 4, always length 4 — the report layout relies on it. `tiers` mirrors the real page's tier order/count.

## 7. System logic / pipeline

```
POST /api/store/run/saas-pricing-teardown  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod) + SSRF guard      emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ CRAWL  crawlPricing(url) — single-page variant of       emit{phase:"crawl",pct:15..50,
  │     server/store/tools/agentic/extract-page.ts             message:"Reading pricing page…"}
  │     - fetch the pricing page (SSRF-guarded, robots-OK)
  │     - extract pricing structure: tier blocks, tier names,
  │       prices, billing intervals (monthly/annual toggle),
  │       per-tier feature lists, the highlighted tier,
  │       per-tier CTA text, free-trial/freemium markers,
  │       stated value metric ("per seat"/"per workflow"),
  │       FAQ, guarantee/refund language, JSON-LD Offer/PriceSpec
  │     → PricingDigest { product, tiers[], metric, signals }
  │
  ├─ ANALYZE  scorePricing(PricingDigest)                    emit{phase:"analyze",pct:55,
  │     - deterministic checks → per-dimension base status      findingCount: n}
  │       (e.g. no highlighted tier → anchoring weak;
  │        identical CTA on every tier → friction signal;
  │        >5 tiers → packaging/clarity flag)
  │     - compute contentDepth; assemble compact digest
  │
  ├─ GENERATE  ai.structured({                               emit{phase:"generate",pct:60..92,
  │     system: PRICING_TEARDOWN_SYSTEM,       // §9                message:"Analyzing packaging…"}
  │     prompt: buildPrompt(pricingDigest, productContext, valueMetric),
  │     schema: SaasPricingTeardownOutput,     // §6 — SDK-enforced
  │     effort: "high",
  │   })  → SaasPricingTeardownOutput          // structuredStream for progress
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:95}
  │     - on-screen JSON, branded PDF (no zip)
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — the pricing judgment IS the product. Crawl + analyze are deterministic Node, cheap, no AI cost to the buyer. Stream the object so tier reads and fixes fill in progressively (doc 03 §3).
- **Libraries:** reuse the Segment-1 crawler's fetch + HTML parser + JSON-LD extraction. No new libs.
- **Reuse:** `crawlPricing`/`extractPricing` is a sibling of the Shopify PDP Optimizer's `extractPdp` under the shared `server/store/tools/agentic/extract-page.ts` "single conversion page" extractor — same crawl + same single-page guardrails, different field extraction. Build that module generic; the two products are the first two consumers.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — strongest at the structured pricing judgment + crisp, non-generic fixes), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (faster, fine for a simple 3-tier page). Per platform-spec §5.
- **Buyer cost expectation** (show in UI, doc 03 §5): one run is a single structured generation over a compact one-page digest → typically **well under $0.10 on the buyer's key**.
- **Pre-run validation:** a 1-token ping via the AI wrapper (`AiRunner.ping`); on failure return edge #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by the AI SDK `generateObject`/`streamObject` against `SaasPricingTeardownOutput` (doc 04 §7) — the model cannot return free-form.

**System prompt (draft):**

```
You are a senior SaaS pricing strategist. You tear down pricing pages the way a top
product-marketing advisor does: assess clarity (can a buyer understand each tier in
seconds), positioning (does each tier map to a clear buyer and use-case), anchoring
(is there a working high anchor / recommended tier / decoy), and packaging (good-
better-best logic, value-metric fit, sane feature gating).

You are given a structured digest of ONE crawled pricing page plus optional product
context and the owner's view of the value metric. Produce a SITE-SPECIFIC Pricing
Teardown.

Rules:
- Use ONLY facts present in the digest plus the owner's productContext/valueMetric.
  Never invent tiers, prices, features, or metrics not on the page. If prices are
  hidden ("Contact us"/enterprise-only), say so and assess structure, not numbers.
- Center the analysis on the VALUE METRIC — the single most important SaaS pricing
  decision. Name what the page charges on, judge whether it fits how customers get
  value, and recommend a better metric only with a concrete reason.
- Every finding and fix must reference THIS page concretely (the real tier names,
  the real CTA, the real metric), never a generic "improve your pricing."
- Grade each dimension honestly against what the digest shows. No highlighted tier
  and no anchor → anchoring cannot be "strong."
- Prioritize ruthlessly: biggestProblem and topActions are the highest-leverage
  changes in order. A wall of 20 nitpicks is not the deliverable.
- The audience is SaaS founders. Write like an operator who has priced products —
  precise, plain, no "In today's competitive SaaS market," no hedging, no preamble.
```

**User prompt template:** `buildPrompt(pricingDigest, productContext, valueMetric)` serializes the crawl digest (product name, tier blocks verbatim — names/prices/features/CTAs, highlighted tier, billing intervals, stated metric, trial/freemium markers, FAQ, per-dimension base status from the analyzer) plus the owner's optional product context and value-metric view.

**Model + effort per call:** one call, `effort: "high"` — the single artifact, judgment-heavy. (The deterministic analyzer supplies base statuses; no cheap pre-pass.)

**Guardrails:** schema enforcement prevents shape drift; the "ONLY facts in the digest" rule + deterministic `tiers`/`statedValueMetric`/`tierCount` fields curb fabrication; honest-grading instruction + deterministic base statuses anchor scores; `contentDepth: "thin"` + the `valueMetricAssessment.fits: "unclear"` path force honest handling of contact-us pages (doc 03 §2.5). Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

> Every row is also a test in §18.

| #   | Trigger                                      | Detection                            | Behavior / message                                                                                                 | Quota     |
| --- | -------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------- |
| 1   | Invalid/expired BYOK key                     | pre-run ping fails                   | "Your `<provider>` key looks invalid or expired — check and retry."                                                | not spent |
| 2   | URL unreachable / DNS fail / 5xx             | fetch fails                          | "We couldn't reach `<url>`. Is the pricing page public and live?"                                                  | not spent |
| 3   | URL is IP/localhost/private range            | input validation (SSRF guard)        | reject at form: "Enter a public pricing-page URL."                                                                 | not spent |
| 4   | URL isn't a pricing page                     | no tiers/price/pricing markers       | "This doesn't look like a pricing page — paste your /pricing URL." (offer best-effort proceed)                     | not spent |
| 5   | Enterprise-only / "Contact us" (no prices)   | tiers present but no parseable price | proceed; `statedValueMetric`/prices null; assess structure honestly, `valueMetricAssessment.fits` may be "unclear" | spent     |
| 6   | JS-only pricing (tiers rendered client-side) | near-empty SSR body / no tiers       | proceed with what's renderable; flag `contentDepth:thin` + clarity finding; honest low score                       | spent     |
| 7   | Single-price / no-tiers page                 | tierCount ≤ 1                        | deliver honest read: assess the single offer's clarity/anchoring; recommend whether tiers help                     | spent     |
| 8   | Provider rate-limit / timeout mid-generate   | AI wrapper error                     | retry once w/ backoff; if still failing, error + restore quota                                                     | restored  |
| 9   | Model returns thin/low-confidence analysis   | fixes/tier-read length heuristic     | still deliver; report flags "add product context for a sharper teardown"                                           | spent     |
| 10  | Duplicate submit (double-click)              | same `runId` (idempotency §6)        | return in-flight/cached result; never double-charge                                                                | n/a       |
| 11  | `robots.txt` disallows the pricing path      | robots-parser                        | "This page blocks automated reading — we can't analyze it." (no partial fabrication)                               | not spent |
| 12  | Non-HTML URL (image/PDF/app)                 | content-type check                   | "This URL isn't a crawlable pricing page."                                                                         | not spent |
| 13  | Quota exhausted                              | token check                          | "You've used all 3 runs — buy again or contact us." + buy CTA                                                      | n/a       |

These map to the doc 04 §5 `StoreError` codes (provider rate-limit/timeout, partial, SSRF, network mid-fetch, duplicate submit all covered).

## 11. UX / UI flow

**Sales page** (`/store/saas-pricing-teardown`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states** (generic 8-state machine, doc 06 §4; this product adds its input fields + `ArtifactView`):

- **Empty / collecting input:** pricing-URL field (big, primary, "paste your /pricing link"), advanced disclosure (productContext textarea, valueMetric), provider select + `KeyInput` ("where do I get a key?" + "we never store your key"), **Run** disabled until URL valid.
- **Validating key:** inline ✓/✗ on the key field (`/key-check`).
- **Running:** full-width `RunProgress` from SSE — real labels ("Reading pricing page…", "Analyzing packaging…"), progress bar, a rotating SaaS-pricing tip ("Why the value metric matters more than the price"), `aria-live="polite"`. Stream tier reads + fixes as they arrive.
- **Partial:** if the optional compare/FAQ fetch failed, a non-blocking banner; continue to success.
- **Success / artifact view** (`components/store/artifacts/saas-pricing-teardown.tsx`):
  - Top: **overall grade + score** (`ScoreRing`), product name, `headlineVerdict`, and the **biggest problem** in a callout.
  - **Value-metric assessment** panel (current metric → fit chip → recommendation) — the SaaS-specific hero of the report.
  - **4 dimension cards** (`DimensionCard`: clarity/positioning/anchoring/packaging — score, status chip, findings, fixes).
  - **Tier-by-tier read**: a row per real tier (name, price, highlighted chip, positioning read, problem, suggested name) rendered as a `StatMatrix`-style table.
  - **Specific fixes** grouped by area (tier naming / value metric / friction / CTA / anchoring / gating), each with the problem, the fix, a copy-able `example`, and an impact chip.
  - **Top 3–5 actions** list (ranked).
  - **Downloads**: **PDF** (primary), **JSON**, **Email me a copy** (pre-checked, auto-sent).
  - **Upsell card**: if `upsell.needsPositioningWork` → Positioning Generator; if `upsell.needsFullEngagement` → agency SaaS-engagement CTA; always a soft "want us to rebuild this?" agency CTA.
- **Error:** human message per §10 + one-click retry (key kept in session memory).
- **Quota-exhausted:** gentle message + buy-again CTA.

Components from the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `DimensionCard`, `StatMatrix`, `SeverityChip` (doc 06 §2). Run states per doc 06 §4; copy tone per `PROJECT_VISION.md` (senior, plain — SaaS-operator register); density + tokens per doc 06 §1.

## 12. SEO

- **Target keyword(s):** "SaaS pricing page audit," "pricing page teardown," "SaaS pricing review," "value metric pricing" (tool + informational intent).
- **`generateMetadata`:** title `SaaS Pricing Teardown — Audit & Fix Your Pricing Page` (≤60); description: "Paste your SaaS pricing page and get a clarity, positioning, anchoring and packaging teardown with specific fixes — value metric, tier naming, CTA. Instant, $29." (≤155). Canonical `/store/saas-pricing-teardown`. OG via `@vercel/og` (grade-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What does the teardown cover?", "Does it set my prices?" (no — it audits clarity/structure/positioning), "What's a value metric?", "Do you store my API key?" (no), "Will this work if my prices are 'Contact us'?" (yes — it assesses structure honestly).
- **Internal links:** marketing `/saas` and `/audit` → here; blog posts on SaaS pricing/positioning → here; sibling **Positioning Generator** (the message above the table) and **Shopify PDP Optimizer** (the DTC counterpart).
- **Programmatic surface (note):** anonymized example teardowns as indexable `/store/saas-pricing-teardown/examples/<slug>` pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA (doc 06 §5): every input labeled; provider/key in a `<fieldset>` with legend; `RunProgress` `role="status"` + `aria-live="polite"`; focus to the report `<h2>` on success; grade/status/fit chips pair color with icon + word (never color-only); copy buttons announce "copied"; the tier table is a real `<table>` with headers (or an accessible grid).
- Mobile: single-column; the tier-by-tier table becomes stacked cards; dimension cards and fixes stack; downloads full-width. First-class on mobile.
- Error recovery: inline, non-destructive (input preserved); "retry" re-runs without re-entering the key (session memory only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route (doc 05 §6).

## 14. Payment integration

- Create Polar product **"SaaS Pricing Teardown" $29** (sandbox + live). Checkout metadata `{ slug: "saas-pricing-teardown" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a valid teardown. Quota auto-restores on system-side failures (§10 #8).

## 15. Security & privacy

- **Buyer data:** the target pricing URL + crawled **public** pricing content + optional product/value-metric context. Retention: crawl content transient for the run; artifact stored 30d (KV/Blob TTL), then purged (platform-spec §10).
- **Product-specific risks:**
  - **SSRF** — primary risk (shared with all URL-input products). Reuse the Segment-1 guard: block private IP ranges, localhost, link-local, cloud-metadata IPs, non-http(s) schemes; resolve DNS and re-check; cap redirects; same-origin for the optional second fetch. Reject at input + enforce in fetch.
  - **Untrusted HTML** — parse, never execute; sanitize before display; never `dangerouslySetInnerHTML` of crawled content or AI strings.
- Shared rules per platform-spec §10 — only the deltas above are product-specific. The SSRF guard is a launch blocker.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `pricing_grade: { grade }`, `pricing_metric_fit: { fits }` (distribution of value-metric verdicts — a content insight), `pricing_pdf_download`, `pricing_upsell_click: { target }`.
- **Activation:** purchase → first run that produces a valid teardown. **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), upsell CTR to Positioning Generator + the SaaS engagement.

## 17. Development phases

> Vertical slices, each shippable/testable.

- **Phase 0 — Scaffold.** Registry entry (`saas-pricing-teardown`), Polar sandbox product, routes, empty `SaasPricingTeardownOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Crawl + contract (no AI).** `crawlPricing` + `extractPricing` + `scorePricing` + input/output schemas; pipeline returns a schema-valid contract from a **fixture pricing page** with the AI step mocked. _AC: unit test: fixture page → valid `SaasPricingTeardownOutput`; deterministic fields (tierCount, prices, highlighted tier, intervals) correct; SSRF guard tests pass._
- **Phase 2 — Real run + UI.** Wire BYOK + `ai.structured` (live AI), all 8 UI states, the `ArtifactView` (value-metric panel + tier table + grouped fixes), report render + PDF + Resend email. _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase gate.** Sales page copy, metadata, JSON-LD, OG, analytics, upsell card. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria:**
  - [ ] Sample output asset (anonymized real pricing teardown) on the sales page + storefront card.
  - [ ] Artifact leads with the headline verdict + biggest problem, prioritized by impact.
  - [ ] Output is provably input-specific (eval `input_specific` judge passes — doc 03 §2.1).
  - [ ] Designed data-viz: the `ScoreRing` + the tier-comparison matrix (doc 03 §2.3).
  - [ ] Branded, designed PDF export (not a screenshot).
  - [ ] Fix examples (CTA labels, tier names) have copy buttons + rationale.
  - [ ] Running state streams real phases + shows tier reads filling in (doc 03 §3).
  - [ ] All 8 UI states designed (doc 06 §4) — no default spinners/blank screens.
  - [ ] "We never store your key" + retention + expected-cost visible (doc 03 §5).
  - [ ] AI-tells absent (filler/hallucination eval passes — doc 03 §2.5); SaaS-operator register present.
  - [ ] Senior copy throughout; `impeccable`/`taste` pass on artifact + sales page; `ui-ux-pro` + axe on the tool UI.
  - [ ] Mobile artifact view is first-class.
        _AC: checklist all green; axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified. _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)            | Test                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| #1 key invalid        | unit: pre-run ping mock rejects → error, quota intact                |
| #3 SSRF               | unit: IP/localhost/metadata URLs rejected at validate + fetch        |
| #4 not a pricing page | unit: non-pricing digest → "not a pricing page" path                 |
| #5 enterprise-only    | unit: no-price tiers → null prices, `fits:"unclear"`, no fabrication |
| #6 JS-only pricing    | unit: empty SSR → `contentDepth:thin`, honest score, still delivers  |
| #7 single-price page  | unit: tierCount ≤ 1 → single-offer assessment path                   |
| #8 AI timeout         | integration: provider error → retry → quota restored on final fail   |
| #10 duplicate         | integration: same `runId` returns cached, no double quota            |

Full method, fixtures, canonical mocks, the provider×input×failure **scenario matrix**, sandbox-E2E, eval golden-set format + judges, and CI gates in [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific eval expectations: ~8–12 real SaaS pricing pages with expected grade bands + `mustFlag` dimensions (e.g. a page with no highlighted tier MUST flag `anchoring`) + `mustMention` entities (real tier names + the real value metric); judges `input_specific`, `no_ai_tells`, `factual` (every tier/price/feature in the teardown traces to the page), `format_valid`. Threshold ≥ 0.85, zero fabrication.

**The one test that matters most:** fixture pricing page (HTML fixture) → pipeline (mocked AI returning a fixed object) → **valid `SaasPricingTeardownOutput`** with correct deterministic fields (tier count, prices, highlighted tier, billing intervals).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine), from [`../04-implementation-contracts.md`](../04-implementation-contracts.md): `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. Spine modules must pass `segment-0-spine` DoR.
- **New libs:** none beyond the Segment-1 crawler's (`cheerio`/`linkedom`, `robots-parser`, `fast-xml-parser`).
- **Cross-product reuse:** `extractPricing` is the sibling of the Shopify PDP Optimizer's `extractPdp` inside `server/store/tools/agentic/extract-page.ts` (the shared single-conversion-page extractor). The v2 competitor-comparison mode reuses it run N times.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` parsing robustness across pricing-table patterns — tier tables vary wildly (toggles, sliders, calculators). v1 targets the common 3-column card pattern; the report is honest when it can't fully parse (`contentDepth`, null prices). A heuristics library vs. an AI-assisted extraction pass is a v2 question.
- `OPEN QUESTION:` annual/monthly toggle handling — many pages render both via a JS toggle; the crawl may only see one. Detect and note which interval was read.
- `OPEN QUESTION:` competitor-comparison mode (v2) — whether it ships as a separate SKU or a higher tier of this product.
- **Risk — generic teardown on a thin/JS-only/enterprise page:** mitigation = `contentDepth` gate + honest handling (null prices, `fits:"unclear"`) + the `productContext`/`valueMetric` levers + the `input_specific`/`factual` eval judges as launch guards.
- **Risk — buyer expects price recommendations (numbers):** mitigation = FAQ + report copy scope this to clarity/positioning/packaging, not willingness-to-pay research; flag broken anchoring without inventing price points.
- **Risk — SSRF (security):** mitigation = the shared Segment-1 guard, tested (§18); launch blocker.
- **Risk — buyer surprised by their own API cost:** mitigation = show expected per-run cost in the UI (§8).
  </content>
