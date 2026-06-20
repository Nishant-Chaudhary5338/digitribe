# 02 · PRD Template

> **Copy this file** to start any product PRD. Fill every section. If a section truly doesn't apply, write `N/A — <reason>`; never delete a heading (agents rely on stable structure).
>
> **Anti-hallucination rules for the author (human or agent):**
>
> - Reference the spine; don't restate it. Write "auth: platform-spec §4," not a re-explanation.
> - The **Output Contract (§6)** is mandatory and exact — real Zod, not prose. This is the section that prevents "the model returned everything."
> - Unknowns are marked `OPEN QUESTION:` — never guessed.
> - Every claim about the stack/models must trace to the codebase or `01-platform-spec.md`. No invented APIs or model IDs.
> - Keep code blocks runnable-shaped (correct imports, types), even if illustrative.
> - **Quality is not optional.** §6, §9, §11, §16, §18 must satisfy [`03-experience-and-design.md`](./03-experience-and-design.md) — the artifact must be advanced, input-specific, beautifully presented, and the run must be progressive/interactive. A schema-valid-but-generic output FAILS review. Embed the §6 Showcase Checklist from doc 03 into your Phase 3 acceptance criteria.

---

## `<Product Name>` — PRD

**Slug:** `<kebab-case>` · **Segment:** `<n>` · **Status:** draft | beta | live
**Owner:** `<founder>` · **Last updated:** `<date>` · **Spine version:** platform-spec §all

---

### 1. TL;DR

- **One-liner:** `<what it does in one sentence>`
- **Problem:** `<the painful, specific problem>`
- **Buyer:** `<who pays, in one phrase>`
- **Input → Output:** `<X> → <one locked artifact>`
- **Price:** `$<n>` (Polar product `<id>`) · **Model:** BYOK-finite · **Providers:** `<anthropic|openai|google>`
- **Est. run time:** `<seconds>` · **Re-run quota:** `<N>`

### 2. Problem & market

- The problem, concretely (what the buyer does today and why it hurts).
- Why it's rare / who competes — name them honestly; state our differentiation.
- The killer stat or trend that creates urgency (cite source).
- How it fits Digitribe's edge (why _we_ can credibly sell this).

### 3. Pricing & packaging

- Price, and the reasoning (anchor, willingness-to-pay).
- What one purchase includes (runs, artifact, email copy, re-run window).
- Upsell / cross-sell path (which product or agency service this leads to).
- Future tiers (note only; v1 ships one SKU).

### 4. User stories / Jobs-to-be-done

- `As a <buyer>, when <situation>, I want <capability>, so that <outcome>.` (3–6 of these.)
- The **primary job** the artifact must nail.
- Explicit non-goals (what this product deliberately does NOT do).

### 5. Functional requirements

- **Inputs** — every field, type, validation, example. (Becomes the Zod `inputSchema`.)
- **Processing** — what happens between input and output, at requirements level (the detailed pipeline is §7).
- **Outputs** — what the buyer receives, at requirements level (the exact shape is §6).
- **Constraints** — limits (max URL depth, file size, row count, etc.) and why.

### 6. ⭐ Output Contract (mandatory, exact)

> The locked schema the AI step is forced to fill (`runStructured`, platform-spec §5). Same shape every run.

```ts
// server/store/schemas/<slug>.ts
import { z } from "zod";

export const <Slug>Output = z.object({
  // … exact fields, enums, ranges, descriptions …
});
export type <Slug>Output = z.infer<typeof <Slug>Output>;
```

- **Export formats:** on-screen (React) · PDF · JSON · `<file bundle/zip if any>`.
- **Field notes:** any field that needs explanation (scoring scale, severity enum meaning).
- **Determinism:** which fields must be stable/graded vs. generative prose.

### 7. System logic / pipeline

- Step-by-step pipeline `(input, ai, emit) => OutputContract`.
- A flow diagram (ASCII) of the phases, with the SSE progress events emitted at each.
- Where AI is called, with which `effort`, and what each call returns.
- Any non-AI work (crawling, parsing, signing, AST analysis) and the library used.
- Reuse note: which existing code/agent/skill this leverages (e.g. `mcp-toolkit/legacy-analyzer`).

### 8. BYOK handling

- Which providers/models (default + cheaper option), referencing platform-spec §5.
- Any product-specific key concerns (scopes, rate, cost the buyer should expect for one run).
- The pre-run validation ping for this product.

### 9. AI / prompt design

- **System prompt** (the real text, or a faithful draft).
- **User prompt template** (with input interpolation).
- Model + `effort` per call; why.
- How structured output is enforced (always: AI SDK `generateObject` + the §6 schema).
- Guardrails: how we keep the model on-contract; refusal/empty handling.

### 10. Edge cases & failure modes

> Table form. Every row is also a test in §18.

| #   | Trigger                     | Detection          | Behavior / user message                | Quota?    |
| --- | --------------------------- | ------------------ | -------------------------------------- | --------- |
| 1   | Invalid/expired BYOK key    | pre-run ping fails | "Your `<provider>` key looks invalid…" | not spent |
| 2   | Input unreachable/oversized | validation         | clear field error                      | not spent |
| …   | …                           | …                  | …                                      | …         |

Include: provider rate-limit/timeouts, partial results, the AI returning low-confidence, abusive input, network failure mid-run, duplicate submit (idempotency, platform-spec §6).

### 11. UX / UI flow

- Screen-by-screen: sales page → checkout → success → tool UI → artifact.
- **Every state** of the tool UI: empty · collecting input · validating key · running (live progress) · partial · success · error · quota-exhausted.
- Key components (reuse repo primitives). Copy tone per `PROJECT_VISION.md`.
- The artifact view: layout, what's above the fold, the download/email actions.

### 12. SEO

- Target keyword(s) + search intent.
- `generateMetadata`: title (≤60), description (≤155), canonical, OG (via `@vercel/og`).
- JSON-LD (`schema-dts`): `Product` + `Offer` + `FAQPage` + `BreadcrumbList` — list the actual FAQs.
- Internal links in/out (marketing pages, blog, sibling products).
- Any programmatic-SEO surface (e.g. example reports as indexable pages) — note if applicable.

### 13. Usability & accessibility

- WCAG 2.1 AA specifics for this UI (labels, `aria-live` on progress, focus order, color contrast).
- Mobile behavior.
- Error-recovery affordances (retry, re-enter key, contact).

### 14. Payment integration

- Polar product/price to create; what metadata the checkout carries (`slug`).
- Anything product-specific beyond platform-spec §9 (usually nothing — reference it).
- Refund stance for this product.

### 15. Security & privacy

- What buyer data is handled (URL, file, repo, content) and its retention.
- Product-specific risks (e.g. SSRF on URL crawl, untrusted file parsing, code execution) + mitigations.
- Reference platform-spec §10 for the shared rules; list only the deltas here.

### 16. Analytics & success metrics

- The standard events (platform-spec §13) + any product-specific event.
- The activation definition for this product.
- Targets: activation rate, refund rate, run-error rate.

### 17. Development phases

> Vertical slices, each shippable/testable. Each phase lists acceptance criteria.

- **Phase 0 — Scaffold:** registry entry, Polar product (sandbox), routes, empty schema. _AC: buy in sandbox → token → blank tool UI loads._
- **Phase 1 — Pipeline core:** input schema + output contract + pipeline with mocked AI. _AC: fixture input → schema-valid artifact in a unit test._
- **Phase 2 — Real run + UI:** BYOK wired, live AI, all UI states, artifact render + PDF + email. _AC: E2E activation path green in sandbox._
- **Phase 3 — SEO + polish:** sales page, metadata, JSON-LD, OG, a11y pass, analytics. _AC: Lighthouse/axe pass; events fire._
- **Phase 4 — Launch:** live Polar product, monitoring, refund flow verified. _AC: Definition of Done (platform-spec §15) all checked._

### 18. Testing strategy

- Map each §10 edge case → a test.
- Unit (pipeline w/ mocked AI), schema (contract rejects bad output), integration (runner/webhook via MSW), E2E (Playwright activation + a11y), eval (if AI quality is the value — golden set + scoring).
- The single most important test: **fixture input → valid Output Contract.**

### 19. Dependencies & platform integration

- What this pulls from the spine (auth §4, BYOK §5, runner §6, report §8, payments §9).
- New libraries to add (with reason) — keep minimal.
- Any cross-product reuse (shared pipeline, shared schema fragment).

### 20. Open questions & risks

- `OPEN QUESTION:` items needing a decision before/within build.
- Risks (technical, legal, cost-to-buyer, quality) + mitigation or owner.
- Explicitly: anything that could make the artifact low-quality, and how we guard it.
