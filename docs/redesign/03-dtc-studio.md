# 03 — DTC "Studio" Experience

> Section-by-section redesign of the DTC route. Theme: **Studio** — bold, fast, a little punk, Riso/print energy, hard edges. Every section below maps to the real file it changes. Copy lives in `06`; tokens in `01`; components in `02`.

**Route:** `app/(dtc)/dtc/page.tsx` · **Theme wrapper:** `app/(dtc)/layout.tsx` (`ThemeProvider theme="studio"`) · **Header/Footer:** `studio-header.tsx` / `studio-footer.tsx`.

## The Studio thesis
A print shop that ships code. The whole DTC site should feel like it came off a Risograph: registration marks, halftone grain on the *whole page* (not just the hero, `01 §4`), hard 0-radius rules, ink-on-newsprint, one hot pink call per screen, yellow as a marker pen. Motion is **mechanical** — things snap into registration. Energy: fast, confident, the studio that runs your build *and* your ads and refuses to apologize for being only two people.

**Current new-order of sections (shared with SaaS — the problem):**
`HeroHome → TrustStrip → ProblemStatement → TwoAnchors → HowWeWork → IdealClients → ProcessSteps → FoundersGrid → FinalCTA`

**New DTC order (diverges from SaaS in layout & rhythm, not just color):**
`StudioHero → TrustStrip(tight) → AnchorTriad(grid) → ProblemStatement(split) → AIStrip → ProcessSteps(press) → FounderSeam → FinalCTA(stamp)`

> Drop `HowWeWork` + `IdealClients` from the DTC home and fold their best lines into `AnchorTriad` and `ProblemStatement` — the DTC page is currently 9 sections and too long for "8 seconds of patience." SaaS keeps a longer, more editorial flow (`04`). Different length is itself a way the siblings differ.

---

### 1. Hero — `components/sections/hero/studio-hero.tsx`
**Intent:** stop the scroll in 3s; say *code + ads, one team, fast* without a paragraph.

**Keep:** the "Code, content, conversions — under one roof." headline structure, the bordered mono eyebrow, the stat row (but cut to three, `02 §D`), the pink/navy/blue CTA.

**Change:**
- **Signature seam enters here** (`07`): the registration line runs down from the hero into the page; the riso shapes become `<RisoField>` with **scroll-linked channel drift**, not infinite spin (`02 §G`). At rest the shapes are perfectly registered; as you scroll the pink/blue channels separate ~6px and the headline gains a 2px misregistration ghost — print coming off the press.
- "roof." → condensed heavy Bricolage + yellow marker, not Instrument Serif (`01 §1`).
- Headline size from `--display-lg`; remove inline clamp.
- Replace the floating `↑ same team. same week.` annotation with a **live micro-proof**: a tiny mono ticker reading `build ▷ launch ▷ traffic` where the active token highlights pink on a 3-step loop *(reduced-motion: all three shown static)* — a 1-line teaser of the AI/loop story.

**Motion:** entrance stagger 0.08 (keep), mechanical ease. No infinite loops.
**Layout:** single left-aligned column (keep) — Studio is direct, not editorial. The asymmetry is the off-canvas riso field bleeding off the right edge.

---

### 2. Trust strip — `components/sections/trust-strip.tsx`
**Intent:** one breath of credibility between hero and offer. Keep it tight (`--space-section-sm`).

**Change:** it's a dark band today (`--color-bg-inverse`). Good for contrast. Make the copy a **marquee of concrete claims** in mono, separated by registration crosses (✛), e.g. `✛ 0 account managers ✛ you talk to the makers ✛ build + ads, one invoice ✛ EU/US hours ✛`. Slow, reduced-motion → static centered line (current behavior). Feed the items from one constant (`lib/utils/constants.ts`) shared with the footer so claims never drift.

---

### 3. Anchor triad — `components/sections/two-anchors.tsx` → `AnchorTriad` (`02 §C`)
**Intent:** the offer in one screen — and the moment AI becomes a peer of Build and Grow.

**Layout (Studio = `grid`):** three hard-bordered cards, equal width, `0` radius, `--shadow-card` offset. **Build** (blue rule), **Grow** (pink rule), **AI & Automation** (the featured one — blue `/// the new bet` mono tag, slightly taller, a faint terminal-cursor blink in the corner). Bullets pulled live from `getServicesByCategory()`.

**Why memorable:** the AI card visibly *outranks* a normal grid cell — it's the studio planting a flag. Hover collapses the offset shadow (mechanical snap).

**Copy:** `06 §DTC-Anchors`. Footnote: `+ Design, research-first, woven through every build.` (keeps design as service, not headcount).

---

### 4. Problem statement — `components/sections/problem-statement.tsx`
**Intent:** name the DTC pain precisely — "your site team and your ads team have never met."

**Change layout to `align='split'`** (`02 §B`): left column = the mono eyebrow `THE PROBLEM` + a hard vertical rule; right column (`--measure`) = the prose. Pull the prose tighter (`06 §DTC-Problem`) — current copy is three dense paragraphs; DTC wants two sharp ones. The pivot line **"We fixed this by being one team."** gets the yellow marker + `--display-sm`.

**Motion:** the two columns enter from opposite sides and *register* (meet at the seam). Reduced-motion → fade.

---

### 5. AI strip *(new — see `05`)*
**Intent:** the differentiator, live, on the DTC page. A short dark band where a **mock MCP tool-call resolves** (`ad-account.fetch → roas: 3.8x → page.suggest_variant`). For DTC the framing is growth: *"we wire your store, your ads, and an agent into one loop."* Full spec in `05`; signature treatment in `07`. Tight-to-medium band, `--color-bg-inverse`, electric-blue terminal accent.

---

### 6. Process — `components/sections/process-steps.tsx`
**Intent:** "from 'let's talk' to live in 4 weeks" — proof we move fast.

**Critical fix:** this file hardcodes `#f0ede5 / #0a0e27 / #ff5b3a` (diagnosis §2). Migrate to tokens. In Studio, render the four steps as a **printer's proof sheet**: four numbered plates `01–04`, giant ghosted Bricolage numerals (keep the `opacity:.3` numeral idea — it's good), connected by the seam, each step a registration cell. Horizontal on desktop, the seam threading through all four.

**Motion:** steps register left-to-right in sequence on scroll-in.

---

### 7. Founders — `components/sections/founders-grid.tsx` → `FounderSeam` (`02 §E`)
**Intent:** two people, no layers — and prove "one team" visually.

**Layout:** two cards joined by the signature seam — Nishant (Build & AI) / Manu (Grow). Studio skin: hard riso dots (pink/blue), `0`-radius cards, mono role chips, stack tags. The seam between them *is* the "no handoff" message. Copy `06 §Founders`.

---

### 8. Final CTA — `components/sections/final-cta.tsx`
**Intent:** book the audit. Highest-intent moment.

**Change:** make it a **stamp** — the seam fuses here (both lanes converge into one CTA), a heavy bordered block on `--color-bg-inverse`, pink CTA with the blue offset shadow, headline `--display-md`. Keep "no pitch, no obligation." Add the audit deliverable as a mono sub-line: `// 30 min → a Loom + a prioritized punch list within 24h. Yours to keep.` (from `system-prompt.ts` — it's a strong, true detail).

---

## Studio motion summary
Mechanical, snappy, registration-based. `--duration-fast`, hard cubic. The only persistent motion is the seam's scroll-linked channel drift and the AI-strip cursor — both reduced-motion-gated. No infinite spins.

## Acceptance criteria
- [ ] `/dtc` section order: `StudioHero → TrustStrip → AnchorTriad → ProblemStatement(split) → AIStrip → ProcessSteps → FounderSeam → FinalCTA`; `HowWeWork`/`IdealClients` removed from the DTC home.
- [ ] `AnchorTriad` shows 3 anchors, AI featured.
- [ ] `process-steps.tsx` uses only theme tokens — zero raw hex; renders warm in Garden, cool in Studio.
- [ ] Hero uses `--display-lg`, no Instrument Serif, riso field is scroll-linked not infinite-spin.
- [ ] Founders render as a seam (2 people) with no third-founder residue.
- [ ] Page-level grain wash present on `[data-theme="studio"]`.
- [ ] DTC page visually distinct from SaaS below the fold (different section set, layouts, rhythm) — not just recolored.
