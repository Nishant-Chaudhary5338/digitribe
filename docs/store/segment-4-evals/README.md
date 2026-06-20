# Segment 4 — Agent Reliability & Evals

> Make agents and prompts **testable** — generate the eval suites, scorecards, golden datasets, and CI guards that an agent builder should have written but never did. Read [`../00-overview.md`](../00-overview.md) and [`../01-platform-spec.md`](../01-platform-spec.md) first. This segment sells to **builders**, and its products **generate test artifacts the buyer runs themselves** — we never run the buyer's agent for them.

---

## Thesis

The agent-building boom has a quality problem it isn't paying down. Teams ship prompts and agents into production, then watch them silently regress when a model updates, a prompt is tweaked, or an edge case shows up — because there's no test on the behavior. Everyone _knows_ they should eval; almost nobody does, because the eval tools that exist are heavy: a framework to adopt, a dataset to hand-label, a dashboard to host, a vendor to integrate. The gap is not "do builders want reliability" — it's "the on-ramp is a project, not a purchase."

That gap is widening fast enough to be an emergency. Analysts now project **over 40% of agentic-AI projects will be scrapped by 2027** — driven by cost, unclear value, and **inadequate risk and reliability controls**. Meanwhile the observability vs. evaluation split is stark: roughly **89% of teams running LLMs in production have monitoring/observability, but only ~52% run systematic evals.** Observability tells you it broke _after_ a user hit it; evals catch it _before_ you ship. The reason for the gap is friction — eval tooling is perceived as too heavy to adopt — not disagreement about its value.

So we sell the opposite of heavy: **paste a prompt or describe an agent → get a runnable eval suite, a reliability scorecard, a labeled golden dataset, or a drop-in CI guard — instant, on your own key, committable today.** No framework to adopt, no dashboard to host, no dataset to label by hand. A finite artifact the buyer drops into their repo and owns. This is eval tooling shaped like the rest of the store: one input → one locked artifact → done.

**The boundary that defines this segment:** these products **produce test artifacts; they do not execute the buyer's agent.** We never receive, host, or call the buyer's agent or its keys-for-the-system-under-test. We generate the cases, the assertions, the dataset, and the harness; the buyer runs them in their own CI against their own system. This keeps us margin-safe (BYOK pays only for _generating_ the suite, a single bounded run — never for executing an open-ended test loop) and keeps the buyer's system in the buyer's hands. Every PRD in this segment states this boundary explicitly and designs the harness so the _buyer_ supplies the "call my agent" adapter.

**Why us:** Digitribe builds Claude/AI-SDK agents and MCP servers for a living, and runs its own eval golden-sets across this very store (doc 05 §7) — every store product ships with `input_specific` / `no_ai_tells` / `factual` / `format_valid` judges before it goes live. We sell builders the discipline we already practice on ourselves, in the exact format we use it: small, fast, committable, threshold-gated. Not a platform — a generated artifact.

### Market signals (cite in sales copy)

- **>40% of agentic-AI projects projected cancelled by 2027** (Gartner), with inadequate risk/reliability controls a named driver — reliability is the difference between an agent that ships and one that gets killed.
- **~89% observability adoption vs. ~52% systematic-eval adoption** among teams running LLMs in production — the eval gap is a real, quantified hole, and it exists because tooling is too heavy, not because evals don't matter.
- **Prompts and agents silently regress** on every model update / prompt edit; without a committed test, the first signal is a user complaint (or a monitoring alert _after_ the fact).
- The discipline is known and standardized (assertion-based test cases, golden datasets, LLM-as-judge scoring, CI gates) — what's missing is the **instant on-ramp**, which is exactly what an instant BYOK store is for.

> Sources tracked in `../research-sources.md` (the shared citation list used across sales pages). Mark any stat you can't trace there as `OPEN QUESTION:` rather than ship it unverified.

## Products

| Slug                       | Name                       | Price | Input → Artifact                                                                                                                                                            | Status          |
| -------------------------- | -------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `prompt-eval-suite`        | **Prompt → Eval Suite** ⭐ | $29   | a prompt (+ optional intended behavior) → generated eval test cases + a runnable, CI-droppable scoring harness (zip)                                                        | PRD ✅ flagship |
| `grade-my-agent`           | Grade my agent             | $29   | agent description + a few sample inputs/outputs → reliability scorecard (correctness/robustness/failure-handling/consistency) + failure modes + prioritized hardening (PDF) | PRD ✅          |
| `golden-dataset-generator` | Golden-dataset generator   | $19   | task description (+ optional examples) → a labeled test set (golden dataset) in JSONL/CSV + a short "how to use" guide (zip)                                                | PRD ✅          |
| `regression-guard`         | Regression guard           | $19   | a prompt + a list of must-hold behaviors/invariants → a CI test file asserting them + a GitHub Actions snippet (zip)                                                        | PRD ✅          |

**Funnel:** `regression-guard` ($19, narrowest — "lock these 5 behaviors") and `golden-dataset-generator` ($19, "give me the labeled set I never made") are the cheap curiosity entries → `prompt-eval-suite` ($29 flagship — the full generated suite + harness) → `grade-my-agent` ($29, the diagnostic that tells you _what_ to test and sells the others by finding). The flagship's harness README cross-sells the dataset generator ("need more cases? generate a golden set") and the guard ("lock the cases that matter into CI"); `grade-my-agent`'s scorecard cross-sells the suite ("turn these failure modes into a runnable eval"). Eval-gap content marketing (a steady stream of "your prompt silently regressed when the model updated" / "you have monitoring but no evals" posts) feeds the top, and the agency CTA ("want us to build your eval pipeline?") catches teams who'd rather we do it.

## Shared logic across this segment (build once, reuse)

These products share an **elicit → generate cases → assert → emit** spine. Build it once in `server/store/tools/evals/` and have each product compose the parts it needs. `prompt-eval-suite` is the reference implementation; the others reference it.

1. **Spec elicitor** (`elicitSpec(input)`) — deterministic Node pre-processing that turns the buyer's raw input (a prompt string, an agent description, sample I/O pairs, a behaviors list) into a structured **`EvalSpec`**: the system-under-test's _intended behavior_, its _input space_ (types, ranges, formats it must handle), its _output contract_ (what a correct answer looks like), and the _risk surface_ (edge cases, adversarial inputs, failure-handling expectations). No AI cost — it parses, classifies, and templates. Where the buyer gives examples, they become grounded few-shot anchors so generated cases match the real distribution. Shared by all four products.
2. **Case/assertion generator** — the BYOK AI step that fills the product's Output Contract: it generates **test cases** (inputs across the elicited input space, including edge/adversarial cases) and, for each, **assertions** — checks that don't require us to run the buyer's agent. Assertions are typed and tiered (see "How the harness scores" below). Static facts from the elicitor are passed in as grounding so the model writes cases for _their_ system, never generic ones.
3. **Harness/artifact emitter** — turns generated cases + assertions into the deliverable: a runnable test file (`prompt-eval-suite`, `regression-guard`), a labeled dataset file (`golden-dataset-generator`), or a rendered scorecard (`grade-my-agent`). Emitters reuse the spine's `report.ts` (doc 04, screen/PDF/zip) and a shared **harness templater** that writes framework-specific scaffolding around the generated cases.

> **Determinism rule for this segment:** the _structure_ of a suite (which dimensions, how many cases per bucket, the assertion tiers, the scoring formula) is deterministic and template-driven; the AI's job is _generating the specific cases, assertions, labels, and prose_ grounded in the elicited spec. The generated harness is itself deterministic code — same input distribution scored the same way every run. (Enforced by the `format_valid` eval judge — generated test files must parse, import, and run; doc 05 §7.)

## How the harness scores without us running the buyer's agent (the segment-wide hard problem)

We generate test artifacts; **the buyer runs them against their own system-under-test (SUT).** The generated harness therefore cannot assume access to the agent — it must score using assertions the buyer can run locally. Three assertion tiers, declared per case, applied across the segment:

1. **Deterministic assertions (no LLM, no key needed at run-time):** exact match, regex, JSON-schema validity, must-contain / must-not-contain substrings, numeric ranges, length bounds, latency budgets, "valid JSON" / "valid tool-call shape." These run free in the buyer's CI with zero inference cost. The bulk of every generated suite is this tier — it's what makes the artifact cheap to run and impossible to flake on a vendor.
2. **LLM-as-judge assertions (buyer's own key, declared, opt-in):** for properties that need semantic grading (faithfulness, tone, "did it refuse appropriately"), the generated harness ships a judge scaffold the buyer points at _their_ key. We generate the judge rubric and the wiring; the buyer chooses whether to enable it and pays for its inference. Clearly labeled as the only tier that costs at run-time.
3. **Buyer-supplied SUT adapter (the seam):** every harness defines one function the buyer fills — `runAgent(input) => output` (or a fixture file of pre-collected outputs for offline scoring). We never call it; we generate everything _around_ it. This single seam is what lets a generated artifact test a system we never touch.

> **The boundary stated plainly:** our BYOK run pays once, to _generate_ the suite (a single bounded structured generation). It does **not** execute the buyer's agent or pay for the buyer's test runs. The artifact is self-contained code/data the buyer owns and runs on their own terms. Every PRD's §5/§7/§8 restate this so no agent confuses "generate an eval suite" with "run an eval loop."

## Which test frameworks we emit

`OPEN QUESTION:` the harness's default emit target. Lead recommendation: **Vitest** (the store's own test runner, doc 05; lowest-friction for the JS/TS builders who are the core buyer) as the default, plus a **framework-agnostic plain-Node runner** (`node --test` / a zero-dep `run.mjs`) so a buyer on any stack can run the suite without adopting Vitest. The Output Contract is **framework-neutral** — cases + assertions as data — and the emitter renders that data into the chosen target; supporting Pytest or a Promptfoo-style YAML export later is purely a new emitter over the same contract. Each PRD declares its emit targets in §6 and offers the choice in the tool UI. Resolve the default + which targets ship in v1 before building `prompt-eval-suite`.

## Eat our own dog food

The store already runs eval golden-sets on every product (doc 05 §7) using exactly the `input_specific` / `no_ai_tells` / `factual` / `format_valid` judges this segment productizes. The first golden-set fixtures for `prompt-eval-suite` and `grade-my-agent` are **our own store prompts** (Agent-Ready Kit's generation prompt, the Segment-3 reasoner prompt) — we know their intended behavior and failure modes exactly, so they're ideal regression fixtures and a credibility proof for the sales page ("here's our eval generator run against the prompts that power this store"). Track as a launch task.
