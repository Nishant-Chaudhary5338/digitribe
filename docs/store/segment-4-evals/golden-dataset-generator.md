# Golden-dataset generator — PRD

**Slug:** `golden-dataset-generator` · **Segment:** 4 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Composes the Segment-4 spine's **spec elicitor** + **case generator** (`prompt-eval-suite.md` §7) but emits **labeled data rows**, not a harness — the "give me the labeled set I never made" entry. A buyer can feed the output straight into `prompt-eval-suite`'s harness or any eval framework.

---

## 1. TL;DR

- **One-liner:** Describe a task → get a labeled golden dataset (JSONL/CSV) you can evaluate your agent or prompt against — the test set you were never going to hand-build.
- **Problem:** Every eval setup needs a labeled "golden set," and hand-labeling 50+ representative cases is the chore that stalls every eval project. So nobody has one.
- **Buyer:** developers / ML/AI engineers / prompt engineers who need a labeled test set to score a prompt or agent but won't hand-write one.
- **Input → Output:** a task description (+ optional examples) → a downloadable **Golden Dataset** (JSONL + CSV) of labeled cases + a short "how to use it" guide.
- **Price:** **$19** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~20–40s (single AI generation) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a builder who wants to eval a task needs a labeled golden set — representative inputs paired with the correct/expected output (or expected properties). Hand-building 50+ good cases that cover the input distribution, the edges, and the adversarial corners is hours of tedious work with no immediate payoff, so it doesn't get done. This is a concrete face of the **~52%-only systematic-eval adoption** stat (segment README): the missing dataset is a top reason evals don't happen.

**Competition:** synthetic-data tools and eval platforms can generate data, but they're heavyweight integrations or generic generators that don't ground in _your_ task and don't hand you a clean, standard-format file you use in 30 seconds. **Gap:** an instant, self-serve, BYOK generator that produces a grounded, format-standard golden set + a guide — file-in-hand, no platform. That's us.

**Urgency stat:** **>40% of agentic-AI projects projected cancelled by 2027** with inadequate reliability controls a named driver — a golden set is the cheapest way to start measuring before the project is at risk.

**Why Digitribe:** we maintain golden sets across this store (doc 05 §7) and know what makes a labeled set actually useful (coverage of buckets, honest "expected properties" not just exact strings, grounding in the real task). We productize the format we use.

## 3. Pricing & packaging

- **$19**, one-time. Cheap-entry price — a dataset is a component, not a full suite; the low price makes it an easy "just buy it" for a missing chore.
- **Includes:** 1 run (3 re-runs to refine the task/examples and regenerate), the dataset download (zip: `golden.jsonl` + `golden.csv` + `README.md` how-to), the on-screen dataset preview, an emailed copy (Resend).
- **Upsell path:** the "how to use" guide and the on-screen preview cross-sell `prompt-eval-suite` ($29 — "drop this dataset into a runnable harness") and `regression-guard` ($19 — "lock the critical rows into CI"); `grade-my-agent` ($29) is suggested for buyers who want a diagnostic first. Agency CTA for "want a bigger / domain-specific set?".
- **Future tiers (note only):** larger sets / domain packs / refresh-on-schedule are v2; v1 is one SKU with a fixed row cap.

## 4. User stories / JTBD

- As a **developer**, when I want to score a prompt, I want a labeled golden set, so that I have something to test _against_ without labeling by hand.
- As an **AI engineer**, when I'm setting up evals, I want representative + edge + adversarial cases pre-labeled, so that my coverage isn't just happy-path.
- As a **prompt engineer**, when I iterate, I want a fixed dataset, so that before/after comparisons are apples-to-apples.
- As a **team**, when onboarding a task, I want a standard-format file (JSONL/CSV), so that it plugs into whatever runner we already use.

**Primary job the artifact must nail:** produce a **task-specific, well-distributed, honestly-labeled** golden set — cases that match the buyer's _real_ input space and edges, with expected outputs/properties that are correct and usable — in a clean standard format that drops into any eval flow.

**Non-goals (v1):** does NOT run/score the buyer's agent (it hands over a dataset; the buyer evaluates with it — segment README boundary); does NOT generate a harness (that's `prompt-eval-suite`); does NOT guarantee real-world distribution match beyond what the description/examples convey; does NOT label with human-verified ground truth — labels are model-generated and clearly marked as such (the buyer reviews/edits).

## 5. Functional requirements

### Inputs

| Field             | Type                   | Validation                                                                        | Example                                                   |
| ----------------- | ---------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `taskDescription` | string                 | non-empty, ≤ 4000 chars: the task the dataset evaluates                           | "Classify a support message into: billing, bug, feature…" |
| `labelType`       | enum                   | `expected_output` \| `expected_properties` \| `classification` (default inferred) | `classification`                                          |
| `labelSpace`      | array (optional, ≤ 30) | the fixed label set for classification tasks                                      | `["billing","bug","feature","other"]`                     |
| `examples`        | array (optional, ≤ 8)  | `{ input, label }` pairs that anchor the distribution + label style               | `[{ input: "card declined", label: "billing" }]`          |
| `size`            | int                    | 20–100, default 50 (cost + signal cap)                                            | `50`                                                      |
| `provider`        | enum                   | one of product's `byokProviders`                                                  | `anthropic`                                               |
| `byokKey`         | string (secret)        | non-empty; validated live pre-run (platform-spec §5)                              | `sk-…`                                                    |

### Processing (requirements level; pipeline in §7)

Elicit a structured spec (task, input space, label space, distribution) from the inputs → AI generates `size` labeled rows across buckets (happy/edge/adversarial), grounded in the description + examples → emitter writes JSONL + CSV + a how-to guide filling the Output Contract → preview + zip + email. **No buyer-agent execution** — this product produces _data the buyer evaluates with_, never runs.

### Outputs

The **Golden Dataset** (zip: JSONL + CSV + README) + on-screen preview. Exact shape in §6.

### Constraints

- 20–100 rows (below 20 is too thin to be a "set"; above 100 adds cost without proportional value for v1). Each input/label ≤ 2000 chars.
- `taskDescription` ≤ 4000; ≤ 8 anchor examples; ≤ 30 labels in a classification set.
- Labels are **model-generated**; the README + a per-row `confidence` make this explicit so the buyer reviews before trusting (honest provenance, doc 03 §2.5).
- Dataset is small text; rows JSON in KV, zip (JSONL+CSV+README) in Vercel Blob.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/golden-dataset-generator.ts
import { z } from 'zod'

const GoldenRow = z.object({
  id: z.string(), // stable row id, e.g. "row-017"
  bucket: z.enum(['happy_path', 'edge', 'adversarial']), // distribution control
  input: z.string(), // the test input
  // exactly one of these is populated per the dataset's labelType:
  expectedOutput: z.string().optional(), // labelType: expected_output / classification
  expectedProperties: z.array(z.string()).max(8).optional(), // labelType: expected_properties
  label: z.string().optional(), // labelType: classification (∈ labelSpace)
  rationale: z.string().max(240), // why this row + why this label (review aid)
  confidence: z.enum(['low', 'medium', 'high']), // honest per-row label confidence
})

export const GoldenDatasetOutput = z.object({
  task: z.object({
    summary: z.string().max(600), // model's understanding of the task
    labelType: z.enum(['expected_output', 'expected_properties', 'classification']),
    labelSpace: z.array(z.string()).max(30).optional(), // present for classification
    inputSpace: z.array(z.string()).max(12), // the kinds of inputs covered
  }),
  distribution: z.object({
    // deterministic counts the preview visualizes (doc 03 §2.3)
    total: z.number().int(),
    happy_path: z.number().int(),
    edge: z.number().int(),
    adversarial: z.number().int(),
    byLabel: z.record(z.string(), z.number().int()).optional(), // class balance (classification)
  }),
  rows: z.array(GoldenRow).min(20).max(100),
  files: z
    .array(
      z.object({
        path: z.string(), // "golden.jsonl" | "golden.csv" | "README.md"
        format: z.enum(['jsonl', 'csv', 'markdown']),
        contents: z.string(), // the actual file body
      })
    )
    .length(3),
  usageNotes: z.array(z.string()).min(2).max(6), // "how to use", incl. "labels are AI-generated — review"
  caveats: z.array(z.string()).min(0).max(5), // honest limits (no human ground truth, distribution caveats)
})
export type GoldenDatasetOutput = z.infer<typeof GoldenDatasetOutput>
```

- **Export formats:** on-screen preview (React table) · **JSON** (the raw contract) · **ZIP** (`golden.jsonl` + `golden.csv` + `README.md`, written to real paths). (No PDF — a dataset is a data file, not a report; the on-screen preview + the files are the deliverable. `OPEN QUESTION:` whether a 1-page "dataset card" PDF adds value — defer.)
- **Field notes:** exactly one of `expectedOutput` / `expectedProperties` / `label` is populated per the dataset's `labelType` (deterministic per the chosen type, so the JSONL/CSV columns are stable). `bucket` is a fixed 3-set controlling distribution. `confidence` is honest per-row; `caveats` and a `usageNotes` line make the "AI-generated labels, review before trusting" provenance explicit (anti-AI-tell honesty, doc 03 §2.5).
- **Determinism:** the file set, columns, buckets, and `labelType` shape are fixed; `input`, labels, `rationale`, prose are generative but constrained and grounded in the spec + examples.

## 7. System logic / pipeline

```
POST /api/store/run/golden-dataset-generator  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ ELICIT  elicitSpec({ taskDescription, labelSpace, examples })  emit{phase:"analyze",pct:22}
  │     - deterministic (shared spine, prompt-eval-suite §7):
  │       infer labelType, input space, label distribution;
  │       fold examples in as grounded anchors + label-style guides
  │     → EvalSpec (dataset-mode)
  │
  ├─ GENERATE  ai.structuredStream({                         emit{phase:"generate",pct:30..82,
  │     system: GOLDEN_DATASET_SYSTEM,       // §9         message:"Labeling rows 24/50…",
  │     prompt: buildPrompt(spec, examples, size),         partial: streamed rows,
  │     schema: GoldenDatasetOutput,          // §6 SDK-enforced  findingCount: rows so far}
  │     effort: "high",
  │   })  → labeled rows + distribution        // streamObject: rows fill progressively
  │
  ├─ EMIT  emitDataset(output)                               emit{phase:"render",pct:88}
  │     - serialize rows → golden.jsonl (one JSON obj/line)
  │     - serialize rows → golden.csv (stable columns per labelType)
  │     - write README.md (how-to: load it, score with it, "labels are
  │       AI-generated — review"; cross-sell prompt-eval-suite harness)
  │     - merge files[] back into the contract for the preview
  │
  ├─ RENDER  report.build(output)                            emit{phase:"persist",pct:95}
  │     - on-screen preview table, JSON, zip(jsonl+csv+README) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — label quality + distribution coverage is the product. Elicit + emit are deterministic — no extra AI cost.
- **Libraries:** none new — JSONL/CSV serialization is plain Node (CSV-escape inline; no dep). Reuses the spine's `elicitSpec` + `report.ts`.
- **Reuse:** consumes the Segment-4 spine's `elicitSpec` and case generator (`prompt-eval-suite.md` §7). Its `GoldenRow` shape is compatible with `prompt-eval-suite`'s `EvalCase.input` + assertions, so a generated dataset feeds that product's harness directly (the cross-sell is technical, not just marketing).

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at generating a well-distributed, correctly-labeled set), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (fine for simple classification sets). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one run generates up to 100 labeled rows in a single structured generation → typically **a few cents to ~$0.20 on the buyer's key** depending on `size`/provider. **State clearly: this run pays only to _generate_ the dataset — using it to evaluate your agent later is your own scoring, not ours.** (Segment README boundary, doc 03 §5.)
- **Pre-run validation:** a 1-token ping via the AI wrapper; on failure return error #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject`/`streamObject` against `GoldenDatasetOutput`.

**System prompt (draft):**

```
You are a senior AI-evaluation engineer building a GOLDEN DATASET for a buyer's
TASK. You are given the elicited task spec (task, labelType, label space, input
space) and any example rows the buyer pasted. Generate a labeled test set the
buyer will evaluate their own prompt/agent against — you are NOT running their
agent.

Hard rules:
- Cases must be SPECIFIC to THIS task and match the real input space + the style
  of the buyer's examples. No generic filler rows. No invented domain facts not
  implied by the task/examples.
- Distribute across buckets: happy_path (typical), edge (boundary/unusual but
  valid), adversarial (hostile/injection/ambiguous). Aim ~60/25/15 unless the
  task implies otherwise. Report the actual distribution.
- For classification: every label MUST be in the provided/inferred labelSpace;
  keep classes reasonably balanced and note byLabel counts.
- For expected_output: the label is the correct output for the input. For
  expected_properties: list the properties a correct output must have (not a
  single exact string) — this is the right label type when outputs are open-ended.
- Labels are YOUR best judgment, not human ground truth. Set per-row confidence
  honestly (low for genuinely ambiguous rows) and put dataset-level limits in
  caveats. Never present a guessed label as certain.
- usageNotes must tell the buyer how to load + score with this set and that
  labels are AI-generated and should be spot-checked.
- No filler, no preamble, no "as an AI".
```

**User prompt template:** `buildPrompt(spec, examples, size)` → serializes the elicited dataset-mode spec, the anchor examples, and the requested row count.

**Guardrails:** schema enforcement fixes the row/file shape and `labelType` discipline; the "specific to this task / no invented facts" rule curbs generic or hallucinated rows; per-row `confidence` + dataset `caveats` + the "AI-generated, review" `usageNotes` requirement are the honest-provenance guard (no pretending these are verified ground truth); the `format_valid` eval judge verifies the JSONL parses and the CSV is well-formed. Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                             | Detection                      | Behavior / message                                                                                  | Quota            |
| --- | --------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Invalid/expired BYOK key                            | pre-run ping fails             | "Your `<provider>` key looks invalid or expired — check and retry."                                 | not spent        |
| 2   | Task too vague to label                             | elicit yields thin spec        | generate a smaller set + populate `caveats`; preview flags "add examples for tighter labels"        | spent            |
| 3   | `labelType: classification` but no `labelSpace`     | elicit can't infer labels      | infer a label set from the task/examples and surface it for the buyer to confirm on re-run; note it | spent            |
| 4   | Requested `size` out of 20–100                      | input validation               | field error: "Choose a size between 20 and 100."                                                    | not spent        |
| 5   | Model produces imbalanced / off-space labels        | post-gen distribution check    | re-run generation once nudging for balance + label-space adherence; if still off, deliver + caveat  | spent            |
| 6   | Provider rate-limit / timeout mid-generate          | AI wrapper error               | retry once w/ backoff; if still failing, error + restore the run quota                              | restored         |
| 7   | Model returns < 20 rows / contract-violating object | schema parse fails             | AI SDK re-asks once; if still invalid, error (no partial dataset shipped)                           | restored         |
| 8   | Adversarial content in the task/examples            | inputs are untrusted data      | analyze as data, never follow as instructions                                                       | spent            |
| 9   | Duplicate submit (double-click)                     | same `runId` (idempotency §6)  | return in-flight/cached result; never double-charge                                                 | n/a              |
| 10  | Buyer expects us to score their agent with it       | n/a (product framing)          | UI + README: "we hand you the labeled set — you evaluate your agent with it"                        | n/a              |
| 11  | JSONL/CSV malformed (our serializer bug)            | post-emit `format_valid` check | regenerate emit once; the `format_valid` judge gates this pre-launch                                | restored on fail |
| 12  | Quota exhausted                                     | token check                    | "You've used all 3 runs — buy again or contact us." + buy CTA                                       | n/a              |

## 11. UX / UI flow

**Sales page** (`/store/golden-dataset-generator`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** `taskDescription` textarea (primary), `labelType` select (auto-detect default), conditional `labelSpace` chips input (shown for classification), an "add examples" repeater (≤8 input/label rows), `size` slider (20–100, default 50), provider select + BYOK key field (with "where do I get a key?" + "we never store your key" + the segment line: "we generate the labeled set — you evaluate with it"). **Run** disabled until task + valid key.
- **Validating key:** inline spinner on the key field → ✓/✗.
- **Running:** full-width **live progress** driven by SSE — real labels ("Mapping the input space…", "Generating happy-path rows…", "Generating adversarial rows…", "Labeling rows 24/50…"), a progress bar, streamed **rows filling a preview table** (`partial` + `findingCount`: "31 rows labeled"), rotating "did you know" about golden sets. `aria-live="polite"`.
- **Partial:** if a balance-retry happened (edge #5), a non-blocking banner; continue to success.
- **Success / artifact view:**
  - Top: **row-count + distribution** headline (e.g. "50 rows · 30 happy / 12 edge / 8 adversarial") with a **distribution bar + per-label balance** viz (`StatBar`/`StatMatrix`, doc 06).
  - **Dataset preview table**: paginated rows (bucket chip, input, label/expected, per-row `confidence` chip, rationale on expand).
  - **Files**: tabbed `FileViewer` (`golden.jsonl` / `golden.csv` / `README.md`) with per-file copy + filename; **Download ZIP** (primary), **Download JSON**, **Email me a copy** (pre-checked).
  - **`caveats`** honest callout ("labels are AI-generated — spot-check before trusting").
  - **Upsell card** → `prompt-eval-suite` ("drop this into a runnable harness") + `regression-guard` + agency CTA.
- **Error:** clear message per §10 + retry; never lose task/examples.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer`, `SeverityChip` (reused for confidence/bucket chips), `StatBar`/`StatMatrix` (see [`../06-ui-kit.md`](../06-ui-kit.md) §2). The only new component is `components/store/artifacts/golden-dataset-generator.tsx` (the distribution + preview table + files body). Run states follow `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md`. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword:** "golden dataset generator" / "generate eval test set" / "labeled dataset for LLM eval" (tool intent).
- **`generateMetadata`:** title `Golden-Dataset Generator — A Labeled Eval Set for Your Task` (≤60); description: "Describe a task and get a labeled golden dataset (JSONL + CSV) to evaluate your prompt or agent against — the test set you'd never hand-build. $19, BYOK." (≤155). Canonical `/store/golden-dataset-generator`. OG via `@vercel/og` (distribution-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real): "What format is the dataset?" (JSONL + CSV, standard columns), "Are the labels human-verified?" (no — they're AI-generated and clearly flagged; review before trusting), "How big is it?" (20–100 rows, you choose), "Do you score my agent with it?" (no — we hand you the set; you evaluate), "Do you store my API key?" (no).
- **Internal links:** golden-set / eval blog posts → here; sibling `prompt-eval-suite` (consumes the dataset), `regression-guard`, `grade-my-agent`.
- **Programmatic surface (note):** anonymized example dataset cards as indexable pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; the examples repeater + `labelSpace` chips labeled; provider/key in a `<fieldset>`; progress region `aria-live="polite"` + `role="status"`; focus moves to the dataset heading on success; bucket/confidence chips never color-only (word + icon); the preview table is a real `<table>` with headers; `FileViewer` tabs a real `tablist`; copy buttons announce "copied."
- Mobile: single-column; the preview table scrolls horizontally with sticky first column or collapses to stacked cards; download buttons full-width.
- Error recovery: errors inline + non-destructive (task/examples preserved); "retry" without re-entering the key (session memory only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route.

## 14. Payment integration

- Create Polar product **"Golden-dataset generator" $19** (sandbox + live). Checkout metadata `{ slug: "golden-dataset-generator" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund if no valid dataset produced (rare). Quota auto-restores on system-side failures (§10 #6/#7/#11).

## 15. Security & privacy

- **Buyer data:** the task description + optional example rows (may carry domain data). Treat as confidential. Retention: transient for the run; dataset stored 30d (KV/Blob TTL) for re-download; then purged. Never logged at info level; never stored longer than the run needs (platform-spec §10.7).
- **Boundary:** we **never run the buyer's agent** and never receive its keys — only the BYOK key paying to _generate_ the dataset. State on the page (doc 03 §5).
- **Product-specific risks:**
  - **Prompt-injection-via-task/examples** — inputs are data we analyze, never instructions we follow.
  - **CSV-injection** — CSV cells starting with `=`/`+`/`-`/`@` are escaped/prefixed so the file is safe to open in spreadsheet apps; zip paths are safe (no `../`).
  - **Misuse of labels as ground truth** — mitigated by explicit `confidence`/`caveats`/README provenance (a quality-trust risk, not a security one).
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `gdg_rows` (count), `gdg_label_type`, `gdg_distribution` (bucket split), `gdg_zip_download`, `gdg_upsell_click`.
- **Activation:** purchase → first run that produces a valid dataset (≥20 rows, JSONL/CSV parse). **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), low-confidence-row rate (signals vague tasks — tune the UI prompt), upsell CTR into `prompt-eval-suite`.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`golden-dataset-generator`), Polar sandbox product, routes, empty `GoldenDatasetOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Spine + contract (no AI).** Reuse `elicitSpec`; the JSONL/CSV emitter; input/output schemas; pipeline returns a schema-valid dataset from a **fixture task** with the AI step mocked, and the emitted `golden.jsonl` parses line-by-line + `golden.csv` is well-formed (CSV-escaped). _AC: unit test: fixture task → valid `GoldenDatasetOutput`; JSONL round-trips; CSV parses with stable columns._
- **Phase 2 — Real run + UI.** Wire BYOK + `structuredStream` (streamed rows), all UI states, preview render + ZIP(Blob) + Resend email. _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6 — gate before live).** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics, upsell. **Every box must be checked:**
  - [ ] Sample dataset asset (anonymized real run) on the sales page + storefront card.
  - [ ] Artifact leads with the distribution headline (answer-first) and is organized by bucket.
  - [ ] Output is provably input-specific (`input_specific` judge — rows reference the actual task/inputs, §2.1).
  - [ ] Designed data-viz: distribution bar + per-label balance.
  - [ ] (No branded PDF — a dataset is a data file; the preview + files are the deliverable. `OPEN QUESTION:` optional 1-page dataset-card PDF.)
  - [ ] File outputs (`golden.jsonl`, `golden.csv`, `README.md`) have copy buttons + filenames + rationale; CSV is spreadsheet-safe.
  - [ ] Running state streams real phases + shows the work (rows filling the preview).
  - [ ] All 8 UI states designed.
  - [ ] "We never run your agent / store your key" + retention + expected cost visible; "labels are AI-generated — review" provenance shown.
  - [ ] AI-tells absent (`no_ai_tells` judge); labels honest (`confidence`/`caveats`); no fabricated domain facts (`factual` judge).
  - [ ] Senior copy throughout.
  - [ ] `impeccable` / `taste` pass on the artifact + sales page; `ui-ux-pro` + axe pass on the tool UI.
  - [ ] Mobile dataset/preview view first-class.
  - _AC: axe clean; events fire; Lighthouse ≥90; checklist fully green._
- **Phase 4 — Launch.** Live Polar product, monitoring, refund flow verified; first golden-set fixtures are tasks we already have labeled sets for in-store (segment README). _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)           | Test                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| #1 key invalid       | unit: pre-run ping mock rejects → error, quota intact                          |
| #2 vague task        | unit: thin task → smaller set + populated `caveats`                            |
| #3 no labelSpace     | unit: classification w/o labels → inferred label set surfaced + noted          |
| #5 imbalanced labels | unit: off-space/imbalanced gen → balance-retry; warn surfaced                  |
| #6 AI timeout        | integration: provider error → retry → quota restored on final fail             |
| #7 contract-invalid  | schema: malformed AI object / <20 rows → `parse` throws; runner restores quota |
| #9 duplicate         | integration: same `runId` returns cached, no double quota                      |
| #11 emit malformed   | unit: emitted JSONL parses per-line + CSV parses with stable columns           |

**The one test that matters most:** fixture task → pipeline (mocked AI) → **valid `GoldenDatasetOutput`** AND the emitted `golden.jsonl` parses line-by-line and `golden.csv` parses with the correct, stable columns for the `labelType`. A dataset that won't load is worthless.

Full method, fixtures, mocks, scenario matrix, sandbox-E2E, eval golden-set + judges, CI gates: [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific eval expectations: ~8–12 real tasks with expected `labelType`, label-space adherence (no off-space labels), bucket distribution within tolerance, and a `format_valid` judge that **parses the emitted JSONL + CSV**; judges `input_specific`, `no_ai_tells`, `factual`, `format_valid`. Provider axis: happy-path against `anthropic | openai | google` mock responses.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. Spine modules must pass `segment-0-spine` DoR.
- **New libs (minimal):** none — JSONL/CSV serialization (with CSV-injection escaping) is plain Node; reuses `elicitSpec` + `report.ts`. Vercel Blob for the zip (already available).
- **Cross-product reuse:** consumes the Segment-4 spine's `elicitSpec` + case generator (`prompt-eval-suite.md` §7); the `GoldenRow` shape is compatible with `prompt-eval-suite`'s harness input so a generated dataset feeds that product directly.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($19).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` row cap — is 100 right for v1, or offer a higher "power" size (cost trade-off)? Default 100.
- `OPEN QUESTION:` optional 1-page "dataset card" PDF (provenance, distribution, caveats) — worth shipping in v1 or defer? Lean defer.
- **Risk — labels treated as verified ground truth:** the core quality/trust risk — a buyer trusting a wrong AI label. Mitigation = per-row `confidence` + dataset `caveats` + explicit README/UI provenance ("AI-generated, review"); the `factual` judge catches fabricated domain content.
- **Risk — generic / non-task-specific rows:** mitigation = elicit grounding + buyer examples + the `input_specific` eval judge.
- **Risk — malformed JSONL/CSV that won't load:** mitigation = the `format_valid` judge parses both files as a launch blocker (§18).
- **Risk — buyer confusion that we score with the dataset:** mitigation = UI + README + FAQ + sales page state the boundary (§10 #10).
