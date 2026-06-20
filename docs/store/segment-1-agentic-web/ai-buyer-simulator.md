# "Can an AI buy from you?" Simulator — PRD

**Slug:** `ai-buyer-simulator` · **Segment:** 1 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Reuses the Segment-1 **crawl spine** ([`agent-ready-kit.md`](./agent-ready-kit.md) §7) and **extends it with a transaction-path traversal**: it walks the buy journey (browse → product → cart → checkout) the way an AI shopping agent would and reports the **exact step where the agent breaks**, why, and how to fix it. Build the Agent-Ready Kit first; this composes its crawler.

---

## 1. TL;DR

- **One-liner:** Paste your store's URL → see exactly where an AI shopping agent trying to buy from you gets stuck, step by step, with the fix for each blocker.
- **Problem:** AI agents are starting to shop and check out on behalf of users. Most sites silently fail somewhere in browse→cart→checkout — a JS-only product page, a CAPTCHA, a multi-step modal cart, no machine-readable price — and the owner has no idea they're losing the channel.
- **Buyer:** DTC / ecommerce owners and growth leads who've seen "AI is sending shopping traffic" and need to know if an agent can actually _transact_, not just read.
- **Input → Output:** one store URL (+ optional product/checkout path) → an **Agent-Transactability Report**: each step of the buy journey marked pass/fail, the specific blocker at each fail, the fix, an overall **transactability score**, and the prioritized fixes — with a clear path to the WebMCP Generator for the deeper fix.
- **Price:** **$39** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~40–90s (traversal-bound) · **Re-run quota:** 3.

## 2. Problem & market

**Today** an ecommerce owner has no way to know whether an AI agent can complete a purchase on their site. Human analytics don't capture it: a human shopper pushes through a slow modal cart or solves a CAPTCHA without thinking; an agent stops dead. The failure is invisible until the new channel is already lost. The standards that make checkout agent-traversable (machine-readable product/offer data, a stable cart/checkout path, `.well-known`/MCP or a commerce protocol endpoint) exist, but nobody tests a real store against them self-serve.

**Competition:** agent-readiness scanners (including our own Monitor/Kit) check the **description and structured-data layers** — "can an agent read you." None walk the **transaction layer** end to end and tell you "an agent gets to your cart and then can't proceed because the checkout is a JS-only modal behind a CAPTCHA." Enterprise commerce-protocol vendors target large retailers with sales calls. **Gap:** an instant, $39, self-serve simulation of an agent _buying_ from you, with a step-by-step break report. That's us.

**Urgency stat:** AI shopping traffic up ~4,700% YoY (Adobe); 93% of AI Mode sessions end without a click — and an agent that can read you but can't check out converts at zero. (See segment README for the citation list.)

**Why Digitribe:** we build MCP servers and AI agents — we know exactly how an agent traverses a purchase and where real agents fail, so the report reflects how agents _actually_ behave, not a generic checklist. It's the natural transaction-layer companion to the Agent-Ready Kit, and it sells the WebMCP Generator (the fix for the hardest blockers).

## 3. Pricing & packaging

- **$39**, one-time. Priced **above** the Kit ($29) and Monitor ($19): it's a deeper, action-oriented diagnostic specific to revenue (a broken agent-checkout is lost sales), and it requires a heavier traversal. Anchored as "find the leak in your AI sales funnel for the price of one lost order."
- **Includes:** 1 run (3 re-runs in quota to re-test after fixes), the on-screen step report, the emailed PDF + JSON copy (Resend). It is a **report**, not a code bundle.
- **Upsell path:** the #1 fix for a broken transaction layer is exposing a real agent-usable endpoint → **WebMCP Endpoint Generator** ($149); buyers who haven't done the description layer yet are routed to the **Agent-Ready Kit** ($29); agency CTA for "want us to make your checkout agent-ready end to end?" → Digitribe services.
- **Future tiers (note only):** scheduled re-tests / regression alerts on the buy path is a v2 idea (pairs with the Monitor's recurring v2). v1 ships one SKU.

## 4. User stories / JTBD

- As a **DTC owner**, when I hear agents are shopping, I want to know if one can actually buy from me, so that I don't silently lose the channel.
- As a **growth lead**, when I'm prioritizing roadmap, I want to see the exact checkout step that blocks agents, so that I fix the highest-leverage thing first.
- As a **Shopify/headless store owner**, when I've added structured data, I want to confirm an agent can get from product to paid, so that I know the transaction layer works, not just the description layer.
- As a **founder**, when I'm pitching that we're "AI-commerce ready," I want a credible report I can show, so that the claim is backed by evidence.

**Primary job the artifact must nail:** correctly identify **the first real blocking step** in this specific store's buy journey and explain it concretely (the actual page, the actual blocker), with a fix — not a generic "improve your checkout." A reader must recognize their own store in the report.

**Non-goals (v1):** does NOT place a real order or enter real payment details (it simulates up to the checkout boundary, never transacts); does NOT bypass CAPTCHAs/anti-bot (it _reports_ them as blockers); does NOT fix anything or generate code (the WebMCP Generator does that); does NOT test behind login/auth checkout; does NOT guarantee an agent will buy (it identifies blockers, not demand).

## 5. Functional requirements

### Inputs

| Field          | Type                        | Validation                                                     | Example                 |
| -------------- | --------------------------- | -------------------------------------------------------------- | ----------------------- |
| `url`          | string (URL)                | http/https, public, resolves, not an IP/localhost (SSRF guard) | `https://shop.acme.com` |
| `productPath`  | string (optional, path/URL) | same-origin path or URL to a specific product to test          | `/products/blue-widget` |
| `checkoutPath` | string (optional, path/URL) | same-origin path/URL where checkout begins, if non-standard    | `/checkout`             |
| `provider`     | enum                        | one of product's `byokProviders`                               | `anthropic`             |
| `byokKey`      | string (secret)             | non-empty; validated live pre-run (platform-spec §5)           | `sk-…`                  |

> `productPath`/`checkoutPath` are optional hints. If omitted, the traversal **discovers** a representative product (first product detected in the crawl) and the conventional checkout entry. Hints make the report sharper and let the buyer test a specific path. Both are SSRF-guarded and forced same-origin as `url`.

### Processing (requirements level; pipeline in §7)

Crawl the store (reusing the Kit's crawler) to map commerce structure → run a **traversal of the canonical buy journey** as a series of discrete, checkable steps (locate product → read price/offer → add to cart → reach cart → reach checkout entry → assess checkout completability) → for each step capture pass/fail + the machine-observable blocker → feed the step transcript + crawl digest to the AI step, which **classifies each step, names the blocker, writes the fix, and scores transactability**, filling the Output Contract → render report + PDF + email.

**Traversal approach — the core technical question (see §7 + §20):** there are two viable ways to "walk the buy journey," and this product must support a clear default with a documented fallback:

1. **Fetch-based heuristic simulation (default for v1):** deterministic Node — fetch each step's HTML/JSON, detect machine-observable signals an agent relies on (a parseable price/`Offer`, an add-to-cart form vs a JS-only button, a same-origin cart URL vs an opaque XHR, a checkout page vs a third-party redirect, presence of CAPTCHA/anti-bot markers, structured data). This is fast, cheap, serverless-safe, and models **how a fetch/structured-data agent (the most common kind today) sees the store**. It cannot execute the store's JS.
2. **Headless-browser traversal (heavier, gated):** a real headless browser (Playwright) actually clicks through. More faithful for JS-heavy stores, but **heavy and fragile in Vercel serverless** (cold starts, binary size, the function timeout). **`OPEN QUESTION:` Playwright-in-serverless vs the fetch-based heuristic** — see §20. v1 ships the fetch-based simulation; the headless path is a documented, flagged enhancement, not a launch dependency.

The report is **honest about which mode ran**: a JS-only store under the fetch simulation is itself a finding ("an agent that doesn't execute your JS — most of them — sees an empty product page here"), which is exactly the signal the buyer needs.

### Outputs

The **Agent-Transactability Report** (on-screen + PDF + JSON). Exact shape in §6. No code bundle.

### Constraints

- Bounded traversal: a **fixed set of journey steps** (below), at most one representative product unless `productPath` given; ≤ ~15 page fetches total; 8s per-fetch timeout; 75s total cap (stream progress).
- Same-origin only for the traversal (don't follow a checkout that redirects to a payment processor's domain beyond detecting the handoff — never submit anything).
- **Never transact:** the traversal stops at the checkout completability assessment; it never submits payment, never creates an account, never places an order.
- Respect `robots.txt`; identify as `DigitribeAgentReadyBot/1.0`.

## 6. ⭐ Output Contract

> The locked schema the AI step is forced to fill (`AiRunner.structured`, doc 04 §7; platform-spec §5). The contract encodes the **answer-first** hierarchy (doc 03 §2.2): overall verdict → the first break → every step → prioritized fixes. The deterministic traversal supplies `observed` facts per step; the AI classifies, explains, and scores within them.

```ts
// server/store/schemas/ai-buyer-simulator.ts
import { z } from 'zod'

// The fixed, ordered buy-journey steps an AI shopping agent must complete.
const JourneyStepKey = z.enum([
  'discover_product', // find a buyable product from entry/url
  'read_offer', // machine-readable price + availability (Product/Offer)
  'add_to_cart', // an agent can add the item (form/endpoint, not JS-only click)
  'reach_cart', // a stable, readable cart state/URL
  'reach_checkout', // get to the checkout entry point
  'complete_checkout', // checkout is completable by an agent (no hard blocker)
])

const BlockerType = z.enum([
  'none',
  'js_only_render', // step requires executing the store's JS; fetch/structured agents can't
  'no_structured_data', // no machine-readable price/offer/availability
  'opaque_cart', // cart is an undiscoverable XHR / no readable state
  'captcha_or_antibot', // CAPTCHA / bot-wall blocks the step
  'auth_wall', // login required before an agent can proceed
  'third_party_redirect', // checkout hands off to a domain/flow an agent can't traverse
  'broken_or_unreachable', // 4xx/5xx/dead path
  'no_agent_endpoint', // no .well-known/MCP/commerce-protocol path for a programmatic buy
  'other',
])

const Step = z.object({
  key: JourneyStepKey,
  label: z.string(), // human label, e.g. "Add to cart"
  order: z.number().int().min(1).max(6),
  status: z.enum(['pass', 'partial', 'fail', 'not_reached']), // not_reached = a prior step blocked
  observed: z.string().max(280), // the DETERMINISTIC fact the traversal saw on THIS store (page URL, what was/wasn't found)
  blocker: BlockerType, // 'none' when status is pass
  explanation: z.string().max(320), // why this blocks an agent, in plain terms, specific to this store
  fix: z.string().max(320), // the concrete fix for THIS step
  fixedByWebmcp: z.boolean(), // true → the WebMCP Generator addresses this (transaction-layer fix)
})

export const BuyerSimOutput = z.object({
  store: z.object({
    url: z.string().url(),
    title: z.string(),
    platform: z.string().max(60), // detected platform if knowable ("Shopify", "WooCommerce", "custom/headless", "unknown")
    testedProductPath: z.string(), // the product the traversal actually used
    isCommerce: z.literal(true), // this product only runs on stores; non-commerce → edge case #11
    traversalMode: z.enum(['fetch_heuristic', 'headless_browser']), // honesty: which mode ran (§5)
  }),
  transactabilityScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  headline: z.string().max(160), // answer-first: "An AI agent gets to your cart, then hits a CAPTCHA it can't pass."
  firstBreakStep: JourneyStepKey.nullable(), // the first failing step (null if a clean A-grade pass)
  steps: z.array(Step).length(6), // always the 6 journey steps, in order
  topFixes: z.array(z.string()).min(2).max(5), // prioritized, the 2–5 things to fix first
  upsell: z.object({
    needsWebmcp: z.boolean(), // any fixedByWebmcp:true → route to WebMCP Generator
    needsAgentReadyKit: z.boolean(), // description-layer gaps (no_structured_data on read_offer) → Kit
    reason: z.string(), // one line tying the upsell to the actual finding
  }),
})
export type BuyerSimOutput = z.infer<typeof BuyerSimOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded, via report renderer, platform-spec §8) · **JSON** (the raw contract). **No ZIP** — this is a diagnostic report, not a file bundle.
- **Field notes:** `status` per step: `pass` (an agent clears it), `partial` (clears with friction/degraded data), `fail` (hard blocker), `not_reached` (a prior step blocked, so this couldn't be tested — the report must not pretend to have tested it). `blocker` enumerates the **real, observable** ways agent-checkout breaks. `score`/`grade` use the store-wide fixed 0–100 / A–F scale (A ≥90 … F <40), computed deterministically from step outcomes (see §7), not free-chosen by the model.
- **Determinism:** `steps` is always the same 6 keys in `order` 1–6; `observed` and `status`/`blocker` are anchored to the deterministic traversal (the model may not invent a pass the traversal didn't see); `firstBreakStep` must equal the first `fail` in order. `explanation`/`fix`/`headline` are generative but constrained.

## 7. System logic / pipeline (extends the Segment-1 crawl spine with a transaction-path traversal)

```
POST /api/store/run/ai-buyer-simulator  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod, SSRF on all paths) emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ CRAWL  crawlSite(url,{maxPages:~12,maxDepth:2})         emit{phase:"crawl",pct:15..40,
  │     ── REUSES Agent-Ready Kit §7 crawler ──                message:"Mapping your store…"}
  │     server/store/tools/agentic/crawl.ts
  │     - detect commerce, locate product/cart/checkout paths,
  │       structured data (Product/Offer), platform fingerprint
  │     - if not commerce → STOP, edge #11 (no quota spent ideally; see §10)
  │     → CrawlResult { pages[], signals, commerceMap }
  │
  ├─ TRAVERSE  walkBuyJourney(commerceMap, {productPath,     emit{phase:"analyze",pct:42..70,
  │     checkoutPath, mode:'fetch_heuristic'})                 message:"Step 3/6: add to cart…",
  │     server/store/tools/agentic/buy-journey.ts  (NEW)       findingCount:n}
  │     - for each of the 6 fixed steps, deterministically
  │       fetch + check the agent-observable signals (§5):
  │       discover_product → read_offer → add_to_cart →
  │       reach_cart → reach_checkout → complete_checkout
  │     - record { observed, status, blocker } per step;
  │       a hard fail marks subsequent steps not_reached
  │     - NEVER submits payment / places an order
  │     → JourneyTranscript { steps[], mode }
  │
  ├─ SCORE  scoreTransactability(JourneyTranscript)          emit{phase:"analyze",pct:72}
  │     - deterministic: weight each step, fails before checkout
  │       cost more; map to 0–100 + grade (fixed bands)
  │     - firstBreakStep = first 'fail' in order
  │
  ├─ GENERATE  ai.structured({                                emit{phase:"generate",pct:78..92}
  │     system: BUYER_SIM_SYSTEM,                // §9
  │     prompt: buildPrompt(crawlDigest, JourneyTranscript, baseScores),
  │     schema: BuyerSimOutput,                  // §6 — SDK-enforced
  │     effort: "high",                           // the report is the artifact
  │   })  → BuyerSimOutput                        // streamObject for progress
  │     - model WRITES headline/explanation/fix per step + topFixes,
  │       anchored to the transcript's observed facts & statuses
  │     - it MAY NOT flip a deterministic fail to a pass
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:96}
  │     - on-screen step report + branded PDF (no zip)
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — quality of the per-step explanation and fix is the product. The **traversal and scoring are deterministic Node** — they decide pass/fail; the AI only narrates and prioritizes within that, so it can't hallucinate a working checkout.
- **Libraries:** the Kit's crawler deps (`cheerio`/`linkedom`, `robots-parser`, `fast-xml-parser`) + structured-data parsing already present. **The fetch-based traversal needs no browser.** _The headless option, if pursued, needs `@playwright/test` + `playwright-core` + a serverless-chromium build — see §20 OPEN QUESTION; not a v1 dep._
- **Reuse:** `crawlSite` is imported unchanged from `agentic/`. The new module is `agentic/buy-journey.ts` (`walkBuyJourney` + `scoreTransactability`), built generic so a future "agent-checkout monitor" (v2) can reuse it. This product **adds the transaction-traversal layer to the shared spine** that the Kit/Monitor stop short of.

## 8. BYOK handling

- Providers: `anthropic` (**default `claude-opus-4-8`** — the per-step explanation/fix is the high-value artifact and benefits from the stronger model), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (acceptable for clear-cut stores; the report's nuance is better on Opus). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one structured generation over the journey transcript + digest (~few K input tokens) → typically **under $0.10 on the buyer's key**. The traversal itself costs no AI tokens (deterministic). State this so the $39 price is clearly product-value, not inference cost.
- **Pre-run validation:** a 1-token ping via `AiRunner.ping()`; on failure return error #1 without spending quota (doc 04 §7).

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by the AI SDK `generateObject` against `BuyerSimOutput` (doc 04 §7) — the model cannot return free-form, and the step `status`/`blocker`/`observed` it sees are **pre-filled from the deterministic transcript**, so its job is explanation + scoring narrative, not detection.

**System prompt (draft):**

```
You are an expert in agentic commerce: how AI shopping agents (ChatGPT/Operator-
style agents, Perplexity, Gemini, and fetch/structured-data agents) traverse a
store from finding a product to completing checkout, and where real agents break.

You are given (1) a digest of a crawled store and (2) a deterministic transcript
of an automated buy-journey traversal: for each of the 6 ordered steps, what was
observed, whether it passed/partial/failed/not_reached, and the detected blocker.
You did NOT run the traversal — trust its observed facts and statuses.

Produce an honest, STORE-SPECIFIC Agent-Transactability Report. Rules:
- NEVER change a step's pass/fail from what the transcript reports. You explain and
  prioritize; you do not re-judge. `firstBreakStep` must be the first failing step.
- `headline` is the single most important truth: where an agent gets in this store's
  buy journey and what stops it. Plain, specific, answer-first. Name the real step.
- For each step, `explanation` must reference THIS store's observed fact (the real
  product path, the actual missing Offer data, the specific redirect) — never a
  generic statement that could fit any store.
- `fix` must be concrete and the right altitude (e.g. "expose add-to-cart via a
  form POST or a documented endpoint" not "improve your cart"). Mark
  `fixedByWebmcp: true` for transaction-layer fixes an agent endpoint solves
  (add_to_cart/reach_cart/complete_checkout via a real MCP/commerce endpoint);
  mark `false` for owner-side fixes (server-render the product page, add Offer
  JSON-LD, remove the CAPTCHA on a non-payment step).
- Use ONLY facts from the digest/transcript. No invented products, prices, or
  endpoints. If the traversal ran in fetch mode and the store is JS-only, say so
  honestly: most agents don't execute JS, so this IS the agent's experience.
- topFixes: the 2–5 highest-leverage fixes, ordered. A blocker earlier in the
  journey outranks a later one.
- No marketing fluff, no "In today's landscape", no preamble. Senior and tight.
```

**User prompt template:** `buildPrompt(crawlDigest, journeyTranscript, baseScores)` → serializes the commerce digest (platform, product/cart/checkout paths, structured data found) + the full 6-step transcript (observed/status/blocker per step) + the deterministic `transactabilityScore`/`grade`.

**Determinism rationale (doc 03 §2.2):** pass/fail and the score are decided by `walkBuyJourney`/`scoreTransactability`, not the model — the model can't claim an agent can check out when the traversal saw it break. This is what keeps the report trustworthy and reproducible.

**Guardrails:** schema enforcement prevents drift; pre-filled statuses prevent the model re-judging; the "ONLY facts in the transcript/digest" rule curbs hallucinated endpoints/prices; `firstBreakStep`-must-match-transcript is validated post-generation (a mismatch → regenerate once, then surface). Handle `stop_reason:"refusal"`/empty per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

> Inherits the Kit's crawl/key/SSRF cases; adds transaction-traversal-specific ones. Every row is also a test in §18.

| #   | Trigger                                          | Detection                         | Behavior / message                                                                                          | Quota     |
| --- | ------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Invalid/expired BYOK key                         | pre-run ping fails                | "Your `<provider>` key looks invalid or expired — check and retry."                                         | not spent |
| 2   | URL unreachable / DNS fail / 5xx                 | fetch homepage fails              | "We couldn't reach `<url>`. Is it public and live?"                                                         | not spent |
| 3   | URL / productPath / checkoutPath is IP/private   | input validation (SSRF guard)     | reject at form: "Enter a public store URL."                                                                 | not spent |
| 4   | Not a commerce site (no product/cart signals)    | crawl commerce detection          | "We couldn't find a store to test at `<url>` — this tool simulates a purchase. Try a product URL." (no run) | not spent |
| 5   | JS-only store (product/cart need JS)             | fetch traversal sees empty SSR    | proceed in fetch mode; mark `js_only_render` blockers honestly — this IS what most agents see; score low    | spent     |
| 6   | CAPTCHA / anti-bot on a step                     | bot-wall markers in response      | mark `captcha_or_antibot` at that step, subsequent steps `not_reached`; do NOT attempt to bypass            | spent     |
| 7   | Checkout redirects to a 3rd-party processor      | cross-origin redirect on checkout | mark `complete_checkout` blocker `third_party_redirect`; never follow/submit; explain the agent impact      | spent     |
| 8   | `productPath`/`checkoutPath` wrong/404           | fetch 4xx                         | fall back to discovered paths + note "the path you gave 404'd; tested the discovered product instead"       | spent     |
| 9   | Provider rate-limit / timeout mid-generate       | AI wrapper error                  | retry once w/ backoff; if still failing, error + restore quota                                              | restored  |
| 10  | Auth wall before product/cart                    | login form / 401 on step          | mark `auth_wall`; report which step; (we don't test behind login)                                           | spent     |
| 11  | Homepage is non-HTML / app shell only            | content-type / empty SSR          | if no commerce can be mapped at all → treat as #4                                                           | not spent |
| 12  | Model tries to flip a deterministic fail to pass | post-gen `firstBreakStep` check   | regenerate once with a stricter reminder; if still inconsistent → use the deterministic statuses, flag      | spent     |
| 13  | Duplicate submit (double-click)                  | same `runId` (idempotency §6)     | return in-flight/cached result; never double-charge                                                         | n/a       |
| 14  | Network failure mid-traversal                    | per-fetch try/catch               | mark the failed step `broken_or_unreachable`, continue/score honestly; report accurately                    | spent     |
| 15  | Quota exhausted                                  | token check                       | "You've used all 3 runs — buy again." + buy CTA                                                             | n/a       |

## 11. UX / UI flow

**Sales page** (`/store/ai-buyer-simulator`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states** (the generic 8-state machine, doc 06 §4):

- **Empty / collecting input:** big URL field (primary), an advanced row (`productPath`, `checkoutPath` — "optional: test a specific product/checkout"), provider select + BYOK key field (`KeyInput` with helper + "we never store your key" + expected sub-$0.10 cost), and a visible **"We never place a real order — we stop at the checkout boundary"** safety line (doc 03 §5). **Run the simulation** button (disabled until valid).
- **Validating key:** inline ✓/✗ on the key field (`/key-check`).
- **Running (the showcase of the run, doc 03 §3):** `RunProgress` driven by SSE, but here the live narration is the **journey itself** — "Step 1/6: finding a product ✓", "Step 3/6: add to cart…", "Step 5/6: reaching checkout…" — each step ticks in as the traversal clears or fails it. This is far more compelling than a generic crawl bar: the buyer _watches an agent try to buy from them_. `aria-live="polite"`; a subtle agent-cursor animation.
- **Partial:** if a path 404'd or a fetch failed, a non-blocking banner; continue to success.
- **Success / report view** (the showcase, doc 03 §2):
  - Top: **`ScoreRing`** (transactability grade + 0–100) and the **`headline`** verdict, answer-first — e.g. "An AI agent reaches your cart, then can't check out — your checkout is a JS-only modal."
  - **The journey timeline** — the 6 steps rendered as a horizontal/stacked **stepper**, each with a pass/partial/fail/not-reached `SeverityChip` (icon + color + word), the `observed` fact, and an expand for `explanation` + `fix`. The **first break** is visually emphasized (this is the answer). `not_reached` steps are clearly dimmed, not faked.
  - **Top fixes** — the prioritized `topFixes`, each fix tagged "Fixed by WebMCP Generator" where `fixedByWebmcp:true`.
  - **Upsell card:** if `needsWebmcp` → "Expose an agent-usable checkout — **WebMCP Endpoint Generator, $149**" tied to the actual blocking step; if `needsAgentReadyKit` (e.g. missing Offer data) → "Make your offers machine-readable — Agent-Ready Kit, $29"; agency CTA.
  - Actions: **Download PDF** (primary — a forwardable "here's our agent-checkout gap" doc for the boss), **Download JSON**, **Email me a copy** (pre-checked, auto-sent). No ZIP.
- **Error:** clear message per §10 + retry; never lose entered input.
- **Quota-exhausted:** message + buy-again CTA.

Components: the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `SeverityChip`, `StatBar` (doc 06 §2). The only new component is `components/store/artifacts/ai-buyer-simulator.tsx` — the **journey stepper** (the one bespoke visual this product needs; built from `SeverityChip` + motion, no new library). Run states follow the state chart in `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md` — senior, plain, confident. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword(s):** "can an AI buy from my store" / "agent checkout test" / "AI shopping agent compatibility" / "agentic commerce readiness" (tool + informational intent).
- **`generateMetadata`:** title `Can an AI Buy From You? — Agent Checkout Simulator` (≤60); description: "Paste your store URL and watch an AI shopping agent try to buy — see the exact step it breaks on, why, and the fix. Instant, $39." (≤155). Canonical `/store/ai-buyer-simulator`. OG via `@vercel/og` (the journey-stepper / grade visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($39) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "Do you actually place an order?" (no — we stop at the checkout boundary and never submit payment), "What if my store needs JavaScript?" (we report that as a finding — most agents don't run your JS), "Do you store my API key?" (no), "What does 'transactability score' mean?" (how completable your buy journey is for an agent, 0–100 across 6 steps), "How do I fix a broken checkout step?" (the report gives the fix; deep transaction-layer fixes → WebMCP Generator).
- **Internal links:** **Agent-Ready Kit** (description layer) and **Agent-Readiness Monitor** (score) as siblings; **WebMCP Generator** as the upsell for the transaction-layer fix; marketing `/audit` → here; blog posts on agentic commerce → here.
- **Programmatic surface (note):** anonymized example reports as indexable `/store/ai-buyer-simulator/examples/<slug>` pages would target high-intent "is X agent-checkout ready" queries — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; provider/key grouped with `<fieldset>` + legend; the live journey progress region `role="status"` + `aria-live="polite"` announces step transitions ("Step 3 of 6 failed: add to cart"), not every pct tick; focus moves to the report heading (`<h2>` = `headline`) on success; logical tab order.
- **Severity never color-only:** every step uses chip = dot + icon + word (pass/partial/fail/not-reached); `firstBreakStep` emphasis pairs color with an explicit "first blocker" label; contrast ≥ AA against `--color-bg-card`.
- Mobile: the journey stepper becomes a vertical timeline (first-class, not a desktop afterthought); step details expand inline; download/email buttons full-width.
- Error recovery: errors inline + non-destructive (input preserved); "retry" re-runs without re-entering the key (kept in memory for the session only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route — zero serious/critical violations.

## 14. Payment integration

- Create Polar product **"Can an AI Buy From You? Simulator" $39** (sandbox + live). Checkout metadata `{ slug: "ai-buyer-simulator" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a valid report (e.g. the store couldn't be mapped at all and slipped past the pre-checks). Quota auto-restores on system-side failures (§10 #9). Edge #4/#11 ideally fail **before** quota is spent.

## 15. Security & privacy

- **Buyer data:** the target store URL + optional product/checkout paths + crawled **public** store content + the traversal transcript. Retention: traversal content used transiently for the run; the report (JSON + PDF) stored 30d (KV/Blob TTL) for re-download; then purged.
- **Product-specific risks:**
  - **SSRF** — #1 risk, on **three** inputs now (`url`, `productPath`, `checkoutPath`). All three must be validated and forced same-origin/public: block private IP ranges, localhost, link-local, cloud metadata IPs (169.254.169.254), non-http(s) schemes; resolve DNS and re-check the resolved IP; cap redirects; never follow a redirect off the original origin during traversal. Enforced in the shared crawler + `buy-journey.ts`; covered by the shared SSRF test table (doc 05 §4) extended to the path inputs.
  - **Never transact / never submit** — the traversal must never POST payment, create an account, or place an order. It is **read/observe-only** up to the checkout boundary; the "complete_checkout" assessment inspects completability, it does not complete. This is a hard invariant and a launch blocker, tested explicitly (§18).
  - **Don't trip anti-bot / respect the store** — identify as `DigitribeAgentReadyBot/1.0`, respect `robots.txt`, keep the traversal small (≤~15 fetches), rate-limit per the spine; report a CAPTCHA/anti-bot wall rather than attempting to defeat it.
  - **Untrusted HTML/JSON** — parse, never execute; sanitize before display; no `dangerouslySetInnerHTML` of store content.
- Shared rules (key handling, rate-limit, webhook verify) per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13; doc 04 §9) + product events: `bsim_traverse_complete` (`{ stepsPassed, mode }`), `bsim_grade` (`{ grade, firstBreakStep }`), `bsim_upsell_click` (`{ target: 'webmcp-generator' | 'agent-ready-kit' | 'agency' }`).
- **Activation:** purchase → first run that produces a valid report. **Target ≥ 85%.**
- **Strategic metric:** **Simulator → WebMCP Generator upsell conversion** — this product is the primary on-ramp to the $149 flagship; track `bsim_upsell_click{ target:'webmcp-generator' }` → downstream `store_purchase{ slug:'webmcp-generator' }`.
- Watch: run-error rate (<5%), refund rate (<3%), the distribution of `firstBreakStep` (a product-insight signal across buyers about where agent-checkout most commonly breaks — feeds blog/marketing content).

## 17. Development phases

> Vertical slices. **Depends on the Agent-Ready Kit's crawler existing** (`crawlSite`); the new work is the traversal layer.

- **Phase 0 — Scaffold.** Registry entry (`ai-buyer-simulator`), Polar sandbox product, empty `BuyerSimOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Traversal + contract (no AI).** Import `crawlSite`; build `walkBuyJourney` + `scoreTransactability` (`fetch_heuristic` mode) + input/output schemas; pipeline returns a schema-valid contract from a **fixture store** with the AI step mocked. _AC: unit tests over fixture stores (pass-all, fails-at-cart, JS-only, 3rd-party-redirect) → valid `BuyerSimOutput` with correct `firstBreakStep` and deterministic grade; SSRF guard tests pass on all three path inputs; the **never-transact** invariant is asserted (no POST/order in the traversal)._
- **Phase 2 — Real run + UI.** Wire BYOK + `ai.structured` (live AI), the live **journey stepper** running state, report render + PDF + JSON + Resend email (no zip). _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled; the model never flips a deterministic fail (post-gen check)._
- **Phase 3 — SEO + polish + the Showcase Checklist (doc 03 §6).** Sales page copy, metadata, JSON-LD, OG, a11y pass (axe), analytics events, upsell card. _AC: every box in the doc 03 §6 Showcase Checklist ticked (note: "file/code outputs" is N/A — report, not files; "branded PDF" applies); report is provably store-specific (eval); axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified. _AC: platform-spec §15 Definition of Done all checked. The Playwright/headless OPEN QUESTION (§20) is **resolved or explicitly deferred** with the fetch mode shipping._

## 18. Testing strategy

| Edge (§10)               | Test                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- |
| #1 key invalid           | unit: pre-run ping mock rejects → error, quota intact                                 |
| #3 SSRF (3 inputs)       | unit: IP/localhost/metadata/cross-origin in url/productPath/checkoutPath all rejected |
| #4 non-commerce          | unit: no commerce signals → edge #4, no run (no quota)                                |
| #5 JS-only store         | unit: empty-SSR fixture → `js_only_render` blockers, honest low score                 |
| #6 CAPTCHA               | unit: bot-wall fixture → `captcha_or_antibot`, subsequent steps `not_reached`         |
| #7 3rd-party redirect    | unit: checkout redirect fixture → `third_party_redirect`, never followed              |
| #8 bad path              | unit: 404 productPath → falls back to discovered, notes it                            |
| #9 AI timeout            | integration: provider error → retry → quota restored on final fail                    |
| #12 model flips a fail   | unit: post-gen `firstBreakStep`/statuses must match transcript; mismatch → regen/flag |
| #13 duplicate            | integration: same `runId` returns cached, no double quota                             |
| **never-transact (sec)** | unit: assert `walkBuyJourney` issues **no POST/order/payment** request on any fixture |

Full method, fixtures, the canonical mocks, the provider×input×failure **scenario matrix**, sandbox-E2E, eval golden-set format + judges, and CI gates are in [`../05-testing-strategy.md`](../05-testing-strategy.md). **New fixtures** needed: commerce HTML fixture stores under `tests/store/fixtures/sites/` — `shop-clean` (passes all 6), `shop-js-only`, `shop-fails-at-cart`, `shop-captcha-checkout`, `shop-3p-redirect` — each with a frozen expected transcript. Product-specific eval expectations: ~8 real stores with expected **grade band** + expected `firstBreakStep` + `mustFlag` blocker types; judges `input_specific` (the report names THIS store's real step/path), `no_ai_tells`, `factual` (no invented endpoints/prices), and a Simulator-specific `status_faithful` judge (the AI's per-step statuses exactly match the deterministic transcript).

**The one test that matters most:** fixture store (HTML fixtures) → `walkBuyJourney` (deterministic) + mocked AI → **valid `BuyerSimOutput`** whose `firstBreakStep` and per-step `status` exactly match the fixture's known break point, and the traversal made **zero transacting requests**.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. The spine modules must already pass `segment-0-spine` DoR.
- **From Segment 1 (reuse):** `server/store/tools/agentic/crawl.ts` (`crawlSite`) imported unchanged. **New shared module:** `server/store/tools/agentic/buy-journey.ts` (`walkBuyJourney`, `scoreTransactability`) — built generic for a v2 agent-checkout monitor.
- **New libs (minimal):** none for the v1 fetch-based traversal (reuses the Kit's parse deps). _Headless option (deferred, §20): `@playwright/test` + a serverless-chromium build — only if the OPEN QUESTION resolves toward it._
- **Cross-product reuse:** the `JourneyStepKey`/`BlockerType` enums and the stepper visual are this product's; the crawler and SSRF guard are shared.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($39).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1 (one-time, store-wide).
- `OPEN QUESTION:` `cheerio` vs `linkedom` — inherited from the Kit; resolve once for the shared crawler.
- `OPEN QUESTION: (the central one)` **Headless-browser (Playwright) traversal vs the fetch-based heuristic simulation in Vercel serverless.** Real headless automation is the most faithful test of a JS-heavy store but is heavy in serverless: large chromium binary, cold-start latency, and the function timeout make a multi-step click-through fragile. **Default v1 decision: ship the fetch-based heuristic simulation** (fast, cheap, serverless-safe, and accurately models how the _majority_ of today's agents — fetch/structured-data agents — see a store; a JS-only store failing the fetch traversal is itself the finding the buyer needs). Treat headless as a **flagged enhancement** later, possibly via a dedicated long-running runtime (Vercel Sandbox / a separate worker) rather than the standard function. **Must be resolved or explicitly deferred before Phase 4.** Owner: Nishant (Build).
- `OPEN QUESTION:` how to detect "platform" (Shopify/Woo/etc.) reliably and whether to special-case known platforms' canonical cart/checkout paths to make the traversal sharper. Default: best-effort fingerprint from the crawl; don't hard-depend on it.
- **Risk — false confidence / false alarm on the score.** A fetch-mode "fail" on a JS-only store could be read as "no agent can ever buy" when a full browser-agent might succeed. Mitigation: the report **always states `traversalMode`** and frames findings as "what a fetch/structured-data agent sees" with an honest note that browser-driving agents may differ; the headlining never overclaims. Eval `factual`/`status_faithful` judges guard it.
- **Risk — buyer expects us to _fix_ the checkout.** Mitigation: scope is diagnostic; the report's fixes + the WebMCP Generator/agency CTAs make the path to fixing explicit. FAQ + copy set expectations.
- **Risk — looking like we attempted fraud / hit anti-bot.** Mitigation: hard **never-transact** invariant (tested), small polite traversal, honest UA, respect robots; we _report_ anti-bot walls, never bypass them. Launch blocker.
- **Risk — SSRF across three URL/path inputs.** Mitigation: shared strict guard applied to all three, tested (§18); launch blocker.
