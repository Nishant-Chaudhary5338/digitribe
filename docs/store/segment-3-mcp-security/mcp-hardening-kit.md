# MCP Hardening Kit — PRD

**Slug:** `mcp-hardening-kit` · **Segment:** 3 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> Composes the Segment-3 spine (segment [`README.md`](./README.md)): consumes the same `Manifest` shape that `scan-my-mcp` produces and turns a server's weaknesses into a **generated fix bundle**. This is the natural $49 upsell from the flagship scan.

---

## 1. TL;DR

- **One-liner:** Describe your MCP server → get generated auth/scope/sanitization middleware, a config, and a hardening checklist you can drop in.
- **Problem:** Builders know _what's_ wrong with their MCP server (often from our scan) but writing correct auth, least-privilege scoping, and input-sanitization middleware for the MCP threat model is fiddly, error-prone work most ship without.
- **Buyer:** developers shipping an MCP server who want the fix, not just the finding.
- **Input → Output:** server details (framework, tools, scopes) → a downloadable **Hardening Bundle** — auth/scope/sanitization middleware + a `mcp-security.config`, a prioritized hardening checklist, and an install README.
- **Price:** **$49** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~40–80s (generation-bound) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a builder who has identified MCP weaknesses (missing auth, over-broad scopes, unsanitized tool inputs, no origin checks) has to hand-write the middleware to fix them — for their specific framework, against a threat model (prompt injection, tool poisoning, confused-deputy) most haven't internalized. There's no maintained, framework-aware "MCP security middleware" they can `npm install`; they cobble it from blog posts or skip it. With **MCP shipping no auth layer of its own** and **a CVE landing every ~4 days**, "I'll harden it later" is how servers become the next disclosure.

**Competition:** generic web-auth middleware exists but isn't MCP-aware (it doesn't know about tool scopes, tool-description poisoning, or the `tools/call` boundary); a few open-source MCP wrappers are early and not tailored to a buyer's stack. **Gap:** no instant, self-serve tool that generates _correct, framework-specific_ hardening code from your server's actual shape. That's us — and code generation tuned to a stack is exactly what Digitribe's `mcp-toolkit` (`component-factory`, `code-modernizer`) already does.

**Urgency stat:** 40+ MCP CVEs in 2026 (~one every four days); MCP has no built-in auth. The fix is undifferentiated grunt work — perfect to productize. (Citations in segment README / `../research-sources.md`.)

**Why Digitribe:** we build MCP servers and ship code generators. We can emit middleware that's idiomatic for the buyer's framework and correct against the real MCP threat classes — not a generic snippet.

## 3. Pricing & packaging

- **$49**, one-time — the highest in the segment because the output is committable _code_ that replaces real engineering hours. Anchored below an afternoon of a senior dev's time.
- **Includes:** 1 run (3 re-runs in quota to regenerate after refining inputs / a stack change), the full bundle (zip of middleware files + config + `HARDENING.md` checklist + install README), on-screen view, emailed copy (Resend).
- **Upsell path:** comes _from_ `scan-my-mcp` (the report's "needs hardening" flag links here). From here → **Agent Prompt-Injection Test Suite** ($39) to verify the sanitization actually holds; agency CTA "want us to implement + maintain your MCP security?" → Digitribe services.
- **Future tiers (note only):** more frameworks / a maintained npm package of the middleware is a v2 idea; v1 is one SKU covering the frameworks in §5.

## 4. User stories / JTBD

- As an **MCP server author**, when my scan flagged missing auth and over-privilege, I want generated middleware for my framework, so that I can commit the fix today.
- As a **developer new to MCP**, when I don't know what "good" auth/scoping looks like for tools, I want a correct reference implementation tailored to my server, so that I'm not guessing.
- As a **team lead**, when I need our MCP server hardened before launch, I want a prioritized checklist plus the code, so that I can assign and track the work.
- As a **builder who values their time**, when sanitizing every tool input by hand is tedious, I want a sanitization layer generated from my tool schemas, so that I just wire it in.

**Primary job the artifact must nail:** generate **correct, idiomatic, framework-specific middleware** that maps to _this_ server's actual tools and scopes — code a senior dev would commit, not a generic template with `// TODO`s.

**Non-goals (v1):** does NOT scan/connect to the buyer's live server (that's `scan-my-mcp`); does NOT deploy or open a PR; does NOT generate the buyer's entire server, only the security middleware/config; does NOT cover frameworks outside the supported set (§5) — it says so honestly.

## 5. Functional requirements

### Inputs

| Field           | Type                                                                 | Validation                                                       | Example                                 |
| --------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| `framework`     | enum `mcp-ts-sdk` \| `mcp-python-sdk` \| `express-bridge` \| `other` | required; drives codegen target                                  | `mcp-ts-sdk`                            |
| `transport`     | enum `stdio` \| `http` \| `sse`                                      | required; affects auth + origin-check generation                 | `http`                                  |
| `tools`         | array of `{ name, description?, scopes?, params? }`                  | 1–40 tools; names non-empty                                      | `[{name:"search", scopes:["read:db"]}]` |
| `currentAuth`   | enum `none` \| `apiKey` \| `oauth` \| `custom`                       | required; what (if any) auth exists today                        | `none`                                  |
| `concerns`      | array of ThreatClass (optional)                                      | pre-select known issues (often paste-through from a scan report) | `["missing_auth","over_privilege"]`     |
| `serverContext` | string (optional, ≤500 chars)                                        | free text ("public, multi-tenant", "internal only")              | "public server, per-tenant data"        |
| `provider`      | enum                                                                 | one of product's `byokProviders`                                 | `anthropic`                             |
| `byokKey`       | string (secret)                                                      | non-empty; validated live pre-run (platform-spec §5)             | `sk-…`                                  |

> A buyer arriving from a `scan-my-mcp` report can pre-fill `tools`, `currentAuth`, and `concerns` from the report's `findings.json` (a "harden this server" deep-link). Convenience only; manual entry always works.

### Processing (requirements level; pipeline in §7)

Normalize the server description into the shared `Manifest` shape → derive the required controls deterministically (which middleware, which scopes to tighten, which inputs to sanitize) → AI generates framework-specific middleware/config files + the prioritized checklist, filling the Output Contract → render on-screen + zip + email.

### Outputs

The **Hardening Bundle**: generated middleware files (auth, scope/least-privilege enforcement, input sanitization, origin/transport checks), a `mcp-security.config`, a prioritized `HARDENING.md` checklist, and an install README. Exact shape in §6.

### Constraints

- Max 40 tools; generated bundle ≤ a few MB of text. No binaries.
- Generated code targets only the supported frameworks; `other` produces framework-agnostic pseudocode + guidance and says so.
- Files are our generated text → safe paths only (no `../`), zip via Vercel Blob.

## 6. ⭐ Output Contract

```ts
// server/store/schemas/mcp-hardening-kit.ts
import { z } from 'zod'

const ThreatClass = z.enum([
  'missing_auth',
  'prompt_injection',
  'tool_poisoning',
  'over_privilege',
  'confused_deputy',
  'path_traversal',
  'unsafe_tool_call',
  'data_exposure',
  'transport_security',
]) // shared with scan-my-mcp / the segment spine

const GeneratedFile = z.object({
  path: z.string(), // e.g. "src/security/auth.ts", "mcp-security.config.ts"
  language: z.enum(['typescript', 'javascript', 'python', 'json', 'markdown', 'text']),
  contents: z.string(), // the actual file body, committable as-is
  purpose: z.enum([
    'auth',
    'scope',
    'sanitization',
    'origin_check',
    'config',
    'readme',
    'checklist',
  ]),
  rationale: z.string().max(280), // why this file, what threat class it addresses
  addresses: z.array(ThreatClass).max(5),
})

const ChecklistItem = z.object({
  id: z.string(), // "H-001"
  title: z.string().max(120), // specific, references the buyer's tools where relevant
  threatClass: ThreatClass,
  priority: z.enum(['now', 'soon', 'later']),
  manual: z.boolean(), // true if it's a step we can't generate (e.g. "rotate this secret")
  detail: z.string().max(400),
})

export const HardeningKitOutput = z.object({
  server: z.object({
    framework: z.string(),
    transport: z.string(),
    toolCount: z.number().int(),
    currentAuth: z.string(),
    coverage: z.array(ThreatClass), // which threat classes this bundle hardens against
    unsupportedNote: z.string().nullable(), // set when framework="other": honest scope statement
  }),
  headline: z.string().max(200), // answer-first: "Generated 4 middleware files closing missing auth + 3 over-privileged tools"
  files: z.array(GeneratedFile).min(3), // auth + sanitization + config at minimum
  checklist: z.array(ChecklistItem).min(3),
  scopeChanges: z.array(
    z.object({
      // the concrete least-privilege diff, per tool — drives a before/after viz
      tool: z.string(),
      before: z.array(z.string()), // current/assumed scopes
      after: z.array(z.string()), // recommended minimal scopes
      reason: z.string().max(200),
    })
  ),
  installSteps: z.array(z.string()).min(3).max(8), // how to wire the bundle in
  upsell: z.object({
    needsInjectionSuite: z.boolean(), // → Agent Prompt-Injection Test Suite to verify
    reason: z.string().max(280),
  }),
})
export type HardeningKitOutput = z.infer<typeof HardeningKitOutput>
```

- **Export formats:** on-screen view (React, code-first) · **PDF** (the checklist + scope diffs as a branded doc, platform-spec §8) · **JSON** (the raw contract) · **ZIP** (the `files[]` at their real paths + `HARDENING.md` + install README).
- **Field notes:** `files` and `checklist` are generative but constrained; `scopeChanges` is a structured least-privilege diff (the before is the buyer's declared scopes, the after is the minimal recommendation). `coverage`/`unsupportedNote` keep the artifact honest about what it does and doesn't harden.
- **Determinism:** `purpose` and `threatClass` enums are fixed so the file viewer + checklist group reliably. _Which_ controls are needed is derived deterministically from inputs (e.g. `currentAuth:"none"` ⇒ an auth file is always generated); the model writes the _code_, not the decision of whether to include it.

## 7. System logic / pipeline

```
POST /api/store/run/mcp-hardening-kit  { token, byokKey, input }
  │
  ├─ [verify] token + quota                                  emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                   emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping                           emit{phase:"key",pct:12}
  │
  ├─ NORMALIZE  toManifest(input)                            emit{phase:"analyze",pct:15..35,
  │     - map the server description into the shared Manifest  message:"Mapping your server…"}
  │       shape (tools, scopes, transport) — same type
  │       scan-my-mcp produces
  │     - DERIVE required controls deterministically:
  │         currentAuth=="none" → need auth middleware
  │         transport in {http,sse} → need origin/transport checks
  │         any tool with params → need a sanitization layer
  │         over-broad scopes → compute least-privilege diff
  │     → ControlPlan { neededFiles[], scopeDiff[], frameworkTarget }
  │
  ├─ GENERATE  runStructured({                               emit{phase:"generate",pct:40..92,
  │     provider, apiKey, model,                               message:"Generating middleware…"}
  │     system: HARDENING_SYSTEM,           // §9
  │     prompt: buildPrompt(Manifest, ControlPlan, serverContext),
  │     schema: HardeningKitOutput,         // §6 — SDK-enforced
  │     effort: "high",
  │   })  → HardeningKitOutput               // structuredStream: files fill in progressively
  │     - model writes idiomatic, framework-specific code for each
  │       file in the ControlPlan; it cannot drop a required control
  │       (the plan dictates which files MUST exist) or add scope it
  │       wasn't asked to tighten
  │
  ├─ VERIFY  lintGenerated(files)                            emit{phase:"render",pct:93}
  │     - cheap static sanity: JSON files parse, TS/JS files parse
  │       via the AST parser, no obvious syntax errors → if a file
  │       fails, mark it and note in the checklist (honest)
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:95}
  │     - on-screen, PDF(checklist+diffs), zip(files[] + HARDENING.md + README) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — the code is the artifact. **Normalize + control-derivation + the generated-code lint are deterministic Node** — they decide _what_ must be hardened and sanity-check the output; the model only writes the _how_. No buyer AI cost on those steps.
- **Libraries:** the shared `Manifest` type + AST parser from the segment spine (reused for the post-gen `lintGenerated` parse check). No new runtime libs beyond the segment's.
- **Reuse:** consumes the **same `Manifest` shape** `scan-my-mcp` produces, so a scan report can hand off directly. Shares `server/store/tools/mcp/` types. The `scopeChanges` least-privilege logic overlaps `tool-permission-auditor`'s engine — factor the minimal-scope computation into a shared helper.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — strongest at producing correct, idiomatic security code), `openai`, `google`. Cheaper option in UI: `claude-haiku-4-5` (smaller servers / fewer files). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one run is a single structured generation producing several short code files over a compact server description → typically **well under $0.20 on the buyer's key** (a bit higher than a scan because it emits more text). Show it.
- **Pre-run validation:** 1-token ping; failure → edge #1, no quota spent.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on. Structured output enforced by AI SDK `generateObject` against `HardeningKitOutput`.

**System prompt (draft):**

```
You are a senior engineer who builds and secures Model Context Protocol (MCP)
servers. You write production-grade security middleware for MCP servers in their
own framework's idiom. The MCP threat model you defend against: missing
auth/authz, prompt injection (direct + indirect), tool poisoning, over-privileged
tools, confused-deputy, path traversal, unsafe tool calls, data exposure, and
transport security.

You are given (a) the server's tools/scopes/transport/framework, and (b) a
ControlPlan listing which controls MUST be generated and the least-privilege
scope diff already computed. Rules:
- Generate every file the ControlPlan requires; do not skip one. Generate code
  that is correct, idiomatic for the stated framework, and committable as-is —
  no placeholders, no "TODO", no pseudo-imports that don't exist.
- Use ONLY the buyer's stated tools/scopes; never invent tools or capabilities.
- Auth middleware must actually gate tool calls; scope enforcement must apply the
  computed least-privilege diff; sanitization must derive from the tools' real
  parameters; origin/transport checks only when the transport warrants them.
- For framework "other", produce framework-agnostic, clearly-commented reference
  code and SAY in unsupportedNote that it needs adapting — do not pretend it's
  drop-in for an unknown stack.
- Each file gets a rationale and the threat classes it addresses. The checklist
  is prioritized (now/soon/later); items we can't generate are marked manual.
- Senior tone in comments and the README. No filler, no security theatre.
```

**User prompt template:** `buildPrompt(manifest, controlPlan, serverContext)` → serializes the normalized tools/scopes/transport/framework, the deterministic ControlPlan (required files + scope diff), and the optional `serverContext`. Buyer free-text is delimited as data.

**Guardrails:** schema enforcement + the ControlPlan dictating required files means the model can't ship an incomplete bundle or silently drop auth; "ONLY the buyer's stated tools" curbs invention; the post-generation `lintGenerated` parse check catches non-compiling output and reports it honestly rather than shipping broken code; the `unsupportedNote` path keeps `other` honest. Refusal/empty handling per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                         | Detection                      | Behavior / message                                                                               | Quota     |
| --- | ----------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ | --------- |
| 1   | Invalid/expired BYOK key                        | pre-run ping fails             | "Your `<provider>` key looks invalid or expired — check and retry."                              | not spent |
| 2   | Zero tools provided                             | input validation               | inline error: "Add at least one tool so we can harden it."                                       | not spent |
| 3   | `framework: "other"`                            | input                          | proceed; generate framework-agnostic reference code; set `unsupportedNote`; flag in checklist    | spent     |
| 4   | Tool list exceeds cap (>40)                     | input validation               | "We harden up to 40 tools per run — split the rest into a second run."                           | not spent |
| 5   | A generated file fails the parse check          | `lintGenerated`                | still deliver the bundle; mark that file + add a `manual` checklist item to review it            | spent     |
| 6   | Buyer already has `oauth` and no other concerns | ControlPlan near-empty         | deliver a "you're mostly covered" bundle (origin checks/checklist) + honest headline; not padded | spent     |
| 7   | Provider rate-limit / timeout mid-generate      | AI wrapper error               | retry once w/ backoff; if still failing, error + refund the run (quota restored)                 | restored  |
| 8   | Model returns thin output (too few files)       | files.length < ControlPlan req | retry once with a stricter prompt; if still thin, error + quota restored                         | restored  |
| 9   | Duplicate submit (double-click)                 | same `runId` (idempotency §6)  | return in-flight/cached result; never double-charge                                              | n/a       |
| 10  | Quota exhausted                                 | token check                    | "You've used all 3 runs — buy again or contact us." + buy CTA                                    | n/a       |

## 11. UX / UI flow

**Sales page** (`/store/mcp-hardening-kit`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** framework select + transport select + `currentAuth` select; a **tool builder** (repeatable rows: name + optional scopes + params) with an "import from a scan report" affordance (paste `findings.json`); optional `concerns` chips + `serverContext`. Provider select + `KeyInput`. **Run** disabled until ≥1 tool + valid key.
- **Validating key:** inline ✓/✗ on the key field.
- **Running:** live SSE progress — "Mapping your server…", "Planning controls: auth + sanitization + 2 scope tightenings", "Generating middleware…" with files appearing as they stream (`structuredStream`). Progress bar + rotating "why least-privilege matters" tip. `aria-live="polite"`.
- **Partial:** a file failed the parse check → non-blocking banner; continue to success with that file flagged.
- **Success / artifact view:**
  - Top: `headline` (answer-first: "Generated N files closing missing auth + M over-privileged tools") + `coverage` chips.
  - **Generated files** (`FileViewer`): tabs/accordion, syntax-highlighted, **per-file copy button** + filename header + `rationale` + the threat classes it addresses.
  - **Scope changes**: a before/after least-privilege diff per tool (`StatBar`/diff viz — `read:db, write:db` → `read:db`).
  - **Hardening checklist**: grouped by `priority` (now/soon/later), `manual` items marked.
  - **Install steps**.
  - **Downloads:** **ZIP** (files + `HARDENING.md` + README) primary, **PDF** (checklist+diffs), **JSON**, **Email me a copy** (pre-checked).
  - **Upsell card** if `upsell.needsInjectionSuite` → Agent Prompt-Injection Test Suite + agency CTA.
- **Error:** clear message per §10 + retry; never lose the tool list / inputs.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer`, `SeverityChip`, `StatBar` ([`../06-ui-kit.md`](../06-ui-kit.md) §2). New component: `components/store/artifacts/mcp-hardening-kit.tsx` (the files + scope-diff + checklist body). States per `06-ui-kit.md` §4; tokens §1. Copy tone per `PROJECT_VISION.md`.

## 12. SEO

- **Target keyword(s):** "MCP server auth middleware" / "harden MCP server" / "MCP least privilege / input sanitization" (tool intent).
- **`generateMetadata`:** title `MCP Hardening Kit — Generate Auth, Scope & Sanitization Middleware` (≤60: `MCP Hardening Kit — Secure Your MCP Server`); description: "Describe your MCP server and get generated auth, least-privilege scope, and input-sanitization middleware plus a hardening checklist — drop it in. $49." (≤155). Canonical `/store/mcp-hardening-kit`. OG via `@vercel/og`.
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($49) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real): "What does it generate?" (auth/scope/sanitization/origin middleware + config + checklist), "Which frameworks?" (MCP TS SDK, MCP Python SDK, Express bridge; `other` = reference code), "Do you connect to my server?" (**no — you describe it; use Scan my MCP server to connect**), "Do you store my API key?" (no), "Is the code committable as-is?" (yes, parse-checked; manual items flagged), "Does this prove it's secure?" (pair it with the Injection Suite).
- **Internal links:** segment README; `scan-my-mcp` ("harden this" hand-off, the main inbound); `agent-injection-suite` (verify the fix); CVE blog posts.
- **Programmatic surface (note):** example bundles per framework could be indexable pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every field labeled; the tool-builder rows have labeled name/scope/param inputs with add/remove buttons that announce; provider/key in a `<fieldset>`; progress region `aria-live="polite"` + `role="status"`; focus moves to the artifact heading on success; `FileViewer` tabs are a real tablist; copy buttons announce "copied"; scope-diff uses text + icon, not color alone.
- Mobile: single-column; tool-builder rows stack; `FileViewer` → accordion; downloads full-width.
- Error recovery: inline + non-destructive (the whole tool list is preserved on error); "retry" re-runs without re-entering the key.
- Gate CI on `@axe-core/playwright` for this route (all states).

## 14. Payment integration

- Create Polar product **"MCP Hardening Kit" $49** (sandbox + live). Checkout metadata `{ slug: "mcp-hardening-kit" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund if the run never produced a valid bundle. Quota auto-restores on system-side failures (§10 #7/#8).

## 15. Security & privacy

- **Buyer data:** the server description (framework, tool names, scopes, params) + optional `serverContext`. No live connection, no buyer source code execution. Retention: inputs used transiently; the generated bundle stored 30d (KV/Blob TTL) for re-download, then purged.
- **Product-specific risks & mitigations:**
  - **Generating insecure code** — the worst failure for a _security_ product. Mitigations: the deterministic ControlPlan guarantees required controls are present; the system prompt forbids placeholders/incomplete auth; the `lintGenerated` parse check catches non-compiling output; the eval suite includes a "does the generated auth actually gate tool calls?" judge (§18). Treat a regression here as a launch blocker.
  - **Untrusted input** — buyer-provided tool names/descriptions are data, never executed; delimited in the prompt; sanitized before display (no `dangerouslySetInnerHTML`).
  - **Zip/path safety** — generated files at safe relative paths only (no `../`).
  - No SSRF surface (we never fetch the buyer's server) — a deliberate simplification vs `scan-my-mcp`.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13) + product events: `mcp_harden_framework`, `mcp_harden_files` (count generated), `mcp_harden_coverage` (threat classes covered), `mcp_harden_zip_download`, `mcp_harden_upsell_click`.
- **Activation:** purchase → first run that produces a valid bundle. **Target ≥ 85%.**
- Watch: run-error rate (<5%), refund rate (<3%), `from_scan` attribution (how many arrive via a scan-report hand-off), upsell CTR.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry, Polar sandbox product, routes, empty `HardeningKitOutput` schema, blank tool UI with the tool-builder. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Plan + contract (no AI).** `toManifest` + deterministic `ControlPlan` derivation + the least-privilege scope-diff helper + input/output schemas; pipeline returns a schema-valid contract from a fixture server description with the AI step mocked. _AC: unit test: fixture input → valid `HardeningKitOutput`; ControlPlan correctly requires auth when `currentAuth:"none"`._
- **Phase 2 — Real run + UI.** Wire BYOK + `runStructured` (live codegen) + `lintGenerated`, all UI states, on-screen + PDF + ZIP(Blob) + Resend email, the file viewer + scope-diff + checklist views. _AC: E2E activation path green in sandbox; generated TS parses; all §10 cases handled._
- **Phase 3 — SEO + polish + Showcase Checklist (doc 03 §6).** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics, upsell. _AC, the §6 gate (abridged — full list in doc 03 §6):_ sample bundle on sales page; answer-first headline; provably input-specific (uses the buyer's real tool names); scope-diff data-viz; branded PDF; files have copy buttons + filenames + rationale; running streams real phases; all 8 states designed; key-safety + retention + cost visible; AI-tells/fabrication evals pass; `impeccable`/`taste` + `ui-ux-pro` + axe pass; mobile first-class.
- **Phase 4 — Launch.** Live Polar product, monitoring, refund flow verified. _AC: platform-spec §15 DoD all checked._

## 18. Testing strategy

| Edge (§10)           | Test                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| #1 key invalid       | unit: pre-run ping rejects → error, quota intact                                                                           |
| #2 zero tools        | schema: empty tools → input schema rejects                                                                                 |
| #3 framework "other" | unit: produces `unsupportedNote` + agnostic code, valid contract                                                           |
| #5 unparseable file  | unit: a fixture AI response with broken TS → `lintGenerated` flags it, bundle still delivered with a manual checklist item |
| #7 AI timeout        | integration: provider error → retry → quota restored on final fail                                                         |
| #8 thin output       | unit: AI returns fewer files than ControlPlan → retry/strict → restored                                                    |
| #9 duplicate         | integration: same `runId` returns cached, no double quota                                                                  |

- **ControlPlan derivation** gets its own unit suite: `currentAuth:"none"` ⇒ an auth file is required; `transport:"http"` ⇒ origin-check required; tools with params ⇒ sanitization required; over-broad scopes ⇒ a `scopeChanges` entry. Deterministic, no AI.
- **Generated-code quality eval** (the segment-specific judge): on the golden set, an LLM-judge checks "does the generated auth middleware actually gate tool calls / does sanitization reference the real params?" plus the standard `input_specific`, `no_ai_tells`, `factual` (no invented tools/scopes), `format_valid` (TS/JSON parse) judges.
- Full method/fixtures/mocks/matrix/E2E/CI in [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific golden set: ~8 server descriptions across frameworks with expected required-control sets + `mustMention` tool names.
- **The one test that matters most:** fixture server description → pipeline (mocked AI returning a fixed bundle) → **valid `HardeningKitOutput`** whose `files` cover every control the ControlPlan required, with correct ZIP paths.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, runner/SSE §6, data model §7, report+PDF+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Import (don't redefine) `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr` from [`../04-implementation-contracts.md`](../04-implementation-contracts.md). Spine must pass `segment-0-spine` DoR.
- **New libs:** none beyond the segment spine's AST parser (reused for `lintGenerated`). Vercel Blob for the zip (already on Vercel).
- **Cross-product reuse:** the shared `Manifest` type + the least-privilege scope-diff helper (shared with `tool-permission-auditor` and the `scopeChanges` math); consumes `scan-my-mcp`'s `findings.json` as an optional pre-fill. Design the scope-diff helper generic in `server/store/tools/mcp/`.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($49).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` exact supported-framework set for v1 — MCP TS SDK confirmed (matches our stack); MCP Python SDK + Express bridge likely; confirm we can generate idiomatic, correct code for each before listing it (don't claim a framework we can't do well).
- `OPEN QUESTION:` depth of the `lintGenerated` check — parse-only (v1) vs a fuller typecheck-in-sandbox (heavier; v2).
- **Risk — generating subtly insecure or non-compiling code (the worst failure):** mitigation = ControlPlan-enforced completeness + parse check + the "auth actually gates" eval judge as a launch blocker; honest flagging of any file that fails.
- **Risk — overclaiming for `framework:"other"`:** mitigation = `unsupportedNote` + a clear checklist item + sales-page FAQ scoping it to reference code.
- **Risk — buyer expects it to connect to their server:** mitigation = FAQ + the input UI make clear this is description-driven; cross-link `scan-my-mcp` for the live path.
- **Risk — buyer surprised by API cost (more text generated than a scan):** mitigation = show expected per-run cost (§8); cap tools at 40.
