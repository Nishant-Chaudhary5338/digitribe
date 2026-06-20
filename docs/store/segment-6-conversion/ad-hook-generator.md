# Ad Angle & Hook Generator — PRD

**Slug:** `ad-hook-generator` · **Segment:** 6 · **Status:** draft
**Owner:** Manu (Grow) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The segment's **top-of-funnel tripwire** ($19, the cheapest SKU). Pure generation: a product + an offer + a channel → 20 scroll-stopping hooks/angles, organized by psychological angle, channel-native, DTC/SaaS-aware. _Optionally_ reuses the Segment-1 crawl spine to read a product URL; works from a text description alone otherwise. Lowest commitment, highest volume — the front door to the rest of the segment and to the agency's paid-ads service.

---

## 1. TL;DR

- **One-liner:** Give a product + an offer + a channel → get 20 scroll-stopping ad hooks and angles, organized and channel-native.
- **Problem:** Founders and marketers stare at a blank ad composer. They need _volume_ of genuinely different _angles_ (not 20 rewordings of one line) to test — the raw material a media buyer feeds into creative testing.
- **Buyer:** DTC and SaaS founders/marketers/media buyers who need ad creative angles to test, fast.
- **Input → Output:** a product URL _or_ description + an offer + a channel (Meta/Google/TikTok/LinkedIn) → **20 hooks/angles**, grouped by angle type, each channel-native, with a why-it-works note.
- **Price:** **$19** one-time (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~15–35s (no crawl) / ~30–50s (with URL crawl) · **Re-run quota:** 5 (more, because generation is cheap + buyers want variations).

## 2. Problem & market

**Today**, a marketer who needs ad angles either (a) brainstorms a handful and tests the same idea worded five ways, (b) hires a copywriter per batch, or (c) prompts a generic chatbot and gets bland, channel-blind, audience-blind lines ("Discover the power of Acme!"). What they actually need is **angle diversity** — pain-led, benefit-led, curiosity-led, social-proof-led, contrarian, etc. — in the register of the _specific channel_ (a TikTok hook ≠ a LinkedIn hook ≠ a Google headline) and tuned to DTC vs SaaS buying psychology. That's a media buyer's skill, and it's exactly Manu's lane.

**Competition:** generic AI copy tools (volume without angle diversity or channel-nativeness, ignore the real product); per-batch copywriters (slow, expensive). **Gap:** a cheap, instant tool that produces _organized, channel-native, audience-aware_ angle sets grounded in the _actual_ product — not 20 variations of one idea. The angle taxonomy + channel register is the senior method here.

**Killer insight:** in paid creative, the _angle_ (the psychological entry point) beats the _wording_ — testing 20 different angles finds winners that 20 rewordings never will. This tool gives a media buyer a test matrix on day one. _(`OPEN QUESTION:` source a creative-testing benchmark for sales copy in `../research-sources.md`; use a range.)_

**Why Digitribe:** Manu runs Meta/Google/TikTok/LinkedIn creative at operator level — channel-native hooks and angle diversity are his daily craft. This productizes the "give me angles to test" step that precedes every campaign, and it's the lowest-friction entry into the agency's Ads management.

## 3. Pricing & packaging

- **$19**, one-time — the cheapest SKU, deliberately. It's the tripwire: low enough to be an impulse, valuable enough to lead a buyer up to the $29 audits and the $49 flagship, and out to Ads management.
- **Includes:** 1 run (5 re-runs — generation is cheap and buyers iterate: new offer, new channel, more angles), the on-screen hook set, branded PDF (a tidy "angle test matrix" to hand a designer/buyer), JSON (importable into an ad tool/sheet), emailed copy (Resend).
- **Upsell / cross-sell path:**
  - In-artifact → "now make sure the page these clicks land on matches" → **Ad Message-Match** ($29) and **Conversion Teardown** ($29); "want us to run the creative + spend?" → **Meta/Google Ads management** (Manu) → free `/audit`.
  - It's the entry point of the segment funnel (README §funnel).
- **Future tiers (note only):** more channels (Pinterest, YouTube), variation expansion per winning angle, a "rewrite my winning ad into 10 variants" mode — v2. v1 is one SKU.

## 4. User stories / JTBD

- As a **media buyer**, when I'm briefing a new campaign, I want 20 _different angles_ to test, so that I find a winner faster than rewording one idea.
- As a **DTC founder**, when I'm launching a product, I want channel-native hooks for Meta/TikTok, so that I can start testing creative today.
- As a **SaaS marketer**, when I run LinkedIn/Google, I want professional, outcome-led angles, so that my ads speak to a B2B buyer.
- As a **founder without a copywriter**, I want a tidy set I can hand to a designer, so that creative production isn't blocked on me.

**Primary job the artifact must nail:** **angle diversity grounded in the real product** — 20 hooks across genuinely different psychological angles, each in the _channel's_ register and the _audience's_ (DTC/SaaS) psychology, each referencing the actual product/offer (no generic "Discover the power of…"). A reader must not be able to swap another product's hook set in.

**Non-goals (v1):** does NOT generate images/video (text hooks only); does NOT predict performance; does NOT write full ad bodies/long-form (hooks + angles + a short supporting line); does NOT manage or place ads.

## 5. Functional requirements

### Inputs

| Field         | Type                   | Validation                                                            | Example                         |
| ------------- | ---------------------- | --------------------------------------------------------------------- | ------------------------------- |
| `productUrl`  | string (URL, optional) | http/https, public, not IP/localhost (SSRF guard, §15) — if provided  | `https://acme.com/box`          |
| `description` | string                 | required if no `productUrl`; ≤1000 chars (what it is, who it's for)   | "Monthly snack box for offices" |
| `offer`       | string                 | required; ≤200 chars (the incentive/promise to feature)               | "50% off your first box"        |
| `channel`     | enum                   | `meta \| google \| tiktok \| linkedin`                                | `tiktok`                        |
| `audience`    | enum `dtc\|saas\|auto` | default `auto` (resolver, segment README §shared-logic 2)             | `dtc`                           |
| `tone`        | enum (optional)        | `bold \| playful \| premium \| professional \| auto` (default `auto`) | `playful`                       |
| `provider`    | enum                   | one of product's `byokProviders`                                      | `anthropic`                     |
| `byokKey`     | string (secret)        | non-empty; validated live pre-run (platform-spec §5)                  | `sk-…`                          |

> **At least one of `productUrl` or `description` is required** (schema `.refine`). `offer` and `channel` are always required. If a URL is given, a light 1-page crawl enriches the product understanding (§7); a description alone works fully.

### Processing (requirements level; pipeline in §7)

(Optionally crawl 1 page) → resolve audience → **AI generates 20 hooks across distinct angle types, channel-native + audience-aware**, filling the Output Contract → render hook set + PDF + email. Pure generation — no scoring/crawl is the _value_ (unlike the audits); the optional crawl only enriches grounding.

### Outputs

The **Hook Set**: 20 hooks grouped by angle type, each with the hook line, the angle label, a short supporting line, and a why-it-works note; plus the resolved product understanding and the cross-sell. Exact shape in §6.

### Constraints

- 20 hooks (fixed) across ≥5 distinct angle types so the set is a real test matrix, not variations.
- Optional crawl: 1 page only, 8s timeout, `robots.txt`, UA `DigitribeAgentReadyBot/1.0`.
- Hooks are short (channel-appropriate length caps in §6) — they're hooks, not paragraphs.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/ad-hook-generator.ts
import { z } from 'zod'

const Angle = z.enum([
  'pain', // lead with the problem/frustration
  'benefit', // lead with the outcome/transformation
  'curiosity', // open loop / pattern interrupt
  'social_proof', // others like you / numbers / testimonial-shaped
  'offer', // lead with the incentive/urgency
  'contrarian', // challenge a belief / "stop doing X"
  'identity', // "for people who…" / belonging
  'objection', // pre-empt the #1 hesitation
])

const Hook = z.object({
  angle: Angle,
  hook: z.string().max(150), // the scroll-stopping line itself (channel-appropriate length)
  support: z.string().max(200), // a short supporting line / next beat
  whyItWorks: z.string().max(200), // the senior rationale — what psychological lever it pulls
})

export const AdHookOutput = z.object({
  product: z.object({
    name: z.string(), // resolved from URL or description
    summary: z.string().max(300), // the model's understanding of what's being sold
    audience: z.enum(['dtc', 'saas']), // resolved (never 'auto')
    source: z.enum(['url', 'description', 'both']), // how the product was understood
  }),
  campaign: z.object({
    channel: z.enum(['meta', 'google', 'tiktok', 'linkedin']),
    offer: z.string().max(200),
    tone: z.enum(['bold', 'playful', 'premium', 'professional']), // resolved
    channelNote: z.string().max(240), // why these hooks fit THIS channel's register
  }),
  hooks: z.array(Hook).length(20), // exactly 20
  anglesCovered: z.array(Angle).min(5), // proof of diversity — ≥5 distinct angles
  topPicks: z.array(z.number().int().min(0).max(19)).min(3).max(5), // indices of the strongest to test first (answer-first, doc 03 §2.2)
  crossSell: z.object({
    // shared Segment-6 fragment (segment README §shared-logic 4)
    service: z.enum(['meta_ads', 'google_ads', 'ad_message_match', 'conversion_teardown']),
    reason: z.string().max(280), // honest, input-specific
  }),
})
export type AdHookOutput = z.infer<typeof AdHookOutput>
```

- **Export formats:** on-screen set (React, grouped by angle) · **branded PDF** (a tidy "angle test matrix" to hand a designer/buyer) · **JSON** (importable into a sheet/ad tool — the per-hook copy buttons make it usable immediately). No zip.
- **Field notes:** `hooks` is **exactly 20**; `anglesCovered.min(5)` _enforces diversity in the schema_ (the model can't return 20 variations of one angle and pass). `topPicks` are indices into `hooks` — the prioritized few to test first (answer-first). `whyItWorks` encodes the senior rationale, which is what separates this from generic copy output.
- **Determinism:** always 20 hooks, ≥5 distinct angles, `topPicks` 3–5; the grouped layout relies on it. The copy is generative but constrained to schema + input-only-facts (no invented product claims, §9).

## 7. System logic / pipeline

```
POST /api/store/run/ad-hook-generator  { token, byokKey, input }
  │
  ├─ [verify] token + quota                                 emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod, SSRF if URL,     emit{phase:"validate",pct:10}
  │     .refine: productUrl OR description; offer+channel req)
  ├─ [validate] BYOK key live ping                          emit{phase:"key",pct:15}
  │
  ├─ (OPTIONAL) CRAWL  if productUrl:                        emit{phase:"crawl",pct:20..40,
  │     crawlSite(productUrl,{maxPages:1,maxDepth:0})         message:"Reading your product page…"}
  │     [SHARED Segment-1 spine — tools/agentic/]
  │     - extract product name, value props, offer, proof
  │     → ProductDigest   (skipped entirely if description-only)
  │
  ├─ RESOLVE audience  resolveAudience(input, crawl?)       emit{phase:"analyze",pct:45}
  │     [SHARED Segment-6 helper] → 'dtc' | 'saas'
  │
  ├─ GENERATE  ai.structuredStream({                        emit{phase:"generate",pct:50..92,
  │     system: HOOK_SYSTEM,                   // §9          partial: hooks[] fill in as
  │     prompt: buildPrompt(productDigest|description,        generated, grouped by angle,
  │             offer, channel, audience, tone),              findingCount: hooksSoFar}
  │     schema: AdHookOutput,                  // §6 SDK-enforced (20 hooks, ≥5 angles)
  │     effort: "medium",                      // generation, not deep analysis — cost-aware
  │   })  → AdHookOutput
  │
  ├─ RENDER  report.build(output) (screen + PDF + JSON)     emit{phase:"render",pct:95}
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl } emit{phase:"done",pct:100}
```

- **AI call count:** one structured generation. `effort: "medium"` (not "high") — this is creative generation over a small input, not multi-dimensional analysis; keeps the buyer's cost low and the run fast. The crawl is **optional and skipped** for description-only input — most runs have no crawl at all (the fastest product in the segment).
- **Libraries:** the shared crawler (reused from Segment 1) _only_ when a URL is given. No other new libs.
- **Reuse note:** crawl spine = `server/store/tools/agentic/` (optional). Audience resolver + anti-AI-tell scaffolding = shared Segment-6 (`prompts/conversion/_shared.ts`). The angle taxonomy is product-specific here (could be shared with a future `dtc-email-flows`/copy products).

## 8. BYOK handling

- Providers: `anthropic` (default `claude-opus-4-8` — best at genuinely diverse, non-generic angles), `openai`, `google`. **Cheaper option recommended in UI:** `claude-haiku-4-5` — for a generation task this is often _good enough_ and the cheapest run in the store; surface it prominently here.
- **Buyer cost expectation** (show in UI): one `medium`-effort generation, small input → typically **a few cents** on the buyer's key (the lowest of any product). Say so — it reinforces the $19 impulse.
- **Pre-run validation:** 1-token ping; on failure → error #1, no quota spent.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8` (or `claude-haiku-4-5` for cost), `effort: "medium"`. Structured output enforced by AI SDK `generateObject`/`streamObject` against `AdHookOutput` (§6) — and the schema's `length(20)` + `anglesCovered.min(5)` _force_ diversity, not just shape.

**System prompt (`HOOK_SYSTEM`, draft):**

```
You are a senior paid-social/search creative strategist generating AD HOOKS to TEST.
You are given a product (a description and/or a crawled page), an offer, a channel
(meta | google | tiktok | linkedin), and an audience (DTC or SaaS).

Produce EXACTLY 20 hooks spanning AT LEAST 5 distinct angles: pain, benefit, curiosity,
social_proof, offer, contrarian, identity, objection. The value is ANGLE DIVERSITY — do
NOT return 20 rewordings of one idea. Each hook is a different psychological entry point.

Rules:
- Ground every hook in the ACTUAL product and offer given. Never invent a feature, claim,
  statistic, or testimonial that isn't supported by the input. (Social-proof angles must
  be phrased as testable framings, not fabricated quotes/numbers.)
- Write in the CHANNEL's native register:
  - tiktok: punchy, casual, pattern-interrupt, first 3 words matter, lowercase ok
  - meta: scroll-stopping, benefit/curiosity, emoji sparingly if on-brand
  - google: tight headline-style, search-intent, no fluff, character-disciplined
  - linkedin: professional, outcome/credibility-led, no hype
- Be AUDIENCE-aware. DTC: desire, identity, urgency, lifestyle. SaaS: outcome, time/cost
  saved, objection handling, who-it's-for.
- Respect the requested tone if given.
- `whyItWorks` states the lever in one senior sentence — no filler, no "this hook is great".
- `topPicks` are the 3–5 you'd test first and why-strong, not random.
- No "Discover the power of", no "In today's fast-paced world", no emoji-soup, no hype
  clichés. If a line reads like generic AI ad copy, replace it.
```

**User prompt template:** `buildPrompt(productDigest|description, offer, channel, audience, tone)` → serializes the product understanding (crawl digest if a URL was given, else the description) + offer + channel + resolved audience + tone.

**How 2.1–2.5 (doc 03) are met:** grounded-in-the-real-product → input-specific (2.1); `topPicks` + grouped-by-angle structure is answer-first + prioritized (2.2); the angle grouping + diversity is the designed structure (2.3 — `anglesCovered` viz, e.g. a small angle-coverage chip row); channel + DTC/SaaS + tone branches (2.4); the explicit ban list + "replace generic AI copy" rule kills AI-tells (2.5 — the central risk for a generation product).

**Guardrails:** schema enforcement _including the diversity constraint_ (`length(20)` + `anglesCovered.min(5)`); "ground in the real product, fabricate nothing"; the explicit AI-cliché ban list (this product's biggest quality risk is generic output); refusal/empty per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                     | Detection                     | Behavior / message                                                              | Quota                       |
| --- | ------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- | --------------------------- |
| 1   | Invalid/expired BYOK key                    | pre-run ping fails            | "Your `<provider>` key looks invalid or expired — check and retry."             | not spent                   |
| 2   | Neither `productUrl` nor `description`      | schema `.refine`              | form error: "Describe your product or paste its URL."                           | not spent                   |
| 3   | Missing `offer` or `channel`                | schema required               | inline field error                                                              | not spent                   |
| 4   | `productUrl` unreachable / 5xx              | fetch fails                   | proceed from `description` if present, else "We couldn't reach that URL."       | not spent if no description |
| 5   | `productUrl` is IP/localhost/private (SSRF) | input validation guard        | reject at form: "Enter a public website URL."                                   | not spent                   |
| 6   | Provider rate-limit/timeout mid-generate    | AI wrapper error              | retry once w/ backoff; if still failing, error + restore quota                  | restored                    |
| 7   | Model returns <20 hooks or <5 angles        | schema parse fails            | retry once with a stricter instruction; if still failing, clean error + restore | restored                    |
| 8   | Thin description (too vague to ground)      | input length/heuristic        | still generate, but note "add detail for sharper hooks" + lean on the offer     | spent                       |
| 9   | Duplicate submit (double-click)             | same `runId` (idempotency §6) | return cached/in-flight; never double-charge                                    | n/a                         |
| 10  | Quota exhausted                             | token check                   | "You've used all 5 runs — buy again or contact us." + buy CTA                   | n/a                         |

## 11. UX / UI flow

**Sales page** (`/store/ad-hook-generator`) → **Buy** → Polar → **success** → **tool UI** (`/store/use/[token]`). Sales page hero: a sanitized real hook set grouped by angle, with the angle-coverage chips visible (doc 03 §1) — the diversity is the visible promise.

**Tool UI states** (all 8, doc 06 §state-chart):

- **Empty / collecting:** a **product panel** (paste `productUrl` _or_ write a `description` — tabbed/either-or with the refine), `offer` field, `channel` select (with channel icons), `audience` toggle + `tone` (advanced); provider + BYOK key (with "we never store your key" + "this is our cheapest run — a few cents on your key"); **Generate hooks** button (disabled until product + offer + channel + key valid).
- **Validating key:** inline ✓/✗.
- **Running:** live SSE progress — "(Reading your product page…)", "Generating angles…", "12/20 hooks," with `findingCount`; hooks fill in progressively, grouped by angle as they arrive (`structuredStream`); rotating "why angle diversity beats reworded copy" micro-education. `aria-live="polite"`.
- **Partial:** non-blocking banner; continue.
- **Success / artifact view (`components/store/artifacts/ad-hook-generator.tsx`):**
  - Top: **product summary + audience + channel + tone chips** + an **angle-coverage row** (which of the 8 angles are present — designed proof of diversity).
  - **Top picks** — the 3–5 strongest to test first (the answer-first hero), each with its why-it-works.
  - **Hooks grouped by angle** — each group a labeled section; each hook a card with the hook line (big), support line, why-it-works, and a **copy button**; a **"copy all" / "export to sheet"** action.
  - **Downloads:** **Download PDF** (the test matrix), **Download JSON** (import to a sheet/ad tool), **Email me a copy** (pre-checked).
  - **Cross-sell card:** "make the page these clicks land on match" → Ad Message-Match / Conversion Teardown; "want us to run it?" → Ads management → `/audit`.
- **Error:** message per §10 + retry; input preserved.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer`/copy-blocks, `SeverityChip`/chips (doc 06 §2). Only new: the artifact body (grouped hooks + angle-coverage chips). Density/tokens per doc 06 §1; copy senior per `PROJECT_VISION.md`.

## 12. SEO

- **Target keyword(s):** "ad hook generator," "facebook ad angles," "tiktok ad hooks," "ad copy angles to test," "ad headline generator" (tool + high-volume commercial intent — the broadest-demand product in the segment).
- **`generateMetadata`:** title `Ad Hook Generator — 20 Scroll-Stopping Angles to Test` (≤60); description: "Give your product + offer + channel and get 20 channel-native ad hooks across distinct angles, ready to test. Meta, Google, TikTok, LinkedIn. DTC/SaaS-aware. $19." (≤155). Canonical `/store/ad-hook-generator`. OG via `@vercel/og` (angle-grid visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs: "How many hooks?" (20, across ≥5 angles), "Which channels?" (Meta, Google, TikTok, LinkedIn), "Are they channel-native?" (yes — a TikTok hook ≠ a LinkedIn one), "Do I need a URL?" (no — a description works; a URL sharpens it), "Do you store my API key?" (no), "Can I export them?" (yes — PDF + JSON).
- **Internal links:** marketing paid-ads service ↔ here; siblings (Ad Message-Match, Conversion Teardown); free `/audit`. As the cheapest/broadest tool, it's a top internal-link target from CRO/ads blog posts.
- **Programmatic surface (note):** angle-type explainer pages or anonymized example sets as indexable pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: labeled inputs; product URL-or-description as an accessible either/or (tabs with real `tablist` or a clearly-labeled radio + field); provider/key `<fieldset>`; `RunProgress` `role="status"` + `aria-live="polite"`; focus to artifact `<h2>` on success; angle-coverage chips never color-only (label + icon).
- Each hook's copy button announces "copied"; "copy all" is keyboard-reachable.
- Mobile: single-column; angle groups stack; copy buttons full-width; downloads full-width.
- Error recovery: inline, non-destructive (input preserved); retry without re-entering the key.
- Gate CI on `@axe-core/playwright`.

## 14. Payment integration

- Create Polar product **"Ad Hook Generator" $19** (sandbox + live). Checkout metadata `{ slug: "ad-hook-generator" }`. Else per platform-spec §9.
- **Refund stance:** one-click refund if the run never produced a valid hook set. Quota auto-restores on system-side failures (§10 #6, #7).

## 15. Security & privacy

- **Buyer data:** an optional product URL (+ crawled public page if given) and/or a product description + offer. Public pages only. Retention: any crawl content + the inputs used transiently for the run; artifact (hook set) 30d for re-download, then purged.
- **Product-specific risks:**
  - **SSRF** _only when a URL is given_ — the shared crawler guard (block private IPs, localhost, link-local, metadata IP, non-http(s); re-check resolved IP; cap redirects). Launch blocker for the URL path. (Description-only runs have no crawl, no SSRF surface.)
  - **Untrusted HTML** (URL path) — parse, never execute; sanitize before display.
  - Generation safety: the prompt forbids fabricated stats/testimonials; social-proof angles are framings, not invented quotes/numbers — a brand-safety + truthfulness guard.
- Shared rules per platform-spec §10 — deltas above only. (Lowest-risk product in the segment — mostly generation, crawl optional.)

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `hooks_complete` (channel, audience, anglesCount, `product.source`), `hooks_pdf_download`, `hooks_copy` (a hook copied — strong engagement), `hooks_copy_all`, `hooks_crosssell_click` (service).
- **Activation:** purchase → first run that produces a valid 20-hook set. **Target ≥ 90%** (highest in the segment — pure generation, fewest failure modes, no crawl-dependency by default).
- Watch: run-error rate (<3%), the schema-diversity retry rate (#7), refund rate (<3%), copy/copy-all rate (engagement quality), cross-sell CTR. As the funnel entry, track downstream purchase of $29/$49 products by hook-generator buyers.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`ad-hook-generator`), Polar sandbox product, routes, empty `AdHookOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Pipeline core (description-only, no live AI).** Input/output schemas (with the URL-or-description refine + the 20/≥5 diversity constraints); pipeline returns a schema-valid hook set from a **fixture description**, AI mocked, **no-crawl path first**. _AC: unit test: fixture → valid `AdHookOutput` (20 hooks, ≥5 angles); refine + diversity rejection tests pass._
- **Phase 2 — Real run + optional crawl + UI.** Wire BYOK + `structuredStream` (live AI); wire the optional 1-page crawl (reused Segment-1 spine) for the URL path; all UI states; report + PDF + JSON + Resend email; the grouped-by-angle artifact + copy buttons. _AC: E2E activation green in sandbox (both description-only and URL paths) with a test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6, gates "live"):**
  - [ ] Sample asset: an anonymized real hook set (grouped, angle-coverage visible) on the sales page + storefront card.
  - [ ] Artifact leads with `topPicks` (answer-first) and is organized by angle (prioritized + structured).
  - [ ] Input-specific (eval: hooks reference the real product/offer; couldn't fit another product).
  - [ ] Designed data-viz: the angle-coverage chip row (proof of diversity), not a flat list.
  - [ ] Branded PDF (the "angle test matrix"), not a screenshot.
  - [ ] Per-hook copy buttons + "copy all"/JSON export + rationale (`whyItWorks`).
  - [ ] Running state streams real phases + `findingCount` ("12/20 hooks").
  - [ ] All 8 UI states designed; no bare spinners.
  - [ ] "We never store your key" + retention + expected cost (a few cents — the cheapest run) visible.
  - [ ] **AI-tells absent — the central risk here** (eval: ban-list + judge; no "Discover the power of…"); channel + DTC/SaaS + tone branches provably shift the output.
  - [ ] Senior copy; `impeccable`/`taste` on artifact + sales page; `ui-ux-pro` + axe on tool UI; mobile first-class.
  - _AC: every box checked; Lighthouse ≥90; events fire._
- **Phase 4 — Launch.** Live Polar product, monitoring, refund verified. As the funnel entry, instrument the downstream-purchase tracking. _AC: platform-spec §15 DoD all checked._

## 18. Testing strategy

| Edge (§10)         | Test                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| #1 key invalid     | unit: pre-run ping mock rejects → error, quota intact                         |
| #2 no product      | schema: neither URL nor description → refine rejects                          |
| #3 missing offer   | schema: missing offer/channel → rejects                                       |
| #5 SSRF (URL path) | unit: IP/localhost/metadata product URLs rejected                             |
| #6 AI timeout      | integration: provider error → retry → quota restored on final fail            |
| #7 low diversity   | schema: <20 hooks or <5 angles → parse fails; integration: retry then restore |
| #9 duplicate       | integration: same `runId` returns cached, no double quota                     |
| channel/tone aware | eval: same product, different `channel`/`tone` → materially different hooks   |

**The one test that matters most:** fixture product (description) → pipeline (mocked AI returning a fixed object) → **valid `AdHookOutput`** with exactly 20 hooks and ≥5 distinct angles (the diversity constraint is the contract's whole point).

**Eval golden set:** ~10 real products (DTC + SaaS, across channels) with expected angle coverage; judges `input_specific` (hooks reference the real product/offer), `no_ai_tells` (**the priority judge here** — ban-list of generic ad clichés), `factual` (no fabricated stats/testimonials in social-proof hooks), `format_valid` (20 hooks, ≥5 angles, `topPicks` indices valid). Full method, fixtures, mocks, scenario matrix, sandbox-E2E, CI gates: [`../05-testing-strategy.md`](../05-testing-strategy.md).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI §5, runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Import the canonical contracts ([`../04-implementation-contracts.md`](../04-implementation-contracts.md)) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`.
- **Reused from Segment 1:** the crawl spine (`server/store/tools/agentic/`) — _only on the URL path; optional_.
- **Reused from Segment 6:** `resolveAudience` + anti-AI-tell scaffolding (`prompts/conversion/_shared.ts`).
- **New libs:** none (no crawl by default; uses only spine + shared crawler).
- **Cross-product reuse:** the angle taxonomy could seed future copy-generation products (`dtc-email-flows`, `positioning-generator`).

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($19).
- `OPEN QUESTION:` creative-testing benchmark + citation for sales copy (`../research-sources.md`) — use a range.
- `OPEN QUESTION:` default model — lean to offering `claude-haiku-4-5` prominently since generation quality is fine and cost matters at this price point (still default `claude-opus-4-8` for the highest-quality angles).
- **Risk — generic AI output (THE risk for a generation product):** mitigation = the explicit cliché ban-list in the prompt, the schema-enforced diversity (`length(20)` + `anglesCovered.min(5)`), and the `no_ai_tells` eval judge as the priority gate. If hooks read like generic AI copy, the product fails review (doc 03 §7).
- **Risk — thin/vague description → weak hooks:** mitigation = "add detail" nudge (#8), lean on the offer, optional URL crawl to ground.
- **Risk — fabricated social proof:** mitigation = prompt forbids invented quotes/numbers; social-proof angles are framings; `factual` eval judge.
- **Risk — SSRF (URL path only):** mitigation = strict shared guard, tested (§18); launch blocker for the URL path.
- **Risk — buyer surprised by API cost:** minimal (cheapest run, a few cents) — still shown in UI (§8).
