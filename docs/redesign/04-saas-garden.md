# 04 — SaaS "Garden" Experience

> Section-by-section redesign of the SaaS route. Theme: **Garden** — editorial, organic, considered, warm. "A small studio the way studios used to be." Maps to real files. Copy in `06`, tokens in `01`, components in `02`.

**Route:** `app/(saas)/saas/page.tsx` · **Theme wrapper:** `app/(saas)/layout.tsx` (`ThemeProvider theme="garden"`) · **Header/Footer:** `garden-header.tsx` / `garden-footer.tsx`.

## The Garden thesis
A letterpress-quality magazine for serious software founders. Where Studio is a print shop that ships fast, Garden is a studio quarterly: generous margins, Fraunces at full optical contrast, warm oat paper with real fiber texture (`01 §4`), soft radii, hairline rules, things that *grow* into place. One terracotta accent per view, sage for the growth lane, plum for AI. The reader is pre-raise or pre-launch and needs to believe *these people are senior and will make me look credible to investors.* Motion is slow, organic, eased — never mechanical. The Garden page is allowed to be **longer and more reflective** than DTC; that difference in pacing is itself a sibling distinction.

**New SaaS order (diverges from DTC in layout & rhythm):**
`GardenHero → TrustStrip(quiet) → ProblemStatement(editorial) → AnchorTriad(editorial) → AIFeature → HowWeWork(guarantees) → ProcessSteps(garden) → FounderSeam → FinalCTA(letterpress)`

> SaaS keeps `HowWeWork` (the four guarantees read as editorial credibility for this audience) and drops `IdealClients` (fold into `ProblemStatement`). DTC dropped `HowWeWork`. **The two pages now genuinely differ in content, not just paint.**

---

### 1. Hero — `components/sections/hero/garden-hero.tsx`
**Intent:** editorial confidence in 3 seconds; the founder card is the proof.

**Keep:** the `1.5fr / 1fr` split, the Fraunces headline with hand-drawn underline, the **founder card** (best element on the site — `02 §E`), the `✿` flourish, the dashed stat rule.

**Change:**
- Promote the founder card pattern into the shared `<FounderCard>` so it recurs (`02 §E`).
- The signature seam is a **growing ink seam / vine** here (`07`) — it sprouts under the underlined "conversions" and threads down into the page. Replace `OrganicBlobs` static SVGs with `<GardenField>` that **grows on entry** then rests (`02 §G`).
- Headline from `--display-lg` (`opsz 144`); stat row cut to three (`02 §D`), terracotta Fraunces-italic numerals.
- Sub-CTA "or read our notes" → keep (warm, editorial) but ensure `/workshop` exists or point to content.

**Motion:** slow stagger (0.1), ease-out, `SOFT` axis settle on the headline. Vine grows once.

---

### 2. Trust strip — `components/sections/trust-strip.tsx`
**Intent:** a quiet line of credibility. In Garden it should *not* be a hard dark band — it should be a hairline-ruled, centered Fraunces-italic line on paper (theme-skin the same component, `02 §I` rule: one logic, two skins). `--space-section-sm`. Same claim source as DTC, different dress.

---

### 3. Problem statement — `components/sections/problem-statement.tsx`
**Intent:** name the SaaS pain — *"you need a product-grade presence before the raise, and someone who speaks both engineering and growth."*

**Garden skin = editorial:** a large Fraunces pull-quote sets the problem, then a two-column justified body at `--measure`, a hairline rule, then the pivot in italic terracotta. This is the same component as DTC's `split` but with the Garden editorial dress + SaaS-specific copy (`06 §SaaS-Problem`). Fold the strongest `IdealClients` line in here as a margin note.

---

### 4. Anchor triad — `AnchorTriad layout='editorial'` (`02 §C`)
**Intent:** Build · Grow · **AI**, but composed like a magazine spread, not a grid.

**Garden layout:** Build and Grow as two soft cards side by side; **AI & Automation as a wide feature row beneath**, plum accent, Fraunces-italic label `— the part that feels like the future`, set slightly off the grid for editorial asymmetry. Bullets from `getServicesByCategory()`. Soft radii, deep-soft `--shadow-card`.

---

### 5. AI feature *(new — see `05`)*
**Intent:** for SaaS the AI story is *product credibility*: "we build the agents and MCP servers your product roadmap needs — and we built this site's assistant the same way." A calmer, editorial version of the DTC AI strip: a warm card with a resolving MCP tool-call rendered as elegant typographic rows (plum), framed by a Fraunces caption. Spec in `05`; treatment in `07`. Medium band, paper or card tone (not the dark band DTC uses — Garden stays warm).

---

### 6. How we work — `components/sections/how-we-work.tsx`
**Intent:** the four guarantees (talk to makers / productized scope / weekly visibility / agreed numbers) as editorial credibility. Keep the four, keep the lucide icons but restyle to thin hairline icons in terracotta inside soft circles. `--color-bg-card-alt` tone. This section is SaaS-only on the home now (DTC dropped it).

---

### 7. Process — `components/sections/process-steps.tsx`
**Intent:** same four steps, Garden dress. After the token fix (`01`/`03`), the Garden skin renders the steps as a **vertical editorial timeline** threaded by the growing ink seam — numbered in Fraunces, each step a paragraph with a hairline rule, the seam as the spine. (Studio renders the same data as a horizontal proof sheet — same component, two layouts.)

---

### 8. Founders — `FounderSeam` (`02 §E`)
**Intent:** two senior practitioners, no middle layer. Garden skin: organic avatar blobs (the `60% 50%` radii already in the hero), Fraunces names, IBM Plex role lines, the ink seam joining them. Copy `06 §Founders`.

---

### 9. Final CTA — `components/sections/final-cta.tsx`
**Intent:** book the audit, warmly. Garden = **letterpress card**: terracotta pill CTA with the `0 5px 0` push shadow on a deep-brown `--color-bg-inverse` block, Fraunces headline, the seam fusing into the button. Same audit-deliverable mono sub-line as DTC but in IBM Plex. Keep "no pitch."

---

## Garden motion summary
Slow, organic, `--duration-deliberate`, ease-out + `--easing-spring` for grow gestures. The vine seam grows on scroll; pollen drifts ±4px on a long loop. All reduced-motion-gated → static.

## Acceptance criteria
- [ ] `/saas` order: `GardenHero → TrustStrip → ProblemStatement(editorial) → AnchorTriad(editorial) → AIFeature → HowWeWork → ProcessSteps(garden) → FounderSeam → FinalCTA(letterpress)`.
- [ ] SaaS keeps `HowWeWork`, drops `IdealClients`; DTC does the opposite set — the two pages differ in content and length, not just color.
- [ ] `AnchorTriad` editorial layout: AI as an offset feature row, plum accent.
- [ ] Trust strip + Final CTA are theme-skinned (warm in Garden, hard in Studio) from the same components.
- [ ] Garden paper-fiber grain present; `GardenField` grows once then rests; no infinite decorative loops.
- [ ] Garden page visually distinct from DTC below the fold — editorial layouts, vertical timeline, longer flow.
