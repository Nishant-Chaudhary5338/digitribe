# 06 · UI Kit — components, wireframes, tokens, state chart

> **The build blueprint for the store UI.** Doc 03 sets the quality _bar_; this doc gives the _components, layouts, tokens, and state machine_ to build it without reinventing per product. The tool UI is **generic** — only a per-product `ArtifactView` is added.
>
> Tokens below are the **real** values from `app/globals.css` (`@theme`). Use the CSS variables / Tailwind tokens — never hardcode hex.

---

## 1. Design tokens (from the live theme — authoritative)

**Color** (warm editorial palette):
| Token | Value | Use |
|---|---|---|
| `--color-bg-page` | `#f2ead8` | page background |
| `--color-bg-card` | `rgba(255,251,240,.7)` | cards / panels |
| `--color-bg-card-alt` | `#f8f2e0` | nested surfaces |
| `--color-bg-inverse` | `#2d2418` | dark sections, code blocks |
| `--color-text-primary` | `#1c0a00` | headings |
| `--color-text-body` | `#3a3028` | body |
| `--color-text-muted` | `#4d6040` | secondary |
| `--color-accent` | `#c5704f` | primary CTA, active (terracotta) |
| `--color-accent-soft` | `#e8c9b0` | accent bg |
| `--color-secondary` | `#7a8b6e` | sage |
| `--color-tertiary` | `#ffcd55` | highlight |
| `--color-success` | `#5c6e54` | good / grade A–B |
| `--color-warning` | `#c5704f` | partial / grade C |
| `--color-error` | `#a8443d` | missing / grade D–F, errors |
| `--color-border` / `--color-border-strong` | `rgba(45,36,24,.12/.3)` | hairlines |

**Type:** Manrope (display) + Inter (body). Scale `--text-xs…xl`, `--display-sm…xl` (clamps). Tracking `--tracking-display/-tight/-label`. Leading `--leading-display/-tight/-body`.

**Space/shape:** `--space-section-sm/md/lg`, `--gutter`, `--measure: 68ch`, `--container-max: 1280px`; radii `--radius-sm…xl` + `-full`; shadows `--shadow-sm/md/lg`.

**Motion:** durations `--duration-fast(150) /base(250)/slow(400)/deliberate(600)`; easings `--easing-out`, `--easing-in-out`, `--easing-spring`. Use `motion` (Framer) with these; `--easing-spring` for delight moments (score reveal).

**Store density override** (it's a tool, doc 03): inputs/buttons `h-9` primary / `h-8` secondary; cards `p-4`; section padding `py-6/8`, NOT the marketing `--space-section-*`. The store group is a _denser sibling_ of the editorial marketing theme.

**Severity ↔ token map (consistent across ALL products):**
`good/A,B → --color-success` · `partial/C → --color-warning` · `missing/D,F → --color-error`. Always pair color with an icon + word (a11y, doc 03 §2.3).

## 2. Component inventory

**Shared (built once in the spine, S10):** `components/store/`
| Component | Props (essentials) | Notes |
|---|---|---|
| `ProductCard` | `product: ProductDef`, `previewSrc` | storefront showcase card w/ artifact thumbnail + hover motion |
| `PriceTag` | `usd: number` | consistent price display |
| `BuyButton` | `slug` | → `POST /checkout` → redirect |
| `KeyInput` | `providers: AiProvider[]`, `value`, `onValidated` | provider select + secret field + inline validate (`/key-check`) + "we never store your key" line + "where do I get a key?" popover |
| `RunProgress` | `events: RunEvent[]`, `phase`, `pct` | live narrated progress (doc 03 §3); `aria-live="polite"`; rotating edu tip; agent animation |
| `ArtifactShell` | `meta`, `onDownload(fmt)`, `children` | frame around any artifact: header, download (zip/pdf), "email me", upsell slot |
| `ScoreRing` | `score: 0–100`, `grade` | animated SVG ring, severity-colored, accessible (`role="img"`) |
| `DimensionCard` | `dimension` | score chip + findings + fixes list |
| `FileViewer` | `files: GeneratedFile[]` | tabbed/accordion, syntax highlight, per-file copy + filename + rationale |
| `SeverityChip` | `status` | color+icon+label |
| `StatBar` / `StatMatrix` | data | inline accessible SVG viz (doc 03 §2.3) |
| `EmptyState` / `ErrorState` / `QuotaState` | message, action | designed non-happy states |

**Per-product (only this):** `components/store/artifacts/<slug>.tsx` — renders that product's Output Contract inside `ArtifactShell`. Everything else is generic.

> Build on existing repo primitives (Radix slot, `class-variance-authority`, `clsx`/`tailwind-merge` `cn()`, `lucide-react`, `motion`). Don't add a component library.

## 3. Wireframes (layout skeletons)

**Storefront `/store`**

```
┌ store nav (logo · For Businesses · For Builders · For Founders · Account) ┐
│  H1  "Instant AI tools. Pay once, use now."   sub: BYOK · no subscriptions │
│  ── For Businesses ───────────────────────────────────────────────         │
│  [ProductCard] [ProductCard] [ProductCard]      ← artifact-preview thumbs   │
│  ── For Builders ─────────────────────────────                              │
│  [ProductCard] [ProductCard] ...                                            │
│  ── For Founders ─────────────────────────────                              │
│  trust strip: "We never store your key · Built by Digitribe"                │
└────────────────────────────────────────────────────────────────────────────┘
```

**Sales page `/store/[product]`**

```
HERO:  outcome H1 · 1-line value · [artifact visual] · PriceTag · BuyButton
HOW:   3 steps (paste → run on your key → get artifact)
PROOF: "See a real example" ▸ expands a real anonymized artifact (NOT lorem)
FAQ:   accordion (also JSON-LD)
TRUST: key-safety · expected cost · retention
CROSS: sibling/upsell products + agency CTA
```

**Tool UI `/store/use/[token]`**

```
┌ header: product name · runs remaining: N · (account) ┐
│  STATE-DRIVEN BODY (see §4):                          │
│   collecting:  [input fields]  [KeyInput]  [Run ▶]    │
│   running:     [RunProgress ............... 62%]      │
│                "Crawling 12/20 · found 3 issues"      │
│   success:     [ArtifactShell > ScoreRing + cards +   │
│                 FileViewer + downloads + upsell]      │
│   error/quota: [ErrorState / QuotaState + action]     │
└───────────────────────────────────────────────────────┘
```

## 4. Run state chart (every tool UI implements this exactly)

```
            ┌────────────┐
            │   empty    │ (form pristine)
            └─────┬──────┘
        input valid │
            ┌─────▼───────┐  key blur   ┌──────────────┐
            │ collecting  ├────────────▶│ validatingKey│
            └─────┬───────┘◀────────────┴──────┬───────┘
          Run ▶ (key ok) │              invalid │ (back to collecting w/ error)
            ┌─────▼───────┐
            │   running   │── SSE RunEvents ──▶ (pct/message updates)
            └──┬────┬─────┘
     error event│    │ done event
       ┌────────▼┐ ┌─▼─────────┐
       │  error  │ │  success  │ (artifact; quota−1)
       └────┬────┘ └─────┬─────┘
   retry (input kept)│   │ Run again (if quota>0 → collecting)
            └─────────┘   │ quota==0
                    ┌─────▼──────┐
                    │  quota     │ (buy-again CTA)
                    └────────────┘
```

Transitions are driven by `/key-check` and the `/run` SSE terminal events (doc 04 §4–§6). **No state may render a bare spinner or blank >300ms** (doc 03 §3).

## 5. Accessibility contract (gate via axe)

- Every input labeled; provider+key in a `<fieldset>` with legend.
- `RunProgress` region: `role="status"` + `aria-live="polite"`; announce phase changes, not every pct tick.
- On `success`, move focus to the artifact `<h2>`; on `error`, focus the error with the retry.
- Severity never color-only (chip = dot + icon + word). Contrast ≥ AA against `--color-bg-card`.
- Keyboard: full tab order; FileViewer tabs are real tablist; copy buttons announce "copied."
- Mobile: artifact is first-class — cards stack, FileViewer → accordion, downloads full-width.

## 6. Motion guidance (delight without noise)

- State transitions: cross-fade/slide `--duration-base` `--easing-out`.
- Score/grade reveal: count-up + ring draw on `--easing-spring`, once.
- Progress: smooth width, subtle working-agent pulse.
- Respect `prefers-reduced-motion` → disable non-essential motion.
- Reference the `emil-design` skill's delight checklist + `frontend:product-showcase` when implementing.

## 7. PDF/export styling

The branded PDF (report.ts, spine S9) uses the same tokens: cover with product name + ScoreRing, section hierarchy, severity chips, footer "Generated by Digitribe — digitribe.world/store". It must look forwardable to a boss, not like a screenshot (doc 03 §2.3).

## 8. Quality skills to run before "live"

Per doc 03 §6 checklist: run `impeccable` + `taste` on the artifact + sales page, `ui-ux-pro` + axe on the tool UI. Treat their findings as blockers, not suggestions.
