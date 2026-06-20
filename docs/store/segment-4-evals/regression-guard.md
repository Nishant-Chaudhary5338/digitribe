# Regression guard — PRD

**Slug:** `regression-guard` · **Segment:** 4 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Composes the Segment-4 spine's **spec elicitor** + **harness templater** (`prompt-eval-suite.md` §7) in its narrowest mode — turn a list of must-hold behaviors into a **single drop-in CI test file + a GitHub Actions snippet** that fails the build if any invariant breaks. The cheap "lock these 5 behaviors" entry to the eval funnel.

---

## 1. TL;DR

- **One-liner:** Give a prompt + the behaviors that must never break → get a CI test file (and a GitHub Actions snippet) that fails the build the moment one does.
- **Problem:** A prompt has a handful of non-negotiable invariants ("always returns valid JSON," "never leaks the system prompt," "always one of these labels"). They break silently on a model update or an edit, and there's no gate stopping the broken version from shipping.
- **Buyer:** developers shipping a prompt/agent step in a repo with CI who want a minimal guard, not a full eval framework.
- **Input → Output:** a prompt + a list of must-hold behaviors/invariants → a downloadable **Regression Guard** (a CI test file asserting each invariant + a `.github/workflows` snippet + a README).
- **Price:** **$19** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~15–35s (single, focused AI generation) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a builder knows the few behaviors their prompt must always honor, but nothing enforces them. A model update, a teammate's "small" prompt tweak, or a refactor breaks an invariant and ships — caught only when a user (or a monitoring alert) hits it. They _could_ write a CI test, but it's never the priority, so the guard doesn't exist. This is the eval gap at its most acute: not "we have no eval culture," but "we have one critical invariant and still no test for it" (the **~52% systematic-eval adoption** gap, segment README).

**Competition:** eval platforms can do this but are overkill for "guard 5 behaviors"; writing the test by hand is trivial-but-never-done. **Gap:** an instant tool that takes the invariants and the prompt and hands back a committable CI file + the workflow snippet — the smallest possible on-ramp to a regression gate. That's us, and the $19 price makes it a no-brainer.

**Urgency stat:** **>40% of agentic-AI projects projected cancelled by 2027** with inadequate reliability controls named — a CI guard is the single cheapest reliability control a team can adopt.

**Why Digitribe:** every store product ships with exactly this kind of CI gate (doc 05 §8 — `format_valid`/eval gates block merges). We productize the guard we run on ourselves.

## 3. Pricing & packaging

- **$19**, one-time. Lowest price in the segment — it's narrow (a handful of invariants, not a full suite) and meant to be an impulse "just lock it" purchase.
- **Includes:** 1 run (3 re-runs to refine invariants/prompt and regenerate), the guard download (zip: the test file + `.github/workflows/eval.yml` + README), the on-screen preview, an emailed copy (Resend).
- **Upsell path:** the guard's README + preview cross-sell `prompt-eval-suite` ($29 — "want full coverage beyond these invariants? generate the whole suite") and `golden-dataset-generator` ($19 — "need data behind these checks?"). `grade-my-agent` ($29) is suggested for buyers unsure _which_ invariants matter. Agency CTA for "want us to own your CI eval gates?".
- **Future tiers (note only):** GitLab CI / CircleCI snippet variants are a v2 emitter; v1 ships GitHub Actions.

## 4. User stories / JTBD

- As a **developer**, when I know my prompt must always return valid JSON, I want a CI test that fails if it stops, so that a broken version can't merge.
- As a **team**, when a model update lands, I want our invariants checked automatically, so that the upgrade doesn't silently break us.
- As a **prompt engineer**, when a teammate edits the prompt, I want the must-hold behaviors gated, so that the edit can't ship a regression.
- As a **solo builder**, when I have one critical prompt, I want the smallest possible guard, so that I get a safety net without adopting an eval framework.

**Primary job the artifact must nail:** turn each stated invariant into a **precise, runnable assertion** in a single CI file that **drops into the buyer's repo and goes red the instant an invariant breaks** — wired with a GitHub Actions snippet so it runs on every push/PR.

**Non-goals (v1):** does NOT run/execute the buyer's prompt (it generates the guard; the buyer's CI runs it against a buyer-supplied `runAgent()` — segment README boundary); does NOT generate broad coverage (that's `prompt-eval-suite` — this is _only_ the stated invariants); does NOT support every CI system in v1 (GitHub Actions only); does NOT decide _which_ invariants matter (the buyer states them; `grade-my-agent` helps find them).

## 5. Functional requirements

### Inputs

| Field        | Type                  | Validation                                                                        | Example                                                                      |
| ------------ | --------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `prompt`     | string                | non-empty, ≤ 8000 chars (the prompt under guard)                                  | "You are a router. Output exactly one of: a, b, c."                          |
| `invariants` | array (1–10)          | each a `{ behavior: string (≤300), severity?: 'block'\|'warn' }` — must-hold rule | `[{ behavior: "Always returns one label from {a,b,c}", severity: "block" }]` |
| `emitTarget` | enum                  | `vitest` \| `node` (default `vitest`)                                             | `vitest`                                                                     |
| `samples`    | array (optional, ≤ 4) | `{ input }` representative inputs the guard should exercise (no labels needed)    | `[{ input: "ship it" }]`                                                     |
| `provider`   | enum                  | one of product's `byokProviders`                                                  | `anthropic`                                                                  |
| `byokKey`    | string (secret)       | non-empty; validated live pre-run (platform-spec §5)                              | `sk-…`                                                                       |

### Processing (requirements level; pipeline in §7)

Elicit a spec focused on the stated invariants (+ the prompt's format) → AI maps each invariant to a precise, runnable assertion over representative inputs, filling the Output Contract → templater renders a single CI test file + a GitHub Actions workflow + README → preview + zip + email. **No buyer-prompt execution** — assertions run later in the buyer's CI against a buyer-supplied `runAgent(input)`.

### Outputs

The **Regression Guard** (zip: the test file + `.github/workflows/eval.yml` + README) + on-screen preview. Exact shape in §6.

### Constraints

- 1–10 invariants (this product is deliberately narrow — past ~10 it's a suite, route the buyer to `prompt-eval-suite`).
- `prompt` ≤ 8000 chars; each invariant ≤ 300 chars; ≤ 4 representative samples.
- The generated test file is **deterministic-first** (substring/regex/JSON/enum checks) — an invariant needing semantic judgment becomes an opt-in `llm_judge` assertion, clearly flagged as costing on the buyer's key at run-time (segment README tiering).
- Small text artifact; rows JSON in KV, zip in Vercel Blob.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/regression-guard.ts
import { z } from 'zod'

// Reuses the segment's Assertion concept (prompt-eval-suite §6), narrowed to guard mode.
const GuardAssertion = z.object({
  tier: z.enum(['deterministic', 'llm_judge']),
  kind: z.enum([
    'equals',
    'contains',
    'not_contains', // e.g. "never leaks the system prompt"
    'regex',
    'json_valid',
    'json_schema',
    'one_of', // e.g. "always one of {a,b,c}"
    'length_range',
    'judge_rubric', // llm_judge only — semantic invariant
  ]),
  description: z.string().max(160),
  expected: z.string().optional(),
  oneOf: z.array(z.string()).max(20).optional(),
  schema: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  rubric: z.string().max(400).optional(),
})

const GuardedInvariant = z.object({
  id: z.string(), // stable slug, e.g. "always-valid-json"
  behavior: z.string().max(300), // echoes the buyer's stated invariant
  severity: z.enum(['block', 'warn']), // block = fails CI; warn = annotates only
  // the representative inputs this invariant is checked against (from buyer samples or generated):
  testInputs: z.array(z.string()).min(1).max(6),
  assertions: z.array(GuardAssertion).min(1).max(4),
  rationale: z.string().max(280), // how the assertion enforces the behavior
  coverageNote: z.string().max(200).optional(), // honest note if it can only partially be enforced
})

export const RegressionGuardOutput = z.object({
  prompt: z.object({
    summary: z.string().max(400), // model's understanding of the guarded prompt
    detectedFormat: z.enum(['freeform', 'json', 'enum', 'classification', 'extraction']),
  }),
  invariants: z.array(GuardedInvariant).min(1).max(10),
  summary: z.object({
    // deterministic counts surfaced in the preview (doc 03 §2.3)
    total: z.number().int(),
    blocking: z.number().int(),
    warning: z.number().int(),
    deterministicAssertions: z.number().int(),
    judgeAssertions: z.number().int(),
  }),
  files: z
    .array(
      z.object({
        path: z.string(), // e.g. "eval/regression.guard.test.ts", ".github/workflows/eval.yml", "eval/README.md"
        target: z.enum(['vitest', 'node', 'ci', 'docs']),
        language: z.enum(['typescript', 'javascript', 'yaml', 'markdown']),
        contents: z.string(), // committable as-is
        rationale: z.string().max(240),
      })
    )
    .min(3), // test file + workflow yml + README at minimum
  unguardable: z.array(z.string()).min(0).max(5), // honest list of invariants we couldn't fully encode
})
export type RegressionGuardOutput = z.infer<typeof RegressionGuardOutput>
```

- **Export formats:** on-screen preview (React) · **JSON** (the raw contract) · **ZIP** (`eval/regression.guard.test.ts` (or `.mjs`) + `.github/workflows/eval.yml` + `eval/README.md`, written to real paths, committable as-is). (No PDF — it's a code artifact; the preview + files are the deliverable.)
- **Field notes:** `severity: 'block'` invariants fail CI (non-zero exit); `severity: 'warn'` only annotate. `tier: 'deterministic'` assertions run free in the buyer's CI; `tier: 'llm_judge'` are opt-in and cost on the buyer's key (the workflow gates them behind a secret/flag and the README flags it). `unguardable` is the required honesty valve — if an invariant genuinely can't be encoded as a runnable check from a prompt alone, it's listed, not faked.
- **Determinism:** the file set (test file + workflow + README), the assertion `kind` enum, and the block/warn semantics are fixed; `behavior` echoes, `testInputs`, assertions, prose are generative but constrained and grounded.

## 7. System logic / pipeline

```
POST /api/store/run/regression-guard  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ ELICIT  elicitSpec({ prompt, invariants, samples })     emit{phase:"analyze",pct:25}
  │     - deterministic (shared spine, prompt-eval-suite §7),
  │       guard mode: infer the prompt's output format; for each
  │       invariant, pick the most precise runnable assertion KIND;
  │       generate/borrow representative testInputs from samples
  │     → GuardSpec (invariant → candidate assertion kind)
  │
  ├─ GENERATE  ai.structuredStream({                         emit{phase:"generate",pct:35..82,
  │     system: REGRESSION_GUARD_SYSTEM,     // §9         message:"Encoding invariant 3/5…",
  │     prompt: buildPrompt(guardSpec, emitTarget),        partial: invariants filling in,
  │     schema: RegressionGuardOutput,        // §6 SDK-enforced  findingCount: invariants encoded}
  │     effort: "high",
  │   })  → invariants + assertions            // streamObject: invariants fill progressively
  │
  ├─ EMIT  templater.renderGuard(output, emitTarget)         emit{phase:"render",pct:88}
  │     - one CI test file: describe/it per invariant, block→assert
  │       (throws/fails), warn→soft-annotate; judge assertions behind
  │       `process.env.EVAL_JUDGE`; the runAgent(input) SEAM stub
  │     - .github/workflows/eval.yml: install → `pnpm test eval/…` on
  │       push/PR; (optional) EVAL_JUDGE secret gate for judge tier
  │     - eval/README.md: "fill runAgent(), commit, push — CI now guards these"
  │     - merge files[] into the contract for the preview
  │
  ├─ RENDER  report.build(output)                            emit{phase:"persist",pct:95}
  │     - on-screen preview, JSON, zip(test + workflow + README) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — mapping a fuzzy invariant to a _precise, correct_ runnable assertion is the product. Elicit + emit are deterministic — no extra AI cost.
- **Libraries:** none new — reuses the spine's `elicitSpec` + harness `templater` (the same one `prompt-eval-suite` uses, in guard mode) + `report.ts`. The workflow YAML is templated.
- **Reuse:** consumes the Segment-4 spine's `elicitSpec` + `templater` (`prompt-eval-suite.md` §7). The `GuardAssertion` shape is the same `Assertion` concept as the flagship's — a buyer who later buys `prompt-eval-suite` gets a superset using the same harness conventions, so the two artifacts coexist in one `eval/` folder.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at translating a stated behavior into the most precise runnable check), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (fine for simple invariants). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one run is a single focused generation over ≤10 invariants (~1–2K input tokens) → typically **a few cents on the buyer's key**, the cheapest run in the segment. **State clearly: this run pays only to _generate_ the guard — running it in your CI is free for deterministic checks; only opt-in judge assertions cost on your key.** (Segment README boundary, doc 03 §5.)
- **Pre-run validation:** a 1-token ping via the AI wrapper; on failure return error #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject`/`streamObject` against `RegressionGuardOutput`.

**System prompt (draft):**

```
You are a senior test engineer. You are given a buyer's PROMPT and a list of
INVARIANTS (behaviors that must always hold). For each invariant, produce the
MOST PRECISE runnable assertion that fails when the invariant breaks. The buyer
will run these in their own CI against their own model — you are NOT running it.

Hard rules:
- These assertions check a SUPPLIED output (the buyer's runAgent(input) result).
  Never write an assertion that assumes you produced the output.
- Prefer DETERMINISTIC assertions (one_of, json_valid, json_schema, contains,
  not_contains, regex, equals, length_range) — they run free in CI. Only use an
  llm_judge assertion when the invariant is irreducibly semantic; write a tight
  rubric and mark tier:"llm_judge".
- Map common invariants precisely:
  · "always returns one of X" → one_of over X
  · "always valid JSON" → json_valid (+ json_schema if a shape is implied)
  · "never leaks/refuses/says X" → not_contains
  · "matches pattern" → regex
  Pick testInputs that would actually trigger a violation if the behavior broke
  (use the buyer's samples; generate a few representative ones if none given).
- severity: "block" invariants must fail CI; "warn" only annotate. Default to
  block unless the buyer marked it warn.
- If an invariant CANNOT be reliably encoded as a runnable check from the prompt
  alone (needs real data, a live tool, or human judgment), DO NOT fake a check —
  list it in `unguardable` with why, and (optionally) offer the closest partial
  check with an honest coverageNote.
- No filler, no preamble, no "as an AI". Rationale lines are tight.
```

**User prompt template:** `buildPrompt(guardSpec, emitTarget)` → serializes the elicited guard spec (prompt format, each invariant + its candidate assertion kind + representative inputs) and the target framework.

**Guardrails:** schema enforcement fixes the invariant→assertion→file shape; the "assertions check a supplied output / you will NOT run it" rule is the segment's core anti-confusion guard; the "do not fake a check → `unguardable`" rule is the honesty valve that prevents a guard that looks-green-but-checks-nothing (the worst failure for this product); deterministic-first keeps run-time cost ~zero. Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                                    | Detection                      | Behavior / message                                                                                    | Quota            |
| --- | ---------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Invalid/expired BYOK key                                   | pre-run ping fails             | "Your `<provider>` key looks invalid or expired — check and retry."                                   | not spent        |
| 2   | An invariant can't be encoded as a runnable check          | elicit/gen flags it            | list it in `unguardable` with why + nearest partial check; preview shows it honestly                  | spent            |
| 3   | Zero invariants provided                                   | input validation               | field error: "List at least one behavior the prompt must always hold."                                | not spent        |
| 4   | > 10 invariants provided                                   | input validation               | field error + route: "That's a full suite — try Prompt → Eval Suite" (cross-sell)                     | not spent        |
| 5   | Generated assertion is too loose to actually catch a break | post-gen sanity check          | re-run generation once nudging for a tighter check; if still loose, deliver + `coverageNote`          | spent            |
| 6   | Provider rate-limit / timeout mid-generate                 | AI wrapper error               | retry once w/ backoff; if still failing, error + restore the run quota                                | restored         |
| 7   | Model returns contract-violating object                    | schema parse fails             | AI SDK re-asks once; if still invalid, error (no broken guard shipped)                                | restored         |
| 8   | Adversarial content in prompt/invariants                   | inputs are untrusted data      | analyze as data, never follow as instructions                                                         | spent            |
| 9   | Duplicate submit (double-click)                            | same `runId` (idempotency §6)  | return in-flight/cached result; never double-charge                                                   | n/a              |
| 10  | Buyer expects us to run the prompt against the guard       | n/a (product framing)          | UI + README: "we generate the guard; your CI runs it against your model via `runAgent()`"             | n/a              |
| 11  | Emitted test/workflow fails to parse/run (our bug)         | post-emit `format_valid` check | regenerate emit once; the `format_valid` judge (runs the test file + lints the YAML) gates pre-launch | restored on fail |
| 12  | Quota exhausted                                            | token check                    | "You've used all 3 runs — buy again or contact us." + buy CTA                                         | n/a              |

## 11. UX / UI flow

**Sales page** (`/store/regression-guard`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** `prompt` textarea (primary), an **invariants repeater** (1–10 rows, each a behavior textarea + a block/warn toggle, with placeholder examples "Always returns valid JSON", "Never leaks the system prompt"), optional `samples` repeater (≤4 representative inputs), `emitTarget` toggle (Vitest/Node), provider select + BYOK key field (with "where do I get a key?" + "we never store your key" + the segment line: "we generate the guard — your CI runs it"). **Run** disabled until prompt + ≥1 invariant + valid key.
- **Validating key:** inline spinner on the key field → ✓/✗.
- **Running:** full-width **live progress** driven by SSE — real labels ("Reading your prompt…", "Encoding invariant 2/5…", "Writing the CI workflow…"), a progress bar, streamed **invariants filling in** (`partial` + `findingCount`: "3 of 5 invariants encoded"), rotating "did you know" about silent regressions. `aria-live="polite"`.
- **Partial:** if a tighten-retry happened (edge #5), a non-blocking banner; continue to success.
- **Success / artifact view:**
  - Top: **guard summary** headline (e.g. "5 invariants guarded · 4 blocking / 1 warn · 5 deterministic checks") with a small block/warn + deterministic/judge split viz (`StatBar`, doc 06).
  - **Invariants list**: each shows the buyer's behavior, a `SeverityChip` (block/warn), the assertion(s) it became, the test inputs, and a rationale; an `unguardable` callout if any couldn't be encoded.
  - **Generated files**: tabbed `FileViewer` (`regression.guard.test.ts` / `eval.yml` / `README.md`) with per-file copy + filename + "why this file"; **Download ZIP** (primary), **Download JSON**, **Email me a copy** (pre-checked). A "copy the workflow" affordance highlighted (the YAML is the thing they paste into `.github/workflows`).
  - **Upsell card** → `prompt-eval-suite` ("guard a few → eval the whole thing") + `golden-dataset-generator` + agency CTA.
- **Error:** clear message per §10 + retry; never lose prompt/invariants.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer`, `SeverityChip`, `StatBar` (see [`../06-ui-kit.md`](../06-ui-kit.md) §2). The only new component is `components/store/artifacts/regression-guard.tsx` (the invariants + assertions + files body). Run states follow `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md`. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword:** "prompt regression test CI" / "LLM CI guardrail" / "github actions for prompt testing" (tool + informational intent).
- **`generateMetadata`:** title `Regression Guard — Lock Your Prompt's Behaviors Into CI` (≤60); description: "List the behaviors your prompt must never break and get a CI test file + GitHub Actions workflow that fails the build if one does. Instant, BYOK, $19." (≤155). Canonical `/store/regression-guard`. OG via `@vercel/og` (guard-summary visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real): "What CI does it support?" (GitHub Actions in v1; the test file runs on Vitest or zero-dep Node so any CI works), "Do you run my prompt?" (no — your CI runs the guard against your model via a `runAgent()` you fill), "Does it cost API calls in CI?" (no for deterministic checks; only opt-in judge assertions cost on your key), "How many behaviors?" (1–10; more → use Prompt → Eval Suite), "Do you store my API key?" (no).
- **Internal links:** silent-regression / CI-for-prompts blog posts → here; sibling `prompt-eval-suite` (the superset), `golden-dataset-generator`, `grade-my-agent`.
- **Programmatic surface (note):** anonymized example guards as indexable pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; the invariants repeater rows + block/warn toggles individually labeled; provider/key in a `<fieldset>`; progress region `aria-live="polite"` + `role="status"`; focus moves to the guard heading on success; severity chips never color-only (word + icon); `FileViewer` tabs a real `tablist`; copy buttons announce "copied" (the YAML copy especially).
- Mobile: single-column; invariants list stacks; file viewer tabs become an accordion; download buttons full-width.
- Error recovery: errors inline + non-destructive (prompt/invariants preserved); "retry" without re-entering the key (session memory only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route.

## 14. Payment integration

- Create Polar product **"Regression guard" $19** (sandbox + live). Checkout metadata `{ slug: "regression-guard" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund if no valid guard produced (rare). Quota auto-restores on system-side failures (§10 #6/#7/#11).

## 15. Security & privacy

- **Buyer data:** the prompt + invariant list + optional sample inputs. Treat as confidential (the prompt is the buyer's IP). Retention: transient for the run; guard stored 30d (KV/Blob TTL) for re-download; then purged. Never logged at info level; never stored longer than the run needs (platform-spec §10.7).
- **Boundary:** we **never run the buyer's prompt** and never receive its SUT keys — only the BYOK key paying to _generate_ the guard. State on the page (doc 03 §5).
- **Product-specific risks:**
  - **Prompt-injection-via-input** — prompt/invariants are data we analyze, never instructions we follow.
  - **Generated-code safety** — emitted test file is templated code over the buyer's invariants; never `eval`s buyer strings; the `runAgent()` seam is a stub the buyer fills (we never call it); the workflow YAML pins action versions and requests least-privilege (`permissions: contents: read`); zip paths safe (no `../`).
  - **Secrets in the workflow** — the judge-tier secret (`EVAL_JUDGE` key) is referenced via `${{ secrets.* }}`, never inlined; README tells the buyer to add it as a repo secret.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `rg_invariants` (count), `rg_severity_split` (block/warn), `rg_unguardable` (count we couldn't encode), `rg_zip_download`, `rg_upsell_click`.
- **Activation:** purchase → first run that produces a valid guard (≥1 invariant encoded, test file + workflow parse). **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), `unguardable` rate (signals invariants too fuzzy — route those to `grade-my-agent`/`prompt-eval-suite`), upsell CTR into the flagship.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`regression-guard`), Polar sandbox product, routes, empty `RegressionGuardOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Spine + contract (no AI).** Reuse `elicitSpec` + `templater` (guard mode + YAML emitter); input/output schemas; pipeline returns a schema-valid guard from a **fixture prompt + invariants** with the AI step mocked, and the emitted test file **parses + runs** (passes/fails deterministically against a stub `runAgent`) and the workflow YAML lints. _AC: unit test: fixture → valid `RegressionGuardOutput`; emitted test runs; `eval.yml` is valid YAML._
- **Phase 2 — Real run + UI.** Wire BYOK + `structuredStream`, all UI states, preview render + ZIP(Blob) + Resend email. _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6 — gate before live).** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics, upsell. **Every box must be checked:**
  - [ ] Sample guard asset (anonymized real run) on the sales page + storefront card.
  - [ ] Artifact leads with the guard-summary headline (answer-first) and invariants are ordered block-first.
  - [ ] Output is provably input-specific (`input_specific` judge — assertions reference the actual prompt/invariants, §2.1).
  - [ ] Designed data-viz: block/warn + deterministic/judge split.
  - [ ] (No branded PDF — it's a code artifact; the preview + files are the deliverable.)
  - [ ] Code outputs (`*.test.ts`, `eval.yml`, `README.md`) have copy buttons + filenames + rationale; YAML copy highlighted.
  - [ ] Running state streams real phases + shows the work (invariants encoding live).
  - [ ] All 8 UI states designed.
  - [ ] "We never run your prompt / store your key" + "running the guard is free for deterministic checks" + retention + expected cost visible.
  - [ ] AI-tells absent (`no_ai_tells` judge); honest `unguardable` (no faked checks).
  - [ ] Senior copy throughout.
  - [ ] `impeccable` / `taste` pass on the artifact + sales page; `ui-ux-pro` + axe pass on the tool UI.
  - [ ] Mobile guard view first-class.
  - _AC: axe clean; events fire; Lighthouse ≥90; checklist fully green._
- **Phase 4 — Launch.** Live Polar product, monitoring, refund flow verified; first golden-set fixtures guard our own store prompts' invariants (segment README). _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)          | Test                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| #1 key invalid      | unit: pre-run ping mock rejects → error, quota intact                |
| #2 unguardable      | unit: a semantic-only invariant → listed in `unguardable`, not faked |
| #3 zero invariants  | unit: empty list → field error, quota intact                         |
| #4 >10 invariants   | unit: 11 invariants → field error + cross-sell route                 |
| #5 loose assertion  | unit: too-loose gen → tighten-retry; `coverageNote` surfaced         |
| #6 AI timeout       | integration: provider error → retry → quota restored on final fail   |
| #7 contract-invalid | schema: malformed AI object → `parse` throws; runner restores quota  |
| #9 duplicate        | integration: same `runId` returns cached, no double quota            |
| #11 emit invalid    | unit: emitted test file parses + runs; `eval.yml` is valid YAML      |

**The one test that matters most:** fixture prompt + invariants → pipeline (mocked AI) → **valid `RegressionGuardOutput`** AND the emitted test file **parses and runs** (against a stub `runAgent`, a violating output makes the block assertion fail and CI go red; a conforming output passes) AND `eval.yml` is valid, lints, and references the test. A guard that's green no matter what is the product's worst-case failure — this test forbids it.

Full method, fixtures, mocks, scenario matrix, sandbox-E2E, eval golden-set + judges, CI gates: [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific eval expectations: ~8–12 real prompt+invariant sets (incl. our own store prompts) where each block invariant's assertion **actually fails on a crafted violating output and passes on a conforming one** (the guard-efficacy check), the workflow YAML lints, and `unguardable` correctly catches non-encodable invariants; judges `input_specific`, `no_ai_tells`, `factual`, `format_valid`. Provider axis: happy-path against `anthropic | openai | google` mock responses.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. Spine modules must pass `segment-0-spine` DoR.
- **New libs (minimal):** none — reuses `elicitSpec` + the harness `templater` (shared with `prompt-eval-suite`) + a YAML-workflow template + `report.ts`. Emitted files import nothing of ours. Vercel Blob for the zip (already available).
- **Cross-product reuse:** consumes the Segment-4 spine's `elicitSpec` + `templater` (`prompt-eval-suite.md` §7); `GuardAssertion` is the same `Assertion` concept as the flagship's, so a buyer's `regression-guard` and a later `prompt-eval-suite` purchase share one `eval/` folder and harness conventions.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($19).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` v1 CI target — GitHub Actions confirmed; GitLab/CircleCI snippets as a v2 emitter over the same contract?
- `OPEN QUESTION:` how the workflow handles the `runAgent()` seam in CI — do we require the buyer to commit a `runAgent.ts` (fail-loud if missing), or ship a stub that skips with a clear "fill me in" message? Lean: ship a stub that fails loudly with instructions, so an unfilled guard is visibly incomplete rather than silently green.
- **Risk — a guard that's green no matter what (the core failure):** a loose or no-op assertion gives false safety. Mitigation = the guard-efficacy eval check (a crafted violating output MUST make the block assertion fail) as a launch blocker (§18) + the tighten-retry (§10 #5) + honest `unguardable`/`coverageNote`.
- **Risk — buyer confusion that we run their prompt:** mitigation = UI + README + FAQ + sales page state the boundary and show the `runAgent()` seam (§10 #10).
- **Risk — invariant can't be encoded → buyer feels short-changed:** mitigation = honest `unguardable` with the nearest partial check + cross-sell to `grade-my-agent`/`prompt-eval-suite` for what a guard can't cover.
- **Risk — workflow secret/permission misconfig:** mitigation = least-privilege `permissions`, pinned action versions, secrets via `${{ secrets.* }}` only, README guidance (§15).
