# Digitribe Redesign — Direction & Build Spec

> **Audience:** the AI coding agent (Claude Code) implementing this redesign in the `digitribe` repo, plus the two founders reviewing it.
> **Status:** direction + buildable spec. Nothing here is decorative. Every recommendation maps to a real file in this repo and ends in an acceptance checklist.

---

## North star (read this first)

**The site is the proof.** A founder lands, feels something in three seconds, and thinks *"if their own site is this sharp, imagine what they'd build for me."* We get there not by adding ornament but by making two things true that aren't true today: (1) the **Studio (DTC)** and **Garden (SaaS)** experiences are genuinely *different spatial systems* — not one layout reskinned by CSS variables — and (2) the **AI / MCP practice** is the visible spine of the studio, not a third pricing column. Density over decoration. Conversion over flourish. One signature moment nobody else owns.

---

## How Claude Code should use this set

Read in order. Each file is self-contained but they assume the ones before.

| # | File | What it gives you |
|---|------|-------------------|
| 00 | `00-README.md` | This. Diagnosis + north star + reading order. |
| 01 | `01-design-system.md` | The ownable system: type, color, space, motion. Before→after token tables mapped to real `--color-*` variable names in `app/globals.css`. **Source of truth for all values.** |
| 02 | `02-components.md` | The signature components (anatomy, states, props, Tailwind direction). |
| 03 | `03-dtc-studio.md` | DTC "Studio" section-by-section, mapped to real component files. |
| 04 | `04-saas-garden.md` | SaaS "Garden" section-by-section, mapped to real component files. |
| 05 | `05-ai-practice.md` | How the AI/MCP practice surfaces across both themes. |
| 06 | `06-content-copy.md` | Paste-ready headlines and section copy, in our voice. |
| 07 | `07-signature-moment.md` | The one ownable wow moment + buildable spec + reduced-motion fallback. |
| 08 | `08-implementation-plan.md` | Phased, file-by-file execution plan with per-phase acceptance criteria. |

**Working rule for the agent:** make the change the doc describes and *only* that change. Do not "improve" adjacent components. When a token value is given, use it exactly. When a file path is given, edit that file. Every phase in `08` ends with a checklist — do not advance until it passes `pnpm build` and the listed checks.

---

## Diagnosis — where the site reads "well-built template" vs "studio with taste"

This site is structurally clean, typed, accessible, and on-brand. That is exactly why it reads as *competent template* and not *studio*: the seams are too tidy and the two audiences are the same page wearing two coats of paint. Specific evidence, by file:

### 1. The two "distinct" experiences are one page. *(the headline problem)*
`app/(dtc)/dtc/page.tsx` and `app/(saas)/saas/page.tsx` are **byte-for-byte the same component stack**:

```
HeroHome → TrustStrip → ProblemStatement → TwoAnchors → HowWeWork → IdealClients → ProcessSteps → FoundersGrid → FinalCTA
```

Only `HeroHome` forks (`components/sections/hero-home.tsx` switches `StudioHero` vs `GardenHero` on `useTheme()`). **Everything below the hero is identical markup**, reskinned only by swapping `--color-*` / `--font-*` in `app/globals.css`. So the "bold, fast, punk" Studio and the "editorial, organic, warm" Garden diverge for one viewport and then converge for the entire rest of the page. The promise of "two distinct but sibling identities" is broken below the fold. **This is the single biggest gap and most of `03`/`04` exists to fix it.**

### 2. `process-steps.tsx` ignores the design system entirely.
`components/sections/process-steps.tsx` hardcodes `bg-[#f0ede5]`, `text-[#0a0e27]`, `text-[#ff5b3a]` — raw hex, no theme tokens. So the Garden (warm) page renders a cold navy/coral process section. It's the clearest single artifact of "shipped fast, not composed."

### 3. The differentiator is missing from the spine.
`components/sections/two-anchors.tsx` presents exactly two anchors — **Build** and **Grow** — with AI relegated to a footnote (`+ Design woven through…`). But `PROJECT_VISION.md §5` and `lib/data/services.ts` make clear the **AI/MCP practice is the growth bet**. It is in the data (`category: 'automate'`, four services incl. `mcp-server-build`) but invisible in the IA. The home page never once shows an agent, an MCP server, or anything that says "the future." See `05`.

### 4. Monotonous section rhythm.
`two-anchors`, `how-we-work`, `founders-grid`, `process-steps` all use the same shape: centered mono eyebrow → centered display headline → symmetric grid of cards. Four sections, one gesture. A studio site earns attention with *rhythm* — asymmetry, scale jumps, full-bleed moments, one or two breaths. Right now every section is the same temperature.

### 5. Vanity stats and 3-founder residue.
- Both heroes end on the same four "stat stamps" (`2 / 5+ / 0 / EU+US`). `0 account managers` is a good line; `5+ years each` is filler. The repetition across both themes flattens them.
- `lib/data/founders.ts` still carries `lane: 'design'` in its type union, three `FOUNDER_DOT_STYLES`, a third founder-dot gradient (`--founder-dot-3`), and `public/brand/design-philosophy.md` is written around **three circles** ("remove one point and the system collapses"). The brand mark's stated meaning is now factually wrong for a 2-founder studio. See `01 §Brand` and `02`.
- `founders.ts` Manu has `accentColor: '#0A0E27'` (navy) — not a real accent. Mock links/photos still present (`// MOCK — replace`).

### 6. Heroes are good-not-great.
`StudioHero` spins three riso shapes on infinite linear loops (`duration: 6/8/12s, repeat: Infinity`) — perpetual motion with no payload; it's motion as wallpaper, and it never rewards a scroll. `GardenHero`'s founder card is the strongest element on the site and should be promoted into a system, not stranded in one hero. Neither hero has a *signature* — the thing you screenshot. See `07`.

### What's genuinely good — keep it
- Token architecture via `@theme` + `[data-theme]` in `app/globals.css` is the right backbone. We extend it, we don't replace it.
- The voice (`lib/chat/system-prompt.ts`) is excellent — direct, senior, zero filler. **All copy in `06` is written to match it.** Do not soften it.
- Productized, fixed-price offer data (`lib/data/services.ts`, `packages.ts`) is clear and honest. We re-present it, we don't re-price it.
- `GardenHero` founder card, the Studio riso/print palette, and the `--shadow-cta` hard-offset button shadows are real assets. We systematize them.

---

## The three moves this redesign makes

1. **Split the spine.** Stop sharing the below-fold stack. Introduce theme-specific section *layouts* (not just colors) so Studio feels printed/fast and Garden feels editorial/grown. (`03`, `04`, `08 Phase 3`.)
2. **Promote AI to an anchor.** Three anchors — Build · Grow · **AI** — with the AI practice getting its own visual language and a live, on-page proof. (`05`, `07`.)
3. **Own one moment.** "The Seam" — the visible join between build and grow that every other agency hides — rendered as a riso mis-registration in Studio and a growing ink seam in Garden. (`07`.)

---

## Acceptance criteria (for the set as a whole)
- [ ] An engineer can implement any single file's recommendations without asking a clarifying question.
- [ ] Every color/type/space value referenced exists in `01` with an exact hex/oklch and a `--variable` name.
- [ ] Every section recommendation in `03`/`04` names the real file in `components/sections/` it changes.
- [ ] No recommendation reintroduces a third founder, a designer headcount, or design-only as a headline lane.
- [ ] The plan in `08` is ordered so the site `pnpm build`s green after every phase.
