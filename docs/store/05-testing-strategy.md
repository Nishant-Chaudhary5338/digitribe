# 05 · Testing Strategy

> **How every product and the spine are tested — concretely enough to execute.** Defines fixtures, the canonical mocks, the scenario matrix, E2E with Polar sandbox, the eval format for AI quality, and CI gates. A product PRD's §18 references this and lists only its product-specific cases.
>
> Stack: **Vitest** (unit/integration), **Playwright** + `@axe-core/playwright` (E2E/a11y) — both already in the repo. Principle: **test behaviour, mock only at boundaries** (AI SDK, Polar, KV, network) — never internal modules.

---

## 1. Test layout (canonical)

```
tests/
  store/
    unit/         <module>.test.ts        # spine modules + product pipelines
    integration/  <flow>.test.ts          # runner, webhook (MSW)
    e2e/          <product>.spec.ts        # Playwright, against sandbox
    evals/        <product>.eval.ts        # AI-quality golden-set runs
    fixtures/
      sites/<name>/                        # HTML fixture sites for crawlers
      digests/<name>.json                  # frozen crawl digests
      ai/<slug>.<case>.json                # frozen AI responses (Output Contracts)
      polar/order-paid.json, refund.json   # webhook payloads
      keys.ts                              # TEST_KEYS (from env, gitignored)
    helpers/
      mockAi.ts, mockKv.ts, mockPolar.ts, factory.ts
```

The single most important test for any product: **fixture input → `ProductPipeline` (AI mocked) → a schema-valid Output Contract.** If that passes, the product's core is correct.

## 2. Canonical mocks (use these — don't invent per test)

### 2.1 AI runner mock (`mockAi.ts`)

Every pipeline takes an injected `AiRunner` (doc 04 §7), so tests pass a mock — **no network, deterministic.**

```ts
export function mockAi(responses: Record<string, unknown>): AiRunner {
  return {
    structured: async ({ schema }) => schema.parse(responses.structured), // throws if fixture violates contract — good
    structuredStream: async ({ schema, onPartial }) => {
      onPartial({})
      const v = schema.parse(responses.structured)
      onPartial(v)
      return v
    },
    ping: async () => responses.ping ?? true,
  }
}
// To simulate failures: ping:false, or make structured throw new StoreErr({code:"PROVIDER_TIMEOUT",...}).
```

- **Live-AI smoke test** (separate, not in CI default): one test per provider that runs `makeAiRunner` against a real `TEST_KEYS` key and asserts the contract parses. Tagged `@live`, run manually / nightly. Guards real provider drift.

### 2.2 KV mock (`mockKv.ts`)

In-memory Map implementing the `kv.ts` interface (get/set/ttl/setnx/incr). Reset per test.

### 2.3 Polar mock (`mockPolar.ts`) + MSW

- `verifyWebhook` test: feed `fixtures/polar/order-paid.json` with a correctly-computed signature → asserts Purchase+token; tamper signature → 400.
- Checkout: stub `createCheckout` to return a fake URL.

### 2.4 Network/crawler mock

MSW intercepts outbound fetches; the crawler is pointed at `fixtures/sites/<name>/` served locally, so crawl tests are hermetic and cover robots/sitemap/JS-only variants.

## 3. The scenario matrix (the "various scenarios" coverage)

Every AI product must cover this matrix. Rows are tests; cells note expected outcome. (Agent-Ready Kit shown; clone per product.)

| Input \ Failure   | happy path                      | KEY_INVALID              | PROVIDER_TIMEOUT           | refusal/empty          | RATE_LIMITED |
| ----------------- | ------------------------------- | ------------------------ | -------------------------- | ---------------------- | ------------ |
| valid site        | ✅ artifact, quota−1            | error, quota intact      | retry→fail: quota restored | retry once→fail: error | 429 surfaced |
| unreachable URL   | INPUT_UNREACHABLE, quota intact | (n/a — fails before key) | —                          | —                      | —            |
| private/IP (SSRF) | INPUT_BLOCKED at validate       | —                        | —                          | —                      | —            |
| JS-only site      | ✅ but crawlability=missing     | —                        | —                          | —                      | —            |
| huge site (>cap)  | ✅ sampled, accurate count      | —                        | —                          | —                      | —            |
| empty/thin site   | ✅ honest low score             | —                        | —                          | —                      | —            |

Plus cross-cutting rows tested once in the spine (not per product): **duplicate runId** (idempotent), **quota exhausted** (402), **token expired/invalid** (403), **concurrent run** (friendly block), **rate-limited** (429).

Provider axis: run the happy-path pipeline test against `anthropic | openai | google` mock responses to ensure provider-agnostic handling.

## 4. Unit & schema tests (per product)

- **Pipeline:** matrix §3 rows via `mockAi` + crawler/network mocks.
- **Output Contract:** feed a deliberately malformed object → `schema.parse` throws (proves the contract actually constrains). Feed the frozen good fixture → parses + matches snapshot of the rendered report.
- **Input schema:** rejects bad URL/file/oversize; accepts valid.
- **SSRF guard:** unit table of blocked hosts (localhost, 127.0.0.1, 169.254.169.254, 10./192.168., `file:`, redirect-to-private) → all `INPUT_BLOCKED`.

## 5. Integration tests (spine, MSW)

- **Runner:** token verify → input validate → key ping → pipeline → persist → quota−1 → artifact retrievable; failure path restores quota; idempotency via repeated `runId`.
- **Webhook:** `order.paid` mints token + Purchase; `refund` revokes; bad signature 400; duplicate order ignored.
- **Artifact route:** json/pdf/zip return; missing → 404; without token → 403.

## 6. E2E (Playwright + Polar sandbox)

- **Env:** `POLAR_MODE=sandbox`; Polar **test card** (e.g. `4242 4242 4242 4242`, any future expiry/CVC — confirm in Polar sandbox docs). A `TEST_KEYS.anthropic` env key for the run step.
- **Activation flow (the must-pass):** open sales page → Buy → Polar sandbox checkout → success → tool UI → select provider + paste test key → key validates → Run → live progress visible → artifact (grade/score) renders → download ZIP → ZIP contains the expected files.
- **State coverage:** force an error (bad key) → error state + input preserved + retry works. Exhaust quota → quota state + buy CTA.
- **A11y:** `@axe-core/playwright` on storefront, sales page, tool UI (each state), artifact view → **zero serious/critical violations** (gate).
- **Visual (optional):** Playwright screenshot snapshots of the artifact view to catch beautification regressions.

## 7. Evals (AI output quality — doc 03 §2 enforcement)

Schema-valid ≠ good. Evals guard the quality bar and catch prompt regressions.

- **Golden set:** `tests/store/evals/fixtures/<slug>.golden.json` — ~8–12 real inputs with expected properties (e.g. for Agent-Ready Kit: expected grade band, dimensions that must be flagged, entities that must appear).
- **Judges (LLM-as-judge, run on a maintainer key):**
  1. **Input-specific?** — "Could this artifact belong to a different input? If yes → FAIL." (kills generic output, doc 03 §2.1)
  2. **No AI-tells?** — scan for banned filler/hedging/preambles (doc 03 §2.5). Regex pre-filter + judge.
  3. **Factual?** — every fact/URL/number in the artifact must trace to the input (no fabrication).
  4. **Format/contract sanity** — generated files are valid (e.g. `llms.txt` parses, JSON-LD validates, `mcp.json` is valid JSON).
- **Scoring:** each input scored 0–1 per judge; product ships only if mean ≥ threshold (default **0.85**) and zero fabrication failures.
- **When run:** on any change to a product's prompt or Output Contract (pre-merge, tagged `@eval`, may use real key + cost a few cents). Not on every CI run.
- **Format of an eval file:**

```ts
export default defineEval({
  slug: 'agent-ready-kit',
  cases: [
    {
      name,
      input,
      expect: { gradeBand: ['B', 'A'], mustFlag: ['transaction_layer'], mustMention: ['<entity>'] },
    },
  ],
  judges: ['input_specific', 'no_ai_tells', 'factual', 'format_valid'],
  threshold: 0.85,
})
```

## 8. CI gates (what blocks a merge)

- `pnpm typecheck` clean (note: the repo's corepack/pnpm shim is currently broken on Node 20.19.4 — fix the toolchain so the gate runs; tracked separately).
- Vitest unit + integration green; **coverage ≥ 80%** on `lib/store/*` and `server/store/tools/*`.
- Playwright activation flow + a11y green (sandbox) for any touched product.
- Lint/prettier clean (`husky` + `lint-staged` already in repo).
- **Not** in default CI (cost/flake): `@live` AI smoke + `@eval` golden runs — run nightly and pre-launch.

## 9. Definition of Done — testing slice (per product)

- [ ] Pipeline test: fixture → valid Output Contract (mocked AI).
- [ ] Output/input schema rejection tests.
- [ ] Full scenario matrix (§3) covered.
- [ ] SSRF/untrusted-input guards tested (if it takes a URL/file).
- [ ] E2E activation flow green in sandbox.
- [ ] All 8 UI states have a test (incl. a11y).
- [ ] Eval golden set ≥ threshold, zero fabrication.
- [ ] Analytics events asserted to fire.
