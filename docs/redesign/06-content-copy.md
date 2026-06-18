# 06 — Content & Copy

> Paste-ready headlines and section copy, organized by page/section. Voice is locked to `lib/chat/system-prompt.ts`: **direct, precise, honest, senior. Short sentences. No "Great question!", no filler, no buzzword soup. Written by an operator who has shipped, not a marketer who has presented.** Prices/timelines are exactly as in `lib/data/services.ts` + `packages.ts` — never invent.

Legend: ◆ = headline · ▸ = sub/body · ⟶ = CTA · `mono` = label/eyebrow.

---

## SHARED

### Trust strip (both, theme-skinned)
`✛ 0 account managers ✛ you talk to the makers ✛ build + ads, one invoice ✛ EU & US hours ✛`
*(Garden renders the same claims without the crosses: "— No account managers. You talk to the makers. Build and ads on one invoice. EU & US hours. —")*

### Final CTA (both)
- ◆ DTC: **Stop coordinating between vendors.**
- ◆ SaaS: **One studio. Build, growth, and the AI in between.**
- ▸ Book a 30-minute audit. We'll go through your site, your ad accounts, and your funnel, and tell you exactly what we'd change.
- `mono` // 30 min → a Loom walkthrough + a prioritized punch list within 24h. Yours to keep. No pitch.
- ⟶ Book the free audit · ⟶ Or start a project

### Footer evidence line (both)
`The assistant in the corner? We built it the way we'd build yours — Claude, the AI SDK, real guardrails, real evals. Ask it anything.`

---

## DTC — "Studio"

### Hero — `studio-hero.tsx`
- `mono` /// 2-person studio · built for brands that move fast
- ◆ **Code, content, conversions — under one roof.** *("conversions" blue + yellow marker; "roof." condensed heavy + marker)*
- ▸ Senior practitioners running your whole funnel — the site that converts and the paid traffic that fills it. Same team, same week. No account managers, no silos, no telephone game.
- ⟶ Book a 30-min audit · ⟶ `{ see services }`
- Ticker: `build ▷ launch ▷ traffic`

### Stat row (cut to three)
`0` account managers · `2` senior founders · `1` team, build → growth

### Anchor triad — `two-anchors.tsx`
- `mono` WHAT WE DO
- ◆ **Three things. One team. No handoffs.**
- **Build** ▸ Sites and apps engineered to convert and load fast — landing pages to full Shopify and custom web apps.
- **Grow** ▸ Paid acquisition and SEO run like it's our own money. ROAS, CAC, LTV:CAC — not vanity metrics.
- **AI & Automation** `/// the new bet` ▸ Custom MCP servers and task-specific agents on Claude — wired into your stack, with real evals and guardrails. Not a prompt in a Zapier step.
- footnote: + Design, research-first, woven through every build.

### Problem — `problem-statement.tsx`
- `mono` THE PROBLEM
- ◆ **Two agencies, one mess.**
- ▸ Your marketing agency makes traffic but can't touch the site. Your dev shop builds the site but never talks to the marketers. Three vendors, three Slack channels, zero coordination — and your ad spend lands on pages that don't convert.
- ◆ (pivot, marker) **We fixed this by being one team.**
- ▸ When Nishant builds the page, Manu is already briefing the creative. When a campaign angle works, the landing page reflects it in days. The site and the growth motion are never out of sync.

### Process — `process-steps.tsx`
- `mono` PROCESS · ◆ **From "let's talk" to live in four weeks.**
- 01 **Free audit (30 min)** — We go through your site, ads, and funnel. We tell you what we'd change. No pitch attached.
- 02 **Scoped proposal (24 hrs)** — One page, one number, one Loom. Deliverables, timeline, milestones, price.
- 03 **Build & launch (2–8 wks)** — Weekly sprints. Progress every Friday. Nothing ships without your sign-off.
- 04 **Optimize (ongoing)** — 30 days of post-launch optimization on real user data. Included.

---

## SaaS — "Garden"

### Hero — `garden-hero.tsx`
- `mono` A small studio · Delhi · serving EU + US ✿
- ◆ **Code, content, *conversions* — under one roof.** *(Fraunces; "conversions" italic terracotta + ink underline)*
- ▸ A senior two-person studio building product-grade sites, the AI agents behind them, and the paid traffic to fill them. We work the way studios used to — small, considered, ours.
- ⟶ Book a 30-min audit · ⟶ or read our notes
- Founder card: *— who you'll work with* / **Two senior practitioners. No middle layer.**

### Stat row
`0` account managers · `2` senior founders · `1` team, build → growth

### Anchor triad — editorial
- `mono` — what we do
- ◆ **Build, grow, and the part that feels like the future.**
- **Build** ▸ Product-grade marketing sites and web apps — Figma to Next.js, engineered for performance and the next raise.
- **Grow** ▸ Meta, Google, SEO, and content, run by an operator who reads the attribution reports for fun.
- **AI & Automation** *(plum)* `— the part that feels like the future` ▸ Custom MCP servers and agents on Claude, built to product standards — evals, guardrails, observability. The same way we built the assistant on this page.

### Problem — `problem-statement.tsx`
- `mono` THE PROBLEM
- ◆ (pull-quote) **You need a product-grade presence before the raise — and someone who speaks both engineering and growth.**
- ▸ Most founders end up stitching a designer, a dev shop, and a marketer together, then doing the project management themselves. The site doesn't match the story the marketing tells. The build can't keep up with the roadmap.
- ◆ (pivot, italic terracotta) **So we made it one team.**
- ▸ Engineering, growth, and AI under one roof — senior people who own their lane and talk to each other daily. You get a partner, not a vendor stack.

### How we work — `how-we-work.tsx`
- `mono` WHY US · ◆ **Four things every engagement guarantees.**
- **You talk to the makers.** Both of us run the work and the calls. No account-manager telephone game.
- **Productized scope.** Fixed deliverables, fixed timelines, fixed prices. No surprise invoices.
- **Weekly visibility.** A Loom or a 30-minute call every week. We never go dark.
- **Numbers we agree on.** We set the metrics that matter before we start, and report on them weekly.

---

## FOUNDERS (both, theme-skinned) — `founders-grid.tsx`
- `mono` THE TRIBE · ◆ **Two of us. Both senior. No layers.**
- **Nishant Chaudhary** — *Build & AI*. Senior frontend engineer. Ships sites, apps, and AI agents that load fast and don't break. React, Next.js, Shopify, MCP servers, Claude + the AI SDK. The kind of engineer who actually reads the Lighthouse output.
- **Manu** — *Grow*. Hands-on paid acquisition across Meta, Google, and content — and an active trainer at one of India's leading marketing institutions. The rare marketer who runs paid *and* reads attribution reports for fun.

---

## AI callout caption (`05`) — both
- DTC: `mono` // illustrative — build ⇄ grow, one loop.
- SaaS: *— how we think about your stack* (Fraunces caption) + `// illustrative`
- visually-hidden alt: "An illustration of an AI agent reading ad performance and proposing a landing-page variant — build and growth in one loop."

---

## Microcopy fixes (do these too)
- Replace any "tribe of three" / three-circle language site-wide (`public/brand/design-philosophy.md`, alt text) with two-in-tension language.
- `pricing-table.tsx`: show USD ranges (`$5,000–$11,000`), not "From €".
- Remove the filler stat "5+ years each" everywhere.
- Keep every price/timeline matching `services.ts`/`packages.ts` exactly. Most-popular badge stays on **Growth Engine** ($6,000/mo).

## Acceptance criteria
- [ ] Every headline/sub on both home pages replaced with the above; no lorem, no filler, no "Great question!"-style fluff.
- [ ] AI is named "AI & Automation" and described with method (MCP, evals, guardrails), never invented outcomes.
- [ ] All prices/timelines match the data files; USD ranges shown.
- [ ] No three-founder / three-circle language remains anywhere in copy or alt text.
- [ ] DTC copy is terser than SaaS copy (different register, same voice).
