# Digitribe — Project Vision & Design Brief

> A living context document for designers, collaborators, and AI design tools.
> Read this first. It explains **what this codebase is, who it's for, and what "great" looks like.**

---

## 1. What this is

**Digitribe** is the marketing website for a senior, founder-led digital agency.
This repo (`digitribe-web`) is **the public site** — not the product. It exists to do one job:

> Make a serious DTC or SaaS founder think _"these people are clearly senior, clearly different, and I want them on my team"_ — then book a free audit.

It is a **Next.js 16 / React 19 / Tailwind v4** site with MDX-driven content, an AI sales assistant ("Digibot"), and a **dual-theme system** that reskins the entire experience for two different audiences.

---

## 2. The objective (why we're redesigning)

The current site is structurally solid and on-brand, but it reads like a **well-built template**, not like a **studio with taste**. We want to move from _competent_ to _unforgettable_.

**Goals for the redesign:**

1. **A wow factor in the first 3 seconds.** The hero should make a founder stop scrolling.
2. **Modern, unique, classy, "agency-grade" aesthetic** — the kind of site that itself is proof we can build beautiful things.
3. **Conversion, not decoration.** Every section earns its place by moving a visitor toward the audit.
4. **Two distinct but sibling identities** for DTC and SaaS — different energy, same DNA.
5. **Editorial confidence** — generous type, intentional whitespace, considered motion. Not "SaaS landing page #4,071."

Success = a redesigned design system + section-by-section direction + refined content for **both the DTC and SaaS experiences**, with a clear, buildable spec.

---

## 3. Who we are (the team)

A **2-person senior studio**, based in Delhi, working exclusively with **EU, US, and UK** founders (all calls in their time zones, in English).

| Founder               | Lane       | What they own                                                                                                                                                                           |
| --------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nishant Chaudhary** | Build & AI | Frontend engineering at product-org standards (React, Next.js, Shopify, monorepos), plus the new AI practice — custom **MCP servers** and **AI agents** built on Claude and the AI SDK. |
| **Manu**              | Grow       | Hands-on paid acquisition (Meta, Google, TikTok, LinkedIn), SEO, and content. Also an active trainer at one of India's leading digital marketing institutions.                          |

Positioning truth: **no account managers, no juniors, no agency telephone game.** Every client talks directly to the person doing the work. We are deliberately small.

> Note: Digitribe was previously a 3-person team including a dedicated designer. The studio is now 2 founders; design is still offered as a service, delivered research-first by the build practice. Any team-count or "designer" references in design output should reflect **two founders**.

---

## 4. Who we're for (the two audiences)

The site splits at the front door into two worlds. Each has its own route group, theme, copy, and CTAs.

### DTC — `/dtc` — "Studio" theme

- **Who:** DTC e-commerce founders, ~$5M–$20M ARR, scaling paid acquisition.
- **Pain:** their site and their ads are run by different vendors who never talk; ad spend lands on pages that don't convert.
- **Energy:** bold, fast, confident, a little punk. Riso-print aesthetic, hard edges, motion.

### SaaS — `/saas` — "Garden" theme

- **Who:** SaaS founders, Seed → Series A, who need a credibility-grade presence before a raise or launch.
- **Pain:** they need a product-grade marketing site and someone who understands both engineering and growth.
- **Energy:** editorial, organic, considered, warm. "A small studio the way studios used to be."

There is also a **neutral** route group and a splash page (`/`) that lets the visitor choose DTC or SaaS.

---

## 5. What we sell

Three anchors + bundled packages. All pricing is fixed-scope, fixed-price, 50/50 milestones (no hourly billing).

- **Build** — Landing Page Sprint, Marketing Site, Shopify Build, Custom Web App.
- **Grow** — Meta Ads, Google Ads, SEO Audit, Content Calendar.
- **AI & Automation** _(the new growth bet)_ — **AI Readiness Sprint**, **AI Agent Development**, **Custom MCP Server**, Automation Workflow.
- **Design** — Design Sprint (offered, research-first).
- **Packages** — Launch Sprint, Growth Engine (most popular), Full Stack.

The **AI practice is the differentiator** we most want to elevate visually — it's what makes us not just "another build+grow agency."

---

## 6. Brand & design system (current state)

**Typography**

- Display / headlines: **Bricolage Grotesque**, **Fraunces** (Garden), **Instrument Serif**
- Body: **Inter Tight**
- Mono / accents: **JetBrains Mono**, **IBM Plex Mono**

**Color — Studio (DTC):** pink accent · electric blue secondary · navy ink · paper. Riso/print energy.
**Color — Garden (SaaS):** terracotta accent · sage secondary · deep-brown ink · warm paper. Organic, editorial.
**Shared brand tokens:** Paper `#FAFAF7` · Sand `#F0EDE5` · Ink `#0A0E27` · Pulse `#FF5B3A` · Slate `#4A5568`.

**Principles in the codebase**

- Density over decoration — "this is a studio site, not a brochure." Tight, intentional spacing.
- Tailwind v4, design tokens via CSS variables, theme switching via `data-theme`.
- Motion via `motion` (Framer) — purposeful, reduced-motion aware.
- Accessibility is a baseline, not an afterthought.

**Where it falls short today:** the two themes are distinct but neither yet feels _award-winning_. Heroes are good-not-great. The AI offering isn't visually expressed. There's no single "signature moment" that makes the site memorable.

---

## 7. Key places to look (for a reviewer)

- `app/(dtc)/dtc/` and `app/(saas)/saas/` — the two audience experiences
- `components/sections/hero/studio-hero.tsx` (DTC) · `garden-hero.tsx` (SaaS) — the two heroes
- `components/sections/` — all reusable page sections (problem, two-anchors, pricing-table, founders-grid, how-we-work, process-steps, trust-strip, final-cta)
- `lib/data/services.ts`, `lib/data/packages.ts` — the offer, as data
- `content/` — MDX for services, packages, founders, case studies, legal
- `app/globals.css` + theme tokens — the design-system source of truth
- `lib/chat/system-prompt.ts` — the brand voice, encoded for the AI assistant (a great voice reference)

---

## 8. Voice & tone

Direct, precise, honest, senior. We tell founders what they need to hear, not what sounds nice.
No "Great question!", no filler, no buzzword soup. Short sentences. Confidence without arrogance.
The copy should read like it was written by an operator who has shipped, not by a marketer who has presented.

---

## 9. What we want from a redesign (the ask)

1. A **design-system direction** (type scale, color usage, spacing rhythm, motion language, signature components) that feels like a top-tier studio's own site.
2. **Section-by-section redesign direction** for both the DTC (Studio) and SaaS (Garden) experiences, including the hero, the offer, social proof, the founders, and the audit CTA.
3. **A signature "wow" moment** unique to Digitribe — something memorable and ownable.
4. **Refined content** — sharper headlines and section copy that convert, in our voice.
5. **Elevated expression of the AI / MCP practice** — make it feel like the future, not a footnote.
6. A clear, **buildable spec** (we implement it ourselves in Next.js + Tailwind v4).

> The bar: someone lands here, feels something, and thinks _"if their own site is this good, imagine what they'd build for me."_
