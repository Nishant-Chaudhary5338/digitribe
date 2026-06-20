# Ad → Landing Message-Match — PRD

**Slug:** `ad-message-match` · **Segment:** 6 · **Status:** draft
**Owner:** Manu (Grow) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Productizes one of Manu's highest-leverage paid-acquisition fixes: the silent **message-match break** between an ad's promise and the landing page's payoff. Every mismatch taxes every click the buyer pays for. **Reuses the Segment-1 crawl spine** to read the landing page; do not build a second crawler.

---

## 1. TL;DR

- **One-liner:** Paste your ad + your landing page URL → see exactly where the ad's promise breaks on the page, scored per element, with the fixes.
- **Problem:** Founders pay for clicks, then send them to a page that doesn't continue the ad's promise — different headline, missing offer, wrong audience, no continuity. Conversion leaks and they blame the ad or the page in isolation, never the _match_.
- **Buyer:** DTC and SaaS founders/marketers running paid traffic (Meta, Google, TikTok, LinkedIn).
- **Input → Output:** ad copy (and/or a screenshot) + a landing page URL → a **Message-Match Audit**: an overall match score, per-element scoring (hook, offer, audience, visual, CTA, proof), where each promise breaks, and the specific fixes.
- **Price:** **$29** one-time (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–60s · **Re-run quota:** 3.

## 2. Problem & market

**Today**, a founder running paid traffic optimizes the ad _or_ the page, almost never the _seam_ between them. The ad promises "50% off your first box"; the LP headline says "Welcome to Acme." The ad targets busy parents; the page speaks to enterprises. That discontinuity — **message mismatch** — is one of the most common, most expensive, least-diagnosed paid-acquisition leaks. It's a core thing Manu fixes to lower CPA: align the post-click experience with the pre-click promise so the paid dollar isn't wasted on a bounce.

**Competition:** ad-creative tools (write ads, ignore the LP); LP tools (audit the page, ignore the ad). **Gap:** nobody audits the _match_ — the ad and the LP _together_, element by element. That seam is exactly where senior paid-acquisition judgment lives, and it's what this tool encodes.

**Killer insight:** you can have a great ad and a great page and still leak money if they don't say the same thing to the same person. Message-match is a multiplier on every click you've already paid for. _(`OPEN QUESTION:` source a benchmark for message-match impact on conversion/CPA in `../research-sources.md`; use a range, no invented precision.)_

**Why Digitribe:** Manu runs Meta/Google/TikTok/LinkedIn at operator level; aligning ad ↔ destination page (with Nishant on the page side) is in the studio's own service copy ("a 2-second LCP improvement on the landing page can do more for CPA than two months of bid adjustments"). This is that judgment, instant.

## 3. Pricing & packaging

- **$29**, one-time. Same anchor as Conversion Teardown — cheap relative to the ad spend it protects (a single fixed mismatch can pay for it on day one).
- **Includes:** 1 run (3 re-runs to re-check after edits / try a different ad-LP pair), the on-screen audit, branded PDF, JSON, emailed copy (Resend).
- **Upsell / cross-sell path:**
  - In-artifact → systemic mismatch across the funnel → **Meta Ads / Google Ads management** (Manu) → free `/audit`.
  - Sibling store products: **Conversion Teardown** ($29, fix the page itself), **Ad Hook Generator** ($19, generate better-matched ad angles), **Digibot-in-a-Box** ($49).
- **Future tiers (note only):** batch (many ads → one LP, or one ad → many LPs) — v2. v1 is one ad ↔ one LP.

## 4. User stories / JTBD

- As a **DTC media buyer**, when an ad set has clicks but no conversions, I want to know if the LP continues the ad's promise, so that I fix the leak instead of killing a good ad.
- As a **SaaS marketer**, when paid demos are expensive, I want my ad's value-prop to land on the LP, so that I don't pay for clicks that bounce on a generic homepage.
- As a **founder**, when I'm about to scale spend, I want the ad↔page match checked first, so that I'm not scaling a leak.
- As a **founder evaluating Digitribe**, I want to see this senior diagnosis on my own funnel, so that I trust Manu with the ad account.

**Primary job the artifact must nail:** a **per-element, ad-and-page-specific** diagnosis — for each element (hook/headline, offer, audience/angle, visual, CTA, proof), does the LP _continue_ the ad's promise, scored, with where it breaks and the exact fix. It must reference _this_ ad's real words and _this_ page's real copy; a generic "ensure consistency" answer fails.

**Non-goals (v1):** does NOT audit the ad's creative quality in isolation (that's adjacent); does NOT predict CTR/CPA numbers; does NOT manage the ad account; does NOT crawl beyond the single LP.

## 5. Functional requirements

### Inputs

| Field          | Type                   | Validation                                                          | Example                              |
| -------------- | ---------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `adCopy`       | string                 | required if no screenshot; ≤2000 chars (headline + body + CTA)      | "50% off your first box. Order now." |
| `adScreenshot` | file (image, optional) | png/jpg/webp, ≤5MB; used via vision OR OCR (§7, §8 — OPEN QUESTION) | (uploaded image)                     |
| `channel`      | enum                   | `meta \| google \| tiktok \| linkedin \| other`                     | `meta`                               |
| `landingUrl`   | string (URL)           | http/https, public, resolves, not IP/localhost (SSRF guard, §15)    | `https://acme.com/box`               |
| `audience`     | enum `dtc\|saas\|auto` | default `auto` (resolver, segment README §shared-logic 2)           | `dtc`                                |
| `provider`     | enum                   | one of product's `byokProviders`                                    | `anthropic`                          |
| `byokKey`      | string (secret)        | non-empty; validated live pre-run (platform-spec §5)                | `sk-…`                               |

> **At least one of `adCopy` or `adScreenshot` is required** (schema `.refine`). If a screenshot is given, the ad text is read from it (§7). The `channel` shapes expectations (TikTok hooks ≠ LinkedIn hooks).

### Processing (requirements level; pipeline in §7)

Resolve ad text (from `adCopy` and/or screenshot) → crawl the landing page (extract above-the-fold, headline, offer, CTA, visual cues, proof) → resolve audience → **AI scores message-match per element, locates each break, writes fixes** filling the Output Contract → render audit + PDF + email.

### Outputs

The **Message-Match Audit**: overall match score, per-element match rows (with the ad promise, the LP payoff, the verdict, the break, the fix), top breaks, the cross-sell. Exact shape in §6.

### Constraints

- 1 landing page; 8s fetch timeout; respect `robots.txt`; UA `DigitribeAgentReadyBot/1.0`.
- Screenshot ≤5MB; if vision is used, it's one image; if OCR, text-only extraction (§8 OPEN QUESTION).
- Per-element rows bounded (§6) so the audit stays scannable, not a wall.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/ad-message-match.ts
import { z } from 'zod'

/** One message-match element: does the LP continue what the ad promised? */
const MatchElement = z.object({
  element: z.enum([
    'hook', // ad headline/hook ↔ LP headline/above-the-fold
    'offer', // ad's offer/incentive ↔ LP's offer (present? same? as prominent?)
    'audience', // who the ad speaks to ↔ who the LP speaks to
    'visual', // ad's visual/vibe ↔ LP's hero visual continuity
    'cta', // ad's action ↔ LP's primary CTA (same verb/intent?)
    'proof', // claims/specifics promised ↔ proof delivered on the LP
  ]),
  label: z.string(),
  adPromise: z.string().max(240), // what the AD said for this element (quoted/paraphrased from ad)
  pagePayoff: z.string().max(240), // what the LP delivers for it (quoted from crawl)
  score: z.number().int().min(0).max(100), // 100 = perfect continuity
  status: z.enum(['match', 'partial', 'break']), // severity: match→success, partial→warning, break→error
  whereItBreaks: z.string().max(280).nullable(), // the specific discontinuity (null if match)
  fix: z.string().max(280).nullable(), // the specific fix (which side to change + how)
})

export const AdMessageMatchOutput = z.object({
  ad: z.object({
    channel: z.enum(['meta', 'google', 'tiktok', 'linkedin', 'other']),
    source: z.enum(['text', 'screenshot', 'both']), // how the ad was read
    hook: z.string().max(240), // the ad's core promise/hook as understood
    offer: z.string().max(240).nullable(),
    cta: z.string().max(120).nullable(),
  }),
  page: z.object({
    url: z.string().url(),
    title: z.string(),
    audience: z.enum(['dtc', 'saas']), // resolved
    aboveFoldSummary: z.string().max(400),
    confidence: z.enum(['high', 'medium', 'low']), // honest on thin/JS-only pages (doc 03 §2.5)
  }),
  overallMatchScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']), // A≥90 B≥75 C≥60 D≥40 F<40
  headlineVerdict: z.string().max(240), // answer-first: the single biggest break (doc 03 §2.2)
  elements: z.array(MatchElement).length(6), // always the 6 elements
  topBreaks: z.array(z.string()).min(1).max(4), // the breaks that leak the most money, prioritized
  crossSell: z.object({
    // shared Segment-6 fragment (segment README §shared-logic 4)
    service: z.enum(['meta_ads', 'google_ads', 'landing_page_sprint']),
    reason: z.string().max(280), // honest, input-specific
  }),
})
export type AdMessageMatchOutput = z.infer<typeof AdMessageMatchOutput>
```

- **Export formats:** on-screen audit (React) · **branded PDF** (forwardable to the media buyer/dev) · **JSON**. No zip.
- **Field notes:** `score`/`grade` fixed 0–100 / A–F. `status` maps to shared severity tokens (doc 06 §1: match→success, partial→warning, break→error). The **side-by-side `adPromise` ↔ `pagePayoff`** per element is the artifact's signature view — a designed two-column "promise vs payoff" with the verdict between. `whereItBreaks`/`fix` are nullable for matched elements. `ad.source` records whether vision was used.
- **Determinism:** always the 6 elements, fixed keys; `topBreaks` 1–4; `headlineVerdict` answer-first. Prose constrained to schema + input-only-facts (§9).

## 7. System logic / pipeline

```
POST /api/store/run/ad-message-match  { token, byokKey, input }
  │
  ├─ [verify] token + quota                                 emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod, SSRF guard,      emit{phase:"validate",pct:8}
  │     .refine: adCopy OR adScreenshot present)
  ├─ [validate] BYOK key live ping                          emit{phase:"key",pct:12}
  │
  ├─ READ AD  resolveAdText(adCopy?, adScreenshot?)         emit{phase:"analyze",pct:18,
  │     - if screenshot: extract ad text (VISION via the      message:"Reading your ad…"}
  │       BYOK model's multimodal input, OR OCR — §8 OPEN Q)
  │     - merge with adCopy if both → ad digest
  │
  ├─ CRAWL  crawlSite(landingUrl,{maxPages:1,maxDepth:0})   emit{phase:"crawl",pct:25..50,
  │     [SHARED Segment-1 spine — tools/agentic/]             message:"Reading the landing page…"}
  │     - above-the-fold, headline, offer, CTA, visual cues,
  │       proof/trust elements (reuses the teardown extractor
  │       extension — shared, not forked)
  │     → PageDigest
  │
  ├─ RESOLVE audience  resolveAudience(input, crawl)        emit{phase:"analyze",pct:55}
  │     [SHARED Segment-6 helper] → 'dtc' | 'saas'
  │
  ├─ GENERATE  ai.structuredStream({                        emit{phase:"generate",pct:60..92,
  │     system: MESSAGE_MATCH_SYSTEM,          // §9          partial: elements[] fill in,
  │     prompt: buildPrompt(adDigest, pageDigest, channel,    findingCount: breaksSoFar}
  │             audience),
  │     schema: AdMessageMatchOutput,          // §6 SDK-enforced
  │     effort: "high",
  │   })  → AdMessageMatchOutput
  │
  ├─ RENDER  report.build(output) (screen + PDF + JSON)     emit{phase:"render",pct:95}
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl } emit{phase:"done",pct:100}
```

- **AI call count:** one structured generation (`effort: "high"`). **If vision is used to read the screenshot, that's part of the same multimodal generation OR a cheap pre-step** — see §8 OPEN QUESTION. Crawl + audience resolution are deterministic Node.
- **Libraries:** the shared crawler (reused from Segment 1, with the teardown extractor extension — shared). For screenshot text: **prefer the BYOK model's native multimodal input** (AI SDK supports image parts) so we add no OCR dependency and the buyer's key does the work; OCR (e.g. `tesseract.js`) is the fallback if a buyer's chosen provider/model lacks vision. `OPEN QUESTION:` confirm vision-via-AI-SDK vs OCR — see §8.
- **Reuse note:** crawl spine = `server/store/tools/agentic/` (+ shared teardown extractor extension). Audience resolver + anti-AI-tell scaffolding = shared Segment-6 (`prompts/conversion/_shared.ts`). `resolveAdText` is a small new helper, potentially reused by `ad-hook-generator` if that ever accepts a screenshot.

## 8. BYOK handling

- Providers: `anthropic` (default `claude-opus-4-8` — strong at the seam-level reasoning and exact fixes; **multimodal**, can read the screenshot natively), `openai`, `google` (also multimodal). Cheaper option in UI: `claude-haiku-4-5` (multimodal, faster).
- **Buyer cost expectation** (show in UI): one structured generation over the ad digest + a compact page digest → typically **well under $0.10** on the buyer's key. Adding an image to the prompt costs a bit more (image tokens) but stays small; show the estimate.
- **Pre-run validation:** 1-token ping; on failure → error #1, no quota spent.
- **`OPEN QUESTION (vision):` does ad-screenshot input require vision?** Yes, _to read text from an image_. Two paths: **(A)** pass the image as a multimodal part to the BYOK model in the same `generateObject` call — zero new deps, the buyer's key does the OCR-equivalent, and it also captures the ad's _visual vibe_ for the `visual` element (a real advantage). **(B)** OCR locally (`tesseract.js`) to text-only, then text-only generation — loses visual analysis, adds a dep, but works on non-vision providers. **Recommendation:** require a **vision-capable model** when a screenshot is provided (all three default providers' default models are multimodal), use Path A, and fall back to Path B / "paste the ad text instead" if the buyer's selected model lacks vision. Resolve in an ADR before Phase 2. Either way, **text-only input (`adCopy`) needs no vision at all** — that's the always-works path.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`. Structured output enforced by AI SDK `generateObject`/`streamObject` against `AdMessageMatchOutput` (§6). If a screenshot is provided, the image is a multimodal part of this same call (Path A, §8).

**System prompt (`MESSAGE_MATCH_SYSTEM`, draft):**

```
You are a senior paid-acquisition specialist auditing MESSAGE MATCH: whether a landing
page continues the promise an ad made to the person who clicked it. You are given the
ad (text and/or a screenshot) and a structured digest of the CRAWLED landing page, the
channel, and the audience (DTC or SaaS).

For each of six elements — hook, offer, audience, visual, cta, proof — judge whether the
landing page CONTINUES what the ad promised. Score 0–100 (100 = perfect continuity).

Rules:
- adPromise must come ONLY from the ad; pagePayoff ONLY from the crawl digest. Quote or
  faithfully paraphrase the real words. Invent nothing — no copy, offer, or claim that
  isn't in the ad or on the page.
- `whereItBreaks` must be specific ("the ad promises '50% off your first box' but the LP
  headline says 'Welcome to Acme' — the offer is absent above the fold"), never generic
  ("improve consistency").
- `fix` names which side to change and how, concretely.
- Prioritize: `topBreaks` are the discontinuities that leak the most paid traffic.
- Channel-aware: a TikTok hook is punchier than a LinkedIn one; judge continuity in the
  channel's register. Audience-aware: DTC vs SaaS expectations differ.
- If a screenshot is provided, also judge `visual` continuity (does the LP hero match the
  ad's look/vibe?), reading the image.
- honest confidence: thin/JS-only pages → page.confidence:"low", say so.
- No filler, no hype, no restated prompt. Senior operator voice.
```

**User prompt template:** `buildPrompt(adDigest, pageDigest, channel, audience)` → serializes the ad (resolved text + channel + screenshot-as-image-part if present) + the page digest (above-the-fold, headline, offer, CTA, visual cues, proof) + resolved audience.

**How 2.1–2.5 (doc 03) are met:** adPromise-from-ad + pagePayoff-from-crawl, quoted → input-specific (2.1); headline verdict → elements → breaks is answer-first + prioritized (2.2); the promise↔payoff two-column + match scores feed designed viz (2.3); channel + DTC/SaaS branches (2.4); no-filler/honest-confidence kill AI-tells (2.5).

**Guardrails:** schema enforcement; the "promise from ad, payoff from page, invent nothing" rule curbs hallucination; honest confidence; refusal/empty per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                      | Detection                       | Behavior / message                                                          | Quota     |
| --- | -------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------- | --------- |
| 1   | Invalid/expired BYOK key                     | pre-run ping fails              | "Your `<provider>` key looks invalid or expired — check and retry."         | not spent |
| 2   | Neither `adCopy` nor `adScreenshot` provided | schema `.refine`                | form error: "Add your ad copy or upload a screenshot."                      | not spent |
| 3   | LP URL unreachable / DNS / 5xx               | fetch fails                     | "We couldn't reach `<landingUrl>`. Is it public and live?"                  | not spent |
| 4   | LP URL is IP/localhost/private (SSRF)        | input validation guard          | reject at form: "Enter a public website URL."                               | not spent |
| 5   | Screenshot unreadable / no text found        | vision/OCR returns empty        | "We couldn't read text from that image — paste the ad copy instead."        | not spent |
| 6   | Buyer's selected model lacks vision (Path A) | provider/model capability check | "This model can't read images — paste the ad copy, or pick a vision model." | not spent |
| 7   | JS-only / thin LP                            | SSR body near-empty             | proceed on what's renderable; `confidence:"low"`; flag it; score honestly   | spent     |
| 8   | Provider rate-limit/timeout mid-generate     | AI wrapper error                | retry once w/ backoff; if still failing, error + restore quota              | restored  |
| 9   | Ad and LP are for clearly different products | low match across all elements   | deliver an honest low grade + "these may not be the right pair?" note       | spent     |
| 10  | Oversized screenshot (>5MB)                  | upload validation               | "Image too large — keep it under 5MB."                                      | not spent |
| 11  | Duplicate submit (double-click)              | same `runId` (idempotency §6)   | return cached/in-flight; never double-charge                                | n/a       |
| 12  | Quota exhausted                              | token check                     | "You've used all 3 runs — buy again or contact us." + buy CTA               | n/a       |

## 11. UX / UI flow

**Sales page** (`/store/ad-message-match`) → **Buy** → Polar → **success** → **tool UI** (`/store/use/[token]`). Sales page hero: a sanitized real audit showing the promise↔payoff two-column with a break highlighted (doc 03 §1).

**Tool UI states** (all 8, doc 06 §state-chart):

- **Empty / collecting:** an **ad panel** (paste `adCopy` _and/or_ drag-drop `adScreenshot` with preview) + `channel` select; a **page panel** (`landingUrl`); `audience` toggle (advanced); provider + BYOK key ("we never store your key"; note "a vision model reads your screenshot"); **Check match** button (disabled until valid — needs ad + URL + key).
- **Validating key:** inline ✓/✗.
- **Running:** live SSE progress — "Reading your ad…", "Reading the landing page…", "Comparing hook… offer… CTA…", "Found 3 breaks," with `findingCount`; the 6 element rows fill in progressively (`structuredStream`); rotating message-match micro-education. `aria-live="polite"`.
- **Partial:** non-blocking banner; continue.
- **Success / artifact view (`components/store/artifacts/ad-message-match.tsx`):**
  - Top: **overall match grade + score ring** + the **headlineVerdict** (the biggest break, answer-first) + audience + channel + confidence chips.
  - **Top breaks** — the prioritized leaks, each one specific.
  - **The signature view:** a **promise ↔ payoff table** — 6 element rows, each a two-column "Ad said / Page delivers" with a `match/partial/break` chip between them and the fix beneath; if a screenshot was used, a small thumbnail anchors the ad side.
  - **Downloads:** **Download PDF** (primary), **Download JSON**, **Email me a copy** (pre-checked).
  - **Cross-sell card:** systemic mismatch → Meta/Google Ads management → `/audit`. Sibling: Conversion Teardown (fix the page), Ad Hook Generator (better-matched angles).
- **Error:** message per §10 + retry; input preserved (including the uploaded screenshot).
- **Quota-exhausted:** message + buy-again CTA.

Components: shared kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `SeverityChip`, `StatMatrix` (for the promise↔payoff rows) (doc 06 §2). New: a small image-upload control (reuse repo primitives) + the artifact body. Density/tokens per doc 06 §1; copy senior per `PROJECT_VISION.md`.

## 12. SEO

- **Target keyword(s):** "ad to landing page message match," "message match audit," "ad landing page mismatch," "why are my ad clicks not converting" (tool + commercial intent).
- **`generateMetadata`:** title `Ad → Landing Message-Match — Find the Leak in Your Funnel` (≤60); description: "Paste your ad + landing page URL and see exactly where the ad's promise breaks on the page — scored per element, with the fixes. DTC/SaaS-aware. $29." (≤155). Canonical `/store/ad-message-match`. OG via `@vercel/og` (promise↔payoff visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs: "What is message match?" (ad promise → landing payoff continuity), "Can I upload an ad screenshot?" (yes — a vision model reads it on your key), "Do you store my API key?" (no), "Which channels?" (Meta, Google, TikTok, LinkedIn), "Does it audit the ad's quality?" (no — it audits the _match_ to your page), "Do you store my screenshot?" (used for the run, then purged).
- **Internal links:** marketing paid-ads service ↔ here; siblings (Conversion Teardown, Ad Hook Generator); free `/audit`.
- **Programmatic surface (note):** anonymized example audits as indexable pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: labeled inputs; ad/page/key fields grouped logically; image upload has a label + drag-drop _and_ a file button (keyboard-reachable) + alt-able preview; `RunProgress` `role="status"` + `aria-live="polite"`; focus to artifact `<h2>` on success; match chips never color-only (word + icon).
- The promise↔payoff table is a real, accessible table/grid with headers — not color-coded cells alone.
- Mobile: panels stack (ad above page); the two-column promise↔payoff becomes stacked promise-over-payoff per element; downloads full-width.
- Error recovery: inline, non-destructive (input + uploaded screenshot preserved); retry without re-entering the key.
- Gate CI on `@axe-core/playwright`.

## 14. Payment integration

- Create Polar product **"Ad → Landing Message-Match" $29** (sandbox + live). Checkout metadata `{ slug: "ad-message-match" }`. Else per platform-spec §9.
- **Refund stance:** one-click refund if the run never produced a valid audit. Quota auto-restores on system-side failures (§10 #8).

## 15. Security & privacy

- **Buyer data:** ad copy, an optional ad screenshot (an uploaded image), the landing URL + crawled public page content. Public pages only. Retention: ad text + screenshot + crawl content used transiently for the run, then purged (the screenshot is **not** retained beyond the run — state this); artifact (report) 30d for re-download.
- **Product-specific risks:**
  - **SSRF** on the LP crawl — shared crawler guard (block private IPs, localhost, link-local, metadata IP, non-http(s); re-check resolved IP; cap redirects). Launch blocker.
  - **Untrusted image upload** — validate type/size; never execute; strip EXIF; the image is only passed to the BYOK model (or OCR) and rendered as a preview from a sandboxed object URL; no server-side image processing beyond decode. Store transiently (or pass straight through), purge after the run.
  - **Untrusted HTML** — parse, never execute; sanitize before display.
- Shared rules per platform-spec §10 — deltas above only.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `match_complete` (grade, channel, audience, `ad.source`), `match_pdf_download`, `match_crosssell_click` (service), `match_used_screenshot` (vision-path usage, to validate the OPEN QUESTION).
- **Activation:** purchase → first run that produces a valid audit. **Target ≥ 85%.**
- Watch: run-error rate (<5%, watch the screenshot/vision path specifically), refund rate (<3%), screenshot-vs-text input split, cross-sell CTR to ads management.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`ad-message-match`), Polar sandbox product, routes, empty `AdMessageMatchOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Pipeline core (text-only ad, no live AI).** Reuse shared crawler + `resolveAudience`; input/output schemas (with the `adCopy` OR `adScreenshot` refine); pipeline returns a schema-valid audit from a **fixture ad + fixture page**, AI mocked, **text-only path first**. _AC: unit test: fixture → valid `AdMessageMatchOutput`; SSRF + refine tests pass._
- **Phase 2 — Real run + vision + UI.** Wire BYOK + `structuredStream` (live AI); resolve the §8 vision OPEN QUESTION and wire screenshot reading (Path A multimodal); image upload control; all UI states; report + PDF + Resend email; the promise↔payoff view. _AC: E2E activation green in sandbox (both text-only and screenshot paths) with a test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6, gates "live"):**
  - [ ] Sample asset: an anonymized real audit (promise↔payoff with a break) on the sales page + storefront card.
  - [ ] Artifact leads with match grade + `headlineVerdict` (answer-first) and `topBreaks` prioritized.
  - [ ] Input-specific (eval: adPromise traces to the ad, pagePayoff to the page; couldn't fit another pair).
  - [ ] Designed data-viz: the score ring + the promise↔payoff two-column matrix.
  - [ ] Branded PDF (forwardable), not a screenshot.
  - [ ] (Copyable fixes per element; rationale present.)
  - [ ] Running state streams real phases + `findingCount` ("found 3 breaks").
  - [ ] All 8 UI states designed incl. the image-upload + screenshot-preview states.
  - [ ] "We never store your key (or your screenshot)" + retention + expected cost (incl. image tokens) visible.
  - [ ] AI-tells absent (eval); channel + DTC/SaaS branches provably shift the audit.
  - [ ] Senior copy; `impeccable`/`taste` on artifact + sales page; `ui-ux-pro` + axe on tool UI; mobile first-class.
  - _AC: every box checked; Lighthouse ≥90; events fire._
- **Phase 4 — Launch.** Live Polar product, monitoring (watch the vision path), refund verified. _AC: platform-spec §15 DoD all checked._

## 18. Testing strategy

| Edge (§10)             | Test                                                               |
| ---------------------- | ------------------------------------------------------------------ |
| #1 key invalid         | unit: pre-run ping mock rejects → error, quota intact              |
| #2 no ad input         | schema: neither adCopy nor screenshot → refine rejects             |
| #4 SSRF                | unit: IP/localhost/metadata LP URLs rejected                       |
| #5 unreadable image    | unit: vision/OCR empty → clean "paste the copy instead," no quota  |
| #7 JS-only LP          | unit: empty SSR → `confidence:"low"`, still delivers               |
| #8 AI timeout          | integration: provider error → retry → quota restored on final fail |
| #11 duplicate          | integration: same `runId` returns cached, no double quota          |
| channel/audience aware | eval: same pair, different `channel`/`audience` → audit shifts     |

**The one test that matters most:** fixture ad (text) + fixture page → pipeline (mocked AI returning a fixed object) → **valid `AdMessageMatchOutput`** whose `adPromise`/`pagePayoff` trace to the fixtures.

**Vision-path test (product-specific):** a fixture screenshot → `resolveAdText` (mocked vision response) → ad text extracted → pipeline proceeds; and the capability-check rejects a non-vision model cleanly (#6).

**Eval golden set:** ~10 real ad↔LP pairs (DTC + SaaS, mixed channels, some intentionally mismatched) with expected overall grade bands + elements that _must_ be flagged `break`; judges `input_specific`, `no_ai_tells`, `factual` (promise traces to ad, payoff to page), `format_valid`. Full method, fixtures, mocks, scenario matrix, sandbox-E2E, CI gates: [`../05-testing-strategy.md`](../05-testing-strategy.md).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI §5 (incl. multimodal image parts), runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Import the canonical contracts ([`../04-implementation-contracts.md`](../04-implementation-contracts.md)) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`.
- **Reused from Segment 1:** the crawl spine (`server/store/tools/agentic/`) + the teardown extractor extension (shared).
- **Reused from Segment 6:** `resolveAudience` + anti-AI-tell scaffolding (`prompts/conversion/_shared.ts`).
- **New (minimal):** `resolveAdText` (vision-via-AI-SDK, OCR fallback — `OPEN QUESTION:` §8), a small image-upload control. `OPEN QUESTION:` confirm the `AiRunner` exposes a multimodal `structured` path (image parts) or whether a thin extension is needed — coordinate with the spine (doc 04 §7).
- **Cross-product reuse:** `resolveAdText` may serve `ad-hook-generator` if it adds screenshot input.

## 20. Open questions & risks

- `OPEN QUESTION:` **Does ad-screenshot input need vision? (the key product question, §8)** Yes for reading image text; recommend Path A (BYOK multimodal model reads it, also enables `visual` analysis), OCR/paste-text fallback. Confirm the spine `AiRunner` supports image parts, or extend it. Resolve in an ADR before Phase 2. **Text-only `adCopy` needs no vision — always-works path.**
- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` message-match impact benchmark + citation for sales copy (`../research-sources.md`) — use a range.
- **Risk — vision adds cost/complexity + provider-capability variance:** mitigation = require a vision model only when a screenshot is given; OCR/paste-text fallback; capability check (#6); analytics watch on the screenshot path.
- **Risk — generic output:** mitigation = promise-from-ad / payoff-from-page quoting + the `input_specific` eval judge.
- **Risk — mismatched pair / nonsense input:** mitigation = honest low grade + "these may not be the right pair" note (#9), not fabricated continuity.
- **Risk — SSRF on LP crawl:** mitigation = strict shared guard, tested (§18); launch blocker.
- **Risk — buyer surprised by API cost (esp. with an image):** mitigation = show expected per-run cost incl. image tokens in UI (§8).
