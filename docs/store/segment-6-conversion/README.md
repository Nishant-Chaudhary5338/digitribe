# Segment 6 — Conversion & Growth

> The CRO and paid-acquisition craft Digitribe sells to $5k+ clients, **productized and sold instant.** Read [`../00-overview.md`](../00-overview.md) and [`../01-platform-spec.md`](../01-platform-spec.md) first.

---

## Thesis

Every product in this segment is a piece of the studio's actual method, made self-serve. When Manu audits a landing page or message-matches an ad to its LP, when Nishant ships a conversion-tuned site or a Claude-powered sales agent — that judgment is a repeatable senior **method**, not a one-off. Segment 6 encodes that method into BYOK tools a founder can buy at 2am, run on their own key, and walk away with a finished artifact.

Two things make this segment different from a generic "AI marketing tool":

1. **It's the agency's real craft, not generic AI output.** A Conversion Teardown reads like a Digitribe audit — above-the-fold, clarity, friction, trust, CTA, scored and prioritized — not like "10 tips to improve your page." Doc 03 §2 is the bar: every artifact must be input-specific, prioritized, and beautifully presented, or it fails review.

2. **Every product is a warm lead for the agency.** A founder who pays $29 to teardown their page and sees 14 prioritized fixes is the most qualified lead we'll ever get for a Landing Page Sprint, Growth Engine retainer, or AI Agent build. Each artifact ends with an honest, specific agency cross-sell ("you can fix items 1–6 yourself; items 7–14 are a Landing Page Sprint") routed to the existing free `/audit` and the relevant service. The tool does the qualifying; the artifact does the pitching.

**Why us:** this is literally what Digitribe does for money. Nishant already built **Digibot**, the AI sales assistant running on this site — Segment 6's flagship _productizes the thing that already exists_. Manu runs paid acquisition (Meta, Google, TikTok, LinkedIn) at operator level — the ad and message-match tools are his playbook, not a prompt someone guessed.

### The dual-DNA rule (every product obeys it)

Digitribe serves two audiences with sibling-but-distinct identities (`PROJECT_VISION.md` §4): **DTC** (bold, fast, paid-acquisition-led, $5M–$20M e-commerce) and **SaaS** (editorial, credibility-led, Seed→Series A). A CRO finding that's right for a DTC PDP is wrong for a SaaS pricing page. So **every Segment-6 product is DTC/SaaS-aware**: it either takes an explicit `audience` toggle or infers it from the input, and the artifact visibly adapts — the heuristics it scores against, the examples it gives, the rewrites it suggests, and the tone all shift. A DTC buyer's report feels DTC; a SaaS buyer's feels SaaS (doc 03 §2.4). This is the single most important way these tools read as "made by senior people," not by a generic wrapper.

### Market signals (cite in sales copy)

- The average landing-page conversion rate sits around **2–6%** across industries; the gap between a median page and a well-optimized one is often 2–3× revenue on the same traffic — the entire ROI case for CRO. _(Source list tracked in `../research-sources.md`.)_
- **Message-match** (ad promise → landing-page payoff) is one of the highest-leverage, most-neglected paid-acquisition fixes: a mismatch silently taxes every click you pay for. This is core to how Manu lowers CPA.
- AI sales/chat assistants that are **trained on the business** (not a generic FAQ bot) measurably lift qualified-lead capture — and the buyer pays inference on **their own key**, so the margin is structural.
- Agencies charge **$2,500+** for a one-off CRO audit and **$5k+** for an embedded sales assistant. We sell the same senior judgment for $19–$49, instant, and use it to feed the $5k engagement.

> Sources tracked in `../research-sources.md` (shared citation list across sales pages). `OPEN QUESTION:` finalize the exact conversion-benchmark figures + citations before sales copy ships — use ranges, never invented precision (doc 03 §2.5).

## Products

Two audiences, one shared method. The flagship productizes an asset that already exists in this repo; the rest are the studio's CRO + paid-acquisition playbook, each DTC/SaaS-aware and each a warm lead for the agency.

| Slug                    | Name                              | Price | Input → Artifact                                                                                                    | Status              |
| ----------------------- | --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `digibot-in-a-box`      | **Digibot-in-a-Box** ⭐           | $49   | site URL + AI key → embeddable, conversion-tuned AI sales assistant (widget config + `<script>` + knowledge digest) | PRD ✅ this segment |
| `conversion-teardown`   | **Conversion Teardown**           | $29   | URL (+ DTC/SaaS + goal) → scored, prioritized senior CRO report with specific rewrites                              | PRD ✅ this segment |
| `ad-message-match`      | **Ad → Landing Message-Match**    | $29   | ad copy/screenshot (+ image) + LP URL → per-element message-match audit + fixes                                     | PRD ✅ this segment |
| `ad-hook-generator`     | **Ad Angle & Hook Generator**     | $19   | product URL/desc + offer + channel → 20 scroll-stopping hooks/angles, organized, DTC/SaaS-aware                     | PRD ✅ this segment |
| `shopify-pdp-optimizer` | Shopify PDP Optimizer             | $29   | Shopify product URL → conversion teardown of the PDP + rewritten copy blocks                                        | PRD ⬜ (parallel)   |
| `saas-pricing-teardown` | SaaS Pricing-Page Teardown        | $29   | pricing-page URL → packaging/anchoring/clarity teardown + rewrites                                                  | PRD ⬜ (parallel)   |
| `dtc-email-flows`       | DTC Email-Flow Generator          | $19   | brand URL + offer → core lifecycle flows (welcome, abandoned cart, post-purchase) copy                              | PRD ⬜ (parallel)   |
| `positioning-generator` | Positioning & Messaging Generator | $19   | product URL/desc → positioning statement, value props, objection handling, hero copy                                | PRD ⬜ (parallel)   |

**Funnel within the segment:** `ad-hook-generator` ($19, top of funnel, pure generation, lowest commitment) → `conversion-teardown` / `ad-message-match` ($29, the audits) → `digibot-in-a-box` ($49, the flagship, an asset they install and keep). Every artifact's cross-sell routes up the price ladder _and_ out to the agency's free `/audit` and paid services.

**Funnel out to the agency (the warm-lead engine):**

- A **Conversion Teardown** that flags structural problems → "items 7–14 are a rebuild, not a copy tweak" → Landing Page Sprint / Marketing Site → free `/audit`.
- An **Ad Message-Match** showing systemic mismatch → Meta/Google Ads management (Manu) → free `/audit`.
- A **Digibot-in-a-Box** install → "want this wired into your CRM with evals and custom tools?" → AI Agent Development (Nishant).

## Shared logic across this segment (build once, reuse)

Three of the four products in this PRD set need to read a live page. **They reuse the Segment-1 crawl spine** — do not build a second crawler.

1. **Crawl spine (from Segment 1, `server/store/tools/agentic/`).** `crawlSite(url, {maxPages, maxDepth})` and its page extractor (readable text, headings, meta, existing schema, commerce/auth signals, JS-only detection, SSRF guard — platform-spec §10). Used by:
   - `digibot-in-a-box` — to crawl the buyer's site and build the **knowledge digest** the assistant is trained on (multi-page crawl, the deepest use).
   - `conversion-teardown` — to fetch + extract the page under audit (above-the-fold structure, copy blocks, CTAs, trust elements; usually 1 page, optionally a few).
   - `ad-message-match` — to fetch + extract the **landing page** the ad points to (1 page).
   - `ad-hook-generator` — _optionally_ crawls 1 page if given a URL; works from a text description alone otherwise.

   > The crawl spine is shared infrastructure — reference it (`agent-ready-kit.md` §7, doc 04 §1 `tools/agentic/`); never restate or fork it. Where a Segment-6 product needs above-the-fold / visual-order awareness the agentic crawler doesn't capture (e.g. teardown needs DOM order + image presence), extend the **shared extractor** with the extra fields and let Segment 1 benefit — don't branch.

2. **DTC/SaaS audience resolver (new, shared in this segment).** A small `resolveAudience(input, crawlResult)` helper: if the buyer set an explicit toggle, use it; else infer from signals (cart/price/checkout/Shopify → DTC; pricing tiers/"book a demo"/"start free trial" → SaaS). Returns `'dtc' | 'saas'` and feeds every prompt's persona + heuristic set. Lives in `server/store/tools/conversion/audience.ts` and is imported by all four (and the four parallel products). This is how the dual-DNA rule (above) is enforced in one place.

3. **Senior-method prompt scaffolding (new, shared).** The CRO dimension taxonomy (above-the-fold, clarity, friction, trust, CTA), the message-match scoring rubric, and the anti-AI-tell / input-only-facts / honest-confidence guardrails (doc 03 §2.1, §2.5) are shared prompt fragments in `server/store/prompts/conversion/_shared.ts`, composed per product. So "what a senior CRO audit checks" is defined once, and a Teardown and a PDP Optimizer grade against the same backbone.

4. **The agency cross-sell block (shared Output Contract fragment).** Every Segment-6 Output Contract includes a `crossSell` object (which agency service this leads to + an honest, input-specific reason). Rendered once by a shared `AgencyCrossSell` artifact component. Defined here so all eight products are consistent and so the warm-lead funnel is a first-class, schema-guaranteed field — not an afterthought bolted onto prose.

> Everything else (payments, tokens, BYOK, runner, report/PDF/zip, the 8-state tool UI, email) is the spine — products reference it (doc 01 §all, doc 04), never restate it.

## Eat our own dog food

This segment _is_ Digitribe's craft. The store's own sales pages and the marketing site should visibly pass the bar these tools sell — a Conversion Teardown of `/store/digibot-in-a-box` should score well, because we built it. Where it doesn't, fix the page. And the marketing site already runs Digibot — Segment 6 sells the productized version of our own running asset, which is the most honest demo there is: "the assistant on this page is the thing you're buying."
