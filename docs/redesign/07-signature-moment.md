# 07 — The Signature Moment: "The Seam"

> One ownable wow moment. Concept, why it works, and a buildable spec with a reduced-motion fallback. This is the thing a founder screenshots.

## The concept
Every competitor hides the join between disciplines — the place where the "web team" hands off to the "ads team," where design hands off to dev, where the brief gets lost. **Digitribe's entire pitch is that there is no handoff: build, grow, and AI are one continuous line.** So make that line *visible*. A single thread — **the Seam** — enters at the hero, runs the full length of the page through every section boundary, and at the conversion CTA the two strands fuse into one.

The Seam is literally the brand thesis rendered as structure: two founders, two lanes (build / grow), AI woven through, **under one roof**. It also re-grounds the brand mark, which was built around three circles and is now wrong for a 2-founder studio (`01 §6`) — two points make a line, and the line is the studio.

**It is structural, not decorative** — it organizes the page (every `<SectionShell seam>` joins to it), which is exactly the "density over decoration, conversion over ornament" bar (`PROJECT_VISION.md §2`).

## Why it works
- **Unique & ownable.** Connective lines exist on other sites; a *doubled seam that represents the founders/lanes and fuses at the CTA* is specific to a 2-person build+grow+AI studio. It can't be lifted without lifting the meaning.
- **On-message.** It says "one team, no handoff" without a sentence — reinforcing the headline ("…under one roof") at every scroll.
- **Dual-theme by design.** The same idea has two genuinely different expressions (below), so it *proves* the sibling system instead of fighting it.
- **Cheap to run, kind to performance.** One thin SVG/`<canvas>`-free element, scroll-linked via `IntersectionObserver` + CSS custom properties; no heavy library beyond the `motion` already in the stack.

---

## Two expressions (same idea)

### Studio (DTC) — "Registration Seam"
A Risograph prints each color on a separate pass; perfect alignment is *registration*, and slight misalignment is the print's signature. The Studio seam is a **two-channel registration line** (pink strand + blue strand) running down the page.
- **At rest:** the two strands are perfectly registered (overlap into one navy line with crisp edges).
- **On scroll:** the pink and blue channels separate by up to ~8px (velocity-linked), like a press running fast; they re-register when scrolling stops (mechanical snap, `--easing-out`).
- **At each section join:** a registration mark (✛ crosshair) stamps the seam — that's where `<SectionShell seam>` attaches.
- **At the AI strip:** the seam briefly *pulses* — a third faint channel (the agent) joins, then merges.
- **At the Final CTA:** the two channels fuse permanently into one heavy line that becomes the top border of the CTA stamp — build + grow, resolved.

### Garden (SaaS) — "Growing Seam"
A vine/ink seam that **grows** down the page as you scroll, like a plant tracking the sun or a hand-drawn marginal line in a notebook.
- **On scroll:** the seam draws itself downward (SVG `stroke-dashoffset` tied to scroll progress), terracotta ink, slight organic wobble.
- **At each join:** a small leaf / `✿` node buds where a section attaches.
- **At the AI feature:** the vine sprouts a plum offshoot (the AI lane) that rejoins.
- **At the Final CTA:** the two strands of the vine braid into one stem feeding the terracotta button — growth, resolved.

---

## Buildable spec

**File:** `components/decor/seam.tsx` (+ `components/decor/seam-node.tsx` for the join marks). Mounted once per page, fixed to the content column, `position: absolute` within a `position: relative` page wrapper; `pointer-events: none`; `aria-hidden="true"`.

### Mechanism (theme-agnostic core)
1. A single full-height `<svg>` (or two stacked `<path>`s for the two channels) positioned along a consistent x (e.g. the left gutter on desktop, hidden < `md`).
2. Track scroll progress with `motion`'s `useScroll` (already in deps) → a `0..1` MotionValue.
3. Drive a CSS var `--seam-progress` and a `--seam-velocity` (from `useVelocity`) on the wrapper.
4. **Studio:** map `--seam-velocity` → channel separation (`transform: translateX`) on the pink/blue paths; clamp ±8px; spring back to 0 at rest.
5. **Garden:** map `--seam-progress` → `stroke-dashoffset` so the path draws in; map section anchors → node `scale` budding.
6. **Section joins:** `<SectionShell seam>` renders a `<SeamNode kind="cross|leaf" />` absolutely positioned at its top edge, registered to the seam x.

```tsx
// sketch — components/decor/seam.tsx
'use client'
import { useScroll, useVelocity, useTransform, motion, useReducedMotion } from 'motion/react'

export function Seam({ theme }: { theme: 'studio' | 'garden' }) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const velocity = useVelocity(scrollYProgress)
  const separation = useTransform(velocity, [-2, 0, 2], [-8, 0, 8]) // studio channels
  const draw = useTransform(scrollYProgress, [0, 1], [1, 0])         // garden dashoffset (1→0)

  if (reduced) return <StaticSeam theme={theme} /> // perfectly-registered line / fully-grown vine

  return theme === 'studio'
    ? <RegistrationSeam separation={separation} />
    : <GrowingSeam draw={draw} />
}
```

### Reduced-motion / no-JS fallback
- `prefers-reduced-motion: reduce` → render **`<StaticSeam>`**: Studio = a single perfectly-registered navy line with the ✛ marks; Garden = the fully-grown terracotta vine with its leaf nodes. No animation, identical meaning. The seam is a *diagram* first; the motion is the bonus.
- No-JS (SSR before hydration): ship the static seam markup so it's correct on first paint; enhance on mount.

### Performance budget
- Pure transform/opacity/`stroke-dashoffset` — no layout, no paint thrash. Target: zero CLS contribution, < 1ms scripting per scroll frame. Disable below `md` (mobile gets the static node marks only, no scroll-linked motion).
- Don't animate `box-shadow`/filters on scroll.

### Where it attaches (both themes)
`Hero (enters) → every <SectionShell seam> join → AI section (pulse/offshoot) → Final CTA (fuse)` + the `<FounderSeam>` instance literally joining the two founders (`02 §E`).

---

## Acceptance criteria
- [ ] `components/decor/seam.tsx` exists; one instance per home page; `aria-hidden`, `pointer-events:none`, no CLS.
- [ ] Studio = two-channel registration line with velocity-linked separation that snaps back at rest + ✛ join marks.
- [ ] Garden = scroll-drawn vine with leaf/✿ nodes + plum AI offshoot.
- [ ] The seam visibly **fuses into one** at the Final CTA in both themes.
- [ ] `prefers-reduced-motion` and no-JS both render a correct, meaningful **static** seam.
- [ ] Disabled (static nodes only) below `md`; verified 60fps scroll on a mid-tier laptop; Lighthouse perf unchanged (≥ existing).
- [ ] Reinforces "under one roof" — a reviewer who never reads a word can infer "one continuous team" from the line alone.
