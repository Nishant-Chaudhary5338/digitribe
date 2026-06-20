# DTC Email Flows — PRD

**Slug:** `dtc-email-flows` · **Segment:** 6 · **Status:** draft
**Owner:** Manu (Grow) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> A **generation-first** product (no required crawl): the buyer describes their brand and product in a form, and the tool writes two complete lifecycle email sequences (welcome + abandoned-cart) tuned for DTC. An **optional URL** enriches the generation via the Segment-1 single-page extractor ([`../segment-1-agentic-web/agent-ready-kit.md`](../segment-1-agentic-web/agent-ready-kit.md) §7), but the product works fully without it. Output is **platform-agnostic plain copy** in v1 (no Klaviyo/ESP integration).

---

## 1. TL;DR

- **One-liner:** Describe your brand and product → get two ready-to-send DTC email sequences (welcome + abandoned-cart), each with subject lines, send timing, and the goal of every email.
- **Problem:** DTC founders know lifecycle email is the highest-ROI channel they own, but they ship the Shopify/Klaviyo default flows (or nothing) because writing a real welcome + abandoned-cart sequence — on-brand, well-timed, with subject lines that get opened — is a copywriting project they never start.
- **Buyer:** DTC ecommerce founders and growth leads who have (or are setting up) Klaviyo/Shopify Email and need the actual sequences written, fast and on-brand.
- **Input → Output:** a short brand/product form (+ optional store URL) → a **DTC Email Flow Pack**: a multi-email welcome sequence and a multi-email abandoned-cart sequence, each email with a subject line, preview text, timing/delay, the email's goal, and the full body copy — DTC-voiced.
- **Price:** **$19** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–60s (one generation; +15s if URL enrichment is on) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a DTC founder who wants real lifecycle flows either pays a copywriter $1k–$3k per sequence, fumbles with a generic email-template marketplace, or leaves the Klaviyo starter flows running with placeholder copy that converts poorly. Email and SMS drive an outsized share of DTC revenue — for many brands it's the highest-margin channel they fully own — yet welcome and abandoned-cart flows, the two highest-leverage automations, are routinely left as defaults because writing them well is real work: brand voice, the right number of emails, the right delays, subject lines that earn the open, and a clear job per email.

**Competition:** generic "AI email writer" tools produce one bland email from a one-line prompt with no sequence logic, no timing, and no brand voice; template marketplaces sell static copy you still have to rewrite; agencies/copywriters do it well but slow and expensive. **Gap:** an instant, $19, brand-specific tool that writes the **whole sequence** — multiple emails, with timing, subjects, and per-email goals — in the brand's voice. That's us.

**Urgency stat:** email consistently delivers one of the highest ROIs in DTC marketing (commonly cited around **$36–$42 per $1 spent**, DMA/Litmus industry figures), and **welcome + abandoned-cart flows are the two highest-revenue automations** in nearly every Klaviyo benchmark — yet most small brands run them on default copy. The money is in the flows nobody finished writing.

**Why Digitribe:** Manu runs DTC growth and the studio ships Shopify stores — the flows reflect what actually converts (timing, sequence logic, DTC voice), not a single generic email. It's a warm lead: a founder who buys the $19 pack is a candidate for the studio's DTC retainer (we set up + run the lifecycle program end to end).

## 3. Pricing & packaging

- **$19**, one-time. The lowest price in the conversion catalog — an impulse buy that's also the **top-of-funnel** into the DTC side of the store and the agency. Anchored as "less than one hour of a copywriter, for two complete sequences."
- **Includes:** 1 run (3 re-runs to regenerate with a tweaked brief or different tone), the on-screen flow pack, every email as copy-paste-ready blocks (subject + preview + body), a **paste-friendly bundle** (a single text/markdown export of all emails, ready to drop into any ESP), the emailed PDF + the bundle (Resend).
- **Upsell path:** the pack's footer routes warm leads → **agency CTA: "Want us to build these in Klaviyo and run your lifecycle program?" → Digitribe DTC retainer**; a buyer who hasn't fixed their product page is routed to the **Shopify PDP Optimizer** ($29 — capture the traffic the emails drive); a buyer who needs more flows is told post-purchase chat / v2 will add browse-abandon, post-purchase, and win-back sequences.
- **Future tiers (note only):** more flow types (post-purchase, win-back, browse-abandon, replenishment) and **direct ESP push** (Klaviyo API to create the flows) are the obvious v2 — see §20. v1 ships one SKU: welcome + abandoned-cart, plain copy.

## 4. User stories / JTBD

- As a **DTC founder**, when I set up Klaviyo and stare at empty flows, I want the welcome and abandoned-cart sequences written for my brand, so that I turn on lifecycle email today instead of "someday."
- As a **growth lead**, when our default flows underperform, I want professionally-structured sequences with the right timing and subject lines, so that I lift the highest-margin channel without hiring a copywriter.
- As a **founder with a strong brand voice**, when generic AI email sounds nothing like us, I want copy that matches our tone, so that the emails feel on-brand, not robotic.
- As a **new brand pre-launch**, when I have no email program yet, I want a credible starting sequence, so that I launch with lifecycle email running from day one.

**Primary job the artifact must nail:** produce **complete, on-brand, ready-to-send sequences** — multiple emails per flow, each with a real subject line, sensible timing, a clear goal, and body copy that sounds like **this brand** and references **this product**. A reader must not be able to swap another brand's pack in and have it fit. The copy must be DTC-voiced (concrete, human, punchy — not corporate).

**Non-goals (v1):** does NOT connect to or push into Klaviyo/any ESP (plain copy output — see §20); does NOT design HTML email templates or images (it writes copy + structure, not layout); does NOT send any email on the buyer's behalf (other than the artifact-delivery copy to the buyer); does NOT cover every flow type (welcome + abandoned-cart only in v1); does NOT do SMS (copy is email-first; a v2 idea).

## 5. Functional requirements

### Inputs

| Field            | Type                          | Validation                                                             | Example                                              |
| ---------------- | ----------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| `brandName`      | string                        | 1–80 chars                                                             | `Folk & Fern`                                        |
| `productSummary` | string                        | 10–600 chars: what you sell + the core benefit                         | `Refillable plant-based home cleaning, zero plastic` |
| `audience`       | string                        | 3–200 chars: who buys                                                  | `Eco-minded millennials setting up a home`           |
| `brandVoice`     | enum                          | one of: `playful` `premium` `bold` `warm` `minimal` `expert`           | `warm`                                               |
| `offer`          | string (optional, ≤160 chars) | a welcome incentive, if any ("10% off first order")                    | `15% off first order`                                |
| `welcomeCount`   | int                           | 2–5, default 3                                                         | `3`                                                  |
| `cartCount`      | int                           | 2–5, default 3                                                         | `3`                                                  |
| `storeUrl`       | string (URL, optional)        | http/https, public, SSRF-guarded (§15); enriches voice + product facts | `https://folkandfern.com`                            |
| `provider`       | enum                          | one of product's `byokProviders`                                       | `anthropic`                                          |
| `byokKey`        | string (secret)               | non-empty; validated live pre-run (platform-spec §5)                   | `sk-…`                                               |

> This is the only Segment-6 product whose **primary input is a form**, not a URL. The form is the source of truth; `storeUrl` is optional enrichment. `brandVoice` + `audience` + `productSummary` are the levers that make the copy brand-specific and DTC-tuned (doc 03 §2.4). `welcomeCount`/`cartCount` let the buyer size each sequence.

### Processing (requirements level; pipeline in §7)

(Optionally) crawl `storeUrl` (single-page extractor) to pull real product names, benefits, and voice cues → assemble a **brand brief** (form fields + any enrichment) → AI step writes both sequences (welcome + abandoned-cart) with per-email subject, preview, timing, goal, and body, filling the Output Contract → render report + PDF + the paste bundle + email.

### Outputs

A **DTC Email Flow Pack** (on-screen + PDF + JSON + a plain-text/markdown bundle of all emails). Exact shape in §6.

### Constraints

- Optional URL: **single page** crawl (homepage or `storeUrl`) only; ≤ 2 fetches; 8s per-fetch timeout; 15s enrichment cap; the run never blocks on enrichment (if it fails, generate from the form alone).
- Sequence sizes bounded: `welcomeCount`/`cartCount` 2–5 each → at most 10 emails total per run (cost + quality bound).
- Respect `robots.txt` on enrichment; identify as `DigitribeCROBot/1.0`.
- `maxOutputTokens` capped (doc 04 §10) so one run stays well under $0.20 on the buyer's key even at 10 emails.

## 6. ⭐ Output Contract

> The locked schema the AI step is forced to fill (`AiRunner.structured`, doc 04 §7; platform-spec §5). The contract encodes the **answer-first** hierarchy (doc 03 §2.2): a one-line strategy summary → the two flows → each email as a fully-structured unit. Both flows are always present; email counts respect the requested sizes. The copy is generative but **constrained to the brand brief** — no invented product facts, prices, or claims beyond the form/enrichment.

```ts
// server/store/schemas/dtc-email-flows.ts
import { z } from 'zod'

const Email = z.object({
  position: z.number().int().min(1), // order within the flow (1-based)
  subject: z.string().max(120), // the subject line
  previewText: z.string().max(160), // inbox preview / preheader
  timing: z.string().max(80), // human send delay, e.g. "Immediately", "1 hour after", "Day 2"
  delayHours: z.number().min(0), // machine-usable delay from the trigger, for ESP setup
  goal: z.string().max(160), // the single job of this email (e.g. "introduce the brand story")
  body: z.string().max(2200), // full email body copy, paste-ready, brand-voiced
  cta: z.object({
    label: z.string().max(40), // button/link text
    intent: z.string().max(120), // where it should point ("to the product page"), not a fake URL
  }),
})

const Flow = z.object({
  type: z.enum(['welcome', 'abandoned_cart']),
  label: z.string(),
  goal: z.string().max(240), // the job of the whole sequence
  trigger: z.string().max(160), // when it fires (e.g. "on email signup", "1h after cart abandon")
  emails: z.array(Email).min(2).max(5), // length matches the requested count
})

export const DtcEmailFlowsOutput = z.object({
  brand: z.object({
    name: z.string(),
    voice: z.enum(['playful', 'premium', 'bold', 'warm', 'minimal', 'expert']),
    audience: z.string(),
    enrichedFromUrl: z.boolean(), // did URL enrichment run successfully?
    detectedProducts: z.array(z.string()).max(12), // real product/benefit names used (from form/enrichment)
  }),
  strategySummary: z.string().max(400), // answer-first: the lifecycle strategy in 2–3 sentences
  flows: z.array(Flow).length(2), // always [welcome, abandoned_cart], in that order
  subjectLineBank: z.array(z.string()).min(4).max(12), // extra A/B subject-line options to test
  setupNotes: z.array(z.string()).max(6), // ESP-agnostic "how to wire this up" notes
  upsell: z.object({
    wantsManaged: z.boolean(), // → agency DTC retainer (build in Klaviyo + run it)
    reason: z.string(),
  }),
})
export type DtcEmailFlowsOutput = z.infer<typeof DtcEmailFlowsOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded, via report renderer, platform-spec §8) · **JSON** (the raw contract) · **TXT/MD bundle** (all emails as plain, paste-ready blocks — the "drop into any ESP" deliverable; written to Blob, doc 04). Each email renders with a **copy button** (subject + body separately).
- **Field notes:** there are **no scores/grades** here — this is a generative product, not an audit, so the contract has no `score`/`grade`/`dimensions` (the answer-first element is `strategySummary` + the structured flows). `enrichedFromUrl` and `detectedProducts` reflect what was actually available. `delayHours` is the machine-usable companion to the human `timing` so a buyer (or a v2 ESP push) can configure the automation exactly.
- **Determinism:** `flows` is always length 2, always `[welcome, abandoned_cart]` in that order — the report layout relies on it. Each flow's email count equals the requested `welcomeCount`/`cartCount`. CTA `intent` describes where the link points; the model never fabricates a URL.

## 7. System logic / pipeline

```
POST /api/store/run/dtc-email-flows  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod) + SSRF (if URL)   emit{phase:"validate",pct:10}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:15}
  │
  ├─ (optional) ENRICH  if storeUrl: crawlPage(storeUrl)     emit{phase:"crawl",pct:18..35,
  │     server/store/tools/agentic/extract-page.ts             message:"Reading your store…"}
  │     - single-page fetch (SSRF-guarded, robots-OK)
  │     - extract real product names, hero copy, benefits,
  │       voice cues; never blocks — on fail, skip silently
  │     → BrandBrief enrichment (enrichedFromUrl = true|false)
  │
  ├─ ASSEMBLE  buildBrandBrief(form, enrichment?)            emit{phase:"analyze",pct:40}
  │     - merge form fields + any enrichment into one brief
  │
  ├─ GENERATE  ai.structured({                               emit{phase:"generate",pct:45..92,
  │     system: EMAIL_FLOWS_SYSTEM,            // §9                message:"Writing welcome flow…"
  │     prompt: buildPrompt(brandBrief, welcomeCount, cartCount),  then "Writing cart flow…"}
  │     schema: DtcEmailFlowsOutput,           // §6 — SDK-enforced
  │     effort: "high",
  │   })  → DtcEmailFlowsOutput                // structuredStream: stream emails as written
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:95}
  │     - on-screen JSON, branded PDF, TXT/MD bundle → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — the copy quality IS the product. Enrichment + assemble are deterministic Node, cheap. Stream the object so each email appears as it's written (doc 03 §3 — "show the work": emails populate one by one).
- **Libraries:** optional enrichment reuses the Segment-1 single-page extractor (`cheerio`/`linkedom`). No new libs. The TXT/MD bundle is built by `report.ts` (doc 04 §1 / platform-spec §8) — same Blob path the Kit uses for its zip.
- **Reuse:** the **only** Segment-6 product that uses the crawler optionally. It composes the shared `extract-page.ts` (sibling of `extractPdp`/`extractPricing`) but degrades gracefully to form-only. No commerce-page parsing needed — just readable content + voice cues.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — strongest at sustained brand voice across a multi-email sequence and at varied, non-templated subject lines), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (faster, fine for shorter 2-email flows). Per platform-spec §5.
- **Buyer cost expectation** (show in UI, doc 03 §5): one run writes up to ~10 emails in a single structured generation → typically **under $0.20 on the buyer's key** (the largest-output product in Segment 6, so set the expectation explicitly). The `maxOutputTokens` cap bounds it.
- **Pre-run validation:** a 1-token ping via the AI wrapper (`AiRunner.ping`); on failure return edge #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by the AI SDK `generateObject`/`streamObject` against `DtcEmailFlowsOutput` (doc 04 §7) — the model writes into the exact flow/email shape, so sequence structure, timing fields, and counts are guaranteed.

**System prompt (draft):**

```
You are a senior DTC lifecycle email copywriter. You write welcome and abandoned-
cart sequences for ecommerce brands the way a top retention studio does: a clear job
per email, sensible timing, subject lines that earn the open, and copy that sounds
like the brand — concrete, human, and DTC, never corporate.

You are given a brand brief (name, what they sell, audience, voice, optional offer,
and optionally real content pulled from their store). Write TWO complete sequences:
a welcome flow and an abandoned-cart flow, with the requested number of emails each.

Rules:
- Use ONLY facts in the brief plus any enrichment. Never invent product names,
  prices, discounts, claims, or guarantees not given. If an offer wasn't provided,
  don't fabricate one — write the sequence to work without a discount.
- Match the requested brandVoice exactly. A "playful" brand reads playful; a
  "premium" brand reads restrained and confident. The voice must be consistent
  across every email in both flows.
- Each email needs a distinct JOB (don't repeat the same pitch 3 times): e.g. a
  welcome flow goes brand-story → value/proof → first-purchase nudge; a cart flow
  goes reminder → objection-handling/benefit → urgency/incentive.
- Subject lines must be specific and varied — no "Don't miss out!" filler, no emoji-
  soup. Each one should fit this brand.
- Timing must be realistic for the trigger (welcome: immediate → over a few days;
  cart: ~1h → ~24h → ~48h). Fill delayHours to match the human timing label.
- CTAs describe intent ("to the product page"); never write a fake URL.
- No "In today's fast-paced world," no "I hope this email finds you," no restated
  prompt, no hedging. Write like a brand that ships.
```

**User prompt template:** `buildPrompt(brandBrief, welcomeCount, cartCount)` serializes the merged brief (brand name, product summary, audience, voice, offer, any enriched product names/benefits/voice cues) and states the exact number of emails required for each flow.

**Model + effort per call:** one call, `effort: "high"` — the single artifact, copy-quality-bound. (Streaming surfaces each email as written for the progressive UI.)

**Guardrails:** schema enforcement guarantees both flows, the requested counts, and every email's structural fields; the "ONLY facts in the brief" rule + "don't fabricate an offer" curb hallucinated discounts/claims (doc 03 §2.5); the per-email distinct-job + varied-subject rules prevent the repetitive, templated feel that marks cheap AI email; the voice-consistency rule enforces brand fit. Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

> Every row is also a test in §18.

| #   | Trigger                                     | Detection                       | Behavior / message                                                                            | Quota          |
| --- | ------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------- | -------------- |
| 1   | Invalid/expired BYOK key                    | pre-run ping fails              | "Your `<provider>` key looks invalid or expired — check and retry."                           | not spent      |
| 2   | Thin brief (1-word product summary)         | input minLength + heuristic     | accept but prompt nudges in-form ("add a sentence for sharper copy"); still generate honestly | spent          |
| 3   | `storeUrl` provided but unreachable/blocked | enrichment fetch fails          | generate from the form alone; `enrichedFromUrl:false`; non-blocking note in the pack          | spent          |
| 4   | `storeUrl` is IP/localhost/private          | input validation (SSRF guard)   | reject the URL field only: "Enter a public store URL (or leave it blank)."                    | not spent      |
| 5   | Provider rate-limit / timeout mid-generate  | AI wrapper error                | retry once w/ backoff; if still failing, error + restore quota                                | restored       |
| 6   | Model returns thin/repetitive copy          | per-email body length + dedup   | still deliver; pack flags "regenerate with more brand detail for sharper copy"                | spent          |
| 7   | Buyer requests max emails (5+5)             | count validation                | honored within the 10-email cap + `maxOutputTokens`; cost note shown pre-run                  | spent          |
| 8   | Voice not matched / off-brand output        | eval (voice judge) / buyer view | re-run quota lets the buyer regenerate; eval guards regressions pre-launch (§18)              | spent (re-run) |
| 9   | Duplicate submit (double-click)             | same `runId` (idempotency §6)   | return in-flight/cached result; never double-charge                                           | n/a            |
| 10  | Network failure mid-enrichment              | per-fetch try/catch             | skip enrichment, continue from form; accurate `enrichedFromUrl:false`                         | spent          |
| 11  | Quota exhausted                             | token check                     | "You've used all 3 runs — buy again or contact us." + buy CTA                                 | n/a            |

These map to doc 04 §5 `StoreError` codes. Note: because the primary input is a form, there's no "URL unreachable = no run" case — the form alone always produces an artifact; URL failures degrade gracefully (#3/#10).

## 11. UX / UI flow

**Sales page** (`/store/dtc-email-flows`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states** (generic 8-state machine, doc 06 §4; this product adds a richer **form** + its `ArtifactView`):

- **Empty / collecting input:** the brand brief form — `brandName`, `productSummary` (textarea), `audience`, `brandVoice` (a segmented control of the 6 voices), `offer` (optional), `welcomeCount`/`cartCount` (steppers, 2–5), `storeUrl` (optional, with "we'll read your store for voice + product details" helper), provider select + `KeyInput` ("where do I get a key?" + "we never store your key"). **Run** disabled until required fields valid. Inline help makes the form feel guided, not a wall.
- **Validating key:** inline ✓/✗ on the key field (`/key-check`).
- **Running:** full-width `RunProgress` from SSE — real labels ("Reading your store…" if URL, "Writing welcome flow…", "Writing cart flow…"), progress bar, a rotating DTC-lifecycle tip ("Why the 2nd cart email outperforms the 1st"), `aria-live="polite"`. **Emails stream in** one by one as written (the "show the work" moment).
- **Partial:** if enrichment failed, a non-blocking "wrote from your brief (couldn't read the store)" banner; continue to success.
- **Success / artifact view** (`components/store/artifacts/dtc-email-flows.tsx`):
  - Top: brand name + voice chip + the **strategy summary** (answer-first).
  - **Two flow sections** (Welcome / Abandoned Cart), each a vertical **timeline** of email cards in send order: per card → `timing` badge, subject line, preview text, the email's goal chip, body copy, CTA. Each card has **copy buttons** (subject, body, or whole email) — the `FileViewer` per-block pattern (doc 06 §2).
  - **Subject-line bank** (extra A/B options) as a copyable list.
  - **Setup notes** (ESP-agnostic wiring guidance).
  - **Downloads**: **Copy all** + **Download bundle** (TXT/MD) (primary), **PDF**, **JSON**, **Email me a copy** (pre-checked, auto-sent).
  - **Upsell card**: if `upsell.wantsManaged` → agency DTC-retainer CTA ("we'll build these in Klaviyo + run your lifecycle program"); a soft cross-link to the **Shopify PDP Optimizer**.
- **Error:** human message per §10 + one-click retry (form + key kept; never lose the brief).
- **Quota-exhausted:** gentle message + buy-again CTA.

Components from the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer`, `SeverityChip` (for voice/goal chips) (doc 06 §2). The email **timeline** is the one product-specific layout inside `ArtifactView`. Run states per doc 06 §4; copy tone per `PROJECT_VISION.md` (and DTC energy in the generated samples); density + tokens per doc 06 §1.

## 12. SEO

- **Target keyword(s):** "DTC email flow generator," "welcome email sequence generator," "abandoned cart email sequence," "Klaviyo flow copy" (tool intent).
- **`generateMetadata`:** title `DTC Email Flows — Welcome & Abandoned-Cart Sequences` (≤60); description: "Describe your brand and get two ready-to-send DTC email sequences — welcome and abandoned cart — with subject lines, timing, and goals. Instant, $19." (≤155). Canonical `/store/dtc-email-flows`. OG via `@vercel/og` (flow-timeline visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What flows do I get?", "Does it work with Klaviyo / Shopify Email?" (yes — copy is platform-agnostic, paste into any ESP), "Do you store my API key?" (no), "Can I edit the emails?" (yes — they're yours), "Does it send emails for me?" (no — it writes them; we deliver the pack to you).
- **Internal links:** marketing `/dtc` → here; blog posts on lifecycle/retention email → here; sibling **Shopify PDP Optimizer** (the page the emails drive traffic to) and **Positioning Generator** (the message the emails carry).
- **Programmatic surface (note):** example flow packs by vertical (skincare welcome flow, apparel cart flow) as indexable `/store/dtc-email-flows/examples/<vertical>` pages — strong SEO surface; defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA (doc 06 §5): every form field labeled; the `brandVoice` segmented control is a real `radiogroup`; the steppers have accessible labels + values; provider/key in a `<fieldset>` with legend; `RunProgress` `role="status"` + `aria-live="polite"`; focus moves to the strategy-summary `<h2>` on success; the email timeline is navigable (each email is a labeled region); copy buttons announce "copied."
- Mobile: single-column form; the two flow timelines stack; email cards full-width; "copy all"/download full-width. First-class on mobile (founders will read this on a phone).
- Error recovery: inline, non-destructive (the whole brief preserved); "retry" re-runs without re-entering the key (session memory, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route (doc 05 §6).

## 14. Payment integration

- Create Polar product **"DTC Email Flows" $19** (sandbox + live). Checkout metadata `{ slug: "dtc-email-flows" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a valid pack. Quota auto-restores on system-side failures (§10 #5).

## 15. Security & privacy

- **Buyer data:** the brand brief (brand name, product summary, audience, voice, offer) + optionally the crawled **public** store content. The brief is buyer-supplied business copy, not sensitive PII. Retention: brief + artifact stored 30d (KV/Blob TTL) for re-download, then purged (platform-spec §10).
- **Product-specific risks:**
  - **SSRF** on the optional `storeUrl` — reuse the Segment-1 guard (block private IPs/localhost/metadata, non-http(s), DNS re-check, redirect cap). The URL is optional, so the guard rejects only the URL field, never the run.
  - **Untrusted HTML** on enrichment — parse, never execute; sanitize before use; never `dangerouslySetInnerHTML` of crawled content or generated copy.
  - **Generated-content safety** — the model writes marketing copy; the "no fabricated offer/claim" rule (§9) prevents it inventing discounts or unverifiable claims the buyer might unknowingly send.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `flows_generated: { welcomeCount, cartCount, enriched }`, `flows_copy_copied: { flow, position }` (which emails get copied — the strongest activation proxy), `flows_bundle_download`, `flows_upsell_click`.
- **Activation:** purchase → first run that produces a valid pack. **Target ≥ 85%.** Secondary activation (value realized): at least one email copied or the bundle downloaded.
- Watch: run-error rate (<5%), refund rate (<3%), regenerate rate (high re-run usage may signal voice misses → eval attention), upsell CTR to the DTC retainer.

## 17. Development phases

> Vertical slices, each shippable/testable.

- **Phase 0 — Scaffold.** Registry entry (`dtc-email-flows`), Polar sandbox product, routes, empty `DtcEmailFlowsOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Contract + pipeline (no AI, form-only).** Input schema + output contract + `buildBrandBrief` + pipeline returning a schema-valid contract from a **fixture brief** with the AI step mocked (no URL). _AC: unit test: fixture brief → valid `DtcEmailFlowsOutput` with 2 flows + correct email counts; URL-omitted path works._
- **Phase 2 — Real run + UI + enrichment.** Wire BYOK + `ai.structured` (live AI, streamed emails), optional `storeUrl` enrichment (degrades gracefully), all 8 UI states, the email-timeline `ArtifactView`, report render + PDF + TXT/MD bundle + Resend email. _AC: E2E activation path green in sandbox with a real test key; URL-on and URL-off both produce a valid pack; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase gate.** Sales page copy, metadata, JSON-LD, OG, analytics, upsell card. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria:**
  - [ ] Sample output asset (a real anonymized flow pack) on the sales page + storefront card.
  - [ ] Artifact leads with the strategy summary (answer-first); flows in sensible order.
  - [ ] Output is provably input-specific (eval `input_specific` judge: copy references the real brand/product — doc 03 §2.1).
  - [ ] Designed presentation: the email-timeline with timing badges + voice/goal chips (doc 03 §2.3).
  - [ ] Branded, designed PDF export (not a screenshot).
  - [ ] Per-email copy buttons + the TXT/MD bundle download with labels.
  - [ ] Running state streams real phases + emails appear one by one (doc 03 §3).
  - [ ] All 8 UI states designed (doc 06 §4) — no default spinners/blank screens.
  - [ ] "We never store your key" + retention + expected-cost visible (doc 03 §5).
  - [ ] AI-tells absent (filler/templated-email eval passes — doc 03 §2.5); requested DTC voice present + consistent.
  - [ ] Senior copy throughout; `impeccable`/`taste` pass on artifact + sales page; `ui-ux-pro` + axe on the tool UI.
  - [ ] Mobile artifact view is first-class.
        _AC: checklist all green; axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified. _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)          | Test                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| #1 key invalid      | unit: pre-run ping mock rejects → error, quota intact                        |
| #3 URL unreachable  | unit: enrichment fetch fails → form-only generation, `enrichedFromUrl:false` |
| #4 SSRF on storeUrl | unit: IP/localhost/metadata URL rejected at validate (URL field only)        |
| #5 AI timeout       | integration: provider error → retry → quota restored on final fail           |
| #7 max emails       | unit: 5+5 → 10 emails, within cap, counts honored                            |
| #9 duplicate        | integration: same `runId` returns cached, no double quota                    |
| contract counts     | schema: requested counts ↔ `flows[].emails.length`; always 2 flows in order  |

Full method, fixtures, canonical mocks, sandbox-E2E, eval golden-set format + judges, and CI gates in [`../05-testing-strategy.md`](../05-testing-strategy.md). Note: the doc 05 §3 scenario matrix is **crawl-centric**; for this form-first product the relevant rows are the failure axis (KEY_INVALID, PROVIDER_TIMEOUT, refusal/empty, RATE_LIMITED) crossed with input variants (thin brief, full brief, URL-on, URL-off), not crawl-input rows. Product-specific eval expectations: ~8–12 real brand briefs across the 6 voices with expected properties (correct flow count + email counts, real brand/product names present, no fabricated offers); judges `input_specific`, `no_ai_tells` (no "Don't miss out!"/templated filler), `factual` (no invented discounts/claims), plus a product-specific **`voice_match`** judge ("does the copy match the requested brandVoice?") and a **`sequence_logic`** judge ("does each email have a distinct job; is the timing sane?"). Threshold ≥ 0.85, zero fabrication.

**The one test that matters most:** fixture brief → pipeline (mocked AI returning a fixed object) → **valid `DtcEmailFlowsOutput`** with exactly 2 flows in `[welcome, abandoned_cart]` order and email counts matching the request.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF+**bundle** §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine), from [`../04-implementation-contracts.md`](../04-implementation-contracts.md): `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. Spine modules must pass `segment-0-spine` DoR.
- **New libs:** none. Optional enrichment reuses `server/store/tools/agentic/extract-page.ts`; the TXT/MD bundle uses the existing `report.ts` Blob path.
- **Cross-product reuse:** shares the optional single-page extractor with the Shopify PDP Optimizer + SaaS Pricing Teardown (it's the only consumer that treats it as optional). No commerce parsing needed.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($19).
- `OPEN QUESTION:` **ESP integration (v2)** — v1 outputs platform-agnostic plain copy. A v2 "push to Klaviyo" mode (create the flows directly via the Klaviyo API) is the obvious upgrade but needs OAuth + per-account consent + an app listing. Defer; keep `delayHours` in the contract now so a future push has machine-usable timing.
- `OPEN QUESTION:` flow-type breadth — v1 ships welcome + abandoned-cart only. Post-purchase, browse-abandon, win-back, replenishment are the v2 set (same contract, more `Flow` types). Decide whether they're more emails in this SKU or a higher tier.
- `OPEN QUESTION:` SMS — a sibling SMS-flow output is a v2 idea; out of scope for v1.
- **Risk — generic/templated email (the #1 quality risk for a generation product):** mitigation = the distinct-job + varied-subject + voice-consistency prompt rules, the `voice_match` + `sequence_logic` eval judges as launch guards, and the re-run quota so a buyer can regenerate. This is the single thing that could make the artifact feel like "cheap AI output" (doc 03 §7) — guard it hardest.
- **Risk — fabricated offers/claims the buyer might send:** mitigation = the "no invented offer/claim" prompt rule + the `factual` eval judge; the offer field is the only place a discount can come from.
- **Risk — buyer expects HTML templates / sending:** mitigation = FAQ + sales copy scope this to copy + structure, paste-ready, no sending.
- **Risk — buyer surprised by their own API cost (largest-output product):** mitigation = explicit expected-cost note in the UI (§8) + the `maxOutputTokens`/10-email cap.
  </content>
