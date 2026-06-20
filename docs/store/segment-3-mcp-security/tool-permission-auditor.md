# Tool-Permission Auditor — PRD

**Slug:** `tool-permission-auditor` · **Segment:** 3 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Composes the Segment-3 spine (segment [`README.md`](./README.md)). The **cheap, narrow, mostly-deterministic** entry point: paste a tool config → get a least-privilege analysis. The static rule engine does the work; AI only writes the rationale. The $29 curiosity buy that funnels to the flagship scan.

---

## 1. TL;DR

- **One-liner:** Paste your MCP/agent tool config → get a least-privilege audit: which scopes are too broad, the minimal set, and why.
- **Problem:** Agent and MCP tools accrue over-broad scopes ("give it `*` to be safe"), and over-privilege is the quiet enabler behind half the MCP threat classes — but nobody checks it, because there's no instant tool that does.
- **Buyer:** developers running an MCP server or agent who want a quick least-privilege gut-check without a full security engagement.
- **Input → Output:** a tool config (JSON) → a **Least-Privilege Report** — per-tool over-privilege flags, the minimal recommended permissions, and the rationale.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-haiku-4-5`), `openai`, `google`.
- **Est. run time:** ~15–40s (mostly deterministic) · **Re-run quota:** 3.

## 2. Problem & market

**Today** scopes are set once, broadly, and never revisited — an agent's filesystem tool gets `read+write` on the whole disk, a database tool gets full CRUD when it only ever reads, a network tool gets unrestricted egress. **Over-privilege is the force-multiplier behind the MCP threat model**: a prompt-injected or confused-deputy'd tool can only do as much damage as its scope allows, so a tool that's broader than its job turns a small bug into a breach. Yet least-privilege review is tedious manual work nobody prioritizes, and there's no instant tool that reads a config and tells you what to trim. With MCP shipping no auth/scoping conventions of its own and a CVE every ~4 days, the cheap win — tightening scopes — goes undone.

**Competition:** cloud IAM has least-privilege analyzers, but nothing equivalent for **MCP/agent tool configs**; generic linters don't understand tool scopes. **Gap:** an instant, $29, paste-a-config least-privilege audit specific to agent tooling. That's us, and it's mostly deterministic — exactly the kind of static-config analysis the founders' `dep-auditor`/`typescript-enforcer` already do.

**Urgency stat:** over-privilege underpins the most common MCP exploit chains; 40+ MCP CVEs in 2026 (~one every four days). The cheapest mitigation is the least-done. (Citations in segment README / `../research-sources.md`.)

**Why Digitribe:** static config analysis with a least-privilege model is squarely our static-analysis wheelhouse; the AI is just there to explain _why_ in plain language. Low cost to us (one cheap model call), low price to the buyer, high funnel value.

## 3. Pricing & packaging

- **$29**, one-time — the segment's cheapest, deliberately. It's the curiosity entry: narrow scope, fast, mostly deterministic, low buyer key-cost.
- **Includes:** 1 run (3 re-runs in quota to re-audit after tightening), the report (on-screen + branded PDF + JSON + a `least-privilege.json` machine-readable export), emailed copy (Resend).
- **Upsell path:** the report's "this is one dimension — get the full picture" → **Scan my MCP server** ($39 full report) and **MCP Hardening Kit** ($49, generates the scoped middleware that enforces these recommendations). Agency CTA for "review our whole agent fleet."
- **Future tiers (note only):** auditing a whole multi-server config / CI integration is a v2 idea; v1 is one SKU.

## 4. User stories / JTBD

- As an **MCP server author**, when I set scopes broadly to ship fast, I want to know which I can safely trim, so that a compromised tool can't pivot.
- As an **agent developer**, when I'm not sure my tools follow least privilege, I want a quick config audit, so that I close the cheapest security gap first.
- As a **reviewer**, when a teammate's PR adds a tool with broad scope, I want a fast second opinion + rationale, so that I can push back with specifics.
- As a **builder on a budget**, when a full scan feels like more than I need, I want a cheap, focused least-privilege check, so that I get value without overbuying.

**Primary job the artifact must nail:** for _this_ config, flag the genuinely over-broad scopes, state the **minimal** replacement set per tool, and give a credible reason — specific to the tool's declared purpose, not a generic "use least privilege" platitude.

**Non-goals (v1):** does NOT connect to a live server (config-only); does NOT cover the full MCP threat model (only over-privilege/least-privilege — point to `scan-my-mcp` for the rest); does NOT generate enforcement code (that's the Hardening Kit); does NOT audit runtime behavior, only the declared config.

## 5. Functional requirements

### Inputs

| Field           | Type                                      | Validation                                                                                                              | Example                                      |
| --------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `config`        | object (JSON)                             | required; a parseable MCP/agent tool config — array of tools with names, descriptions, and declared scopes/capabilities | `{ tools: [{ name, description, scopes }] }` |
| `configFormat`  | enum `mcp` \| `openai-tools` \| `generic` | which schema shape the config follows (drives the parser)                                                               | `mcp`                                        |
| `serverContext` | string (optional, ≤500 chars)             | free text ("read-only reporting agent", "needs write for tickets") — helps justify what's legitimately broad            | "read-only analytics agent"                  |
| `provider`      | enum                                      | one of product's `byokProviders`                                                                                        | `anthropic`                                  |
| `byokKey`       | string (secret)                           | non-empty; validated live pre-run (platform-spec §5)                                                                    | `sk-…`                                       |

> Max 60 tools per config; config paste capped at 256 KB.

### Processing (requirements level; pipeline in §7)

Parse the config into the shared `Manifest` shape → run the **deterministic least-privilege engine**: classify each tool's purpose from its name/description, compare declared scopes against the minimal set its purpose implies, flag the deltas → AI writes a plain-language rationale per flagged tool, filling the Output Contract → render report + PDF + JSON + email.

### Outputs

The **Least-Privilege Report**: an over-privilege score, per-tool current-vs-minimal scope diffs with severity, and a rationale for each. Exact shape in §6.

### Constraints

- Config-only — no network, no live connection (no SSRF surface).
- The minimal-scope recommendation is **deterministic** (the engine computes it); AI supplies only the human rationale. This keeps the core reproducible and cheap.
- Report JSON in KV; the small zip (report + `least-privilege.json`) in Vercel Blob.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/tool-permission-auditor.ts
import { z } from 'zod'

const Severity = z.enum(['critical', 'high', 'medium', 'low', 'info'])

const ScopeFinding = z.object({
  tool: z.string(), // the config's real tool name
  inferredPurpose: z.string().max(160), // what the engine thinks the tool is for (from name/description)
  privilege: z.enum(['read', 'write', 'exec', 'network', 'mixed']),
  declaredScopes: z.array(z.string()).max(30), // what the config grants today
  minimalScopes: z.array(z.string()).max(30), // the deterministic least-privilege recommendation
  overBroad: z.array(z.string()).max(30), // declared − minimal: the scopes to drop
  severity: Severity, // weighted by how dangerous the over-broad scope is (write/exec > read)
  rationale: z.string().max(500), // AI: why these are over-broad for THIS tool's purpose
  confidence: z.enum(['confirmed', 'likely', 'possible']), // 'confirmed' = deterministic delta
})

export const ToolPermissionOutput = z.object({
  source: z.object({
    configFormat: z.string(),
    toolCount: z.number().int(),
    scopedToolCount: z.number().int(), // tools that declare any scopes
  }),
  overPrivilegeScore: z.number().int().min(0).max(100), // deterministic; 100 = perfectly least-privileged
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  headline: z.string().max(200), // answer-first: "3 of 7 tools are over-privileged; dropping 5 scopes closes it"
  findings: z.array(ScopeFinding), // one per tool (clean tools included, with empty overBroad)
  topActions: z.array(z.string()).min(1).max(5), // the highest-leverage scopes to drop first
  cleanTools: z.array(z.string()).max(60), // tools already at least-privilege (positive signal)
  upsell: z.object({
    needsFullScan: z.boolean(), // → Scan my MCP server (full threat model)
    needsHardening: z.boolean(), // → MCP Hardening Kit (generate the enforcement)
    reason: z.string().max(280),
  }),
})
export type ToolPermissionOutput = z.infer<typeof ToolPermissionOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded scope-diff report, platform-spec §8) · **JSON** (the raw contract) · **ZIP** (report PDF + `least-privilege.json` machine-readable + a `RECOMMENDATIONS.md`).
- **Field notes:**
  - `overPrivilegeScore`/`grade` are **deterministic**: derived in code from the count + severity of over-broad scopes (e.g. start 100, subtract per over-broad scope weighted by privilege class), grade A ≥90 … F <40. The model never sets the score.
  - `inferredPurpose`, `minimalScopes`, `overBroad`, `severity`, `confidence` are produced by the **deterministic engine** (`confidence:"confirmed"` for the scope delta); only `rationale`, `headline`, `topActions` prose are AI-generated. This is the most deterministic product in the segment — by design.
- **Determinism:** every tool in the input appears exactly once in `findings` (clean tools too, with empty `overBroad`), so the report layout and the diff viz are guaranteed.

## 7. System logic / pipeline

```
POST /api/store/run/tool-permission-auditor  { token, byokKey, input }
  │
  ├─ [verify] token + quota                                  emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping                           emit{phase:"key",pct:12}
  │
  ├─ PARSE  parseConfig(config, configFormat)                emit{phase:"analyze",pct:15..35,
  │     - normalize into the shared Manifest shape (reused      message:"Parsing 7 tools…"}
  │       from scan-my-mcp): tools[] with names, descriptions,
  │       declared scopes/capabilities
  │     → Manifest
  │
  ├─ AUDIT  leastPrivilege(Manifest)  (DETERMINISTIC)        emit{phase:"analyze",pct:35..60,
  │     for each tool:                                          message:"Computing minimal scopes…",
  │       - classify purpose + privilege from name/description   findingCount: grows}
  │         against a scope-knowledge map (read/write/exec/net)
  │       - compute minimalScopes its purpose implies
  │       - overBroad = declaredScopes − minimalScopes
  │       - severity from the privilege class of the over-broad
  │         scopes (drop a write/exec scope > drop a read scope)
  │       - confidence:"confirmed" (it's a set delta)
  │     - overPrivilegeScore = computeScore(findings)  (in code)
  │     → ScopeFinding[] (no rationale yet)
  │
  ├─ EXPLAIN  runStructured({                                emit{phase:"generate",pct:62..90,
  │     provider, apiKey, model: "claude-haiku-4-5" (cheap),    message:"Writing rationale…"}
  │     system: PERMISSION_SYSTEM,          // §9
  │     prompt: buildPrompt(findings, serverContext),
  │     schema: ToolPermissionOutput,       // §6 — SDK-enforced
  │     effort: "medium",
  │   })  → ToolPermissionOutput
  │     - model fills ONLY rationale/headline/topActions over the
  │       deterministic findings; it MUST NOT change scopes/scores —
  │       those are passed through. It explains, it doesn't decide.
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:95}
  │     - on-screen, PDF(scope diffs), zip(report + least-privilege.json + RECOMMENDATIONS.md) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **The audit is deterministic Node** — purpose classification, minimal-scope computation, the over-broad delta, severity, and the score all run without AI. This is the segment's **most deterministic** product (cheaper, faster, fully reproducible). **AI is one cheap call** (`claude-haiku-4-5`, `effort:"medium"`) that only writes the human rationale over the already-computed findings — it cannot alter a scope or the score.
- **Libraries:** the shared `Manifest` parser + the least-privilege scope-diff helper from the segment spine (the same helper `mcp-hardening-kit` uses for its `scopeChanges`). No new runtime libs.
- **Reuse:** the `parseConfig`→`Manifest` step and the scope-diff math are **shared with `scan-my-mcp` (config/source mode) and `mcp-hardening-kit` (`scopeChanges`)** — this product is essentially the scope-subset of the flagship's engine, surfaced standalone and cheap. Build the helper generic in `server/store/tools/mcp/`.

## 8. BYOK handling

- Providers: `anthropic` (default **`claude-haiku-4-5`** — the rationale is short and the audit is deterministic, so the cheaper/faster model is the right default here, unlike the rest of the segment), `openai`, `google`. Opus offered as an "upgrade for richer rationale" option. Per platform-spec §5 (this PRD overrides the segment's Opus-default for the rationale step, reason: deterministic core + short prose ⇒ Haiku is sufficient and keeps buyer cost minimal).
- **Buyer cost expectation** (show in UI): one short Haiku call over the findings → typically **a few cents on the buyer's key**, the cheapest run in the store. Show it as a selling point.
- **Pre-run validation:** 1-token ping; failure → edge #1, no quota spent.

## 9. AI / prompt design

**Model:** default `claude-haiku-4-5`, `effort:"medium"`. Structured output enforced by AI SDK `generateObject` against `ToolPermissionOutput`. The model fills _only_ the prose fields (`rationale`, `headline`, `topActions`); the deterministic fields are passed through and must be echoed unchanged.

**System prompt (draft):**

```
You are a security engineer explaining least-privilege findings for AI-agent and
MCP tool configurations. A deterministic engine has ALREADY computed, per tool:
its inferred purpose, declared scopes, the minimal scopes its purpose needs, and
which declared scopes are over-broad. Your ONLY job is to explain, clearly and
specifically, WHY each over-broad scope is unnecessary for that tool's purpose,
and to write the headline + top actions. Rules:
- Do NOT change any scope, minimalScopes, overBroad list, severity, or score.
  Echo the engine's findings exactly; only add rationale/headline/topActions.
- Each rationale must be specific to the tool's stated purpose ("a read-only
  reporting tool has no need for `write:db`"), not a generic least-privilege
  lecture.
- Respect serverContext: if the owner says a tool legitimately needs a broad
  scope, acknowledge it in the rationale rather than insisting blindly.
- topActions: the highest-leverage scopes to drop first (write/exec before read).
- No filler, no hedging, no restating the prompt. Senior, plain, specific.
```

**User prompt template:** `buildPrompt(findings, serverContext)` → serializes the deterministic `ScopeFinding[]` (tools, purposes, declared/minimal/over-broad scopes, severities) + the optional `serverContext`. Buyer free-text delimited as data.

**Guardrails:** the deterministic engine owns every security-relevant number; the model is boxed to prose, so it **cannot fabricate a finding or inflate a grade** — the strongest anti-hallucination posture in the segment (doc 03 §2.5 / doc 05 §7). Schema enforcement + "echo findings unchanged" prevents drift. Refusal/empty handling per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                         | Detection                                | Behavior / message                                                                                                                    | Quota     |
| --- | ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Invalid/expired BYOK key                        | pre-run ping fails                       | "Your `<provider>` key looks invalid or expired — check and retry."                                                                   | not spent |
| 2   | Malformed / unparseable config                  | parse + schema                           | inline error: "This doesn't parse as a `<format>` tool config — check the JSON."                                                      | not spent |
| 3   | Config declares no scopes at all                | `scopedToolCount === 0`                  | deliver an honest report: "No scopes declared — we can't assess least-privilege; declare scopes first" + note                         | spent     |
| 4   | Tool count exceeds cap (>60)                    | input validation                         | "We audit up to 60 tools per run — split the config."                                                                                 | not spent |
| 5   | All tools already least-privileged              | no over-broad deltas                     | deliver a clean "grade A — nothing to trim" report; positive `cleanTools`; not padded with fake issues                                | spent     |
| 6   | Ambiguous tool purpose (sparse description)     | classifier low confidence                | mark that finding `confidence:"likely"`/`"possible"`; rationale notes the assumption                                                  | spent     |
| 7   | Model alters a scope/score (contract violation) | post-gen check: echoed fields ≠ engine's | discard model's tampered fields, re-apply the deterministic values; log a warn                                                        | spent     |
| 8   | Provider rate-limit / timeout mid-explain       | AI wrapper error                         | retry once; if still failing, **deliver the deterministic report without rationale** (degraded but valid) + note, OR refund — see §20 | see §20   |
| 9   | Duplicate submit (double-click)                 | same `runId` (idempotency §6)            | return in-flight/cached result; never double-charge                                                                                   | n/a       |
| 10  | Quota exhausted                                 | token check                              | "You've used all 3 runs — buy again or contact us." + buy CTA                                                                         | n/a       |

## 11. UX / UI flow

**Sales page** (`/store/tool-permission-auditor`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** a large **config paste area** (JSON) with a `configFormat` select (MCP / OpenAI-tools / generic) + inline "paste your tool config" help and a sample; optional `serverContext`. Provider select + `KeyInput` (defaulting to the cheap model with a "fast & cheap" note). **Run** disabled until config parses + valid key.
- **Validating key:** inline ✓/✗.
- **Running:** live SSE progress (fast — it's mostly deterministic): "Parsing 7 tools…", "Computing minimal scopes… 3 over-privileged so far", "Writing rationale…". Progress bar + a "why least privilege?" tip. `aria-live="polite"`.
- **Partial:** AI rationale degraded (edge #8) → non-blocking banner; the deterministic report still shows.
- **Success / artifact view:**
  - Top: **over-privilege grade + score** (`ScoreRing`) + `headline` (answer-first: "3 of 7 tools over-privileged; dropping 5 scopes closes it").
  - **Per-tool scope diffs** (`StatBar`/diff list): each tool's `declaredScopes` → `minimalScopes` with the `overBroad` ones struck/highlighted, a `SeverityChip`, and the `rationale`. Clean tools shown collapsed as a positive signal (`cleanTools`).
  - **Top actions** (scopes to drop first).
  - **Downloads:** **ZIP** (report + `least-privilege.json` + `RECOMMENDATIONS.md`) primary, **PDF**, **JSON**, **Email me a copy** (pre-checked).
  - **Upsell cards** via `upsell.*`: Scan my MCP server (full threat model) / MCP Hardening Kit (generate the enforcement) + agency CTA.
- **Error:** clear message per §10 + retry; never lose the pasted config.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `SeverityChip`, `StatBar` ([`../06-ui-kit.md`](../06-ui-kit.md) §2). New component: `components/store/artifacts/tool-permission-auditor.tsx` (the grade + per-tool scope-diff body). States per `06-ui-kit.md` §4; tokens §1. Copy tone per `PROJECT_VISION.md`.

## 12. SEO

- **Target keyword(s):** "MCP tool least privilege" / "agent tool permission audit" / "over-privileged MCP tools" (tool intent).
- **`generateMetadata`:** title `Tool-Permission Auditor — Least-Privilege Check for MCP & Agent Tools` (≤60: `Tool-Permission Auditor — MCP Least Privilege`); description: "Paste your MCP or agent tool config and get a least-privilege audit: over-broad scopes flagged, the minimal set recommended, with rationale. $29." (≤155). Canonical `/store/tool-permission-auditor`. OG via `@vercel/og`.
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real): "What does it check?" (over-privilege / least-privilege only — point to Scan for the full model), "What config formats?" (MCP, OpenAI-tools, generic), "Do you connect to my server?" (no — config-only), "Do you store my API key?" (no), "How is the minimal set computed?" (deterministically from each tool's purpose; AI only explains it), "What do I get?" (graded report + per-tool scope diffs + `least-privilege.json`).
- **Internal links:** segment README; `scan-my-mcp` (full report) + `mcp-hardening-kit` (enforcement) as upsells; CVE blog posts on over-privilege/confused-deputy.
- **Programmatic surface (note):** anonymized example audits could be indexable — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: config textarea labeled with a visible label; `configFormat` a real select; provider/key in a `<fieldset>`; progress region `aria-live="polite"` + `role="status"`; focus moves to the report heading on success; scope-diff uses strikethrough + icon + word (not color alone); grade chip meets contrast.
- Mobile: single-column; per-tool diffs stack; scope lists wrap; downloads full-width.
- Error recovery: inline + non-destructive (pasted config preserved); "retry" re-runs without re-entering the key.
- Gate CI on `@axe-core/playwright` for this route (all states).

## 14. Payment integration

- Create Polar product **"Tool-Permission Auditor" $29** (sandbox + live). Checkout metadata `{ slug: "tool-permission-auditor" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund if the run never produced a valid report. Quota auto-restores on system-side failures.

## 15. Security & privacy

- **Buyer data:** the pasted tool config + optional `serverContext`. No live connection, no code execution — the lowest-risk surface in the segment. Retention: config used transiently for the run; the report stored 30d (KV/Blob TTL) for re-download, then purged.
- **Product-specific risks & mitigations:**
  - **Untrusted config parsing** — parse as JSON/data only, never `eval`/execute; scope names treated as strings; sanitize before display (no `dangerouslySetInnerHTML`).
  - **Model tampering with security values** — guarded by the post-gen echo check (edge #7): the deterministic scopes/scores are re-applied if the model deviates, so the security content can't be corrupted by the AI.
  - **Zip/path safety** — generated report files at safe relative paths only.
  - No SSRF surface (config-only).
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `perm_audit_grade` (grade), `perm_audit_overbroad` (count of over-broad scopes), `perm_audit_clean` (clean tool count), `perm_audit_zip_download`, `perm_audit_upsell_click`.
- **Activation:** purchase → first run that produces a valid report. **Target ≥ 90%** (higher than the segment because the deterministic core almost always succeeds — failures are basically just bad input or key).
- Watch: run-error rate (<3%), refund rate (<2%), upsell CTR into Scan/Hardening (this is the funnel's job).

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry, Polar sandbox product, routes, empty `ToolPermissionOutput` schema, blank tool UI with the config paste area. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Engine + contract (the bulk; mostly no AI).** `parseConfig` + the deterministic `leastPrivilege` engine + `computeScore` + input/output schemas; pipeline returns a schema-valid contract from a fixture config with the AI rationale step mocked. _AC: unit test: fixture config → valid `ToolPermissionOutput` with correct over-broad deltas + deterministic score; a least-privileged fixture → grade A, empty `overBroad`._
- **Phase 2 — Real run + UI.** Wire BYOK + the cheap `runStructured` rationale call + the echo-check, all UI states, on-screen + PDF + ZIP(Blob) + Resend email, the scope-diff view. _AC: E2E activation path green in sandbox; the deterministic report renders even with the AI step mocked-degraded; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6).** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics, upsell. _AC, the §6 gate (abridged — full list in doc 03 §6):_ sample report on sales page; answer-first headline; provably input-specific (real tool names, purposes); scope-diff data-viz; branded PDF; `least-privilege.json` has copy button + filename + rationale; running streams real phases; all 8 states designed; key-safety + retention + (very low) cost visible; AI-tells/fabrication evals pass; `impeccable`/`taste` + `ui-ux-pro` + axe pass; mobile first-class.
- **Phase 4 — Launch.** Live Polar product, monitoring, refund flow verified. _AC: platform-spec §15 DoD all checked._

## 18. Testing strategy

| Edge (§10)              | Test                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| #1 key invalid          | unit: pre-run ping rejects → error, quota intact                                    |
| #2 malformed config     | schema: bad JSON / wrong shape → input schema rejects                               |
| #3 no scopes            | unit: zero declared scopes → honest "can't assess" report, valid contract           |
| #5 all least-privileged | unit: clean fixture → grade A, all `overBroad` empty, no fabricated issues          |
| #6 ambiguous purpose    | unit: sparse description → `confidence:"likely"/"possible"`                         |
| #7 model tampering      | unit: AI response that mutates a scope → echo-check restores deterministic values   |
| #8 AI timeout           | integration: provider error → degraded report (no rationale) path OR refund per §20 |
| #9 duplicate            | integration: same `runId` returns cached, no double quota                           |

- **The deterministic engine** is the heart and gets the most unit coverage: a table of (tool purpose × declared scopes) → expected `minimalScopes`/`overBroad`/`severity`, covering read/write/exec/network classes; the score computation; clean vs over-broad fixtures.
- **Eval** is lighter here (the security content is deterministic), focused on rationale quality: `input_specific` (rationale references the real tool/purpose), `no_ai_tells`, `factual` (rationale doesn't claim a scope the engine didn't flag), `format_valid` (`least-privilege.json` parses). Golden set: ~8 configs with known over-broad scopes + expected grade bands.
- Full method/fixtures/mocks/matrix/E2E/CI in [`../05-testing-strategy.md`](../05-testing-strategy.md).
- **The one test that matters most:** fixture config → pipeline (mocked AI rationale) → **valid `ToolPermissionOutput`** whose `findings` carry the correct deterministic `overBroad`/`minimalScopes`/score, with a correct ZIP.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, runner/SSE §6, data model §7, report+PDF+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Import (don't redefine) `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr` from [`../04-implementation-contracts.md`](../04-implementation-contracts.md). Spine must pass `segment-0-spine` DoR.
- **New libs:** none — uses the segment spine's `Manifest` parser + the shared least-privilege scope-diff helper.
- **Cross-product reuse:** the `parseConfig`→`Manifest` step + the scope-diff math are shared with `scan-my-mcp` and `mcp-hardening-kit` (this product is the standalone, cheap surface of that shared engine). Build the helper generic in `server/store/tools/mcp/`.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` **edge #8 policy** — if the AI rationale step fails, do we (a) deliver the fully-valid deterministic report _without_ rationale (degraded but genuinely useful, since the security content is all deterministic) and not refund, or (b) treat it as a failed run and restore quota? Lean to (a) with a clear "rationale unavailable, findings are complete" note — but confirm it's acceptable to charge when the AI step degraded. This is the one place this product's mostly-deterministic nature changes the standard refund logic.
- `OPEN QUESTION:` the scope-knowledge map — how rich is the purpose→minimal-scope mapping for v1 (a curated heuristic set vs broader). Start curated for common MCP/agent scope vocabularies; expand from real configs.
- `OPEN QUESTION:` supported `configFormat` set — MCP confirmed; OpenAI-tools + a generic shape likely; confirm parsers.
- **Risk — wrong minimal-scope recommendation (false positive):** mitigation = conservative classifier + `confidence` levels + `serverContext` to justify legitimate breadth + the rationale explaining each call; eval golden set guards regressions.
- **Risk — perceived as too narrow for the price:** mitigation = it's deliberately the cheap entry; the report's value + the upsell into Scan/Hardening is the funnel design; sales page sets the scope expectation honestly.
- **Risk — model corrupts security values:** mitigation = the deterministic engine owns all security numbers + the echo-check (edge #7) — by construction the AI can't change them.
