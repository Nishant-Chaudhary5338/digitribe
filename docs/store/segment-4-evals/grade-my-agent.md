# Grade my agent — PRD

**Slug:** `grade-my-agent` · **Segment:** 4 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Composes the Segment-4 spine's **spec elicitor** (`prompt-eval-suite.md` §7) but stops at the diagnostic — it produces a **scorecard**, not a runnable harness. It is the segment's "tell me what's wrong" entry that sells the generators by finding.

---

## 1. TL;DR

- **One-liner:** Describe your agent and paste a few real input/output samples → get a reliability scorecard with the failure modes that will bite you and the fixes that matter most.
- **Problem:** Builders have a working-ish agent but no honest read on _how_ reliable it is or _where_ it breaks. "It works in the demo" hides the brittleness that shows up in production.
- **Buyer:** developers / AI-product owners with a shipped-or-shipping agent who want a credible reliability read before (or after) it bites them.
- **Input → Output:** an agent description + a few sample inputs/outputs → a downloadable **Reliability Scorecard** (4 graded dimensions, identified failure modes, prioritized hardening recommendations) as an on-screen report + branded PDF.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~20–40s (single AI reasoning pass) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a builder who wants to know if their agent is reliable either eyeballs a few runs ("looks fine"), waits for production to surface failures, or commissions a heavyweight eval setup they never finish. There's no instant, honest second opinion. This is the eval-gap stat made personal: **~89% have observability but only ~52% run systematic evals** — most builders are flying on "it didn't error" with no view of _robustness_, _consistency_, or _failure-handling_.

**Competition:** eval platforms can measure these dimensions but require you to build the harness and dataset first (which is the wall). LLM "agent reviewers" exist as one-off prompts but give unstructured, ungrounded opinions. **Gap:** an instant, structured, grounded reliability diagnostic that uses the buyer's _real_ samples and prioritizes fixes — and then hands them the next product to actually fix it. That's us.

**Urgency stat:** **>40% of agentic-AI projects are projected cancelled by 2027**, with inadequate reliability controls a named driver — a scorecard turns "it feels flaky" into a ranked, actionable list before the project is on the chopping block.

**Why Digitribe:** we ship agents and grade our own (doc 05 §7) — the scorecard's dimensions and failure-mode taxonomy come from the discipline we run on this store, not a generic rubric.

## 3. Pricing & packaging

- **$29**, one-time. Same anchor as the flagship — a structured diagnostic is worth as much as the suite for a buyer who doesn't yet know _what_ to test.
- **Includes:** 1 run (3 re-runs to refine the description / add more samples), the on-screen scorecard, a branded PDF (forwardable to a boss/team), an emailed copy (Resend).
- **Upsell path:** every failure mode and dimension in the scorecard cross-sells: weak `format`/`robustness` → `prompt-eval-suite` ($29, "turn these into a runnable suite"); thin coverage → `golden-dataset-generator` ($19, "you need a labeled set first"); the must-hold invariants it surfaces → `regression-guard` ($19, "lock these in CI"). Agency CTA: "want us to harden this for you?" → Digitribe services. This product is the **diagnostic top of the eval funnel.**
- **Future tiers (note only):** a re-grade-on-each-release subscription is a v2 idea; v1 is one SKU.

## 4. User stories / JTBD

- As a **developer** about to ship an agent, when I want a sanity check, I want an honest reliability read on real samples, so that I know the risks before users do.
- As an **AI-product owner**, when something feels flaky, I want the failure modes named and ranked, so that I fix the few that matter, not chase everything.
- As a **team lead**, when I need to justify reliability work, I want a credible scorecard PDF, so that I can show leadership the gap and the plan.
- As a **solo builder**, when I lack an eval setup, I want to know _what_ to test, so that I can buy the suite/dataset that targets it.

**Primary job the artifact must nail:** an **honest, grounded, prioritized** read — graded on the buyer's _actual_ samples, naming failure modes that are real for _this_ agent (not a generic checklist), with fixes ranked by impact. The grade must be defensible, not flattering.

**Non-goals (v1):** does NOT run/execute the buyer's agent (it reasons over the description + the samples the buyer provides — segment README boundary); does NOT generate a runnable harness (that's `prompt-eval-suite`); does NOT rewrite the agent's prompt/code; does NOT certify the agent as "safe" — it diagnoses, it doesn't warrant.

## 5. Functional requirements

### Inputs

| Field              | Type                           | Validation                                                                      | Example                                                          |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `agentDescription` | string                         | non-empty, ≤ 4000 chars: what the agent does, its tools, its constraints        | "A support triage agent; tools: search-kb, create-ticket; must…" |
| `samples`          | array (1–8)                    | `{ input: string, output: string, note?: string }` — the buyer's real I/O pairs | `[{ input: "refund pls", output: "{ticket:…}" }]`                |
| `riskFocus`        | array enum (optional)          | subset of the 4 dimensions to emphasize (default: all)                          | `["robustness","failure_handling"]`                              |
| `context`          | string (optional, ≤ 500 chars) | DTC/SaaS, stakes, audience — shapes tone + examples (doc 03 §2.4)               | "B2B SaaS, customer-facing, high stakes"                         |
| `provider`         | enum                           | one of product's `byokProviders`                                                | `anthropic`                                                      |
| `byokKey`          | string (secret)                | non-empty; validated live pre-run (platform-spec §5)                            | `sk-…`                                                           |

### Processing (requirements level; pipeline in §7)

Elicit a structured spec from the description + samples → AI reasons over the samples to grade 4 reliability dimensions, identify failure modes (each tied to evidence in a sample), and prioritize hardening recommendations, filling the Output Contract → render report + PDF + email. **No buyer-agent execution** — the grade is grounded in the samples the buyer supplies, not in runs we perform.

### Outputs

The **Reliability Scorecard** (on-screen + PDF). Exact shape in §6.

### Constraints

- 1–8 samples (need ≥1 for a grounded grade; >8 adds cost without proportional signal). Each sample ≤ 4000 chars.
- `agentDescription` ≤ 4000 chars. Oversize → field error.
- Grades are honest: with only 1–2 samples the report's `confidence` is explicitly lowered and `topGaps` says "add more samples for a firmer grade."

## 6. ⭐ Output Contract

```ts
// server/store/schemas/grade-my-agent.ts
import { z } from 'zod'

const FailureMode = z.object({
  id: z.string(), // stable slug, e.g. "ignores-empty-input"
  title: z.string().max(120),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  dimension: z.enum(['correctness', 'robustness', 'failure_handling', 'consistency']),
  evidence: z.string().max(400), // MUST cite a provided sample (input/output) — no fabrication
  why: z.string().max(400), // why it's a reliability problem in production
  likelihood: z.enum(['rare', 'occasional', 'frequent']),
})

const Dimension = z.object({
  key: z.enum(['correctness', 'robustness', 'failure_handling', 'consistency']),
  label: z.string(),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  score: z.number().int().min(0).max(100),
  status: z.enum(['good', 'partial', 'missing']),
  summary: z.string().max(400), // grounded in the samples
  evidence: z.array(z.string()).max(6), // sample references supporting the grade
})

const Recommendation = z.object({
  priority: z.number().int().min(1), // 1 = do first; the list is pre-sorted by impact
  title: z.string().max(120),
  rationale: z.string().max(400),
  effort: z.enum(['quick', 'moderate', 'involved']),
  addresses: z.array(z.string()).max(6), // failureMode ids this fixes
  // drives in-app cross-sell to the generators:
  fixWith: z
    .enum(['prompt-eval-suite', 'golden-dataset-generator', 'regression-guard', 'manual'])
    .optional(),
})

export const GradeMyAgentOutput = z.object({
  agent: z.object({
    summary: z.string().max(600), // the model's understanding of the agent
    detectedTools: z.array(z.string()).max(12),
    sampleCount: z.number().int(),
    context: z.string().max(200).optional(), // echoes DTC/SaaS framing if given
  }),
  overall: z.object({
    grade: z.enum(['A', 'B', 'C', 'D', 'F']),
    score: z.number().int().min(0).max(100),
    headline: z.string().max(200), // the answer-first verdict (doc 03 §2.2)
    confidence: z.enum(['low', 'medium', 'high']), // honest, scales with sample count
  }),
  dimensions: z.array(Dimension).length(4), // always the same 4, always length 4
  failureModes: z.array(FailureMode).min(0).max(12), // prioritized by severity
  recommendations: z.array(Recommendation).min(1).max(8), // pre-sorted by `priority`
  topGaps: z.array(z.string()).min(0).max(5), // honest "what we couldn't assess from samples alone"
})
export type GradeMyAgentOutput = z.infer<typeof GradeMyAgentOutput>
```

- **Export formats:** on-screen scorecard (React) · **PDF** (branded, the primary deliverable — cover with overall grade ring + 4 dimension rings + failure modes + plan, platform-spec §8) · **JSON** (the raw contract). (No zip — there are no generated files; the scorecard _is_ the artifact.)
- **Field notes:** the 4 `dimensions` are fixed (`correctness`, `robustness`, `failure_handling`, `consistency`) so the scorecard layout and PDF are deterministic. `score`/`grade` use the fixed 0–100 / A–F scale (A ≥90, B ≥75, C ≥60, D ≥40, F <40). `FailureMode.evidence` **must reference a provided sample** — the `factual` eval judge fails the run if a failure mode cites something not in the inputs. `recommendations` arrive pre-sorted by `priority`; `confidence` is honestly tied to `sampleCount`.
- **Determinism:** the dimension set, grade scale, and answer-first hierarchy are fixed by the schema; `headline`, `summary`, `evidence`, `rationale` are generative but constrained and grounded.

## 7. System logic / pipeline

```
POST /api/store/run/grade-my-agent  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ ELICIT  elicitSpec({ agentDescription, samples })       emit{phase:"analyze",pct:25}
  │     - deterministic (shared spine, prompt-eval-suite §7):
  │       parse description → tools, constraints, task; index
  │       the samples as grounded evidence the model must cite
  │     → EvalSpec + indexed samples
  │
  ├─ GRADE  ai.structuredStream({                            emit{phase:"generate",pct:35..85,
  │     system: GRADE_AGENT_SYSTEM,          // §9         message:"Grading robustness…",
  │     prompt: buildPrompt(spec, samples, riskFocus, ctx), partial: dimensions/failureModes
  │     schema: GradeMyAgentOutput,           // §6 SDK-enforced   filling in,
  │     effort: "high",                                     findingCount: failure modes found}
  │   })  → scorecard                          // streamObject: dimensions then failure modes
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:92}
  │     - on-screen scorecard, branded PDF (grade rings + plan), JSON
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the grade step), `effort: "high"` — honest, grounded reasoning is the product. Elicit is deterministic — no extra AI cost.
- **Libraries:** none new — reuses the spine's `elicitSpec` and `report.ts` (PDF). No harness templater (this product emits no code files).
- **Reuse:** consumes the shared `elicitSpec` (Segment-4 spine, `prompt-eval-suite.md` §7). Its dimension/failure-mode taxonomy is shared with `prompt-eval-suite`'s buckets (a `failure_handling` failure mode here maps to a `failure_handling` bucket there) so the cross-sell hand-off is coherent.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at honest, evidence-grounded reasoning over samples), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (fine for a quick read on a few samples). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one run is a single reasoning pass over the description + ≤8 samples (~few K input tokens) → typically **well under $0.10 on the buyer's key**. **State clearly: this run pays only for the diagnostic — we do not run your agent.** (Segment README boundary, doc 03 §5.)
- **Pre-run validation:** a 1-token ping via the AI wrapper; on failure return error #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject`/`streamObject` against `GradeMyAgentOutput`.

**System prompt (draft):**

```
You are a senior reliability engineer grading an AI agent. You are given the
buyer's agent DESCRIPTION and a small set of REAL input/output SAMPLES they
collected. You are NOT running the agent — you reason ONLY over the description
and these samples.

Grade four dimensions, each A–F with a 0–100 score:
- correctness: does the output do the task right for the given input?
- robustness: how does it hold up on unusual, malformed, or adversarial inputs?
- failure_handling: does it refuse/guard/degrade gracefully when it should?
- consistency: similar inputs → similar, stable outputs?

Hard rules:
- Be HONEST, not flattering. A demo-quality agent on thin samples gets a low
  confidence and an honest grade. Do not inflate.
- Every failure mode and every piece of dimension evidence MUST cite a specific
  provided sample (quote or reference it). If you cannot ground a claim in a
  sample or the description, do NOT make it — put the limitation in topGaps.
- Identify the failure modes that are REAL for THIS agent given the evidence —
  not a generic checklist. Rank by severity × likelihood.
- Recommendations are prioritized (priority 1 = do first) and tied to the failure
  modes they fix. Set fixWith to the product that addresses each (eval-suite for
  test coverage, golden-dataset for a labeled set, regression-guard for CI locks).
- Set overall.confidence honestly from sampleCount: 1–2 samples → low; 3–5 →
  medium; 6–8 → high. Say so.
- Adapt tone/examples to the buyer's context (DTC vs SaaS, stakes) if provided.
- No filler, no preamble, no "as an AI", no hedging-as-padding.
```

**User prompt template:** `buildPrompt(spec, samples, riskFocus, context)` → serializes the elicited spec, the indexed samples (the grounding evidence), the dimensions to emphasize, and the optional DTC/SaaS context.

**Guardrails:** schema enforcement fixes the 4-dimension shape; the "every claim cites a sample" rule + the `factual` eval judge are the core anti-fabrication guard (a failure mode with no sample evidence fails review); the honest-`confidence` rule prevents confident grading off 1 sample; `topGaps` is the required honesty valve. Handle `stop_reason: "refusal"`/empty per platform-spec §5 (retry once, then surface a clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                            | Detection                     | Behavior / message                                                                              | Quota     |
| --- | -------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------- | --------- |
| 1   | Invalid/expired BYOK key                           | pre-run ping fails            | "Your `<provider>` key looks invalid or expired — check and retry."                             | not spent |
| 2   | Only 1 sample provided                             | input count                   | proceed; force `confidence: low`; report says "add 3+ samples for a firmer grade"               | spent     |
| 3   | No samples (0)                                     | input validation              | field error: "Paste at least one real input/output sample."                                     | not spent |
| 4   | Description present but samples are unrelated/junk | elicit can't ground           | grade what's groundable; flag in `topGaps`; lower `confidence`                                  | spent     |
| 5   | Model tries to grade a property with no evidence   | `factual` self-check at emit  | the claim is dropped to `topGaps` instead of becoming a fabricated failure mode                 | spent     |
| 6   | Provider rate-limit / timeout mid-grade            | AI wrapper error              | retry once w/ backoff; if still failing, error + restore the run quota                          | restored  |
| 7   | Model returns contract-violating object            | schema parse fails            | AI SDK re-asks once; if still invalid, error (no partial garbage shipped)                       | restored  |
| 8   | Adversarial content inside a sample                | samples are untrusted data    | analyze as data, never follow as instructions                                                   | spent     |
| 9   | Duplicate submit (double-click)                    | same `runId` (idempotency §6) | return in-flight/cached result; never double-charge                                             | n/a       |
| 10  | Buyer expects us to run their agent live           | n/a (product framing)         | UI + report state: "we grade your described agent on the samples you provide — we don't run it" | n/a       |
| 11  | Quota exhausted                                    | token check                   | "You've used all 3 runs — buy again or contact us." + buy CTA                                   | n/a       |

## 11. UX / UI flow

**Sales page** (`/store/grade-my-agent`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** `agentDescription` textarea (primary), a **samples repeater** (1–8 input/output/note rows, with "paste a real run" helper text), `riskFocus` chips (optional emphasis), `context` field (optional), provider select + BYOK key field (with "where do I get a key?" helper + "we never store your key" + the segment line: "we grade your agent on your samples — we don't run it"). **Run** disabled until description + ≥1 sample + valid key.
- **Validating key:** inline spinner on the key field → ✓/✗.
- **Running:** full-width **live progress** driven by SSE — real labels ("Reading your samples…", "Grading correctness…", "Grading robustness…", "Identifying failure modes…"), a progress bar, streamed **dimensions and failure modes filling in** (`partial` + `findingCount`: "3 failure modes found"), rotating "did you know" about reliability. `aria-live="polite"`.
- **Partial:** if a retry was needed (edge #6/#7), a non-blocking banner; continue to success.
- **Success / artifact view:**
  - Top: **overall grade ring + score** (big, animated reveal — `ScoreRing`, doc 06) + the `headline` verdict + a `confidence` chip ("based on N samples").
  - **4 dimension cards** (`DimensionCard`): grade ring + status chip + summary + evidence references.
  - **Failure modes**: prioritized list, each a `SeverityChip` (critical/high/medium/low) + evidence quote + why + likelihood.
  - **Hardening plan**: numbered recommendations (pre-sorted), each with effort chip + a "fix with →" button linking the cross-sell product (`fixWith`).
  - **`topGaps`** honest callout.
  - **Download PDF** (primary — the forwardable scorecard), **Download JSON**, **Email me a copy** (pre-checked). No ZIP (no code files).
  - **Upsell card** driven by the dominant `fixWith` → the relevant generator + agency CTA.
- **Error:** clear message per §10 + retry; never lose the description/samples.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `DimensionCard`, `SeverityChip` (see [`../06-ui-kit.md`](../06-ui-kit.md) §2). The only new component is `components/store/artifacts/grade-my-agent.tsx` (the grade + dimensions + failure modes + plan body). Run states follow `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md`. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword:** "grade my AI agent" / "agent reliability scorecard" / "how reliable is my LLM agent" (tool + informational intent).
- **`generateMetadata`:** title `Grade My Agent — A Reliability Scorecard for Your AI Agent` (≤60); description: "Describe your agent, paste a few real runs, and get a graded reliability scorecard — correctness, robustness, failure-handling, consistency — plus the fixes that matter. $29, BYOK." (≤155). Canonical `/store/grade-my-agent`. OG via `@vercel/og` (grade-ring visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real): "Do you run my agent?" (no — we grade it from your description + the samples you provide), "What do the 4 dimensions mean?" (correctness/robustness/failure-handling/consistency, with one-line each), "How many samples should I give?" (3–8 for a firm grade; 1 works but confidence is lower), "Do you store my API key?" (no), "Is the grade flattering?" (no — it's honest and grounded in your samples).
- **Internal links:** reliability/eval-gap blog posts → here; sibling `prompt-eval-suite`, `golden-dataset-generator`, `regression-guard` (the scorecard recommends them by finding).
- **Programmatic surface (note):** anonymized example scorecards as indexable pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; the samples repeater rows individually labeled; provider/key in a `<fieldset>`; progress region `aria-live="polite"` + `role="status"`; focus moves to the overall-grade heading on success; grade chips + severity chips never color-only (letter/word + icon); contrast ≥ AA.
- Mobile: single-column; dimension cards stack; the hardening plan is a vertical list; download buttons full-width. The PDF is the mobile-friendly takeaway.
- Error recovery: errors inline + non-destructive (description/samples preserved); "retry" re-runs without re-entering the key (session memory only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route.

## 14. Payment integration

- Create Polar product **"Grade my agent" $29** (sandbox + live). Checkout metadata `{ slug: "grade-my-agent" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund if no valid scorecard produced (rare). Quota auto-restores on system-side failures (§10 #6/#7).

## 15. Security & privacy

- **Buyer data:** the agent description + real I/O samples (may contain the buyer's domain data / customer content). Treat as confidential. Retention: transient for the run; scorecard stored 30d (KV/Blob TTL) for re-download; then purged. Never logged at info level; never stored longer than the run needs (platform-spec §10.7).
- **Boundary:** we **never execute the buyer's agent** and never receive its keys — only the BYOK key that pays for the diagnostic. State on the page (doc 03 §5).
- **Product-specific risks:**
  - **Sensitive content in samples** — samples may carry PII/customer data; redact from logs, never persist beyond TTL, and tell the buyer to paste representative-but-not-secret samples where possible (UI note).
  - **Prompt-injection-via-sample** — samples are data we analyze, never instructions we follow.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `gma_grade` (overall grade), `gma_confidence` (low/med/high), `gma_failure_count`, `gma_pdf_download`, `gma_fixwith_click` (which generator the buyer clicked).
- **Activation:** purchase → first run that produces a valid scorecard. **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), low-confidence rate (signals buyers giving too few samples — tune the UI prompt), `fixwith` CTR (the cross-sell engine).

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`grade-my-agent`), Polar sandbox product, routes, empty `GradeMyAgentOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Spine + contract (no AI).** Reuse `elicitSpec`; input/output schemas; pipeline returns a schema-valid scorecard from a **fixture agent + samples** with the AI step mocked, including the rule that every `failureModes[].evidence` references a provided sample. _AC: unit test: fixture → valid `GradeMyAgentOutput`; a fabricated-evidence fixture fails the grounding check._
- **Phase 2 — Real run + UI.** Wire BYOK + `structuredStream`, all UI states, scorecard render + branded PDF + Resend email. _AC: E2E activation path green in sandbox with a real test key; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6 — gate before live).** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics, upsell. **Every box must be checked:**
  - [ ] Sample scorecard asset (anonymized real run) on the sales page + storefront card.
  - [ ] Artifact leads with the overall grade + headline verdict (answer-first) and recommendations are prioritized.
  - [ ] Output is provably input-specific (`input_specific` judge — the grade references the actual agent + samples, §2.1).
  - [ ] Designed data-viz: overall + 4 dimension grade rings; severity chips.
  - [ ] Branded, designed PDF (the primary deliverable) — forwardable, not a screenshot.
  - [ ] (No code files — N/A for copy-button rule; severity/grade chips carry the visual rationale instead.)
  - [ ] Running state streams real phases + shows the work (dimensions/failure modes filling in).
  - [ ] All 8 UI states designed.
  - [ ] "We never run your agent / store your key" + retention + expected cost visible.
  - [ ] AI-tells absent (`no_ai_tells` judge); grading honest (no inflation); evidence grounded (`factual` judge); `topGaps` honest.
  - [ ] Senior copy throughout.
  - [ ] `impeccable` / `taste` pass on the scorecard + sales page; `ui-ux-pro` + axe pass on the tool UI.
  - [ ] Mobile scorecard view first-class.
  - _AC: axe clean; events fire; Lighthouse ≥90; checklist fully green._
- **Phase 4 — Launch.** Live Polar product, monitoring, refund flow verified; first golden-set fixtures grade our own store agents (segment README). _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)          | Test                                                                            |
| ------------------- | ------------------------------------------------------------------------------- |
| #1 key invalid      | unit: pre-run ping mock rejects → error, quota intact                           |
| #2 one sample       | unit: 1 sample → `confidence: low` forced + advisory in report                  |
| #3 no samples       | unit: 0 samples → field error, quota intact                                     |
| #5 ungrounded claim | unit: model object with evidence not in samples → grounding check moves to gaps |
| #6 AI timeout       | integration: provider error → retry → quota restored on final fail              |
| #7 contract-invalid | schema: malformed AI object → `parse` throws; runner restores quota             |
| #9 duplicate        | integration: same `runId` returns cached, no double quota                       |

**The one test that matters most:** fixture agent + samples → pipeline (mocked AI) → **valid `GradeMyAgentOutput`** with **every failure-mode evidence traceable to a provided sample** (the grounding invariant — a fabricated-evidence fixture must fail). A scorecard that invents failures is worse than none.

Full method, fixtures, canonical mocks, scenario matrix, sandbox-E2E, eval golden-set + judges, CI gates: [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific eval expectations: ~8–12 real agents (incl. our own store agents) with expected grade bands per dimension + failure modes that must be flagged + a hard `factual` judge ("every evidence string traces to an input sample; zero fabrication"); judges `input_specific`, `no_ai_tells`, `factual`. Provider axis: happy-path against `anthropic | openai | google` mock responses.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. Spine modules must pass `segment-0-spine` DoR.
- **New libs (minimal):** none — reuses `elicitSpec` + `report.ts` (PDF). No harness templater (no code emit).
- **Cross-product reuse:** consumes the Segment-4 spine's `elicitSpec` (`prompt-eval-suite.md` §7); its dimension/failure-mode taxonomy aligns with `prompt-eval-suite`'s buckets and `regression-guard`'s invariants so the `fixWith` cross-sell hands off coherently.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` sample-count guidance — is 8 the right cap, or should we allow more (cost vs signal) for power users? Default 8 for v1.
- **Risk — flattering / ungrounded grades (the core quality risk):** an inflated or fabricated scorecard destroys trust. Mitigation = the "every claim cites a sample" rule (§9) + the `factual` grounding judge as a launch blocker (§18) + honest-`confidence`.
- **Risk — buyer confusion that we run their agent:** mitigation = UI + report + FAQ + sales page state the boundary (§10 #10).
- **Risk — too few samples → low-signal grade:** mitigation = `confidence` scaling + the UI nudging for 3+ samples + `topGaps` honesty.
- **Risk — sensitive data in samples:** mitigation = retention TTL + no info-level logging + UI guidance to paste representative samples (§15).
