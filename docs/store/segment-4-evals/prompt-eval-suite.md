# Prompt → Eval Suite — PRD

**Slug:** `prompt-eval-suite` · **Segment:** 4 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> This is the **reference PRD** and the **reference implementation** of Segment 4's elicit→generate→assert→emit spine. Build it first. The other eval products compose its pieces (the spec elicitor, the case/assertion generator, the harness templater).

---

## 1. TL;DR

- **One-liner:** Paste a prompt → get a runnable eval suite + a CI-droppable scoring harness, so the prompt never silently regresses again.
- **Problem:** Builders ship prompts with zero tests. The first sign a prompt broke (model update, a "small" wording tweak, a new edge case) is a user complaint or a monitoring alert _after_ the fact. Writing the eval suite by hand is a project nobody starts.
- **Buyer:** developers / prompt engineers / small AI teams shipping a prompt or agent step into production who know they should eval but haven't.
- **Input → Output:** one prompt (+ optional intended-behavior description) → a downloadable **Eval Suite Bundle** (generated test cases with tiered assertions + a runnable scoring harness for Vitest and/or a zero-dep Node runner + a README) + an on-screen suite report.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~25–45s (single AI generation) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a builder with a production prompt who wants it tested must: enumerate the inputs it should handle, hand-write expected outputs or assertions, pick and adopt an eval framework, wire an LLM-judge for the fuzzy properties, and stand it up in CI. It's a multi-day project with no immediate payoff, so it doesn't happen — which is why **~89% of teams have observability but only ~52% run systematic evals** (the eval-gap stat, see segment README). The result is prompts that **silently regress** on every model update and every "harmless" edit, caught only after a user hits the failure.

**Competition:** eval _platforms_ (Promptfoo, Braintrust, LangSmith, Arize) are powerful but are a tool to _adopt_ — they assume you'll write the cases, label the data, host the dashboard, and integrate the SDK. There's no instant, self-serve tool that **hands you the generated suite + a harness you commit today**, framework-light, on your own key. That's the gap, and it's exactly the store's shape.

**Urgency stat:** **>40% of agentic-AI projects are projected cancelled by 2027**, with inadequate reliability controls a named driver — a tested prompt is cheap insurance against being in that 40%.

**Why Digitribe:** we run this exact discipline on our own store (doc 05 §7 — every product is gated on `input_specific`/`no_ai_tells`/`factual`/`format_valid` judges before launch). We're selling builders the eval practice we already operate on ourselves, in the same committable, threshold-gated format.

## 3. Pricing & packaging

- **$29**, one-time. Anchored well below a day of an engineer's time to hand-build an eval suite; impulse-range for a team that just watched a prompt regress.
- **Includes:** 1 run (3 re-runs in quota to refine the intended-behavior description and regenerate), the full suite download (zip: test files + harness + README + cases as JSON), the on-screen suite report, an emailed copy (Resend).
- **Upsell path:** the suite README cross-sells `golden-dataset-generator` ($19 — "need more cases? generate a labeled golden set the same harness consumes") and `regression-guard` ($19 — "lock the must-hold cases into a minimal CI gate"). The report's "we couldn't infer X dimension from the prompt alone" finding → `grade-my-agent` ($29, the full diagnostic). Agency CTA: "want us to build and own your eval pipeline?" → Digitribe services.
- **Future tiers (note only):** a "monitor my prompt" re-run subscription that regenerates the suite on each model release is a v2 idea; v1 is one SKU.

## 4. User stories / JTBD

- As a **developer** shipping a classification/extraction prompt, when a model update is coming, I want a test suite that fails if behavior drifts, so that I catch the regression in CI, not from a user.
- As a **prompt engineer**, when I tweak wording, I want to run the same suite before/after, so that I prove the edit didn't break the cases that matter.
- As a **founder/solo builder**, when I have one critical prompt and no test culture, I want the suite generated for me, so that I get coverage without building an eval framework first.
- As a **team lead**, when onboarding an agent step, I want a committable eval file + a CI snippet, so that quality is enforced by the pipeline, not by vigilance.

**Primary job the artifact must nail:** generate **test cases that are specific to _this_ prompt** (its real task, its real input space, its real failure modes) with assertions the buyer can run **without us running their model**, wired into a harness that drops into their repo and runs green-or-red on the first try.

**Non-goals (v1):** does NOT execute the buyer's prompt/agent for them (we generate the suite; they run it — segment README boundary); does NOT host a dashboard or store results; does NOT fine-tune or rewrite their prompt (that's a different product); does NOT guarantee the prompt is _good_, only that it's _tested_ and won't silently regress.

## 5. Functional requirements

### Inputs

| Field              | Type                            | Validation                                                                            | Example                                                      |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `prompt`           | string                          | non-empty, ≤ 8000 chars (system/user prompt or template)                              | "You are a support classifier. Output one of: billing, bug…" |
| `intendedBehavior` | string (optional, ≤ 1000 chars) | free text: what "correct" means, constraints, what must never happen                  | "Must always return one label; never explain; never refuse." |
| `outputFormat`     | enum (optional)                 | `freeform` \| `json` \| `enum` \| `classification` \| `extraction` (default inferred) | `enum`                                                       |
| `examples`         | array (optional, ≤ 6)           | `{ input: string, output: string }` pairs the buyer pastes as anchors                 | `[{ input: "card declined", output: "billing" }]`            |
| `emitTargets`      | array enum                      | subset of `vitest` \| `node` (≥1; default both)                                       | `["vitest"]`                                                 |
| `provider`         | enum                            | one of product's `byokProviders`                                                      | `anthropic`                                                  |
| `byokKey`          | string (secret)                 | non-empty; validated live pre-run (platform-spec §5)                                  | `sk-…`                                                       |

### Processing (requirements level; pipeline in §7)

Elicit a structured `EvalSpec` from the inputs (intended behavior, input space, output contract, risk surface) → AI generates test cases across that space with tiered assertions filling the Output Contract → templater renders the cases into the chosen harness target(s) → render report + zip + email. **No buyer-model execution at any point** — assertions are designed to run later in the buyer's CI against a buyer-supplied `runAgent(input)` adapter.

### Outputs

The **Eval Suite Bundle** (zip) + on-screen **Suite Report**. Exact shape in §6.

### Constraints

- Max **24 generated cases** per suite (cost + signal density — a focused suite beats a bloated one); max 6 buyer examples as anchors.
- Prompt input capped at 8000 chars; `intendedBehavior` at 1000. Oversize → field error before any run.
- Generated harness has **zero runtime deps for the Node target** and only `vitest` (already a dev dep for most JS buyers) for the Vitest target; LLM-judge assertions are opt-in and clearly cost-bearing on the buyer's key.
- Total artifact is small text/code (a few hundred KB); cases JSON in KV, zip in Vercel Blob.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/prompt-eval-suite.ts
import { z } from 'zod'

// One assertion the buyer's harness can run against an SUT output WITHOUT us running their model.
const Assertion = z.object({
  tier: z.enum(['deterministic', 'llm_judge']),
  // deterministic kinds run free in CI; llm_judge needs the buyer's key (opt-in, run-time cost).
  kind: z.enum([
    'equals', // exact string match
    'contains', // substring present
    'not_contains', // substring absent (e.g. must never leak)
    'regex', // matches pattern
    'json_valid', // output parses as JSON
    'json_schema', // output matches a JSON shape (schema in `schema`)
    'one_of', // output ∈ a fixed set (classification/enum prompts)
    'length_range', // char/length bounds
    'numeric_range', // parsed number within [min,max]
    'judge_rubric', // LLM-as-judge against `rubric` (tier must be 'llm_judge')
  ]),
  description: z.string().max(160), // human label shown in the report row
  // exactly the fields the chosen kind needs — others omitted:
  expected: z.string().optional(), // equals/contains/not_contains/regex pattern
  oneOf: z.array(z.string()).max(20).optional(),
  schema: z.string().optional(), // a JSON-schema string for json_schema
  min: z.number().optional(),
  max: z.number().optional(),
  rubric: z.string().max(400).optional(), // judge instruction (llm_judge only)
  weight: z.number().min(0).max(1).default(1), // contribution to the case score
})

const EvalCase = z.object({
  id: z.string(), // stable slug, e.g. "edge-empty-input"
  bucket: z.enum([
    'happy_path', // normal expected inputs
    'edge', // boundary/unusual but valid inputs
    'adversarial', // injection / jailbreak / hostile inputs
    'failure_handling', // inputs the prompt should refuse/guard/degrade on
    'format', // must-hold output-shape cases
  ]),
  title: z.string().max(120),
  input: z.string(), // the test input fed to the buyer's SUT (their runAgent)
  rationale: z.string().max(280), // why this case exists / what it guards
  assertions: z.array(Assertion).min(1).max(6),
})

export const PromptEvalSuiteOutput = z.object({
  spec: z.object({
    taskSummary: z.string().max(600), // the model's understanding of the prompt's job
    detectedFormat: z.enum(['freeform', 'json', 'enum', 'classification', 'extraction']),
    inputSpace: z.array(z.string()).max(12), // the kinds of inputs this prompt must handle
    invariants: z.array(z.string()).max(10), // properties that must always hold
    riskNotes: z.array(z.string()).max(8), // edge/adversarial/failure surfaces found
  }),
  coverage: z.object({
    // deterministic counts the report visualizes (doc 03 §2.3)
    happy_path: z.number().int(),
    edge: z.number().int(),
    adversarial: z.number().int(),
    failure_handling: z.number().int(),
    format: z.number().int(),
    deterministicAssertions: z.number().int(), // run free in CI
    judgeAssertions: z.number().int(), // need buyer key (opt-in)
  }),
  cases: z.array(EvalCase).min(8).max(24),
  scoring: z.object({
    // the harness's deterministic scoring formula, surfaced so it's not a black box
    method: z.literal('weighted_assertion_pass_rate'),
    passThreshold: z.number().min(0).max(1).default(0.8), // suite passes if score ≥ this
    note: z.string().max(280),
  }),
  emitted: z
    .array(
      z.object({
        path: z.string(), // e.g. "eval/prompt.eval.test.ts", "eval/run.mjs", "eval/cases.json"
        target: z.enum(['vitest', 'node', 'data', 'docs']),
        language: z.enum(['typescript', 'javascript', 'json', 'markdown']),
        contents: z.string(), // the actual committable file body
        rationale: z.string().max(240),
      })
    )
    .min(3), // at least: one harness file + cases.json + README
  topGaps: z.array(z.string()).min(0).max(5), // honest "what this suite can't cover from a prompt alone"
})
export type PromptEvalSuiteOutput = z.infer<typeof PromptEvalSuiteOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded coverage summary, platform-spec §8) · **JSON** (the raw contract) · **ZIP** (the `emitted[]` files written to their real paths — `eval/…` — runnable as-is).
- **Field notes:** `tier: 'deterministic'` assertions run with no inference (free in the buyer's CI); `tier: 'llm_judge'` assertions are opt-in and cost on the buyer's key at run-time — the harness gates them behind an env flag and the report labels them. `bucket` is a fixed 5-set so the coverage viz and report layout are deterministic. `scoring.method` is a literal — the formula is fixed, not model-chosen.
- **Determinism:** the suite _structure_ (buckets, scoring formula, the emitted file set) is template-driven and stable; `cases[].input`, `assertions`, `rationale`, prose are generative but constrained to the schema and grounded in the elicited spec.

## 7. System logic / pipeline (the Segment-4 reference spine)

```
POST /api/store/run/prompt-eval-suite  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ ELICIT  elicitSpec(input)                               emit{phase:"analyze",pct:20}
  │     - deterministic, no AI: parse the prompt; infer
  │       output format (json/enum/classification/extraction)
  │       from structure + the optional outputFormat hint
  │     - bucket the input space + invariants from intendedBehavior
  │     - fold buyer `examples[]` in as grounded few-shot anchors
  │     → EvalSpec { taskSummary, inputSpace, invariants, riskNotes }
  │
  ├─ GENERATE  ai.structuredStream({                         emit{phase:"generate",pct:30..82,
  │     system: EVAL_SUITE_SYSTEM,           // §9         message:"Generating adversarial cases…",
  │     prompt: buildPrompt(spec, examples, emitTargets),  partial: streamed cases,
  │     schema: PromptEvalSuiteOutput,        // §6 SDK-enforced  findingCount: cases so far}
  │     effort: "high",
  │   })  → cases + assertions + spec        // streamObject so cases fill in progressively
  │
  ├─ EMIT  templater.render(output, emitTargets)            emit{phase:"render",pct:88}
  │     - turn cases+assertions (data) into harness FILES:
  │       · vitest → eval/prompt.eval.test.ts (describe/it per case,
  │         deterministic assertions inline, judge assertions behind
  │         `process.env.EVAL_JUDGE` + a generated judge rubric)
  │       · node  → eval/run.mjs (zero-dep runner over cases.json)
  │       · always → eval/cases.json (framework-neutral data)
  │       · always → eval/README.md ("fill runAgent(), then `pnpm test`")
  │     - inject the runAgent(input) SEAM stub the buyer fills (§ segment README)
  │     - merge emitted[] back into the contract for the artifact view
  │
  ├─ RENDER  report.build(output)                            emit{phase:"persist",pct:95}
  │     - on-screen report, PDF, zip(emitted[] at real paths) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — case/assertion quality _is_ the product. Elicit and emit are deterministic Node — no AI cost to the buyer beyond the single generation.
- **Libraries:** no new heavy deps. The harness templater is plain string-templating in `server/store/tools/evals/templater.ts`; emitted Vitest/Node files import nothing of ours. JSON-schema assertions validate at run-time in the buyer's repo via a tiny inlined check (no dep) or `zod` if the buyer already has it (README notes both).
- **Reuse:** `elicitSpec` and the case/assertion `templater` ARE the shared Segment-4 spine and are **reused by `regression-guard` (narrow invariant→guard mode), `golden-dataset-generator` (cases→labeled rows, no harness), and `grade-my-agent` (spec→scorecard, no emit)**. Build them generic in `server/store/tools/evals/`.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at reasoning about a prompt's true input space and writing precise assertions), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (faster, fine for small/simple prompts). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one run is a single structured generation over a compact spec (~few K input tokens, capped `maxOutputTokens`) → typically **well under $0.10 on the buyer's key**. **State clearly: this run pays only to _generate_ the suite — running the generated suite later in your CI is free for deterministic assertions, and costs on your key only if you opt into the LLM-judge assertions.** (Segment README boundary, made visible per doc 03 §5.)
- **Pre-run validation:** a 1-token ping via the AI wrapper; on failure return error #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject`/`streamObject` against `PromptEvalSuiteOutput` — the model cannot return free-form prose or "everything."

**System prompt (draft):**

```
You are a senior AI-evaluation engineer. You are given a structured spec elicited
from a buyer's PROMPT (the system-under-test, "SUT"): its task, inferred output
format, input space, invariants, and risk surface, plus any examples the buyer
pasted. Produce a focused, SUT-SPECIFIC eval suite.

Hard rules:
- You are generating TEST CASES and ASSERTIONS the buyer will run themselves
  against their own model. You will NOT run their model. Never write an assertion
  that assumes you produced the SUT's output. Assertions check a given output the
  buyer's harness will supply.
- Every case must be specific to THIS prompt's actual task and input space — use
  the elicited facts and the buyer's examples. No generic "test that it works"
  cases, no invented domain facts not in the spec.
- Prefer DETERMINISTIC assertions (equals/contains/not_contains/regex/one_of/
  json_valid/json_schema/length_range/numeric_range) — they run free in CI. Use an
  llm_judge assertion ONLY when a property is genuinely semantic (faithfulness,
  tone, "refused appropriately"); write a tight rubric and mark tier:"llm_judge".
- Cover all five buckets: happy_path, edge, adversarial (injection/jailbreak),
  failure_handling (should refuse/guard/degrade), format (output-shape invariants).
  Bias toward the buckets the spec's risk surface emphasizes.
- For an enum/classification prompt, the primary assertion is `one_of` over the
  real label set; for json/extraction, `json_valid` + `json_schema`.
- Be honest in `topGaps`: if a property can't be tested from the prompt alone
  (it needs real data, a live tool, or human judgment), say so — do NOT fabricate
  a test that pretends to cover it.
- No filler, no preamble, no "as an AI". Rationale lines are tight and concrete.
```

**User prompt template:** `buildPrompt(spec, examples, emitTargets)` → serializes the elicited `EvalSpec` (task summary, detected format, input space, invariants, risk notes), the buyer's `examples[]`, and which harness targets to optimize the cases for.

**Guardrails:** schema enforcement prevents shape drift; the "you will NOT run their model / assertions check a supplied output" rule is the core anti-confusion guard for this segment (keeps the model from generating cases that assume execution); the "use only elicited facts" rule curbs invented domain content; `topGaps` is a required honesty valve so the model declares what it can't cover instead of faking coverage. Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                               | Detection                           | Behavior / message                                                                                                                                   | Quota            |
| --- | ----------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Invalid/expired BYOK key                              | pre-run ping fails                  | "Your `<provider>` key looks invalid or expired — check and retry."                                                                                  | not spent        |
| 2   | Prompt empty / under-specified (one line, no task)    | elicit yields thin spec             | proceed, but generate a smaller suite + populate `topGaps` ("add an intended-behavior description for deeper coverage"); report flags it             | spent            |
| 3   | Prompt oversize (> 8000 chars)                        | input validation                    | field error: "Trim the prompt to its core (≤8000 chars) or split it."                                                                                | not spent        |
| 4   | Buyer pastes a whole codebase / non-prompt text       | elicit can't find a task            | honest message: "This doesn't look like a prompt — paste the system/user prompt you want tested."                                                    | not spent        |
| 5   | Model generates a judge-only suite (no deterministic) | post-gen coverage check             | re-run generation once nudging toward deterministic; if still judge-heavy, deliver + warn "this suite leans on LLM-judge (costs on your key to run)" | spent            |
| 6   | Provider rate-limit / timeout mid-generate            | AI wrapper error                    | retry once w/ backoff; if still failing, error + DO restore the run quota                                                                            | restored         |
| 7   | Model returns < 8 cases / contract-violating object   | schema parse fails                  | AI SDK re-asks once; if still invalid, error (no partial garbage shipped)                                                                            | restored         |
| 8   | Adversarial/injection input in the buyer's prompt     | treated as untrusted data           | the prompt is data to analyze, never instructions to follow (we analyze it, we don't obey it)                                                        | spent            |
| 9   | Duplicate submit (double-click)                       | same `runId` (idempotency §6)       | return in-flight/cached result; never double-charge                                                                                                  | n/a              |
| 10  | Buyer expects us to run/score their agent now         | n/a (product framing)               | UI + README make explicit: "we generate the suite; you run it against your system" — the seam is `runAgent()`                                        | n/a              |
| 11  | Emitted harness fails to parse/run (our bug)          | post-emit `format_valid` self-check | regenerate emit once; the eval `format_valid` judge (doc 05 §7) gates this pre-launch                                                                | restored on fail |
| 12  | Quota exhausted                                       | token check                         | "You've used all 3 runs — buy again or contact us." + buy CTA                                                                                        | n/a              |

## 11. UX / UI flow

**Sales page** (`/store/prompt-eval-suite`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** large `prompt` textarea (primary), optional `intendedBehavior` textarea, `outputFormat` select (with "auto-detect" default), an expandable "add examples" repeater (≤6 input/output pairs), `emitTargets` toggle (Vitest / Node, both on by default), provider select + BYOK key field (with "where do I get a key?" helper + "we never store your key" note **and** the segment line: "this run only _generates_ your suite — running it later is free for deterministic checks"). **Run** button disabled until a non-empty prompt + valid key.
- **Validating key:** inline spinner on the key field → ✓/✗.
- **Running:** full-width **live progress** driven by SSE — real labels ("Analyzing your prompt…", "Generating edge cases…", "Generating adversarial cases…", "Building the Vitest harness…"), a progress bar, streamed **cases filling in** (`partial` + `findingCount`: "9 cases so far"), and a rotating "did you know" about silent prompt regressions. `aria-live="polite"`.
- **Partial:** if generation was nudged/retried (edge #5), a non-blocking banner; continue to success.
- **Success / artifact view:**
  - Top: **case-count + coverage** headline (e.g. "18 cases · 31 assertions · 27 deterministic / 4 judge") with a **coverage bar/matrix** across the 5 buckets (`StatBar`/`StatMatrix`, doc 06).
  - **Spec card**: the model's task understanding + invariants (so the buyer confirms we understood the prompt).
  - **Cases**: grouped by bucket, each case showing input, rationale, and its assertion chips (deterministic vs judge as `SeverityChip`-style tier chips).
  - **Generated files**: tabbed `FileViewer` (`prompt.eval.test.ts` / `run.mjs` / `cases.json` / `README.md`) with per-file copy + filename + "why this file"; **Download ZIP** (primary), **Download PDF**, **Email me a copy** (pre-checked, auto-sent).
  - **`topGaps`** honest callout: "what a prompt-only suite can't cover" → cross-sell `golden-dataset-generator` / `grade-my-agent`.
  - **Upsell card** → `regression-guard` ("lock the must-hold cases into a CI gate") + agency CTA.
- **Error:** clear message per §10 + retry; never lose the entered prompt/examples.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer`, `SeverityChip`, `StatBar`/`StatMatrix` (see [`../06-ui-kit.md`](../06-ui-kit.md) §2). The only new component is `components/store/artifacts/prompt-eval-suite.tsx` (the coverage + spec + cases + files body). Run states follow the state chart in `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md` — senior, plain, confident. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword:** "prompt eval suite generator" / "generate LLM eval tests" / "prompt regression testing" (tool + informational intent).
- **`generateMetadata`:** title `Prompt → Eval Suite — Test Your Prompt So It Can't Silently Regress` (≤60); description: "Paste a prompt and get a runnable eval suite + a CI harness you commit today. Catches regressions on model updates. Instant, BYOK, $29." (≤155). Canonical `/store/prompt-eval-suite`. OG via `@vercel/og` (coverage-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "Do you run my agent/prompt?" (no — we generate the suite, you run it against your system via a `runAgent()` you fill), "What framework is the harness?" (Vitest and/or a zero-dep Node runner; cases are framework-neutral JSON), "Does running the suite cost API calls?" (no for the deterministic assertions; only if you opt into the LLM-judge ones), "Do you store my API key?" (no), "Can I edit the cases?" (yes — they're yours, in your repo).
- **Internal links:** eval-gap blog posts → here; sibling `golden-dataset-generator`, `regression-guard`, `grade-my-agent`.
- **Programmatic surface (note):** with buyer consent, anonymized example suites could become indexable `/store/prompt-eval-suite/examples/<slug>` pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; provider/key fields grouped with `<fieldset>`; the examples repeater rows individually labeled; progress region `aria-live="polite"` + `role="status"`; focus moves to the report heading on success; tier chips meet contrast (don't rely on color alone — include the word "deterministic" / "judge" + icon). The `FileViewer` tabs are a real `tablist`; copy buttons announce "copied."
- Mobile: single-column; bucket coverage stacks; file viewer tabs become an accordion; download buttons full-width.
- Error recovery: errors are inline + non-destructive (prompt/examples preserved); "retry" re-runs without re-entering the key (kept in memory for the session only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route.

## 14. Payment integration

- Create Polar product **"Prompt → Eval Suite" $29** (sandbox + live). Checkout metadata `{ slug: "prompt-eval-suite" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a runnable suite (rare). Quota auto-restores on system-side failures (§10 #6/#7/#11).

## 15. Security & privacy

- **Buyer data:** the pasted prompt + optional intended-behavior + examples. This is the buyer's IP — treat as confidential. Retention: used transiently for the run; artifact (suite + report) stored 30d (KV/Blob TTL) for re-download; then purged. We never store the prompt longer than the run needs (platform-spec §10.7) and never log it at info level.
- **Boundary (the segment's defining safety property):** we **never execute the buyer's prompt/agent** and never receive the keys-for-their-SUT — only the BYOK key that pays for _generating_ the suite. The artifact is self-contained; the buyer runs it on their own infra. This is both a margin guarantee and a trust property — state it on the page (doc 03 §5).
- **Product-specific risks:**
  - **Prompt-injection-via-input** — the buyer's prompt is _data we analyze_, never instructions we follow; the system prompt quarantines it. (We eat our own dog food: the same indirect-injection defense Segment 3 documents.)
  - **Generated-code safety** — emitted harness is our own templated code over the buyer's cases; it never `eval`s buyer strings, sets safe zip paths (no `../`), and the `runAgent()` seam is a stub the buyer fills (we never call it).
- Shared rules (key handling, rate-limit, webhook verify) per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `pes_cases_generated` (count), `pes_coverage` (deterministic vs judge split), `pes_emit_target` (vitest/node/both), `pes_zip_download`, `pes_upsell_click`.
- **Activation:** purchase → first run that produces a runnable suite (≥8 cases, harness parses). **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), judge-heavy-suite rate (signals prompts too fuzzy for deterministic coverage — tune the elicitor), upsell CTR.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`prompt-eval-suite`), Polar sandbox product, routes, empty `PromptEvalSuiteOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Spine + contract (no AI).** `elicitSpec` + `templater` (Vitest + Node emitters) + input/output schemas; pipeline returns a schema-valid contract from a **fixture prompt** with the AI step mocked, and the emitted files **parse and run** (a generated suite against a stub `runAgent` passes/fails deterministically). _AC: unit test: fixture prompt → valid `PromptEvalSuiteOutput`; emitted Vitest file compiles + runs; `cases.json` round-trips._
- **Phase 2 — Real run + UI.** Wire BYOK + `structuredStream` (live AI, streamed cases), all UI states, report render + PDF + ZIP(Blob) + Resend email. _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6 — gate before live).** Sales page copy, metadata, JSON-LD, OG card, a11y pass (axe), analytics, upsell. **Every box must be checked:**
  - [ ] Sample suite asset (anonymized real run over a real prompt) on the sales page + storefront card.
  - [ ] Artifact leads with the coverage headline (answer-first) and is prioritized (buckets the spec emphasized first).
  - [ ] Output is provably input-specific (eval `input_specific` judge passes — cases reference the actual prompt's task/inputs, §2.1).
  - [ ] At least one designed data-viz (the 5-bucket coverage matrix / deterministic-vs-judge bar).
  - [ ] Branded, designed PDF export (coverage summary + spec + case list), not a screenshot.
  - [ ] Code outputs (`*.test.ts`, `run.mjs`, `cases.json`, `README.md`) have copy buttons + filenames + rationale.
  - [ ] Running state streams real phases + shows the work (cases filling in).
  - [ ] All 8 UI states designed — no default spinners/blank screens.
  - [ ] "We never store your key" + "this run only generates the suite; running it is free for deterministic checks" + retention + expected cost visible.
  - [ ] AI-tells absent (`no_ai_tells` judge passes); `topGaps` honest, no fabricated coverage.
  - [ ] Senior copy throughout (matches `PROJECT_VISION.md`).
  - [ ] `impeccable` / `taste` pass on the artifact + sales page; `ui-ux-pro` + axe pass on the tool UI.
  - [ ] Mobile artifact view first-class.
  - _AC: axe clean; events fire; Lighthouse ≥90; checklist fully green._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts, refund flow verified; first golden-set fixtures are our own store prompts (segment README). _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)          | Test                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| #1 key invalid      | unit: pre-run ping mock rejects → error, quota intact                      |
| #2 thin prompt      | unit: under-specified prompt → smaller suite + populated `topGaps`         |
| #4 non-prompt input | unit: codebase blob → "doesn't look like a prompt", quota intact           |
| #5 judge-heavy      | unit: spec forcing fuzzy props → deterministic-nudge retry, warn surfaced  |
| #6 AI timeout       | integration: provider error → retry → quota restored on final fail         |
| #7 contract-invalid | schema: malformed AI object → `parse` throws; runner restores quota        |
| #9 duplicate        | integration: same `runId` returns cached, no double quota                  |
| #11 emit invalid    | unit: emitted Vitest/Node files must parse + run against a stub `runAgent` |

**The one test that matters most:** fixture prompt → pipeline (mocked AI returning a fixed object) → **valid `PromptEvalSuiteOutput`** AND the emitted harness **parses and runs** (a generated Vitest file, given a stub `runAgent`, executes its deterministic assertions and reports pass/fail). A suite that doesn't run is worthless — this test guards the segment's whole premise.

Full method, fixtures, canonical mocks, the provider×input×failure **scenario matrix**, sandbox-E2E, eval golden-set format + judges, and CI gates are in [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific eval expectations: ~8–12 real prompts (incl. our own store prompts) with expected buckets that must appear, invariants that must be asserted, and a `format_valid` judge that **runs the emitted harness** (cases must parse + execute); judges `input_specific`, `no_ai_tells`, `factual`, `format_valid`. Provider axis: happy-path against `anthropic | openai | google` mock responses.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. The spine modules this depends on must already pass `segment-0-spine` DoR.
- **New libs (minimal):** none required — `elicitSpec` and the harness `templater` are plain Node/string-templating; emitted files import nothing of ours (Node target zero-dep; Vitest target uses the buyer's existing `vitest`). Vercel Blob for the zip (already available on Vercel).
- **Cross-product reuse:** `server/store/tools/evals/{elicit,templater,assertions}.ts` are shared with `regression-guard`, `golden-dataset-generator`, and `grade-my-agent` — design them generic now (this product is the reference implementation of the segment spine, §7).

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` default + shipped emit targets — Vitest + zero-dep Node confirmed for v1? Pytest/Promptfoo-YAML as later emitters over the same contract? (segment README).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` for the `json_schema` assertion, emit a zero-dep inlined validator vs assume the buyer has `zod`/`ajv` — README should support both; pick the default.
- **Risk — generated harness that doesn't actually run:** the #1 product risk (a suite that won't `pnpm test` kills trust). Mitigation = the `format_valid` judge runs the emitted harness in CI as a launch blocker (§18); treat a non-running emit as a release blocker.
- **Risk — buyer confusion that we run their agent:** mitigation = UI + README + FAQ + sales page all state the boundary and show the `runAgent()` seam (§10 #10).
- **Risk — judge-heavy suites surprise the buyer with run-time cost:** mitigation = deterministic-first generation rule (§9), the coverage split shown in the report, and the harness gating judge assertions behind an env flag.
- **Risk — generic/non-specific cases (the doc 03 §2.1 failure):** mitigation = elicit grounding + buyer examples + the `input_specific` eval judge as a regression gate.
