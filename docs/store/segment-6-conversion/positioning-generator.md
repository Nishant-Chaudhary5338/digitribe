# Positioning Generator — PRD

**Slug:** `positioning-generator` · **Segment:** 6 · **Status:** draft
**Owner:** Manu (Grow) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> A **generation-first**, dual-audience product. From a product description (or an optional URL, via the Segment-1 single-page extractor — [`../segment-1-agentic-web/agent-ready-kit.md`](../segment-1-agentic-web/agent-ready-kit.md) §7), it produces ONE positioning artifact giving **both a DTC angle and a SaaS angle** — value prop, headline options, ICP, and message hierarchy for each. This deliberately **mirrors Digitribe's own dual-theme DNA** (`PROJECT_VISION.md`: the site splits at the front door into Studio/DTC and Garden/SaaS). It's a showcase of how the studio thinks about positioning across both worlds, sold instant for $19.

---

## 1. TL;DR

- **One-liner:** Describe your product (or paste a URL) → get a positioning artifact with two complete angles: a DTC angle and a SaaS angle, each with value prop, headlines, ICP, and message hierarchy.
- **Problem:** Founders can't articulate their own positioning crisply, and the few who try get one generic "value proposition" from an AI tool. Many products genuinely sit between worlds (a DTC brand with a subscription/SaaS-like model; a SaaS with a consumer/DTC-feeling motion) and never test which framing converts — they default to one and never see the other.
- **Buyer:** founders and marketers — DTC, SaaS, or in-between — who need sharp positioning language for a homepage, a pitch, or an ad, and want to see their product framed both ways.
- **Input → Output:** a product description (+ optional URL) → a **Dual Positioning Artifact**: a shared core, then a full DTC angle and a full SaaS angle (value prop, 3–5 headline options, ICP, message hierarchy each), plus a recommendation on which to lead with.
- **Price:** **$19** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–50s (one generation; +15s if URL enrichment is on) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a founder who needs positioning either pays a positioning consultant (April Dunford-style engagements run thousands), reads _Obviously Awesome_ and tries to self-facilitate, or prompts ChatGPT and gets one bland "We help X do Y" sentence with no ICP, no message hierarchy, and no sense of which audience to lead with. The hardest part isn't writing words — it's seeing your product from the **buyer's** angle, and most products can credibly be framed for more than one buyer. A DTC brand with a refill subscription is also a retention/SaaS story; a developer tool is also a bottom-up, almost-consumer motion. Founders pick one framing on instinct and never see the alternative laid out properly.

**Competition:** generic AI "value proposition generators" produce a single sentence with no structure and no audience awareness; positioning consultants do it properly but slow and expensive; frameworks (positioning canvases) are DIY and hard to self-run. **Gap:** an instant, $19 tool that produces a **structured, two-angle** positioning artifact — and uniquely, one that thinks in both DTC and SaaS registers at once (the thing Digitribe is built on). That's us.

**Urgency stat:** positioning is consistently named the highest-leverage, most-neglected growth lever for early-stage companies — weak positioning quietly caps conversion on every page and every ad, yet most founders never formalize it and **can't state their own ICP in one sentence**. (Positioning-practice/PMM industry consensus — see segment README for citations.)

**Why Digitribe:** the studio's entire identity is the dual DTC/SaaS lens — the site itself reskins into Studio (DTC) and Garden (SaaS) themes for the two audiences (`PROJECT_VISION.md` §4). This product **is** that thinking, productized: the founders who can credibly frame a product both ways. It's the strongest warm-lead magnet in the catalog — a founder who sees both angles laid out senior-level wants the studio to build the page that expresses them.

## 3. Pricing & packaging

- **$19**, one-time. Matched to DTC Email Flows as the catalog's impulse-tier entry; positioned as "the positioning workshop output, for the price of a book." It's the **best top-of-funnel hook** for the agency because the artifact directly showcases the studio's signature dual-lens thinking.
- **Includes:** 1 run (3 re-runs to refine with a sharper description or explore a pivot), the on-screen artifact, every block copy-paste-ready (headlines, value props, ICP), the emailed PDF + JSON copy (Resend).
- **Upsell path:** the artifact's recommendation routes warm leads → if they want the page that expresses the chosen angle, **agency CTA: "Want us to build the site that lands this positioning?" → Digitribe (DTC Studio or SaaS Garden engagement, matched to the recommended angle)**; a SaaS buyer is cross-linked to the **SaaS Pricing Teardown** ($29); a DTC buyer to the **Shopify PDP Optimizer** ($29) + **DTC Email Flows** ($19).
- **Future tiers (note only):** a **competitor-aware** mode (positioning against 1–2 named alternatives, the "for X unlike Y" frame) and a **brand-voice / tagline** expansion are v2 ideas. v1 ships one SKU: the dual-angle artifact.

## 4. User stories / JTBD

- As a **founder**, when I can't explain my product crisply, I want a structured positioning artifact, so that my homepage, pitch, and ads finally say the same sharp thing.
- As an **in-between founder** (subscription DTC, or bottom-up SaaS), when I'm unsure which audience to lead with, I want both angles laid out, so that I can choose the framing that converts instead of guessing.
- As a **marketer**, when I'm briefing a redesign or a campaign, I want value props, headlines, ICP, and a message hierarchy I can hand to design/ads, so that the work starts from real positioning, not a blank page.
- As a **founder pre-raise/pre-launch**, when first impressions decide everything, I want senior-grade positioning language, so that I sound like I know exactly who I'm for.

**Primary job the artifact must nail:** produce **two genuinely distinct, credible angles** — a DTC framing and a SaaS framing that each read as if written for that audience (DTC: visceral, outcome/identity-led; SaaS: precise, ICP/value-led) — both grounded in the **real product**, plus an honest recommendation on which to lead with and why. A reader must recognize their own product in both angles, and the two angles must not be interchangeable rewordings — they must reflect a real shift in buyer, register, and emphasis.

**Non-goals (v1):** does NOT do competitor/market research or name competitors (no fabricated competitive claims — v2 competitor mode); does NOT write a full homepage or ads (it gives the positioning inputs to those — headlines, ICP, hierarchy); does NOT pick your business model for you (it frames what you describe both ways); does NOT guarantee the positioning is "right" (it's a senior, structured starting point + a recommendation, not a market study).

## 5. Functional requirements

### Inputs

| Field                | Type                          | Validation                                                       | Example                                                |
| -------------------- | ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `productDescription` | string                        | 20–800 chars: what it is, who it's for, the core value           | `A refillable home-cleaning brand with a subscription` |
| `productUrl`         | string (URL, optional)        | http/https, public, SSRF-guarded (§15); enriches the description | `https://acme.com`                                     |
| `currentAudience`    | enum (optional)               | `dtc` `saas` `unsure` — the angle they lean toward today, if any | `unsure`                                               |
| `knownStrengths`     | string (optional, ≤300 chars) | what customers love / the wedge, if known                        | `people stay subscribed for years`                     |
| `provider`           | enum                          | one of product's `byokProviders`                                 | `anthropic`                                            |
| `byokKey`            | string (secret)               | non-empty; validated live pre-run (platform-spec §5)             | `sk-…`                                                 |

> Either `productDescription` (required) or it plus `productUrl` (optional enrichment). `currentAudience` tells the artifact which angle to weight in its recommendation; `unsure` is the sweet-spot case the product is built for. These levers make the artifact context-aware (doc 03 §2.4) and let the dual-angle output adapt.

### Processing (requirements level; pipeline in §7)

(Optionally) crawl `productUrl` (single-page extractor) for real product facts and language → assemble a **product brief** (description + any enrichment) → AI step writes a shared positioning core, then a full DTC angle and a full SaaS angle, plus a lead recommendation, filling the Output Contract → render artifact + PDF + email.

### Outputs

A **Dual Positioning Artifact** (on-screen + PDF + JSON): shared core, DTC angle, SaaS angle, and the recommendation. Exact shape in §6.

### Constraints

- Optional URL: **single page** crawl only; ≤ 2 fetches; 8s per-fetch timeout; 15s enrichment cap; never blocks on enrichment (form alone always works).
- Respect `robots.txt` on enrichment; identify as `DigitribeCROBot/1.0`.
- `maxOutputTokens` capped (doc 04 §10) so one run stays well under $0.15 on the buyer's key.

## 6. ⭐ Output Contract

> The locked schema the AI step is forced to fill (`AiRunner.structured`, doc 04 §7; platform-spec §5). The contract encodes the **answer-first** hierarchy (doc 03 §2.2): the lead recommendation + the one-line core → the shared core → the two full angles. The schema **guarantees both angles exist and are symmetric** (same fields each), so the artifact's dual-lens layout is structural, not left to the model. Copy is generative but constrained to the brief — no invented features, metrics, or competitors.

```ts
// server/store/schemas/positioning-generator.ts
import { z } from 'zod'

const Headline = z.object({
  text: z.string().max(120), // a homepage/hero headline option
  angle: z.string().max(120), // the hook it leans on (e.g. "identity", "time-saved", "ICP-specific")
})

const MessageLayer = z.object({
  level: z.enum(['primary', 'secondary', 'supporting']), // the message hierarchy
  message: z.string().max(240),
})

const PositioningAngle = z.object({
  audience: z.enum(['dtc', 'saas']),
  label: z.string(), // "DTC Angle" | "SaaS Angle"
  valueProposition: z.string().max(320), // the core promise, framed for this audience
  oneLiner: z.string().max(160), // the "we help X do Y" sentence, audience-tuned
  icp: z.object({
    who: z.string().max(200), // the ideal customer for this angle, specific
    painPoint: z.string().max(240), // the pain this angle leads with
    buyingTrigger: z.string().max(200), // the moment they start looking
  }),
  headlines: z.array(Headline).min(3).max(5), // homepage/hero options to test
  messageHierarchy: z.array(MessageLayer).min(3).max(6), // primary → supporting
  toneNotes: z.string().max(240), // how this angle should sound (DTC vs SaaS register)
  whyItWorks: z.string().max(280), // why this framing fits the product, concretely
})

export const PositioningGeneratorOutput = z.object({
  product: z.object({
    summary: z.string().max(400), // the model's grounded understanding of the product
    enrichedFromUrl: z.boolean(), // did URL enrichment run successfully?
    detectedEntities: z.array(z.string()).max(20), // real features/benefits/terms used
    category: z.string().max(120), // the market category, as best understood (not invented)
  }),
  core: z.object({
    // the audience-agnostic spine both angles share — answer-first
    essence: z.string().max(280), // what the product fundamentally is/does, in one breath
    differentiator: z.string().max(280), // the real wedge (from knownStrengths/brief), not generic
    valueThemes: z.array(z.string()).min(2).max(5), // the 2–5 value themes available to draw on
  }),
  angles: z.array(PositioningAngle).length(2), // ALWAYS [dtc, saas], symmetric
  recommendation: z.object({
    leadWith: z.enum(['dtc', 'saas', 'either']), // honest call on which to lead with
    reasoning: z.string().max(400), // why, grounded in the product + currentAudience
    testIdea: z.string().max(280), // a concrete way to validate the call (e.g. an A/B test)
  }),
  upsell: z.object({
    matchedEngagement: z.enum(['dtc_studio', 'saas_garden', 'either']), // → the right agency lane
    reason: z.string(),
  }),
})
export type PositioningGeneratorOutput = z.infer<typeof PositioningGeneratorOutput>
```

- **Export formats:** on-screen artifact (React) · **PDF** (branded, via report renderer, platform-spec §8) · **JSON** (the raw contract). Headlines, one-liners, and value props render with **copy buttons** (paste into a homepage/brief). No ZIP.
- **Field notes:** there are **no scores/grades** — this is a generative positioning artifact, not an audit; the answer-first element is `recommendation.leadWith` + `core.essence`. `enrichedFromUrl`, `detectedEntities`, `category` reflect what was actually available (`category` is the model's best honest read, never a fabricated market label). The **two angles are always present and symmetric** (identical sub-fields), which is what makes the dual-lens artifact possible.
- **Determinism:** `angles` is always length 2, always `[dtc, saas]` in that order — the side-by-side layout relies on it. The two angles must be **substantively different** (different ICP, pain, register), enforced by the prompt (§9) and an eval judge (§18), not just the schema.

## 7. System logic / pipeline

```
POST /api/store/run/positioning-generator  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod) + SSRF (if URL)   emit{phase:"validate",pct:10}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:15}
  │
  ├─ (optional) ENRICH  if productUrl: crawlPage(productUrl) emit{phase:"crawl",pct:18..35,
  │     server/store/tools/agentic/extract-page.ts             message:"Reading your site…"}
  │     - single-page fetch (SSRF-guarded, robots-OK)
  │     - extract real product name, hero copy, benefits,
  │       category cues; never blocks — on fail, skip
  │     → ProductBrief enrichment (enrichedFromUrl = true|false)
  │
  ├─ ASSEMBLE  buildProductBrief(input, enrichment?)         emit{phase:"analyze",pct:40}
  │     - merge description + strengths + audience + enrichment
  │
  ├─ GENERATE  ai.structured({                               emit{phase:"generate",pct:45..92,
  │     system: POSITIONING_SYSTEM,           // §9                message:"Framing the DTC angle…"
  │     prompt: buildPrompt(productBrief, currentAudience),       then "Framing the SaaS angle…"}
  │     schema: PositioningGeneratorOutput,    // §6 — SDK-enforced
  │     effort: "high",
  │   })  → PositioningGeneratorOutput         // structuredStream: core → DTC → SaaS → reco
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:95}
  │     - on-screen JSON, branded PDF (no zip)
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — the positioning judgment IS the product. Enrichment + assemble are deterministic Node, cheap. Stream the object so the core, then each angle, then the recommendation fill in progressively (doc 03 §3 — the two angles building side by side is the signature reveal).
- **Libraries:** optional enrichment reuses the Segment-1 single-page extractor (`cheerio`/`linkedom`). No new libs.
- **Reuse:** composes the shared `server/store/tools/agentic/extract-page.ts` (sibling of `extractPdp`/`extractPricing`) **optionally** — like DTC Email Flows, it degrades to brief-only.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — strongest at holding two distinct, credible registers at once and at the strategic judgment in the recommendation), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (faster, fine for a clearly single-audience product). Per platform-spec §5.
- **Buyer cost expectation** (show in UI, doc 03 §5): one run is a single structured generation over a short brief → typically **well under $0.10 on the buyer's key**.
- **Pre-run validation:** a 1-token ping via the AI wrapper (`AiRunner.ping`); on failure return edge #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by the AI SDK `generateObject`/`streamObject` against `PositioningGeneratorOutput` (doc 04 §7) — the model fills the symmetric two-angle shape, so both angles are guaranteed and structurally parallel.

**System prompt (draft):**

```
You are a senior positioning strategist who thinks fluently in BOTH worlds: DTC
ecommerce and B2B SaaS. You produce sharp, structured positioning the way a top
studio does — grounded in the real product, with a clear ICP, value proposition,
headline options, and message hierarchy.

You are given a product brief (a description, optional known strengths, the founder's
current leaning, and optionally real content from their site). Produce ONE artifact
with a shared core and TWO distinct angles — a DTC angle and a SaaS angle — plus an
honest recommendation on which to lead with.

Rules:
- Use ONLY facts in the brief plus any enrichment. Never invent features, metrics,
  customers, competitors, or category claims. If something isn't given, frame around
  what is — don't fabricate a market or a stat.
- The two angles MUST be substantively different, not reworded twins. The DTC angle
  is visceral and outcome/identity-led, speaks to a consumer/brand buyer, and sounds
  DTC (concrete, human, a little bold). The SaaS angle is precise and ICP/value-led,
  speaks to a business buyer or operator, and sounds SaaS (specific, credible, calm).
  Different ICP, different pain, different buying trigger, different register.
- Every angle must be recognizably about THIS product. A reader should see their own
  product in both framings.
- The recommendation must be honest: if the product is clearly one audience, say so
  ("lead with SaaS — DTC is a stretch here, but here's how it could read"). Respect
  the founder's currentAudience as a signal, not a command.
- Headlines must be specific and varied — no "Revolutionize your X," no buzzwords,
  no emoji. Each should fit its angle's register.
- No filler ("In today's competitive landscape"), no hedging, no restated prompt.
  Write like an operator who has positioned real products.
```

**User prompt template:** `buildPrompt(productBrief, currentAudience)` serializes the merged brief (description, known strengths, any enriched product name/benefits/category cues, detected entities) and states the founder's `currentAudience` leaning so the recommendation can weight it.

**Model + effort per call:** one call, `effort: "high"` — the single artifact, judgment- and register-heavy. (Streaming surfaces the core then each angle for the side-by-side reveal.)

**Guardrails:** schema enforcement guarantees the symmetric two-angle structure; the "ONLY facts in the brief" + "never invent competitors/metrics/category" rules curb fabrication (doc 03 §2.5); the explicit "angles must be substantively different" rule + the `angle_distinctness` eval judge (§18) prevent the failure mode of two reworded twins; the honest-recommendation rule prevents forcing a DTC angle onto an obviously-SaaS product. Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

> Every row is also a test in §18.

| #   | Trigger                                       | Detection                     | Behavior / message                                                                                        | Quota          |
| --- | --------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | Invalid/expired BYOK key                      | pre-run ping fails            | "Your `<provider>` key looks invalid or expired — check and retry."                                       | not spent      |
| 2   | Thin description (< meaningful detail)        | input minLength + heuristic   | accept; in-form nudge ("add a sentence or a URL for sharper angles"); generate honestly from what's given | spent          |
| 3   | `productUrl` provided but unreachable/blocked | enrichment fetch fails        | generate from the description alone; `enrichedFromUrl:false`; non-blocking note                           | spent          |
| 4   | `productUrl` is IP/localhost/private          | input validation (SSRF guard) | reject the URL field only: "Enter a public URL (or leave it blank)."                                      | not spent      |
| 5   | Clearly single-audience product               | model judgment                | still produce both angles; recommendation says "lead with X; the other is a stretch — here's how"         | spent          |
| 6   | Provider rate-limit / timeout mid-generate    | AI wrapper error              | retry once w/ backoff; if still failing, error + restore quota                                            | restored       |
| 7   | Two angles come out near-identical            | eval `angle_distinctness`     | re-run quota lets buyer regenerate; eval guards regressions pre-launch (§18)                              | spent (re-run) |
| 8   | Model returns thin/low-confidence output      | field length heuristic        | still deliver; artifact flags "add detail or a URL for a sharper artifact"                                | spent          |
| 9   | Duplicate submit (double-click)               | same `runId` (idempotency §6) | return in-flight/cached result; never double-charge                                                       | n/a            |
| 10  | Network failure mid-enrichment                | per-fetch try/catch           | skip enrichment, continue from description; accurate `enrichedFromUrl:false`                              | spent          |
| 11  | Quota exhausted                               | token check                   | "You've used all 3 runs — buy again or contact us." + buy CTA                                             | n/a            |

These map to doc 04 §5 `StoreError` codes. As with DTC Email Flows, the form alone always yields an artifact; URL failures degrade gracefully (#3/#10).

## 11. UX / UI flow

**Sales page** (`/store/positioning-generator`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states** (generic 8-state machine, doc 06 §4; this product adds its form + the **dual-angle** `ArtifactView`):

- **Empty / collecting input:** `productDescription` (big primary textarea, with a one-line example), `productUrl` (optional, "we'll read your site for real details"), `currentAudience` (segmented control: DTC / SaaS / Unsure — defaulting to Unsure, the product's sweet spot), `knownStrengths` (optional), provider select + `KeyInput` ("where do I get a key?" + "we never store your key"). **Run** disabled until the description is valid.
- **Validating key:** inline ✓/✗ on the key field (`/key-check`).
- **Running:** full-width `RunProgress` from SSE — real labels ("Reading your site…" if URL, "Framing the DTC angle…", "Framing the SaaS angle…", "Writing the recommendation…"), progress bar, a rotating positioning tip ("Why the ICP comes before the headline"), `aria-live="polite"`. Stream the core, then the two angles building side by side (the signature reveal).
- **Partial:** if enrichment failed, a non-blocking "framed from your description (couldn't read the site)" banner; continue to success.
- **Success / artifact view** (`components/store/artifacts/positioning-generator.tsx`):
  - Top: the **recommendation** (lead-with chip: DTC / SaaS / Either) + the `core.essence` one-liner (answer-first), with the `reasoning` + `testIdea`.
  - **Shared core** panel (essence, differentiator, value themes).
  - **Two angle columns side by side** — DTC (Studio register) | SaaS (Garden register) — each a card with value prop, one-liner, ICP (who/pain/trigger), headline options (copyable), message hierarchy (primary→supporting), tone notes, why-it-works. On mobile they stack with a tab/segmented switch. **This dual-column layout is the showcase moment and the visual echo of Digitribe's own DTC/SaaS theme split** (`PROJECT_VISION.md`) — the two columns may even adopt subtle Studio/Garden accent tones (doc 06 tokens) to make the dual-DNA tangible.
  - **Downloads**: **PDF** (primary), **JSON**, **Email me a copy** (pre-checked, auto-sent).
  - **Upsell card**: `upsell.matchedEngagement` routes to the matching agency lane (DTC Studio / SaaS Garden / either), plus cross-links to the matched sibling tool (Pricing Teardown for SaaS, PDP Optimizer + Email Flows for DTC).
- **Error:** human message per §10 + one-click retry (form + key kept).
- **Quota-exhausted:** gentle message + buy-again CTA.

Components from the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer` (copyable blocks), `SeverityChip` (for the lead-with + level chips) (doc 06 §2). The **dual-angle column layout** is the product-specific piece inside `ArtifactView`. Run states per doc 06 §4; copy tone per `PROJECT_VISION.md` — and the artifact must visibly honor the DTC/SaaS register split in the generated samples; density + tokens per doc 06 §1.

## 12. SEO

- **Target keyword(s):** "positioning generator," "value proposition generator," "product positioning tool," "DTC vs SaaS positioning," "ICP generator" (tool + informational intent).
- **`generateMetadata`:** title `Positioning Generator — DTC & SaaS Angles for Your Product` (≤60); description: "Describe your product and get a positioning artifact with two angles — a DTC framing and a SaaS framing — value prop, headlines, ICP, and message hierarchy. Instant, $19." (≤155). Canonical `/store/positioning-generator`. OG via `@vercel/og` (the dual-column visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What's in the artifact?", "Why two angles?" (most products can be framed more than one way; seeing both helps you choose), "What if my product is clearly DTC (or SaaS)?" (you still get both + an honest recommendation), "Do you store my API key?" (no), "Can I use the headlines on my site?" (yes — they're yours).
- **Internal links:** the splash `/` and both `/dtc` + `/saas` → here (it's the dual-lens product, so it links from both worlds); blog posts on positioning → here; sibling **SaaS Pricing Teardown** + **Shopify PDP Optimizer** + **DTC Email Flows**.
- **Programmatic surface (note):** example artifacts by category as indexable `/store/positioning-generator/examples/<category>` pages — strong SEO + a perfect showcase of the dual-lens; defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA (doc 06 §5): every field labeled; the `currentAudience` segmented control is a real `radiogroup`; provider/key in a `<fieldset>` with legend; `RunProgress` `role="status"` + `aria-live="polite"`; focus moves to the recommendation `<h2>` on success; the two angle columns are landmarked regions with headings (so screen-reader users navigate DTC vs SaaS clearly); the lead-with + level chips pair color with icon + word (never color-only — important since the columns use accent tones); copy buttons announce "copied."
- Mobile: the two columns become a tabbed/segmented switch (DTC | SaaS) or stack with clear headers; everything full-width. First-class on mobile.
- Error recovery: inline, non-destructive (the brief preserved); "retry" re-runs without re-entering the key (session memory, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route (doc 05 §6).

## 14. Payment integration

- Create Polar product **"Positioning Generator" $19** (sandbox + live). Checkout metadata `{ slug: "positioning-generator" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a valid artifact. Quota auto-restores on system-side failures (§10 #6).

## 15. Security & privacy

- **Buyer data:** the product description + optional known strengths + optionally the crawled **public** site content. Buyer-supplied business copy, not sensitive PII. Retention: brief + artifact stored 30d (KV/Blob TTL), then purged (platform-spec §10).
- **Product-specific risks:**
  - **SSRF** on the optional `productUrl` — reuse the Segment-1 guard (block private IPs/localhost/metadata, non-http(s), DNS re-check, redirect cap). URL is optional → the guard rejects only the URL field, never the run.
  - **Untrusted HTML** on enrichment — parse, never execute; sanitize before use; never `dangerouslySetInnerHTML` of crawled content or generated copy.
  - **No fabricated competitive/market claims** — the "never invent competitors/metrics/category" rule (§9) prevents the artifact asserting market facts the buyer might repeat.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `positioning_generated: { currentAudience, enriched }`, `positioning_leadwith: { leadWith }` (which angle gets recommended — a content insight), `positioning_copy_copied: { angle, block }` (which framings get used), `positioning_pdf_download`, `positioning_upsell_click: { matchedEngagement }`.
- **Activation:** purchase → first run that produces a valid artifact. **Target ≥ 85%.** Secondary activation (value realized): at least one headline/value-prop copied.
- Watch: run-error rate (<5%), refund rate (<3%), regenerate rate (a proxy for angle-quality misses → eval attention), upsell CTR to the matched agency lane (this product's upsell is its main strategic purpose).

## 17. Development phases

> Vertical slices, each shippable/testable.

- **Phase 0 — Scaffold.** Registry entry (`positioning-generator`), Polar sandbox product, routes, empty `PositioningGeneratorOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Contract + pipeline (no AI, description-only).** Input schema + output contract + `buildProductBrief` + pipeline returning a schema-valid contract from a **fixture brief** with the AI step mocked (no URL). _AC: unit test: fixture brief → valid `PositioningGeneratorOutput` with exactly 2 symmetric angles `[dtc, saas]`; URL-omitted path works._
- **Phase 2 — Real run + UI + enrichment.** Wire BYOK + `ai.structured` (live AI, streamed core→angles→reco), optional `productUrl` enrichment (degrades gracefully), all 8 UI states, the dual-column `ArtifactView`, report render + PDF + Resend email. _AC: E2E activation path green in sandbox with a real test key; URL-on and URL-off both produce a valid artifact; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase gate.** Sales page copy, metadata, JSON-LD, OG, analytics, upsell card. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria:**
  - [ ] Sample output asset (a real anonymized dual-angle artifact) on the sales page + storefront card.
  - [ ] Artifact leads with the recommendation + core essence (answer-first).
  - [ ] Output is provably input-specific (eval `input_specific` judge: both angles reference the real product — doc 03 §2.1).
  - [ ] The dual-column DTC/SaaS layout reads as the studio's signature dual-DNA (doc 03 §2.3/§2.4); Studio/Garden accent tones applied tastefully.
  - [ ] Branded, designed PDF export (not a screenshot) — both angles laid out.
  - [ ] Headlines/value-props/ICP have copy buttons.
  - [ ] Running state streams real phases + the two angles build side by side (doc 03 §3).
  - [ ] All 8 UI states designed (doc 06 §4) — no default spinners/blank screens.
  - [ ] "We never store your key" + retention + expected-cost visible (doc 03 §5).
  - [ ] AI-tells absent (filler/hallucination eval passes — doc 03 §2.5); the two angles are substantively distinct (`angle_distinctness` eval passes).
  - [ ] Senior copy throughout; `impeccable`/`taste` pass on artifact + sales page; `ui-ux-pro` + axe on the tool UI.
  - [ ] Mobile artifact view is first-class (the column→tab transition works).
        _AC: checklist all green; axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified. _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)            | Test                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| #1 key invalid        | unit: pre-run ping mock rejects → error, quota intact                        |
| #3 URL unreachable    | unit: enrichment fetch fails → description-only, `enrichedFromUrl:false`     |
| #4 SSRF on productUrl | unit: IP/localhost/metadata URL rejected at validate (URL field only)        |
| #5 single-audience    | eval: clearly-SaaS brief → `leadWith:"saas"`, honest "DTC is a stretch" reco |
| #6 AI timeout         | integration: provider error → retry → quota restored on final fail           |
| #9 duplicate          | integration: same `runId` returns cached, no double quota                    |
| contract symmetry     | schema: always 2 angles, `[dtc, saas]`, both with all sub-fields populated   |

Full method, fixtures, canonical mocks, sandbox-E2E, eval golden-set format + judges, and CI gates in [`../05-testing-strategy.md`](../05-testing-strategy.md). Note: like DTC Email Flows, this is form-first — the relevant scenario rows are the failure axis (KEY_INVALID, PROVIDER_TIMEOUT, refusal/empty, RATE_LIMITED) crossed with input variants (thin/rich description, URL-on/off, dtc/saas/unsure), not crawl-input rows. Product-specific eval expectations: ~8–12 real product briefs spanning clear-DTC, clear-SaaS, and genuinely-in-between cases, with expected `leadWith` bands + `mustMention` entities (the real product's features); judges `input_specific`, `no_ai_tells`, `factual` (no invented competitors/metrics/category), plus a product-specific **`angle_distinctness`** judge ("are the DTC and SaaS angles substantively different — different ICP/pain/register — or reworded twins? twins → FAIL") and a **`register_match`** judge ("does the DTC angle read DTC and the SaaS angle read SaaS?"). Threshold ≥ 0.85, zero fabrication.

**The one test that matters most:** fixture brief → pipeline (mocked AI returning a fixed object) → **valid `PositioningGeneratorOutput`** with exactly 2 symmetric angles in `[dtc, saas]` order, each fully populated.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine), from [`../04-implementation-contracts.md`](../04-implementation-contracts.md): `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. Spine modules must pass `segment-0-spine` DoR.
- **New libs:** none. Optional enrichment reuses `server/store/tools/agentic/extract-page.ts`.
- **Cross-product reuse:** shares the optional single-page extractor with DTC Email Flows (both treat it as optional); shares the catalog's upsell-routing pattern but uniquely routes to **both** agency lanes based on `matchedEngagement`. The dual-column `ArtifactView` is bespoke but uses only shared primitives.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($19).
- `OPEN QUESTION:` whether to apply literal Studio/Garden theme accent tones to the two angle columns (a strong brand moment) or keep them neutral with labels only — lean toward subtle accent tones, gated on the `taste`/`impeccable` pass and the a11y contrast check (doc 06 §5).
- `OPEN QUESTION:` **competitor-aware mode (v2)** — positioning against 1–2 named alternatives ("for X, unlike Y") needs either buyer-supplied competitor info or research; v1 explicitly avoids fabricating competitors. Decide v2 whether competitor data is buyer-input or crawled.
- `OPEN QUESTION:` category inference reliability — `product.category` is the model's best read; for novel products it may be vague. Acceptable (honest > confident-wrong), but watch in evals.
- **Risk — the two angles come out as reworded twins (the #1 quality risk):** mitigation = the explicit distinctness prompt rule + the `angle_distinctness` + `register_match` eval judges as launch guards + re-run quota. If the dual-angle isn't genuinely dual, the product's whole premise fails (doc 03 §7) — guard it hardest.
- **Risk — forcing an angle onto a single-audience product:** mitigation = the honest-recommendation rule + the `leadWith:"either"`/"stretch" handling; the product's value is partly _telling a founder their other angle is weak_.
- **Risk — fabricated market/competitor claims:** mitigation = the "never invent competitors/metrics/category" rule + the `factual` judge.
- **Risk — buyer surprised by their own API cost:** mitigation = show expected per-run cost in the UI (§8).
  </content>
