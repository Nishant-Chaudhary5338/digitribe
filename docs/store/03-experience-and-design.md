# 03 · Experience & Design Spec — the quality bar

> **The doc that makes the store feel premium, not like a cheap AI wrapper.** Every product's PRD §6 (Output Contract), §9 (AI/prompt), and §11 (UX) MUST satisfy the bars defined here. If a deliverable looks like "basic AI-generated output," it fails this spec — regardless of whether it technically works.
>
> Audience: engineering + design agents. Read after [`01-platform-spec.md`](./01-platform-spec.md). Lineage for taste: `PROJECT_VISION.md` (Digitribe's senior, editorial, "studio with taste" aesthetic) + the `impeccable`, `taste`, `emil-design`, `ui-ux-pro`, and `frontend:product-showcase` skills (use them when building UI).

---

## 0. The one sentence

**Every screen and every artifact must make a buyer think "this was made by senior people who care," and must be so obviously useful and well-crafted that paying felt cheap.** That feeling is the product. The AI is just the engine.

## 1. The store is a product showcase, not a form farm

The storefront and each sales page are conversion surfaces that _prove_ craft (consistent with `PROJECT_VISION.md`'s "the site itself is proof we can build beautiful things").

**Storefront (`/store`) requirements:**

- Each product is a **showcase card**, not a text link: name, one-line outcome, a **real artifact preview** (a thumbnail of the actual report/file it produces), price, and a hover micro-interaction (motion).
- Group by the two audiences (businesses / builders / founders) with editorial section intros, not a flat grid.
- A live "what you get" — every product shows a **sample output** (sanitized real example), so the buyer sees the quality _before_ paying. This single thing is the biggest conversion lever; treat sample outputs as first-class assets, not afterthoughts.

**Product sales page (`/store/[product]`) requirements:**

- Hero: the outcome in one line + the artifact visual + price + Buy.
- **"See a real example"** — an expandable real (anonymized) report/bundle. Never lorem ipsum.
- 3-step "how it works," the FAQ (also JSON-LD), trust strip (§5), and the upsell/cross-sell.
- Senior copy: plain, confident, specific. No hype, no emoji-soup, no "Revolutionize your…". Matches the studio voice.

## 2. Output quality bar — "advanced, personalized, not basic AI output"

This is the heart of the user's concern. A schema-valid object is necessary but **not sufficient**. Every artifact must clear ALL of these:

### 2.1 Specific, not generic

- The output must reference **the buyer's actual inputs** — their real site, their real product names, their real entities. A reader must not be able to swap another customer's output in and have it still fit.
- **Enforcement:** prompts must instruct "use ONLY facts from the provided input; no placeholders, no invented details" (see Agent-Ready Kit §9). PRDs must add an **eval check** that the artifact is input-specific (golden-set + LLM-judge: "could this output belong to a different site? if yes, fail").

### 2.2 Structured, scannable, hierarchical

- Artifacts lead with the answer: a headline verdict / score / the single most important thing — then detail. (Same "answer-first" principle the blog skills use.)
- Clear hierarchy: summary → dimensions/sections → specifics → next actions. The Output Contract (§6 of each PRD) is designed so this hierarchy is guaranteed by the schema, not left to the model's prose.
- **Prioritized**, always. "Here are 30 issues" is basic; "here are the 3 that matter, then the rest" is senior. Every list-producing product ranks by impact.

### 2.3 Beautiful presentation (the "beautification" the user asked for)

- **Typography & layout:** Manrope/Inter, generous spacing, real visual hierarchy — the artifact reads like a designed report, not a JSON dump or a chat transcript.
- **Data visualization:** scores → gauges/rings; comparisons → bars; coverage → matrices. Use inline, accessible SVG (transparent bg, dark-mode safe, `role="img"`), matching the blog-chart conventions. Numbers get visualized, never left as raw text where a chart helps.
- **Severity/status as design:** chips, color + icon + label (never color alone), consistent across products (e.g. missing/partial/good; A–F grades).
- **Code/file outputs:** syntax-highlighted, monospace, per-file **copy button**, filename headers, "why this file" rationale. Files look committable and trustworthy.
- **Branded PDF:** the downloadable PDF is a designed Digitribe artifact (cover, grade, sections, footer) — something a buyer would forward to their boss. Not a screenshot.

### 2.4 Customized to context

- Where a PRD collects optional context (business description, audience, DTC vs SaaS), the artifact must visibly adapt — tone, examples, recommendations. Digitribe's **dual DTC/SaaS DNA** should show up: a DTC buyer's report feels DTC; a SaaS buyer's feels SaaS.

### 2.5 No AI-tells

- Ban filler ("In today's fast-paced digital landscape…", "It's important to note", "Let's dive in"), hedging, and restated-prompt preambles. Prompts and post-processing strip these.
- No hallucinated facts, no fake URLs/stats/citations. If a fact isn't in the input, it isn't in the output.
- Confidence is honest: low-content inputs produce honest "we found limited data, here's how to improve" — not confident nonsense.

> **PRD requirement:** every product's §6 and §9 must show how 2.1–2.5 are met. Reviewers reject PRDs whose output could read as "generic ChatGPT output."

## 3. Progressive, interactive run experience ("interactive AI till agents are working")

The wait is part of the product. A dead spinner says "cheap script"; a narrated, live run says "powerful agent working for me."

**Requirements for every tool's running state:**

- **Real, streamed phases** from the job runner's SSE events (platform-spec §6): "Crawling 12/40 pages…", "Analyzing structured data…", "Generating your bundle…". Real counts, not fake percentages.
- **Show the work:** surface intermediate findings as they arrive (e.g. "Found 3 issues so far", page titles being read, entities detected). Stream partial Output-Contract fields with `streamObject` where possible so sections fill in progressively.
- **Stagecoach, not freeze:** progress bar + current-step label + a subtle motion/agent animation. Optional rotating micro-education ("Why llms.txt matters") to make waiting valuable, not idle.
- **Perceived performance:** optimistic transitions (`motion`), skeletal placeholders for sections about to fill, and a satisfying completion moment (the grade/score animates in).
- **Never a blank screen for >300ms.** Every async boundary has a designed state.
- **Cancel/!done affordances:** user can cancel a run; on error, the partial work and the entered input are preserved.

Reference patterns: `emil-design` (spring micro-interactions, the "delight checklist"), `frontend:product-showcase` (showcase motion). Use them when implementing.

## 4. The full state machine (every tool UI implements all of these)

`empty → collecting input → validating key → running (streamed) → [partial] → success (artifact) | error | quota-exhausted`

Each state is **designed**, not default:
| State | Bar |
|---|---|
| empty / collecting | inviting, clear single primary action, inline help, "we never store your key" |
| validating key | inline ✓/✗, never a full-page block |
| running | §3 — live, narrated, interactive |
| partial | non-blocking banner, keep going |
| success | §2 — the showcase artifact, copy/download/email, upsell |
| error | human message (per PRD §10), input preserved, one-click retry |
| quota-exhausted | gentle, with buy-again CTA |

## 5. Trust & safety as visible design

Buyers paying with their own API key and pasting their site/code need to feel safe. Make safety **visible**, not buried in a privacy page:

- **"We never store your API key"** stated at the key field, every time, with a one-line how (used for this run only; encrypted only if you choose to save it).
- Security posture badges where relevant ("public pages only," "your code is never retained," "files generated locally").
- Transparent pricing: show expected per-run cost on the buyer's key (platform-spec §8) so there's no bill surprise.
- Clear data-retention statement per product (artifact kept 30 days for re-download, then purged).
- Real, human error messages — buyers trust tools that fail gracefully.

## 6. Per-product Showcase Checklist (gate before "live")

A product is **not** allowed to go live until every box is checked. Add this checklist to each PRD's §17 Phase 3.

- [ ] **Sample output asset** created (anonymized real run) and shown on the sales page + storefront card.
- [ ] Artifact leads with the headline verdict (answer-first) and is prioritized by impact.
- [ ] Output is provably input-specific (eval check passes — §2.1).
- [ ] At least one piece of designed data-viz where numbers warrant it (§2.3).
- [ ] Branded, designed PDF export (not a screenshot).
- [ ] File/code outputs have copy buttons + filenames + rationale.
- [ ] Running state streams real phases + shows-the-work (§3).
- [ ] All 8 UI states designed (§4) — no default spinners/blank screens.
- [ ] "We never store your key" + retention + expected-cost visible (§5).
- [ ] AI-tells absent (filler/hallucination eval passes — §2.5).
- [ ] Senior copy throughout (no hype, matches `PROJECT_VISION.md` voice).
- [ ] `impeccable` / `taste` skill pass on the artifact + sales page; `ui-ux-pro` + axe pass on the tool UI.
- [ ] Mobile artifact view is first-class (not a desktop afterthought).

## 7. Anti-patterns (automatic rejection)

- A wall of unstyled AI prose / a raw JSON or markdown dump as "the deliverable."
- Generic output that ignores the buyer's actual input.
- A spinner with no information during the run.
- Fabricated stats, URLs, or citations.
- Hype/emoji marketing voice; restated-prompt preambles; "As an AI…".
- Color-only severity (a11y fail); unlabeled inputs; missing focus management.
- Hiding the sample output behind the paywall (buyers need to see quality first).
- One giant undifferentiated list with no prioritization.

## 8. How this plugs into the PRD template

- **§6 Output Contract** — schema must encode the answer-first hierarchy and the fields needed for §2 (headline verdict, prioritized actions, viz-able numbers, rationale).
- **§9 AI/prompt** — must include the anti-generic, anti-AI-tell, input-only-facts rules and an honest-confidence rule.
- **§11 UX** — must reference §3 (progressive run) and §4 (all states) here, not re-describe them.
- **§16/§18** — the eval suite must include the "input-specific" and "no AI-tells" judges from §2.
- **§17 Phase 3** — must embed the §6 Showcase Checklist as acceptance criteria.
