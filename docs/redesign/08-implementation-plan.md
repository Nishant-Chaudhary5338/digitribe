# 08 — Implementation Plan

> Phased, file-by-file execution for Claude Code. Ordered so `pnpm build` stays green after every phase and the site is shippable at each checkpoint. Do not batch phases. Each ends with acceptance criteria — do not advance until they pass.

**Stack reminder:** Next.js 16 (App Router), React 19, Tailwind v4 (tokens as CSS vars in `app/globals.css`), MDX, `motion`. No new heavy deps — `motion` already covers the seam (`useScroll`/`useVelocity`). No proprietary tools.

**Global guardrails (all phases):**
- Never reintroduce a third founder, a designer headcount, or design-as-headline-lane.
- Use exact token values from `01`. No raw hex in components (the migration of `process-steps.tsx` is the canary).
- Keep `prefers-reduced-motion` honored on every animation.
- Run `pnpm build`, `pnpm test` (Playwright e2e + a11y), and the visual snapshots after each phase; update snapshots only when the change is intended.

---

## Phase 0 — Foundations (tokens & fonts) · low risk
**Goal:** the design system exists in code before any component uses it.
**Files:**
- `app/globals.css` — add to `@theme`: `--text-8xl/9xl`, `--display-sm/md/lg/xl`, tracking/leading tokens, `--space-section-sm/md/lg`, `--measure`, `--gutter`, `--container-max`, `--easing-spring`. Update all `--color-*` in both `[data-theme]` blocks to the `01 §2` "after" values. Add Garden paper-fiber `--grain` + page-level grain wash for Studio.
- `app/layout.tsx` — remove the Instrument Serif font loader; keep Bricolage, Fraunces, Inter Tight, JetBrains Mono, IBM Plex Mono. Ensure `--font-accent` (Studio) no longer references it.
- `lib/data/founders.ts` — `lane: 'build' | 'grow'`; give Manu a real `accentColor`; keep `// MOCK` flags on photos/links (do not invent).
- `public/brand/design-philosophy.md` — rewrite around two-in-tension (keep prose quality).

**Acceptance:** `pnpm build` green; axe/contrast pass on `/dtc`, `/saas`; no reference to Instrument Serif; no `--founder-dot-3`; both themes visibly retextured; no visual regression beyond intended color shifts.

---

## Phase 1 — Kill the template tells · low risk, high signal
**Goal:** fix the three artifacts that most scream "template" — fast wins, no new components.
**Files:**
- `components/sections/process-steps.tsx` — **remove all raw hex** (`#f0ede5/#0a0e27/#ff5b3a`); use `--color-bg-card-alt`, `--color-text-primary`, `--color-accent`. Verify it now renders warm under Garden, cool under Studio.
- `components/sections/pricing-table.tsx` — switch `€`→ USD using `startingPriceUsd`/`ceilingPriceUsd`; render ranges; fold the `theme: 'ink'|'sand'` prop toward `data-theme` tokens.
- `components/sections/hero/studio-hero.tsx` — swap Instrument Serif "roof." for condensed Bricolage + marker (`01 §1`); headline → `--display-lg`.
- Cut the "5+ years each" stat in both heroes.

**Acceptance:** zero raw hex in `components/sections/*` (grep); prices show USD ranges; Garden process section is warm; no Instrument Serif anywhere; `pnpm build` + visual snapshots updated intentionally.

---

## Phase 2 — Shared primitives · medium risk
**Goal:** the rhythm + header system that the section work depends on.
**Files (new):**
- `components/layout/section-shell.tsx` (`02 §A`) — `size`/`tone`/`align`/`seam` props.
- `components/sections/section-header.tsx` (`02 §B`) — extract the two hero eyebrow gestures; three alignments.
- `components/sections/stat-row.tsx` (`02 §D`) — three claims, theme-skinned.
- `components/decor/riso-field.tsx`, `components/decor/garden-field.tsx` (`02 §G`) — extract from the heroes; scroll-linked / single-grow, no infinite loops.

**Then:** migrate existing sections to wrap in `<SectionShell>` (no layout change yet — just the wrapper + tokens). Enforce the "no adjacent `{size+tone}` repeat" rule.

**Acceptance:** every `components/sections/*` renders through `<SectionShell>`; heroes use the extracted fields; no infinite decorative animation remains; `pnpm build` green; e2e nav tests pass.

---

## Phase 3 — Split the spine (the core fix) · higher risk
**Goal:** DTC and SaaS stop sharing the below-fold stack (`diagnosis §1`).
**Files:**
- `app/(dtc)/dtc/page.tsx` — new order (`03`): `StudioHero → TrustStrip → AnchorTriad → ProblemStatement(split) → AICallout → ProcessSteps → FounderSeam → FinalCTA`. Remove `HowWeWork`, `IdealClients` from this page.
- `app/(saas)/saas/page.tsx` — new order (`04`): `GardenHero → TrustStrip → ProblemStatement(editorial) → AnchorTriad(editorial) → AICallout → HowWeWork → ProcessSteps → FounderSeam → FinalCTA`. Remove `IdealClients`.
- `components/sections/two-anchors.tsx` → `AnchorTriad` (`02 §C`): **3 anchors**, data-driven via `getServicesByCategory`, `layout` prop (`grid` for Studio / `editorial` for Garden), AI featured.
- `components/sections/founders-grid.tsx` → add `variant='seam'` (2-up join), reduce `FOUNDER_DOT_STYLES` to 2.
- `components/sections/problem-statement.tsx` — `split` (Studio) vs `editorial` (Garden) skins; new copy (`06`).
- Theme-skin `trust-strip.tsx` and `final-cta.tsx` (hard/stamp in Studio, hairline/letterpress in Garden).

**Acceptance:** `/dtc` and `/saas` differ in section set, layout, *and* length — not just color (screenshot diff confirms); `AnchorTriad` shows 3 anchors; founders render as a 2-person seam; all copy from `06`; `pnpm build` + e2e green.

---

## Phase 4 — Elevate the AI practice · medium risk
**Files (new):**
- `components/sections/ai-callout.tsx` (`05 §2`) — deterministic dual-skin tool-call animation; static under reduced-motion; visually-hidden summary; mounted in both home pages (Phase 3 left the slot).
- `components/sections/ai-practice-board.tsx` (`05 §3`) — object-style cards for `automate` services; mount on `app/(dtc)/dtc/services/page.tsx` + `app/(saas)/saas/services/page.tsx` replacing `<PricingTable category="automate">`.
- Footer evidence line (`05 §4`) in `studio-footer.tsx` / `garden-footer.tsx`, linking the chat widget.

**Acceptance:** AI callout works in both skins, fully static/readable under reduced-motion + no-JS; AI services render as objects, not price rows; numbers labeled illustrative; no invented outcomes; `pnpm build` green; a11y pass.

---

## Phase 5 — The Seam (signature) · highest risk, do last
**Files (new):**
- `components/decor/seam.tsx` + `components/decor/seam-node.tsx` (`07`).
- Wire `<Seam theme>` into both home page wrappers (one per page, `aria-hidden`, `pointer-events:none`); attach `<SeamNode>` via `<SectionShell seam>`; seam fuses at `FinalCTA`; `FounderSeam` uses it.

**Acceptance:** seam present both themes (registration line / growing vine), fuses at CTA, ✛/leaf join nodes; correct static fallback under reduced-motion + no-JS + below `md`; 60fps scroll on mid-tier laptop; Lighthouse perf ≥ pre-seam baseline; zero CLS contribution.

---

## Phase 6 — Polish & QA · low risk
- Tighten `Reveal` stagger caps (`01 §5`); audit hit targets ≥44px; check `::selection`, focus rings.
- Re-run full `tests/` suite; refresh `tests/visual/screenshots/*` intentionally; run `scripts/lighthouse-audit.ts`.
- Verify `prefers-reduced-motion` across the whole site in one pass.
- Final voice pass against `06` — no filler crept back in.

**Acceptance:** all e2e + a11y + visual + lighthouse green; reduced-motion clean; copy matches `06`.

---

## Risks & mitigations
| Risk | Mitigation |
|---|---|
| Splitting the spine breaks shared imports / tests | Phase 3 is isolated; keep old components until pages are migrated, then delete. Update `tests/e2e/*` selectors in the same phase. |
| Seam hurts performance / CLS | Phase 5 is last and independent; transform/dashoffset only; disabled < `md`; ship behind a static fallback so it can be reverted by removing one mount. |
| Color shifts fail contrast | Phase 0 includes an axe pass before any component work. |
| Scope creep into `/about`, `/contact`, services detail | Out of scope for v1 except the AI services board (Phase 4). Note as a fast-follow. |
| Reintroducing 3-founder residue | Global guardrail + Phase 0 founder-data fix + Phase 3 `FOUNDER_DOT_STYLES` reduction. |

## Definition of done (whole project)
- [ ] DTC and SaaS are recognizably sibling but genuinely distinct below the fold.
- [ ] AI is a peer anchor with a live moment and an object-based services board.
- [ ] The Seam is the screenshot moment, with bulletproof reduced-motion/no-JS fallbacks.
- [ ] No raw hex in components; all values from `01`; no third-founder residue anywhere.
- [ ] `pnpm build`, e2e, a11y, visual, and lighthouse all green; copy matches `06` and the `system-prompt.ts` voice.
