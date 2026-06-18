# 02 — Signature Components

> The components that *define* the look. For each: what it is, where it lives, anatomy, variants/props, states, and the Tailwind v4 / token direction. Values come from `01`. The governing idea: a component is **one piece of logic with two skins** (`data-theme` drives the skin) — never two forks of markup. Where a layout must differ between themes (not just color), that's called out explicitly.

---

## A. `<SectionShell>` — the rhythm primitive *(new)*

**Problem it solves:** every section re-types `py-16 sm:py-20 lg:py-24` + `<Container>` + a centered eyebrow/headline. That uniformity is the monotony in diagnosis §4. Make rhythm a prop.

**File:** `components/layout/section-shell.tsx` (new). Replaces the repeated wrapper in every `components/sections/*`.

**Anatomy:**
```
<section data-screen-label data-band={tone}>   ← bg + vertical rhythm
  <Container>                                    ← max-w, gutter
    <SectionHeader align eyebrow title kicker /> ← optional, see B
    {children}
```

**Props:**
| prop | type | default | effect |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | maps to `--space-section-sm/md/lg` (`01 §3`) |
| `tone` | `'page' \| 'card' \| 'inverse'` | `'page'` | `--color-bg-page` / `-card-alt` / `-inverse` |
| `align` | `'center' \| 'start' \| 'split'` | `'start'` | header alignment; `split` = label left / title right (editorial) |
| `seam` | `boolean` | `false` | renders the signature seam join at the top edge (`07`) |

**Rule the agent must enforce:** adjacent `<SectionShell>`s may not repeat `{size + tone}` (see `01 §3`). Lint this in review, not in code.

**Tailwind direction:** `style={{ paddingBlock: 'var(--space-section-' + size + ')', background: toneVar }}`. No hardcoded `py-*`.

---

## B. `<SectionHeader>` — typographic header *(new, extracted)*

**File:** `components/sections/section-header.tsx`. Standardizes the mono-eyebrow + display-headline pair but allows the three alignments so it stops being *always centered*.

**Anatomy:** `eyebrow` (mono, `--tracking-label`, uppercase) · `title` (display, `--display-sm`) · optional `kicker` (one-line sub).

**Theme skins:**
- **Studio:** eyebrow is a *bordered mono tag* (`2px solid ink`, slight `rotate(-1deg)`, yellow bg) — the print-label gesture already in `studio-hero`. Title in Bricolage, `wght 800`, `wdth 88`.
- **Garden:** eyebrow is *italic Fraunces with a leading rule* (`— label ✿`) — the gesture already in `garden-hero`. Title in Fraunces `opsz 144`.

> Promote the eyebrow gestures that **already exist inside the two heroes** into this shared header so the whole page speaks the hero's language, not generic centered mono.

**States:** static. Respects `align='split'` for the editorial left/right.

---

## C. Anchor system → `<AnchorTriad>` *(rework of `two-anchors.tsx`)*

**File:** `components/sections/two-anchors.tsx` → rename export to `AnchorTriad` (keep file or rename to `anchor-triad.tsx`; update imports in both home pages).

**The change:** **three** anchors, not two. Build · Grow · **AI & Automation**. This is the single most important IA change (diagnosis §3, `05`). The "+ Design woven through" footnote stays as a footnote.

**Anatomy per card:**
```
title (display)
one-liner (body)
bullet list (services in that lane, from lib/data/services.ts by category)
tech tags (mono chips)
lane CTA → /services#<lane>
```

**Data source:** drive bullets from `getServicesByCategory()` (already exists in `services.ts`) — `build`, `grow`, and **`automate`** (label it "AI & Automation"). Don't hardcode the bullet arrays as it does today; the data already exists.

**Variants / props:**
| prop | values | note |
|---|---|---|
| `layout` | `'grid' \| 'editorial'` | Studio = `grid` (3 hard-bordered equal cards, the AI card accented); Garden = `editorial` (stacked, the AI card offset, asymmetric) |
| `featured` | `'ai'` | the AI card gets the accent treatment in both themes — secondary in Studio (electric blue rule + mono "/// new"), plum in Garden |

**Theme skins:**
- **Studio:** three cards, `0` radius, `--shadow-card` hard offset, `1px navy` rules. The **AI card** carries a blue top-rule + a mono `/// the new bet` tag.
- **Garden:** not a symmetric grid — Build & Grow as two soft cards, **AI as a wider feature row beneath** with the plum accent and a Fraunces-italic label. Asymmetry = editorial.

**States:** hover lifts (`translate(3px,3px)` collapse of offset shadow in Studio; `translateY(2px)` in Garden — mirror the `.btn-primary` behavior already in `globals.css`).

---

## D. `<StatRow>` — earn the stats *(rework of the hero stat stamps)*

Currently four stamps (`2 / 5+ / 0 / EU+US`) duplicated across both heroes, one of them filler (`5+ years`). 

**Direction:**
- Cut `5+ years each` (filler). Replace the four-up vanity row with **three claims that are differentiators, not metrics:** `0 account managers · 2 senior founders · 1 team, build → growth`. Keep it to three.
- Make it a shared component `components/sections/stat-row.tsx` so it's identical logic, theme-skinned.
- **Studio:** big condensed Bricolage numerals, color-coded to role (blue / pink / navy). **Garden:** Fraunces-italic numerals in terracotta, dashed top rule (as today).

---

## E. `<FounderCard>` / `<FounderSeam>` — promote the best element

The `GardenHero` founder card is the strongest single element on the site. Systematize it.

**File:** `components/sections/founders-grid.tsx` (rework) + extract `components/founder/founder-card.tsx`.

**Anatomy:** organic/print avatar (theme dot or photo) · name (display) · role chip (mono) · one-liner · stack chips · links.

**Key fix:** today `FOUNDER_DOT_STYLES` has **three** entries and `founders.ts` carries 3-founder residue — reduce to two (`01 §6`). With exactly two founders, render them as a **seam**: two cards joined by the signature line (`07`), Nishant (Build & AI) left, Manu (Grow) right, the seam between them literally illustrating "one team, no handoff." This is the founders section *and* a signature-moment instance.

**Variants:** `variant: 'compact' | 'full' | 'seam'`. `seam` is the new home-page default; `full` stays for `/about`.

**Theme skins:** Studio avatars = hard-edged riso dots (pink / blue), `0` radius option; Garden = the organic `borderRadius: 60% 50% …` blobs already in the hero.

---

## F. `<Button>` — keep, codify

`globals.css` already nails theme-specific primary buttons (Studio: navy border + blue `7px` offset that collapses on hover; Garden: terracotta pill + `0 5px 0` push). Keep both. Codify the existing `components/ui/button.tsx` variants and make sure **every** CTA uses it (some heroes inline `<Link className="btn-primary">` — fine, but ensure the `.btn-primary` class + token shadow is the single source).

**Variants:** `primary` (theme CTA), `secondary` (mono `{ braces }` in Studio / Fraunces-italic underline in Garden — both already exist in heroes), `ghost`. **Min hit target 44px** (current `py-[18px]` passes; verify `secondary`).

---

## G. `<RisoField>` & `<GardenField>` — decorative backdrops, with a payload

Replace the infinite-spin `RisoShapes` (Studio) and static `OrganicBlobs` (Garden) — wallpaper with no payload (diagnosis §6).

- **`<RisoField>`** (Studio): the riso shapes stay, but motion becomes **scroll-linked registration drift** (CMYK channels separate slightly as you scroll, snap back at rest) — ties directly to the signature moment (`07`). No infinite loops. `useReducedMotion` → static, perfectly-registered.
- **`<GardenField>`** (Garden): the blobs/leaves **grow** on entry (scale + `SOFT` axis) once, then rest. Pollen drifts only within ±4px on a long, eased loop *(this is the one allowed organic ambient motion; reduced-motion → static)*.

**Files:** extract from `studio-hero.tsx` / `garden-hero.tsx` into `components/decor/riso-field.tsx` and `components/decor/garden-field.tsx` so they're reusable on services/about, not hero-locked.

---

## H. `<ServiceTable>` → lane-aware `<OfferBoard>` *(rework `pricing-table.tsx`)*

`pricing-table.tsx` renders every category in the same dark/sand table, including the AI services — which is why "the future" looks like a spreadsheet row (diagnosis §3).

**Direction:**
- Keep the table for `build` / `grow` (it's honest and scannable).
- The **`automate` (AI & Automation)** category gets a *different component* — `<AIPracticeBoard>` (`05`): cards that look like agent/MCP objects (terminal chrome, tool-call rows), not price rows.
- Fix: `pricing-table.tsx` `theme: 'ink' | 'sand'` prop is a parallel mini-theme-system bolted on. Fold it into the real `data-theme` + `tone` from `<SectionShell>`.
- Show **USD** (offer is USD-default per `system-prompt.ts`); current table shows `€` only — switch to `$` with the existing `startingPriceUsd`/`ceilingPriceUsd` fields, render ranges (`$5,000–$11,000`) not just "From".

---

## I. The Seam `<Seam>` — signature connective element *(new — full spec in `07`)*

A thin element that renders the join between sections / the two founders / the two lanes. Two skins: Studio = riso registration line (offset color channels); Garden = growing ink seam. Reduced-motion → static line. Used by `<SectionShell seam>`, `<FounderSeam>`, and the hero. **See `07` for the complete build.**

---

## Component inventory — keep / rework / new / cut

| Component | File | Action |
|---|---|---|
| `SectionShell` | `layout/section-shell.tsx` | **new** |
| `SectionHeader` | `sections/section-header.tsx` | **new** (extract hero eyebrow gestures) |
| `StudioHero` / `GardenHero` | `sections/hero/*` | rework (signature, scroll payload) |
| `AnchorTriad` | `sections/two-anchors.tsx` | **rework** → 3 anchors, data-driven, theme layouts |
| `StatRow` | `sections/stat-row.tsx` | **new** (cut filler stat) |
| `FounderCard` / `FounderSeam` | `founder/*`, `sections/founders-grid.tsx` | **rework** → 2 founders as a seam |
| `Button` | `ui/button.tsx` | keep, codify |
| `RisoField` / `GardenField` | `decor/*` | **new** (extract, add payload) |
| `OfferBoard` / `AIPracticeBoard` | `sections/pricing-table.tsx`, `sections/ai-practice-board.tsx` | rework + **new** |
| `Seam` | `decor/seam.tsx` | **new** (signature) |
| `ProcessSteps` | `sections/process-steps.tsx` | **rework** → tokens (kill hardcoded hex) + theme rhythm |
| `TrustStrip` | `sections/trust-strip.tsx` | keep (good tight band); feed from one source |

---

## Acceptance criteria
- [ ] `<SectionShell>` exists and wraps every `components/sections/*`; no section hardcodes `py-*` or raw hex.
- [ ] No two adjacent sections share `{size + tone}` on either home page.
- [ ] `AnchorTriad` renders **three** anchors driven by `getServicesByCategory('build'|'grow'|'automate')`; the AI card is visually featured.
- [ ] Founders render as a 2-up **seam** on home; `FOUNDER_DOT_STYLES` and founder data carry no third-founder residue.
- [ ] `pricing-table` shows USD ranges; AI services route to `AIPracticeBoard`, not the price table.
- [ ] Hero backdrops have no infinite decorative loops; all motion is scroll-linked or single-entry and reduced-motion-gated.
