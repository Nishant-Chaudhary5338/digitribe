# Shopify PDP Optimizer — PRD

**Slug:** `shopify-pdp-optimizer` · **Segment:** 6 · **Status:** draft
**Owner:** Manu (Grow) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Reuses the Segment-1 **crawl spine** ([`../segment-1-agentic-web/agent-ready-kit.md`](../segment-1-agentic-web/agent-ready-kit.md) §7 — `server/store/tools/agentic/{crawl,score}.ts`) to read one public Shopify product page, then runs a **DTC-tuned CRO + copy rewrite** over it. This is the conversion work the studio does for $5k Shopify clients, sold instant for $29. Build the Agent-Ready Kit crawler first; this composes a single-page variant of it.

---

## 1. TL;DR

- **One-liner:** Paste a Shopify product URL → get the rewritten product copy plus a prioritized list of conversion, trust, and structure fixes for that exact page.
- **Problem:** DTC founders pour ad spend into traffic that lands on product pages written like a spec sheet — feature-led, trust-thin, no clear hierarchy — and they have no idea which of the dozen things to fix first. A CRO consultant charges $2k+ and takes two weeks.
- **Buyer:** Shopify DTC founders and growth leads (~$1M–$20M, scaling paid) who know their PDP is leaking conversion but can't afford an audit per product.
- **Input → Output:** one Shopify product URL → a **PDP Optimization Report**: a benefit-led copy rewrite (title, subhead, hero paragraph, bullets, FAQ), a prioritized CRO fix list, trust / social-proof recommendations, and a before→after structure map — all specific to that product.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–60s (single-page crawl + one generation) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a DTC owner who senses their product page underperforms must either (a) read ten "Shopify CRO" listicles and guess, (b) install a $200/mo heatmap tool and wait weeks for data, or (c) hire an agency for a $2k page teardown. The actual work — restructure the page around the buyer's outcome, rewrite feature-led copy into benefit-led copy, add the trust and social-proof elements that de-risk the purchase, fix the hierarchy so the price and CTA aren't buried — is well understood by senior operators but rarely available instant and self-serve.

**Competition:** generic "AI product description generators" spit out keyword-stuffed paragraphs from a product name with no knowledge of the actual page; Shopify app-store CRO apps are recurring subscriptions that gate the real recommendations; agencies do it properly but slow and expensive. **Gap:** an instant, $29, page-specific teardown that reads the real PDP and hands back both the rewrite and the prioritized fix list. That's us.

**Urgency stat:** the average Shopify storefront converts at **~1.4%** (Littledata, 2025), and product-page copy + layout is the single most-tested lever in DTC CRO — yet most founders ship the Shopify theme default and never revisit it. Every percentage point of PDP conversion is direct revenue on traffic they already paid for.

**Why Digitribe:** Manu runs the paid acquisition that lands on these pages, and the studio ships Shopify builds — so the report reflects what actually converts paid traffic, not a generic copywriting template. It's also a warm lead: a founder who buys a $29 teardown and sees the depth is a candidate for the studio's Shopify + paid retainer.

## 3. Pricing & packaging

- **$29**, one-time. Anchored well below an agency PDP teardown ($2k+) and inside impulse range for a founder testing one product page. Priced to match the Agent-Ready Kit so the conversion catalog has a consistent entry point.
- **Includes:** 1 run (3 re-runs in quota to re-test after edits or try a different product), the on-screen report, the copy rewrite as copy-pasteable blocks, the emailed PDF + JSON copy (Resend).
- **Upsell path:** the report's overall verdict routes warm leads → if the whole store (not one page) needs work, **agency CTA: "Want us to do this across your catalog + run the paid traffic?" → Digitribe DTC retainer**; a SaaS-curious buyer is routed to the **SaaS Pricing Teardown** ($29); a buyer who wants the lifecycle layer is routed to **DTC Email Flows** ($19).
- **Future tiers (note only):** a multi-product / whole-catalog batch and a Shopify-API-connected variant (live theme data, inventory, reviews) are v2 ideas — see §20. v1 ships one SKU, one page.

## 4. User stories / JTBD

- As a **DTC founder**, when my best product converts under 2% on paid traffic, I want to know exactly what to change on the page, so that I stop burning ad spend on a leaky PDP.
- As a **growth lead**, when I'm prioritizing a CRO sprint, I want the 3 highest-leverage fixes for this specific page, so that I ship the ones that move revenue first.
- As a **founder writing my own copy**, when my product description reads like a spec sheet, I want a benefit-led rewrite I can paste into Shopify, so that the page sells the outcome, not the feature list.
- As a **brand owner launching a new SKU**, when I have no conversion data yet, I want a senior teardown of the page before I drive traffic, so that I launch on a page that's already optimized.

**Primary job the artifact must nail:** produce a rewrite and fix list that are **unmistakably about this product** — the real product name, the real claimed benefits, the real price, the real gaps on the real page. A reader must not be able to swap in another product's report and have it fit. The copy rewrite must be paste-ready, benefit-led, and on-brand for DTC.

**Non-goals (v1):** does NOT edit the live Shopify store or push changes; does NOT need the Shopify Admin API (reads the public PDP only — see §20); does NOT do whole-site/IA work (one page); does NOT generate images or run A/B tests; does NOT guarantee a conversion lift (it gives senior, specific recommendations, not a promise).

## 5. Functional requirements

### Inputs

| Field            | Type                          | Validation                                                                      | Example                                 |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| `url`            | string (URL)                  | http/https, public, resolves, not an IP/localhost (SSRF guard, §15)             | `https://acme.com/products/blue-widget` |
| `brandContext`   | string (optional, ≤500 chars) | free text: positioning, audience, voice ("premium sleep brand for new parents") | `Eco DTC skincare, Gen-Z, playful`      |
| `targetAudience` | string (optional, ≤200 chars) | who this product is for, if not obvious from the page                           | `first-time home cooks`                 |
| `provider`       | enum                          | one of product's `byokProviders`                                                | `anthropic`                             |
| `byokKey`        | string (secret)               | non-empty; validated live pre-run (platform-spec §5)                            | `sk-…`                                  |

> No Shopify domain restriction is enforced at validation (a buyer may run it on a Shopify-on-custom-domain store); instead the pipeline **detects** whether the page is a Shopify PDP (§7) and the report states what it found. `brandContext`/`targetAudience` are the levers that make the rewrite DTC-tuned and on-voice (doc 03 §2.4).

### Processing (requirements level; pipeline in §7)

Crawl the single product URL (single-page variant of the Segment-1 crawler) → extract the PDP's structured content (title, price, description, bullets, variant options, image count/alt coverage, existing reviews/ratings markup, JSON-LD `Product`/`Offer`, above-the-fold elements, CTA text, detected Shopify signals) → assemble a compact **PDP digest** → AI step rewrites the copy benefit-first and grades the page across CRO dimensions, filling the Output Contract → render report + PDF + email.

### Outputs

A **PDP Optimization Report** (on-screen + PDF + JSON) containing the copy rewrite, the prioritized CRO fixes, the trust/social-proof recommendations, and the structure map. No code or file bundle (it's a report + paste-ready copy). Exact shape in §6.

### Constraints

- **Single page** crawl (the PDP) plus an optional same-origin fetch of the linked reviews/collection page if cheaply available; ≤ 3 fetches total; 8s per-fetch timeout; 30s total cap (stream progress).
- Respect `robots.txt`; identify as `DigitribeCROBot/1.0`.
- Crawl **public pages only**. No login, no cart manipulation, no order placement.
- `maxOutputTokens` capped (doc 04 §10) so one run stays well under $0.15 on the buyer's key.

## 6. ⭐ Output Contract

> The locked schema the AI step is forced to fill (`AiRunner.structured`, doc 04 §7; platform-spec §5). The contract encodes the **answer-first** hierarchy (doc 03 §2.2): overall verdict + score → the single biggest opportunity → the benefit-led rewrite → prioritized CRO fixes → trust/social-proof → structure map. The deterministic crawl supplies `observed` page facts; the AI rewrites and grades **within them** — it may not invent product facts, prices, or claims not present on the page or in `brandContext`.

```ts
// server/store/schemas/shopify-pdp-optimizer.ts
import { z } from 'zod'

const CroDimension = z.object({
  key: z.enum([
    'copy_clarity', // is the copy benefit-led, scannable, outcome-first?
    'value_proposition', // is the core promise obvious above the fold?
    'trust_signals', // reviews, guarantees, badges, shipping/returns clarity
    'visual_hierarchy', // price/CTA prominence, scannability, above-the-fold use
    'friction', // variant confusion, unclear CTA, missing answers (sizing, shipping)
    'social_proof', // ratings, UGC, review depth, testimonials present & used
  ]),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['missing', 'partial', 'good']),
  findings: z.array(z.string()).max(6), // specific to THIS page, observed facts
  fixes: z.array(z.string()).max(6), // prioritized, actionable, page-specific
})

const RewriteBlock = z.object({
  block: z.enum([
    'product_title',
    'subhead',
    'hero_paragraph',
    'benefit_bullets',
    'cta_label',
    'faq', // objection-handling Q&A
  ]),
  label: z.string(),
  current: z.string().max(800), // what's on the page now (verbatim from crawl, "" if absent)
  rewrite: z.string().max(1200), // benefit-led, paste-ready, DTC-voiced
  why: z.string().max(280), // the conversion rationale for this rewrite
})

const TrustRecommendation = z.object({
  element: z.string(), // e.g. "Money-back guarantee badge", "First-fold star rating"
  present: z.boolean(), // is it on the page today?
  recommendation: z.string().max(280), // what to add / change, specific to this product
  impact: z.enum(['high', 'medium', 'low']),
})

export const ShopifyPdpOptimizerOutput = z.object({
  page: z.object({
    url: z.string().url(),
    productName: z.string(),
    detectedPrice: z.string().nullable(), // as shown on page, e.g. "$49.00"; null if not parseable
    isShopify: z.boolean(), // detected Shopify storefront signals
    detectedReviews: z.object({
      hasRatingMarkup: z.boolean(),
      ratingValue: z.number().nullable(),
      reviewCount: z.number().int().nullable(),
    }),
    imageCount: z.number().int(),
    altCoveragePct: z.number().int().min(0).max(100), // accessibility + SEO signal
    detectedEntities: z.array(z.string()).max(20), // variants, materials, claimed benefits
    contentDepth: z.enum(['thin', 'moderate', 'rich']), // honest read of how much to work with
  }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  headlineVerdict: z.string().max(280), // the single most important sentence (answer-first)
  biggestOpportunity: z.string().max(400), // the #1 highest-leverage change, named concretely
  dimensions: z.array(CroDimension).length(6),
  rewrite: z.array(RewriteBlock).min(3), // at least title, hero paragraph, bullets
  trustRecommendations: z.array(TrustRecommendation).min(3).max(8),
  structureMap: z.object({
    // before→after page section order, for the visual structure diagram
    current: z.array(z.string()).max(12), // sections in current page order
    recommended: z.array(z.string()).max(12), // recommended reorder, benefit-first
    rationale: z.string().max(400),
  }),
  topActions: z.array(z.string()).min(3).max(5), // the 3–5 things to do first, ranked by impact
  upsell: z.object({
    needsCatalogWork: z.boolean(), // → agency DTC retainer (whole store, not one page)
    needsLifecycle: z.boolean(), // → DTC Email Flows (capture the traffic this page wins)
    reason: z.string(),
  }),
})
export type ShopifyPdpOptimizerOutput = z.infer<typeof ShopifyPdpOptimizerOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded, via report renderer, platform-spec §8) · **JSON** (the raw contract). The rewrite blocks render with per-block **copy buttons** (doc 06 §FileViewer pattern) so the buyer can paste each into Shopify. No ZIP (no file bundle).
- **Field notes:** `score`/`grade` use the fixed 0–100 / A–F scale (deterministic mapping: A ≥90, B ≥75, C ≥60, D ≥40, F <40, same as the Kit so the catalog reads consistently). `detectedPrice`, `detectedReviews`, `imageCount`, `altCoveragePct`, `isShopify` are **deterministic facts from the crawl**, never generated. `contentDepth` is a deterministic heuristic the AI must respect (a `thin` page yields honest "limited content — here's the structure to add," not confident fabrication; doc 03 §2.5).
- **Determinism:** `dimensions[].key` is always the same 6, always length 6 — the report layout relies on it. `structureMap.current` is derived from the crawl, not invented.

## 7. System logic / pipeline

```
POST /api/store/run/shopify-pdp-optimizer  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod) + SSRF guard      emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ CRAWL  crawlPdp(url) — single-page variant of           emit{phase:"crawl",pct:15..50,
  │     server/store/tools/agentic/crawl.ts                     message:"Reading product page…"}
  │     - fetch the PDP (SSRF-guarded, robots-respecting)
  │     - extract: <title>, og/meta, JSON-LD Product/Offer,
  │       visible price, description body, bullet lists,
  │       variant <select>/swatches, image count + alt coverage,
  │       review/rating markup (Product.aggregateRating, app blocks),
  │       CTA button text, above-the-fold section order
  │     - detect Shopify signals: cdn.shopify.com assets,
  │       /products/ path, Shopify meta, theme markers → isShopify
  │     - (optional) one same-origin fetch of a linked reviews page
  │     → PdpDigest { productName, price, sections[], reviews, signals }
  │
  ├─ ANALYZE  scorePdp(PdpDigest)                            emit{phase:"analyze",pct:55,
  │     - deterministic checks → per-dimension base status      findingCount: n}
  │       (e.g. no rating markup → social_proof:missing;
  │        price below the fold heuristics → visual_hierarchy)
  │     - compute altCoveragePct, contentDepth
  │     - assemble compact digest for the AI step
  │
  ├─ GENERATE  ai.structured({                               emit{phase:"generate",pct:60..92,
  │     system: PDP_OPTIMIZER_SYSTEM,          // §9                message:"Rewriting copy…"}
  │     prompt: buildPrompt(pdpDigest, brandContext, targetAudience),
  │     schema: ShopifyPdpOptimizerOutput,     // §6 — SDK-enforced
  │     effort: "high",
  │   })  → ShopifyPdpOptimizerOutput          // structuredStream for progress
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:95}
  │     - on-screen JSON, branded PDF (no zip)
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — the rewrite quality IS the product. Crawl + analyze are deterministic Node, cheap, no AI cost to the buyer. Stream the object so the rewrite blocks fill in progressively (doc 03 §3).
- **Libraries:** reuse the Segment-1 crawler's fetch + HTML parser (`cheerio`/`linkedom` — whichever the Kit lands on) and JSON-LD extraction (`schema-dts` types for validation). No new libs.
- **Reuse:** `crawlPdp` is a thin `maxPages:1` configuration of the shared `crawlSite` in `server/store/tools/agentic/crawl.ts`, plus a `extractPdp` enricher (price/variant/review extraction) that is **shared with the SaaS Pricing Teardown's `extractPricing`** as sibling single-page extractors. Build the extractor generic over "a single conversion page" so both compose it.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — strongest at on-voice, benefit-led copy that stays factual to the page), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (faster, good enough for a content-rich page where the structure is already strong). Per platform-spec §5.
- **Buyer cost expectation** (show in UI, doc 03 §5): one run is a single structured generation over a compact one-page digest (~few K input tokens) → typically **well under $0.10 on the buyer's key**. Set the expectation so there's no bill surprise.
- **Pre-run validation:** a 1-token ping via the AI wrapper (`AiRunner.ping`, doc 04 §7); on failure return edge #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by the AI SDK `generateObject`/`streamObject` against `ShopifyPdpOptimizerOutput` (doc 04 §7) — the model cannot return free-form.

**System prompt (draft):**

```
You are a senior DTC conversion strategist and copywriter. You optimize Shopify
product pages the way a top ecommerce studio does: restructure around the buyer's
desired outcome, rewrite feature-led copy into benefit-led copy, and add the trust
and social-proof elements that de-risk a first purchase.

You are given a structured digest of ONE crawled product page plus optional brand
context and target audience. Produce a SITE-SPECIFIC PDP Optimization Report.

Rules:
- Use ONLY facts present in the digest plus the owner's brandContext/targetAudience.
  Never invent product attributes, prices, ingredients, claims, ratings, or reviews.
  If the page is thin, say so honestly and recommend the structure to add — do not
  fabricate content to fill it.
- The copy rewrite must be PASTE-READY and benefit-led: lead with the outcome the
  buyer gets, not the feature. Keep the brand's voice (use brandContext); for a DTC
  buyer the copy should feel DTC — punchy, concrete, human — not corporate.
- Every fix and finding must reference THIS page concretely (the real product name,
  the real gap), never a generic "improve your copy."
- Grade each CRO dimension honestly against what the digest shows. Do not inflate.
  No rating markup detected → social_proof cannot be "good."
- Prioritize ruthlessly: topActions and biggestOpportunity are the 3–5 changes that
  move conversion most, in order. A wall of 30 tweaks is not the deliverable.
- No marketing fluff, no "In today's fast-paced ecommerce landscape," no hedging,
  no restated prompt. Senior, plain, specific.
```

**User prompt template:** `buildPrompt(pdpDigest, brandContext, targetAudience)` serializes the crawl digest (product name, price, current copy blocks verbatim, bullets, variants, image/alt stats, review markup, detected entities, content depth, per-dimension base status from the deterministic analyzer) plus the owner's optional brand context and audience.

**Model + effort per call:** one call, `effort: "high"` — this is the single artifact and copy quality is the value. (No cheap classification pass; the deterministic analyzer already supplies base statuses.)

**Guardrails:** schema enforcement prevents shape drift; the "ONLY facts in the digest" rule + the deterministic `current`/`detectedPrice`/`detectedReviews` fields curb hallucinated product facts; honest-grading instruction + deterministic base statuses anchor the scores; `contentDepth: "thin"` forces honest low-content handling (doc 03 §2.5). Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

> Every row is also a test in §18.

| #   | Trigger                                       | Detection                         | Behavior / message                                                                                                 | Quota     |
| --- | --------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- |
| 1   | Invalid/expired BYOK key                      | pre-run ping fails                | "Your `<provider>` key looks invalid or expired — check and retry."                                                | not spent |
| 2   | URL unreachable / DNS fail / 5xx              | fetch fails                       | "We couldn't reach `<url>`. Is the product page public and live?"                                                  | not spent |
| 3   | URL is IP/localhost/private range             | input validation (SSRF guard)     | reject at form: "Enter a public product-page URL."                                                                 | not spent |
| 4   | URL isn't a product page (collection/home)    | no Product/Offer + no PDP markers | "This looks like a `<type>` page, not a product page — paste a single product URL." (offer to proceed best-effort) | not spent |
| 5   | Not a Shopify store                           | no Shopify signals                | proceed anyway; report sets `isShopify:false` and notes recs are Shopify-oriented but apply broadly                | spent     |
| 6   | JS-only PDP (price/copy rendered client-side) | near-empty SSR body / no price    | proceed with what's renderable; flag `contentDepth:thin` + `visual_hierarchy` finding; honest low score            | spent     |
| 7   | Thin page (few words, no bullets/reviews)     | `contentDepth` heuristic          | deliver honest report: "limited content — here's the structure + copy to add," no fabrication                      | spent     |
| 8   | Provider rate-limit / timeout mid-generate    | AI wrapper error                  | retry once w/ backoff; if still failing, error + restore quota                                                     | restored  |
| 9   | Model returns thin/low-confidence rewrite     | rewrite block length heuristic    | still deliver; report flags "add brand context for a sharper rewrite"                                              | spent     |
| 10  | Duplicate submit (double-click)               | same `runId` (idempotency §6)     | return in-flight/cached result; never double-charge                                                                | n/a       |
| 11  | `robots.txt` disallows the PDP path           | robots-parser                     | "This page blocks automated reading — we can't analyze it." (no partial fabrication)                               | not spent |
| 12  | Non-HTML URL (image/PDF/app)                  | content-type check                | "This URL isn't a crawlable product page."                                                                         | not spent |
| 13  | Quota exhausted                               | token check                       | "You've used all 3 runs — buy again or contact us." + buy CTA                                                      | n/a       |

Provider rate-limit/timeout, partial results, low-confidence, abusive/SSRF input, network failure mid-fetch, and duplicate submit are all covered above and map to the doc 04 §5 `StoreError` codes.

## 11. UX / UI flow

**Sales page** (`/store/shopify-pdp-optimizer`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states** (the generic 8-state machine, doc 06 §4 — this product only adds its input fields and `ArtifactView`):

- **Empty / collecting input:** product-URL field (big, primary, with "paste your Shopify product link" helper), advanced disclosure (brandContext textarea, targetAudience), provider select + `KeyInput` (with "where do I get a key?" popover + "we never store your key" line), **Run** disabled until URL valid.
- **Validating key:** inline ✓/✗ on the key field (`/key-check`), never a full-page block.
- **Running:** full-width `RunProgress` driven by SSE — real labels ("Reading product page…", "Rewriting copy…"), progress bar, a rotating DTC-CRO tip ("Why benefit-led beats feature-led"), `aria-live="polite"`. Stream the rewrite blocks in as they arrive.
- **Partial:** if the optional reviews fetch failed, a non-blocking banner; continue to success.
- **Success / artifact view** (`components/store/artifacts/shopify-pdp-optimizer.tsx`):
  - Top: **overall grade + score** (`ScoreRing`), product name, `headlineVerdict`, and the **biggest opportunity** in a callout.
  - **6 CRO dimension cards** (`DimensionCard`: score, status chip, findings, fixes).
  - **Copy rewrite** as `FileViewer`-style blocks: each block shows `current` vs `rewrite` side-by-side with a per-block **copy button** and the `why`.
  - **Trust / social-proof** recommendations as a checklist (present/absent chip + impact).
  - **Structure map**: a before→after section-order diagram (`StatMatrix`-style inline SVG).
  - **Top 3–5 actions** list (ranked).
  - **Downloads**: **PDF** (primary), **JSON**, **Email me a copy** (pre-checked, auto-sent).
  - **Upsell card**: if `upsell.needsCatalogWork` → agency DTC-retainer CTA; if `upsell.needsLifecycle` → DTC Email Flows; always a soft "want us to do this across your store + run the ads?" agency CTA.
- **Error:** human message per §10 + one-click retry (key kept in memory for the session, never lost input).
- **Quota-exhausted:** gentle message + buy-again CTA.

Components from the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `DimensionCard`, `FileViewer`, `SeverityChip`, `StatMatrix` (doc 06 §2). Run states follow doc 06 §4; copy tone per `PROJECT_VISION.md` (senior, plain, confident — and DTC-energy in the rewrite samples); density + tokens per doc 06 §1.

## 12. SEO

- **Target keyword(s):** "Shopify product page optimizer," "Shopify PDP CRO," "rewrite Shopify product description," "Shopify conversion audit" (tool + informational intent).
- **`generateMetadata`:** title `Shopify PDP Optimizer — Rewrite & Fix Your Product Page` (≤60); description: "Paste a Shopify product URL and get a benefit-led copy rewrite plus the prioritized CRO and trust fixes that lift conversion. Instant, $29." (≤155). Canonical `/store/shopify-pdp-optimizer`. OG via `@vercel/og` (grade-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What does the report include?", "Does it work on non-Shopify stores?" (yes, recs are Shopify-tuned but apply broadly), "Do you store my API key?" (no), "Do you edit my live store?" (no — you get paste-ready copy), "Will this guarantee more sales?" (it's senior, specific guidance, not a promise).
- **Internal links:** marketing `/dtc` and `/audit` → here; blog posts on Shopify CRO → here; sibling **DTC Email Flows** (lifecycle layer) and **SaaS Pricing Teardown** (the SaaS counterpart).
- **Programmatic surface (note):** with buyer consent, anonymized example reports could become indexable `/store/shopify-pdp-optimizer/examples/<slug>` pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA (doc 06 §5): every input labeled; provider/key in a `<fieldset>` with legend; `RunProgress` region `role="status"` + `aria-live="polite"`; focus moves to the report `<h2>` on success; grade/status chips pair color with icon + word (never color-only); copy buttons announce "copied"; the before→after structure diagram has a text alternative.
- Mobile: single-column; the `current` vs `rewrite` side-by-side stacks; dimension cards and trust checklist stack; downloads full-width. The artifact is first-class on mobile, not a desktop afterthought.
- Error recovery: inline, non-destructive (input preserved); "retry" re-runs without re-entering the key (kept in memory for the session only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route (doc 05 §6).

## 14. Payment integration

- Create Polar product **"Shopify PDP Optimizer" $29** (sandbox + live). Checkout metadata `{ slug: "shopify-pdp-optimizer" }`. Everything else per platform-spec §9 — nothing product-specific.
- **Refund stance:** one-click refund honored if the run never produced a valid report (rare). Quota auto-restores on system-side failures (§10 #8).

## 15. Security & privacy

- **Buyer data:** the target product URL + the crawled **public** PDP content + optional brand/audience context. Retention: crawl content used transiently for the run; the artifact (report) stored 30d (KV/Blob TTL) for re-download, then purged (platform-spec §10).
- **Product-specific risks:**
  - **SSRF** — the primary risk (shared with all URL-input products). Reuse the Segment-1 crawler's guard: block private IP ranges, localhost, link-local, cloud-metadata IPs (169.254.169.254), non-http(s) schemes; resolve DNS and re-check the resolved IP; cap redirects; force same-origin for the optional second fetch. Reject at input + enforce in fetch.
  - **Untrusted HTML** — parse, never execute; sanitize before display; never `dangerouslySetInnerHTML` of crawled content or of the AI's `current`/`rewrite` strings.
- Shared rules (key handling, rate-limit, webhook verify) per platform-spec §10 — only the deltas above are product-specific. The SSRF guard is a launch blocker.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `pdp_grade: { grade }`, `pdp_copy_copied: { block }` (which rewrite blocks get copied — signals value), `pdp_pdf_download`, `pdp_upsell_click: { target }`.
- **Activation:** purchase → first run that produces a valid report. **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), copy-block copy rate (a proxy for "the rewrite was actually used"), upsell CTR to the DTC retainer.

## 17. Development phases

> Vertical slices, each shippable/testable.

- **Phase 0 — Scaffold.** Registry entry (`shopify-pdp-optimizer`), Polar sandbox product, routes, empty `ShopifyPdpOptimizerOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Crawl + contract (no AI).** Single-page `crawlPdp` + `extractPdp` + `scorePdp` + input/output schemas; pipeline returns a schema-valid contract from a **fixture PDP** with the AI step mocked. _AC: unit test: fixture PDP → valid `ShopifyPdpOptimizerOutput`; deterministic fields (price, reviews, alt%) correct; SSRF guard tests pass._
- **Phase 2 — Real run + UI.** Wire BYOK + `ai.structured` (live AI), all 8 UI states, the `ArtifactView` (rewrite blocks with copy buttons + structure map), report render + PDF + Resend email. _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase gate.** Sales page copy, metadata, JSON-LD, OG card, analytics, upsell card. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria:**
  - [ ] Sample output asset (anonymized real PDP teardown) on the sales page + storefront card.
  - [ ] Artifact leads with the headline verdict + biggest opportunity, prioritized by impact.
  - [ ] Output is provably input-specific (eval `input_specific` judge passes — doc 03 §2.1).
  - [ ] Designed data-viz: the `ScoreRing` + the before→after structure-map SVG (doc 03 §2.3).
  - [ ] Branded, designed PDF export (not a screenshot).
  - [ ] Rewrite blocks have copy buttons + labels + the `why` rationale.
  - [ ] Running state streams real phases + shows the rewrite filling in (doc 03 §3).
  - [ ] All 8 UI states designed (doc 06 §4) — no default spinners/blank screens.
  - [ ] "We never store your key" + retention + expected-cost visible (doc 03 §5).
  - [ ] AI-tells absent (filler/hallucination eval passes — doc 03 §2.5); DTC voice present.
  - [ ] Senior copy throughout; `impeccable`/`taste` pass on artifact + sales page; `ui-ux-pro` + axe on the tool UI.
  - [ ] Mobile artifact view is first-class.
        _AC: checklist all green; axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified. _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)            | Test                                                                |
| --------------------- | ------------------------------------------------------------------- |
| #1 key invalid        | unit: pre-run ping mock rejects → error, quota intact               |
| #3 SSRF               | unit: IP/localhost/metadata URLs rejected at validate + fetch       |
| #4 not a product page | unit: collection/home digest → "not a product page" path            |
| #6 JS-only PDP        | unit: empty SSR → `contentDepth:thin`, honest score, still delivers |
| #7 thin page          | unit: sparse PDP → no fabrication, structure-to-add recs            |
| #8 AI timeout         | integration: provider error → retry → quota restored on final fail  |
| #10 duplicate         | integration: same `runId` returns cached, no double quota           |

Full method, fixtures, canonical mocks, the provider×input×failure **scenario matrix**, sandbox-E2E, eval golden-set format + judges, and CI gates are in [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific eval expectations: ~8–12 real Shopify PDPs with expected grade bands + `mustFlag` dimensions (e.g. a no-reviews page MUST flag `social_proof`) + `mustMention` entities (the real product name + at least one real claimed benefit); judges `input_specific`, `no_ai_tells`, `factual` (every fact/price/claim in the rewrite traces to the page), `format_valid` (rewrite blocks non-empty and within length). Threshold ≥ 0.85, zero fabrication.

**The one test that matters most:** fixture PDP (HTML fixture) → pipeline (mocked AI returning a fixed object) → **valid `ShopifyPdpOptimizerOutput`** with correct deterministic fields (price, review markup, alt coverage).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine), from [`../04-implementation-contracts.md`](../04-implementation-contracts.md): `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. The spine modules this depends on must already pass `segment-0-spine` DoR.
- **New libs:** none beyond what the Segment-1 crawler already adds (`cheerio`/`linkedom`, `robots-parser`, `fast-xml-parser`).
- **Cross-product reuse:** `crawlPdp`/`extractPdp` is the single-conversion-page extractor **shared with the SaaS Pricing Teardown** (`extractPricing` is its sibling). Build `server/store/tools/agentic/extract-page.ts` generic now.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` **Shopify-API enrichment** — v1 reads the public PDP only (no Admin/Storefront API, no auth). A v2 "connect your store" mode could pull live theme content, full review datasets, variant inventory, and even write back the rewrite as a draft — but that needs OAuth, an app listing, and per-store consent. Defer; mark as the headline v2 enhancement.
- `OPEN QUESTION:` whether to do the optional second fetch (reviews/collection page) in v1 or ship single-fetch only — lean single-fetch for the 30s budget, add the second fetch behind a flag.
- `OPEN QUESTION:` review-data fidelity from markup alone — many Shopify review apps render reviews client-side; the report should be honest that it sees only what's in the markup (`detectedReviews.hasRatingMarkup`).
- **Risk — generic copy on a thin/JS-only page:** mitigation = `contentDepth` gate + honest low-content handling + the `brandContext`/`targetAudience` levers + the `input_specific`/`factual` eval judges as launch guards.
- **Risk — buyer expects us to edit their store:** mitigation = FAQ + report copy clearly scope this to paste-ready recommendations, not live changes.
- **Risk — SSRF (security):** mitigation = the shared Segment-1 guard, tested (§18); launch blocker.
- **Risk — buyer surprised by their own API cost:** mitigation = show expected per-run cost in the UI (§8).
  </content>
  </invoke>
