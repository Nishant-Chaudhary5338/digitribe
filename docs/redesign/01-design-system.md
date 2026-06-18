# 01 — Design System

> The refined, ownable system. Every value here is exact and maps to a Tailwind v4 CSS variable in `app/globals.css`. When `03`–`08` reference a token, this file defines it. **Source of truth.**

The architecture is already right: a global `@theme` block for primitives, then `[data-theme="studio"]` / `[data-theme="garden"]` overriding semantic `--color-*` / `--font-*`. We **extend** it. We do not rebuild it.

---

## 1. Typography

### The decision: two voices, sharply split. Cut one font.

Today there are **six** display/accent families in play (Bricolage Grotesque, Fraunces, Instrument Serif, Inter Tight, JetBrains Mono, IBM Plex Mono). That's one too many, and the split between themes is muddy — both themes can reach an italic serif, which blurs the sibling distinction.

**New rule — each theme commits to one tension:**

| | Studio (DTC) | Garden (SaaS) |
|---|---|---|
| **Tension** | Grotesque + Mono = *machine / print shop* | Serif + Sans = *editorial / studio letterpress* |
| **Display** | **Bricolage Grotesque** (variable `wght 200–800`, `wdth 75–100`, `opsz`) | **Fraunces** (variable `opsz 9–144`, `wght`, `SOFT`) |
| **Body** | **Bricolage Grotesque** (`wght 400`, `wdth 100`) | **Inter Tight** (`wght 400–500`) |
| **Label / meta** | **JetBrains Mono** (geometric, technical) | **IBM Plex Mono** (humanist, warm) |
| **Accent** | *(none — the condensed grotesque + mono is the accent)* | Fraunces italic (`opsz 144`, the expressive serif) |

> **CUT: Instrument Serif — remove entirely.** It exists only for Studio's single italic word ("roof."). Replacing that one word with condensed Bricolage (see below) is sharper and removes a whole font load. Studio having **no serif** is the point: it reads like a print shop, not a magazine. Two monos stay — they're cheap and they reinforce the sibling split (JetBrains = technical/Studio, IBM Plex = warm/Garden).

**Net: 6 families → 5, and the two themes can no longer be confused.**

#### Studio's "roof." replacement
In `studio-hero.tsx` the italic-serif `roof.` becomes condensed, heavy Bricolage with a yellow marker — print, not prose:

```tsx
// was: fontFamily: var(--font-accent) /* Instrument Serif italic */
<span style={{
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'wght' 800, 'wdth' 75, 'opsz' 96",
  letterSpacing: '-0.06em',
}}>roof.</span>
```

### Type scale — extend `@theme`

The current scale tops at `--text-7xl: 4.5rem`, but heroes hard-code `clamp(3.5rem, 8vw, 6.5rem)` inline — the scale doesn't actually cover display sizes. Add display steps and make hero sizes fluid *tokens*, so headlines stop being magic numbers.

**Add to the `@theme` block in `app/globals.css`:**

```css
@theme {
  /* …existing --text-xs … --text-7xl … */
  --text-8xl: 6rem;
  --text-9xl: 8rem;

  /* Fluid display steps — use these in heroes/section headers instead of inline clamps */
  --display-sm:  clamp(2rem,   1.2rem + 3.5vw, 3rem);     /* section headlines */
  --display-md:  clamp(2.75rem, 1.5rem + 5vw,  4.5rem);   /* sub-heroes, big numbers */
  --display-lg:  clamp(3.5rem,  2rem + 7vw,    6.5rem);   /* hero H1 */
  --display-xl:  clamp(4rem,    2rem + 9vw,    8.5rem);   /* signature / one-word moments */

  /* Tracking + leading tokens (stop re-typing these) */
  --tracking-display: -0.05em;
  --tracking-tight:   -0.02em;
  --tracking-label:    0.12em;  /* mono eyebrows */
  --leading-display:   0.93;
  --leading-tight:     1.05;
  --leading-body:      1.55;
}
```

#### Before → after (headline sizing)
| Element | Before | After |
|---|---|---|
| Hero H1 | inline `clamp(3.5rem, 8vw, 6.5rem)` (two values, two heroes, drift) | `font-size: var(--display-lg)` |
| Section H2 | inline `clamp(1.75rem, 3.5vw, 2.5rem)` | `var(--display-sm)` |
| Big stat number | inline `3.25rem` / `2.75rem` | `var(--display-md)` |
| Signature word | n/a | `var(--display-xl)` |

### Font-feature discipline (Garden)
Fraunces is the most expressive asset on the site and the most abusable. **Rules:**
- Headlines: `'opsz' 144` (max optical size — high contrast, "display" cut). Tracking `var(--tracking-display)`.
- Body/UI Fraunces (founder names, labels): `'opsz' 24–40` only. Never set body-size Fraunces at `opsz 144` — the thins disappear.
- Italic is reserved for **one accent word per view** (the conversion word). Not for whole paragraphs.

---

## 2. Color

The hues are good. The *usage* is the problem: accents are sprinkled decoratively instead of used as **signal** (the brand philosophy literally says "color functions as pure signal, not aesthetic preference" — the code doesn't honor it). Plus two real contrast risks. We tighten values for WCAG AA and lock each color to a *role*.

### Studio (DTC) — `[data-theme="studio"]`

| Role | Variable | Before | After (hex) | After (oklch) | Notes |
|---|---|---|---|---|---|
| Accent (signal) | `--color-accent` | `#FF4F8B` | **`#F5356F`** | `oklch(0.65 0.213 9)` | Deepened ~6% for AA when used as text/border on paper. The one hot signal. |
| Accent soft | `--color-accent-soft` | `#FFCAD4` | `#FFD0DC` | `oklch(0.89 0.06 6)` | Tints only (badges, fills). |
| Secondary | `--color-secondary` | `#2841DD` | **`#2438C7`** | `oklch(0.46 0.21 268)` | Electric blue. Links, the CTA offset shadow, the "build" lane. Slightly deepened for AA. |
| Tertiary (marker) | `--color-tertiary` | `#FFD700` | `#FFD400` | `oklch(0.88 0.18 99)` | **Highlight/marker ONLY** — never text, never large fills. |
| Ink | `--color-text-primary` | `#1A2233` | `#141B2B` | `oklch(0.23 0.03 263)` | Near-black navy. Slightly deeper for crisper print feel. |
| Paper | `--color-bg-page` | `#F4EFE2` | `#F2ECDB` | `oklch(0.94 0.02 88)` | Warm newsprint. |
| Card | `--color-bg-card` | `#FAF6E8` | keep | — | |

**Role lock (Studio):** pink = the call (CTAs, the conversion word, the "now"); blue = build/structure (links, offsets, the engineering lane); yellow = marker only; navy = everything else. **Max one pink and one yellow event per viewport.**

### Garden (SaaS) — `[data-theme="garden"]`

| Role | Variable | Before | After (hex) | After (oklch) | Notes |
|---|---|---|---|---|---|
| Ink | `--color-text-primary` | `#1C0A00` | **`#241200`** | `oklch(0.24 0.04 56)` | Keep deep-brown; it carries body text — must stay ≥7:1 on paper. |
| Accent | `--color-accent` | `#C5704F` | `#BE6443` | `oklch(0.58 0.10 45)` | Terracotta. **Accent only — never body text** (current `5.2:1` on paper is borderline for small text). |
| Accent soft | `--color-accent-soft` | `#E8C9B0` | keep | — | Card tints, underlines. |
| Secondary | `--color-secondary` | `#7A8B6E` | `#6E8060` | `oklch(0.57 0.05 135)` | Sage — growth lane, organic shapes. |
| Quaternary | `--color-quaternary` | `#6B3E5C` | keep | `oklch(0.40 0.08 350)` | Plum — the AI lane accent in Garden (see `05`). |
| Tertiary | `--color-tertiary` | `#FFCD55` | keep | — | Pollen/honey — sparingly. |
| Paper | `--color-bg-page` | `#F0E6CE` | keep | `oklch(0.92 0.03 86)` | Warm oat. |
| Muted text | `--color-text-muted` | `#4D6040` | keep (AA-checked) | — | Sage-derived; already noted 5.6:1. |

**Role lock (Garden):** terracotta = warmth/accent/the conversion word; sage = growth/the grow lane/organic forms; plum = AI/MCP; honey = the rare delight. Body copy is **always** `--color-text-body` on paper — never an accent.

### Contrast strategy (both themes)
- **Body text:** only `--color-text-primary` / `--color-text-body` on `--color-bg-page`/`-card`. Target ≥ 7:1.
- **Accents on accents are banned for text.** Pink text on yellow, terracotta text on terracotta-soft → fail. Accents may *fill* shapes and *underline*, not carry reading text.
- **On dark sections** (`--color-bg-inverse`): text is `--color-text-on-inverse`; accents keep ≥ 4.5:1 (pink `#F5356F` on navy and terracotta on `#2D2418` both pass).
- Add a build-time check: extend `scripts/lighthouse-audit.ts` or add an axe-core pass in `tests/a11y/accessibility.spec.ts` asserting no contrast violations on `/dtc`, `/saas`, `/dtc/services`.

---

## 3. Spacing, grid & rhythm

The site uses ad-hoc `py-16 sm:py-20 lg:py-24` on nearly every section — uniform, which is *why the rhythm is monotonous* (diagnosis §4). Introduce a **section-rhythm scale** so sections can be deliberately tight or expansive.

**Add to `@theme`:**
```css
@theme {
  --space-section-sm: clamp(3rem, 6vw, 5rem);    /* tight band: trust strip, seam */
  --space-section-md: clamp(4rem, 8vw, 7rem);    /* standard */
  --space-section-lg: clamp(6rem, 12vw, 11rem);  /* breath: hero, signature, founders */
  --measure: 68ch;          /* max reading width */
  --gutter: clamp(1.25rem, 4vw, 3.5rem);
  --container-max: 1280px;  /* matches existing max-w-[1280px] */
}
```

**Rhythm rule:** no two adjacent sections share the same vertical size *and* the same background. Alternate `--space-section-md` content bands with one `--space-section-lg` breath and one `--space-section-sm` tight band per page. The page should feel like it inhales and exhales.

**Grid:** keep the 12-col mental model at `--container-max`. The new asymmetry comes from theme layouts (`03`/`04`), e.g. Garden's `1.5fr / 1fr` editorial split (already in `GardenHero`) becomes a *reusable* layout; Studio's full-bleed bordered bands.

---

## 4. Radii, borders, shadows, texture

These already encode the sibling split well — Studio = `0px` radius + hard offset shadows + grain; Garden = soft radii + drop shadows + no grain. Formalize and push slightly harder.

### Before → after
| Token | Studio before | Studio after | Garden before | Garden after |
|---|---|---|---|---|
| `--radius-theme-md` | `0px` | `0px` (keep) | `16px` | `16px` (keep) |
| `--shadow-card` | `5px 5px 0 var(--color-border)` | `6px 6px 0 var(--color-border)` | `0 5px 20px rgba(45,36,24,.06)` | `0 8px 30px -6px rgba(45,36,24,.10)` (deeper, softer) |
| `--shadow-cta` | `7px 7px 0 var(--color-secondary)` | keep (it's great) | `0 5px 0 var(--color-text-primary)` | keep |
| Border | `2.5px solid navy` | keep — hard print rule | `1px solid rgba` | keep — hairline |

### Texture (the most under-used asset)
- **Studio grain** (`--grain` halftone dots) is defined but only applied to the hero via `.grain-bg`. **Apply it as a faint page-level wash** on `[data-theme="studio"]` so the whole DTC site feels printed, not just the hero. Add `--grain-strong` for the signature moment.
- **Garden** currently has `--grain: none`. Give it a **paper-fiber texture** — a near-invisible warm noise — so the oat background reads as stock, not flat `#F0E6CE`. Spec:
```css
[data-theme="garden"] {
  --grain: url("data:image/svg+xml,...fractalNoise..."); /* baseFrequency .9, opacity ~.025 */
}
[data-theme="garden"] body::before { /* fixed, pointer-events:none, mix-blend multiply, opacity .35 */ }
```
Both must respect `prefers-reduced-motion`/`prefers-reduced-data` is N/A (static), but keep opacity low enough to never touch text contrast.

---

## 5. Motion language

Current motion is two modes: hero-only Framer reveals, and `Reveal` fade-up everywhere else. The infinite hero spins (§6 diagnosis) are wallpaper. New principles:

1. **Motion has a payload or it doesn't exist.** No infinite loops as decoration. The only persistent motion allowed is the signature seam (`07`) and the AI "signal" pulse (`05`), both reduced-motion-gated.
2. **Two easings, named** (already in `@theme`): `--easing-out` for entrances, `--easing-in-out` for state. Add `--easing-spring` only for the Garden "grow" gestures.
3. **Theme-specific motion personality:**
   - **Studio:** snappy, mechanical. `--duration-fast (150ms)`, hard cubic, slight overshoot + *registration snap* (elements click into place like a print bed). Transforms in whole pixels.
   - **Garden:** slow, organic. `--duration-deliberate (600ms)`, ease-out, subtle scale/`SOFT`-axis shifts. Things *grow* in.
4. **Reveal stagger:** keep `Reveal`, but cap stagger at 3 items and `delay ≤ 0.3s` — current `index * 0.15` on grids gets sluggish.
5. **Always honor `useReducedMotion()`** (the heroes already do — extend to the seam and AI pulse).

```css
@theme { --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1); }
```

---

## 6. Brand mark & "tribe" system (fix the 3-founder residue)

`public/brand/design-philosophy.md` describes the mark as **three circles** ("remove one point and the system collapses"). The studio is now **two** founders. The mark's stated meaning is factually wrong and the code carries the residue (`--founder-dot-3`, three `FOUNDER_DOT_STYLES`, `lane: 'design'`).

**Direction — re-theorize the mark for two, and make the duality the brand:**
- The new primitive is **two forms in tension**, not three in a constellation — which is *better*: it maps exactly to Build↔Grow, Nishant↔Manu, code↔content, "under one roof." Two points make a **seam** (a line), and the seam is the signature moment (`07`). The geometry now *means* the studio.
- Concretely:
  - Rewrite `public/brand/design-philosophy.md` around two-in-tension (keep the prose quality — it's good — change the count and the thesis).
  - In `lib/data/founders.ts`: remove `'design'` from the `lane` union (→ `'build' | 'grow'`); give Manu a real `accentColor` (Studio `#2438C7` / role color, not navy `#0A0E27`); flag the `// MOCK` photos/links for replacement (don't invent real ones).
  - In `app/globals.css`: keep `--founder-dot-1/2`, delete `--founder-dot-3` (and the third entry in `FOUNDER_DOT_STYLES` in `founders-grid.tsx`).
  - The split-color wordmark (`components/brand/wordmark.tsx`) "one half grounded, one half burning" is perfect for two-in-tension — keep it, it's the duality already.

---

## Acceptance criteria
- [ ] `app/globals.css` `@theme` block contains the new `--text-8xl/9xl`, `--display-*`, `--space-section-*`, tracking/leading, `--easing-spring`, `--measure`, `--gutter`, `--container-max`.
- [ ] All `--color-*` values updated to the "after" hex in both `[data-theme]` blocks; axe/contrast pass green on `/dtc` and `/saas`.
- [ ] Instrument Serif removed from the font loader (`app/layout.tsx`) and no `--font-accent` references it in Studio.
- [ ] No `--founder-dot-3`; `FOUNDER_DOT_STYLES` has 2 entries; `lane` union has no `'design'`.
- [ ] Garden has a paper-fiber `--grain`; Studio grain washes the page, not just the hero.
- [ ] No section uses raw hex (`process-steps.tsx` migrated to tokens — see `08 Phase 1`).
- [ ] Heroes and section headers read sizes from `--display-*`, not inline clamps.
