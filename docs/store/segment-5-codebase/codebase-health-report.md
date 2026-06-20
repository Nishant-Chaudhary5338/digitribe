# Codebase Health & Migration Report — PRD

**Slug:** `codebase-health-report` · **Segment:** 5 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> This is the **reference PRD** and **reference implementation** of Segment 5's **downloadable local-app** model (D-13/14/15). Build it first. The other two codebase apps compose its pieces — the local-app shell, the license module/client, and the engine-adapter pattern.
>
> **Delivery model (read first):** this is NOT a cloud tool and does NOT use the spine's in-browser run flow (platform-spec §6). It is a **standalone downloadable local app** the buyer runs on their own machine (`pnpm install && pnpm dev`), points at a local repo, and gets the report from — locally, on their own BYOK key. The store/cloud side does only purchase → license issuance → download delivery. **The buyer's code never leaves their machine** — that is the headline selling point (segment README, "The delivery model").

---

## 1. TL;DR

- **One-liner:** A local app you download and run on your own machine — point it at any React/TypeScript repo on your disk and get a 0–100 health score plus a prioritized, plain-English migration roadmap. Your code never leaves your computer.
- **Problem:** Teams inherit legacy React/TS codebases with no map and no plan; the real options are a $5k consultant or 4,000 unprioritized linter warnings. And the codebase is often proprietary — they won't upload it to a stranger's server, which is exactly why a cloud tool is a non-starter.
- **Buyer:** tech leads / senior engineers / CTOs at small teams who own a codebase they didn't fully write and need to justify or scope a migration — and who care that the code stays local.
- **Input → Output:** a **local repo path** on the buyer's machine → a **Codebase Health & Migration Report** rendered in the app (overall grade, per-area scores, an AI-written prioritized roadmap with fix guidance + blast-radius hints), exportable **locally to PDF and JSON**. The deliverable is the **downloadable app + license** plus the locally-generated report.
- **Price:** **$49** (range $29–79) (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite, **local app + license** · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~40–90s (local AST scan-bound) · **Re-run quota:** unlimited local runs while the license is active (the license, not a per-run quota, is the unit — see §3, §14).

## 2. Problem & market

**Today** a tech lead who inherits a React/TS app has no honest, prioritized view of its health. They run ESLint and get noise; they read blog posts about migrating CRA → Vite or to the App Router or to strict TS but have no idea which of those is the urgent one _for their repo_. To get a real answer they hire a consultant for a week ($5k+) or guess. Almost nobody has a number and a plan — and the ones who'd most want a tool often can't use a cloud one, because the codebase is the company's crown jewels and security won't let it touch a third-party server.

**This is open-core (the strategy — see segment README).** The engine behind this product is Digitribe's **open-source, MIT** [`legacy-analyzer`](https://github.com/Nishant-Chaudhary5338/mcp-toolkit) — a 22-tool, 0–100 health audit for any React/Next.js/Remix/Vite/CRA app, shipped and CI-verified. Anyone can `npx mcp-react-toolkit legacy-analyzer` and run it for free, forever; that's the funnel, not the loss. What we **sell** is a **polished local app** the bare OSS isn't: a designed UI (no MCP client, no JSON-RPC, no terminal), an **AI-written migration roadmap** on top of the raw findings, a **branded PDF/JSON export** a tech lead forwards to their VP — and the **local-first guarantee** that the code stays on the machine. A fork of the MIT repo gets the raw `{ healthScore, migrationHints[] }` JSON in a terminal; it does not get the app, the AI narrative, the design, the export, or the license.

**Competition:** generic SaaS code-quality dashboards (SonarQube, CodeClimate) are enterprise, subscription, **cloud-hosted (the deal-breaker for proprietary code)**, and produce undifferentiated walls of issues without a migration narrative; "score-only" tools give a number with no plan; consultants give a plan but cost $5k and a week. **Gap:** no instant, affordable, self-serve, **local** tool that combines a real deterministic audit with a prioritized, written roadmap and never sees your code. That's us.

**Urgency:** maintenance is ~60–80% of total software lifetime cost (trace exact source in `../research-sources.md`); the long tail of CRA / Vite / pages-router apps facing migrations (App Router, strict TS, React 19) is large and grows with every major release. A buyer scoping any of those needs this number first.

**Why Digitribe:** we wrote `legacy-analyzer`, we maintain it, we run it in our own CI. Our score is a deterministic engine's output, not an LLM's vibe — the AI only writes the plan on top. That's credible in a way a generic AI wrapper isn't, and the local-first model proves we're not in the business of hoarding our customers' code.

## 3. Pricing & packaging

- **$49**, one-time (range $29–79; $49 anchors well below an hour of senior-consultant time while staying an easy team-card purchase). The raw engine is free OSS — buyers pay for the **downloadable app + license** (the AI roadmap, the designed artifact, the local-first experience), and the sales page says so plainly (open-core honesty builds trust).
- **What one purchase includes:** a **license key** + a **download link** (emailed via Resend). The license unlocks the paid AI layer in the app and permits **N machine activations** (`OPEN QUESTION:` default **3 device activations** — see §14). Within an active license the buyer runs the tool **as many times as they want, locally** (no per-run quota — there's no server cost to us; inference is on their key). The deliverable is the app + license, not a one-shot cloud artifact.
- **Upsell path:** the roadmap's blast-radius hints → **Blast-Radius Analyzer** ($59, "before you refactor `<X>`, see what breaks", a separate download/SKU); any a11y anti-pattern finding → **WCAG Audit Report** ($29, separate SKU); the report footer's agency CTA → "want us to run the migration?" → Digitribe services (the $5k engagement this product is the cheap, local preview of). Because each is a separate download, cross-sell lives in the report copy + the sales pages, linking back to the store.
- **Future tiers (note only):** per-seat / team licenses, CI-integrated trend tracking, and an Electron/Tauri double-click build are v2 ideas; v1 ships one SKU as a `pnpm dev` download.

## 4. User stories / JTBD

- As a **tech lead inheriting a codebase**, when I'm asked "how bad is it and what do we do?", I want a scored report + a prioritized plan **without uploading our private code anywhere**, so that I can answer with evidence and pass the security review.
- As a **senior engineer planning a migration** (CRA→Vite, pages→App Router, JS→strict TS), when I need to scope the work, I want to know which areas are worst and in what order to fix them, so that I sequence the migration sanely.
- As a **CTO at a small company**, when I'm deciding whether to refactor or rewrite, I want an honest health number + the top risks, so that I can make the call and defend it to the board.
- As a **consultant / agency**, when I onboard a new client's repo, I want an instant local baseline audit I can run on the client's machine, so that I can scope my engagement in minutes instead of a week.

**Primary job the artifact must nail:** produce a **repo-specific, honestly-scored health report with a prioritized migration roadmap** — the score must reflect _their_ real findings (their large components, their actual anti-patterns), and the roadmap must be _their_ next 5 actions in priority order, not generic "consider adding tests" boilerplate.

**Non-goals (v1):** does NOT modify or migrate the code for the buyer (that's the agency upsell); does NOT execute, build, install, or run the repo; does NOT analyze backend/non-JS-TS code; does NOT replace a full security audit (it's a maintainability/architecture audit); does NOT upload, clone, or transmit the buyer's code anywhere (it's local-first by design).

## 5. Functional requirements

### Inputs (entered in the LOCAL app, not a web form)

| Field            | Type                          | Validation                                                                                                                            | Example                                 |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `repoPath`       | string (local FS path)        | absolute or app-relative path that exists, is a directory, and contains a JS/TS project (a `package.json` and/or `src`/`app`/`pages`) | `/Users/me/work/acme-app`               |
| `subPath`        | string (optional)             | path within the repo to treat as the app root (monorepo)                                                                              | `packages/web`                          |
| `projectContext` | string (optional, ≤500 chars) | free text the owner adds ("legacy CRA we want on App Router")                                                                         | "CRA app, migrating to Next App Router" |
| `licenseKey`     | string (entered once)         | the key emailed at purchase; validated online once to unlock the paid AI layer (§9, §14)                                              | `DGT-CHR-XXXX-XXXX`                     |
| `provider`       | enum                          | one of the app's supported `byokProviders`                                                                                            | `anthropic`                             |
| `byokKey`        | string (secret)               | non-empty; entered in the local app; **never transmitted to us** (§8); used only for the local AI call                                | `sk-…`                                  |

### Processing (requirements level; the LOCAL pipeline is §7)

All of this runs **on the buyer's machine, inside the app**: read the repo from `repoPath` (no clone/upload; §15) → run the **deterministic `legacy-analyzer` engine** in-process (22 sub-tools: tech detection, components, state, API layer, routing, styling, assets, anti-patterns, duplication, dependencies, folder structure → a 0–100 `healthScore` + `migrationHints[]`) → assemble a compact "audit digest" of the typed findings → call the AI **on the buyer's BYOK key** to fill the Output Contract (the score narrative + prioritized roadmap + per-area explanations + blast-radius hints) → render the report in the app → let the buyer export to PDF/JSON locally. The only network calls are the one-time license validation and the buyer's own AI provider call.

### Outputs

The **Codebase Health & Migration Report** — rendered in-app + exported **locally** to branded PDF + JSON. Exact shape in §6.

### Constraints

- **Repo size caps** (cost + time bound, even though it's the buyer's own machine): the engine samples large repos and honors source-dir detection (`src/` / `app/` / `pages/` / root); over a sensible cap → sampled with an honest "analyzed N of M files" note. Single huge files (>20 MB) skipped.
- **Languages:** the engine analyzes `.js/.jsx/.ts/.tsx` + CSS/SCSS + asset globs; non-JS/TS code is ignored (noted in the report).
- **Never execute the repo** (§15). The engine is pure static parsing (`@typescript-eslint/parser` AST + regex), so no install/build is needed or permitted — and since it runs on the buyer's machine, "never execute" now also protects the buyer's own environment.
- The artifact is text (report JSON + PDF) written to the buyer's chosen local path; nothing is stored on our servers.

## 6. ⭐ Output Contract

> Same locked Zod schema as before — but it is **produced and rendered by the LOCAL app**, and exported locally to PDF/JSON. The engine-pinned fields still come from the deterministic engine, not the AI.

```ts
// (bundled in the local app) schemas/codebase-health-report.ts
import { z } from 'zod'

// The 11 audit areas, fixed — map 1:1 to legacy-analyzer's deterministic sub-analyses.
const AreaKey = z.enum([
  'typescript', // language: JS vs TS, strictness signals
  'components', // count, large (>300L), complex (multi-responsibility)
  'state_management', // redux/context/zustand/local/mixed; state-heavy components
  'api_layer', // centralized vs scattered, http clients, error handling
  'routing', // router lib, flat/nested, lazy loading
  'styling', // CSS/SCSS/Tailwind/CSS-in-JS, inline styles, hardcoded colors
  'assets', // oversized images/video, assets in src, unused
  'anti_patterns', // prop drilling, god components, tight coupling, a11y, etc.
  'duplication', // duplicate components (Jaccard ≥0.85), duplicate utils
  'dependencies', // import anti-patterns, UI-package misuse
  'folder_structure', // flat vs feature-based, nesting, boundary violations
])

const Severity = z.enum(['low', 'medium', 'high']) // mirrors migrationHint.priority

const Area = z.object({
  key: AreaKey,
  label: z.string(),
  score: z.number().int().min(0).max(100), // engine-derived per-area sub-score
  status: z.enum(['good', 'partial', 'poor']), // good ≥75 · partial 50–74 · poor <50
  issueCount: z.number().int(), // count of deterministic findings in this area
  findings: z.array(z.string()).max(8), // specific, from engine output (NOT invented)
  explanation: z.string().max(400), // AI: why this matters for THIS repo
})

const RoadmapStep = z.object({
  order: z.number().int().min(1), // 1 = do first
  priority: Severity, // from the engine's migrationHint priority
  area: AreaKey, // which audit area this addresses
  title: z.string().max(120), // imperative, specific ("Split the 6 god components in src/dashboard")
  rationale: z.string().max(400), // AI: why now, what it unblocks — grounded in findings
  effort: z.enum(['S', 'M', 'L']), // rough size estimate
  affectedFiles: z.array(z.string()).max(20), // real paths from the engine's migrationHints
  blastRadiusHint: z.string().max(240).optional(), // "touches shared utils — check impact first" → upsell
})

export const CodebaseHealthOutput = z.object({
  repo: z.object({
    name: z.string(),
    source: z.literal('local'), // always local — read from the buyer's disk
    framework: z.string(), // engine: "Next.js" | "Vite" | "CRA" | "Remix" | "Gatsby" | "React"
    routerVariant: z.string().optional(), // "app-router" | "pages-router" when Next.js
    reactVersion: z.string(), // engine: "18", "19", …
    language: z.enum(['TypeScript', 'JavaScript']),
    filesAnalyzed: z.number().int(),
    filesTotal: z.number().int(), // for the honest "N of M" note
    sampled: z.boolean(),
  }),
  overallScore: z.number().int().min(0).max(100), // the engine's healthScore (0–100)
  grade: z.enum(['A', 'B', 'C', 'D', 'F']), // deterministic from overallScore (see field notes)
  headline: z.string().max(200), // answer-first verdict, repo-specific
  totalIssues: z.number().int(), // engine's aggregate count
  areas: z.array(Area).length(11), // always the 11 keys, always length 11
  roadmap: z.array(RoadmapStep).min(3).max(8), // prioritized; order 1..n
  topRisks: z.array(z.string()).min(1).max(3), // the 1–3 things that would hurt most if ignored
  upsell: z.object({
    needsBlastRadius: z.boolean(), // any roadmap step touches shared/widely-used code → Blast-Radius Analyzer
    needsWcagAudit: z.boolean(), // anti_patterns flagged a11y issues → WCAG Audit Report
    reason: z.string(),
  }),
})
export type CodebaseHealthOutput = z.infer<typeof CodebaseHealthOutput>
```

- **Export formats:** in-app report (React) · **PDF** (branded, generated **locally** by the app) · **JSON** (the raw contract, saved locally). No file bundle — the deliverable is the report itself. No server round-trip for export.
- **Field notes:**
  - `repo.source` is always `'local'` — the repo is read from the buyer's disk; there is no github/zip ingest in this model.
  - `overallScore` **is the deterministic `legacy-analyzer` `healthScore`** (0–100). The AI never sets or adjusts it — it's passed in as a fact. `grade` maps deterministically: A ≥90, B ≥75, C ≥60, D ≥40, F <40.
  - Per-area `score`, `status`, `issueCount`, and `findings` are **derived from the engine's typed output** (e.g. component counts, anti-pattern list, duplication results). The AI fills `explanation`, `rationale`, `headline`, `title`, `topRisks`, `blastRadiusHint` — the narrative — and reorders findings by impact.
  - `roadmap` is the engine's `migrationHints[]` (each has `priority`, `category`, `description`, `affectedFiles`) **re-expressed and prioritized** by the AI into an ordered, effort-sized plan. `affectedFiles` are real paths from the engine, never invented.
- **Determinism:** `areas` is always the same 11 keys, always length 11 — the report layout relies on it. Scores and findings are deterministic; only prose is generative, and it's constrained to the schema and grounded in engine facts (doc 03 §2.1, §2.5).

## 7. System logic / pipeline

> **Two surfaces, two pipelines.** (A) The **store/cloud** side does only purchase + license issuance + download delivery (thin — see §14, §19). (B) The **local app** runs the real analysis pipeline below, on the buyer's machine. This is NOT the spine's serverless runner (platform-spec §6).

### (A) Store/cloud side — purchase → license → download (thin)

```
Polar checkout (sales page §11a) ──▶ webhook order.paid (platform-spec §9, extended for Seg-5):
   - create Purchase + License (license.ts §19) — a key bound to this purchase + slug
   - email (Resend): license key + download link for the app
   - NO access token, NO in-browser tool (this product isn't a cloud tool)

POST /api/store/license/validate   { licenseKey, deviceId, slug }   ← called ONCE by the local app
   - verify key (HMAC/lookup), check slug match, check/record device activation (≤ N)
   - return { valid, activationsRemaining }   — NEVER receives the buyer's code
```

### (B) Local app — the analysis pipeline (runs entirely on the buyer's machine)

```
LOCAL app  (pnpm dev)  →  buyer enters licenseKey + provider + BYOK key, picks a repoPath
  │
  ├─ [license] validate once online (POST /api/store/license/validate) → unlock paid AI layer
  │     - cache a signed activation receipt locally (offline-tolerant, §9/§14)
  │     - on subsequent runs: use the cached receipt; re-validate when it expires/online
  │
  ├─ [validate] repoPath exists, is a dir, looks like a JS/TS project (zod)   progress:"Checking project…"
  ├─ [key] BYOK key live ping (local, on the buyer's key)                     progress:"Validating your key…"
  │
  ├─ READ   read the repo from disk (read-only, §15)                          progress:"Reading 1,240 files…"
  │     - apply caps (files/bytes/depth); skip node_modules, .git, binaries
  │     - NEVER install/build/execute; nothing leaves the machine
  │     → LocalRepoRef { path, fileCount, bytes, sampled }
  │
  ├─ ANALYZE  runLegacyAnalyzer(repoPath)  [DETERMINISTIC OSS, in-process]    progress:"Analyzing components 3/11…",
  │     - the 22-tool legacy-analyzer engine, static AST only:                 findingCount:<running total>
  │       detect-project-tech, components, state, api, routing, styling,
  │       assets, anti-patterns, duplication, deps, folder-structure
  │     → { summary:{healthScore,totalIssues}, tech, …per-area…,
  │        migrationHints[] }   // typed facts, NO AI yet
  │     - assemble compact "audit digest" for the AI step
  │
  ├─ GENERATE  ai.structured({   [LOCAL call on the buyer's BYOK key]         progress:"Writing your migration roadmap…"
  │     system: HEALTH_SYSTEM,                  // §9
  │     prompt: buildPrompt(auditDigest, projectContext),
  │     schema: CodebaseHealthOutput,           // §6 — SDK-enforced
  │     effort: "high",
  │   })  → CodebaseHealthOutput                 // stream partials for progressive in-app UI
  │     - score/areas/findings are pre-filled FROM the engine;
  │       AI writes narrative, roadmap order, rationale, risks
  │
  └─ RENDER + EXPORT (local)                                                  progress:"Building your report…"
        - render the report in the app; buyer exports PDF/JSON to a local path
        - nothing persisted server-side; the report lives on the buyer's disk
```

- **AI is called once** (the generate step), `effort: "high"` (the roadmap quality is the artifact), **locally on the buyer's key**. Read + analyze are deterministic Node — no AI cost to the buyer.
- **Libraries / engines (bundled in the app):** the analysis is the **OSS `legacy-analyzer` engine itself** (it ships `@typescript-eslint/parser` + regex fallbacks), invoked in-process via its `analyze-legacy-app` entry against the local path — **never re-implemented.** No clone/unzip libs are needed in this model (the repo is already on disk). The AI call uses the same `runStructured`/`generateObject` pattern as the spine (doc 04 §7), but runs in the local app on the buyer's key. _OPEN QUESTION: vendor the engine source vs depend on the published npm engine (default: depend on it so `pnpm install` pulls it — segment README)._
- **Reuse:** the **local-app shell** (license client, BYOK + repo-path inputs, the run/progress/report UI, local PDF/JSON export) and the `runLegacyAnalyzer` adapter are the segment's shared spine. `blast-radius-analyzer` swaps in `runCodeIndexer`; `wcag-audit-report` swaps in `runAccessibilityChecker` (and adds a local URL mode). Build the shell generic now.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at producing a coherent, well-prioritized, repo-specific roadmap), `openai`, `google`. Cheaper option offered in the app: `claude-haiku-4-5` (faster, fine for smaller repos). Per platform-spec §5 (the BYOK rules apply, adapted to local).
- **The key is entered in the LOCAL app and is NEVER transmitted to us.** It lives in the app's memory (and, only if the buyer chooses, in local OS-keychain/`.env` storage on their own machine) and is used solely for the local AI provider call. It never reaches a Digitribe server — the license-validation endpoint sees only the license key + a device id, never the BYOK key (§15). State this at the key field.
- **Buyer cost expectation** (show in app): one run is a **single** structured generation over a compact audit digest (the typed engine output, not the raw source — a few K tokens) → typically **well under $0.15 on the buyer's key**, even for a large repo. Set the expectation so there's no bill surprise (doc 03 §5).
- **Pre-run validation:** a 1-token ping via the AI wrapper, locally; on failure show error #1, no run consumed (there's no quota anyway — runs are unlimited under an active license).

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject` against `CodebaseHealthOutput` (doc 04 §7) — the model cannot return free-form. **The call runs in the local app on the buyer's BYOK key.**

> The paid AI layer is **gated by the license**: the app makes the generate call only after a successful license validation (online once, then a cached signed receipt — §14). Without a valid license the app can still run the free deterministic engine (it's MIT) but not the AI roadmap/narrative — that's the paid value.

**System prompt (draft):**

```
You are a principal frontend engineer writing a codebase health & migration report
for a React/TypeScript application. You are given the DETERMINISTIC output of a
static-analysis engine (legacy-analyzer): a health score (0–100), per-area findings,
detected tech, and migration hints with real file paths. Your job is to turn those
facts into a senior, prioritized, plain-English report.

Hard rules:
- The overallScore, per-area scores, issue counts, framework, react version, and all
  file paths are FACTS from the engine. Copy them exactly. NEVER change a score,
  invent a file path, or claim an issue the engine did not report.
- Use ONLY the engine's findings plus the owner's projectContext. No invented metrics,
  no hallucinated files, no generic advice ungrounded in this repo's findings.
- Write the roadmap as an ORDERED, prioritized plan: the single highest-leverage fix
  first. Each step states why-now and what it unblocks, grounded in the findings, with
  an effort estimate (S/M/L) and the real affectedFiles from the engine's hints.
- The headline leads with the verdict for THIS repo ("A React 18 CRA app scoring 64/100,
  held back by 9 god components and a scattered API layer"), not a generic preamble.
- topRisks: the 1–3 findings that would hurt most if ignored — be specific to this repo.
- If a roadmap step touches shared/widely-used files, set blastRadiusHint and the
  upsell.needsBlastRadius flag. If anti-patterns include accessibility issues, set
  upsell.needsWcagAudit.
- Be honest. A clean repo gets a high score and a short roadmap — do not manufacture
  problems. Low-finding repos get an honest "this is in good shape, here's the polish."
- Senior, plain, confident tone. No marketing fluff, no "In today's fast-paced…",
  no restated-prompt preamble, no "As an AI".
```

**User prompt template:** `buildPrompt(auditDigest, projectContext)` → serializes the engine's `AnalyzeLegacyAppOutput` (the `healthScore`, `tech`, each per-area result block, the `migrationHints[]` with paths) plus the owner's optional context. **Only the typed digest is sent to the provider — never the raw source files** (keeps the prompt small, cheap, and free of injected instructions from buyer code — even though the call is on the buyer's own key, this discipline keeps cost bounded and the output grounded).

**Model + effort per call:** one call, `effort: "high"` — prioritization and grounded rationale are the value.

**Guardrails:** schema enforcement prevents shape drift; the "scores/paths are facts, copy them" rule + sending only the typed digest (not raw code) curbs hallucination; the "be honest, don't manufacture problems" rule keeps low-finding repos credible (doc 03 §2.5). Handle `stop_reason:"refusal"`/empty per platform-spec §5 (retry once locally, then a clean error).

## 10. Edge cases & failure modes

| #   | Trigger                                        | Detection                          | Behavior / message                                                                                  | License/run impact |
| --- | ---------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | Invalid/expired BYOK key                       | pre-run ping fails (local)         | "Your `<provider>` key looks invalid or expired — check and retry."                                 | no run consumed    |
| 2   | License key invalid / not for this product     | `license/validate` → `valid:false` | "That license key doesn't match this app. Check the key from your email, or contact us."            | AI layer locked    |
| 3   | License over-activated (all device slots used) | validate → activations exhausted   | "This license is active on its maximum number of machines. Deactivate one, or contact us."          | AI layer locked    |
| 4   | Offline at first activation (never validated)  | no cached receipt + network fail   | "Connect to the internet once to activate. After that the app works offline."                       | AI layer locked    |
| 5   | Offline after activation (receipt valid)       | cached receipt present + fresh     | proceeds normally, fully offline; re-validates next time it's online / receipt nears expiry         | works offline      |
| 6   | Bad repo path (missing / not a directory)      | local FS check                     | "We couldn't find a project at `<path>`. Pick the folder that contains your package.json."          | no run             |
| 7   | Path isn't a React/TS project                  | engine `detect-project-tech`       | honest report: "No analyzable React/TS source found at `<path/subPath>`." low/empty areas           | runs (honest)      |
| 8   | Repo over size cap (files/bytes)               | local caps                         | engine samples top files by source-dir; report `sampled:true`, "analyzed N of M files"              | runs               |
| 9   | Monorepo / app not at root                     | no `package.json` at root          | prompt for `subPath`; if absent, analyze detected app dir + note it in the report                   | runs               |
| 10  | Provider rate-limit / timeout mid-generate     | AI wrapper error (local)           | retry once w/ backoff; if still failing, clean error, keep inputs — re-run freely                   | no penalty         |
| 11  | Engine throws on a malformed file              | per-tool try/catch (engine has it) | engine skips the file, continues; report reflects accurate `filesAnalyzed`                          | runs               |
| 12  | Clean repo (few/no findings)                   | low `totalIssues`                  | honest high score + short roadmap ("in good shape; here's the polish") — never manufacture problems | runs               |
| 13  | Engine error / unexpected crash                | top-level try/catch                | clean in-app error, inputs preserved, "try again or contact us"                                     | no penalty         |

> No "quota exhausted" row — under the local-app/license model, runs are unlimited while the license is active. The gating failure mode is **license** state (#2–#5), not per-run quota.

## 11. UX / UI flow

> **Two surfaces** (doc 03 §1 quality bar applies to both). (a) the **STORE sales page + buy + license/download delivery** (uses the storefront/spine); (b) the **LOCAL APP UI** — the actual tool, applying doc 06 design tokens/states locally.

### 11a. Store surface (sales + buy + delivery) — uses the spine

- **Sales page** (`/store/codebase-health-report`, server-rendered, SEO §12): hero outcome + a **real sample report visual** + price + **Buy**. "How it works": **1) Buy → 2) Download the app + get your license key → 3) `pnpm install && pnpm dev`, paste your license + AI key, point it at your repo → 4) get the report — your code never leaves your machine.** "See a real example" expands our own anonymized dog-food report. FAQ (also JSON-LD), trust strip (local-first, key-safety), cross-sell to the sibling SKUs + agency CTA.
- **Buy → Polar checkout** (platform-spec §9) → on `order.paid` the webhook issues a **License** and emails (Resend) the **license key + download link** (no in-browser tool, no access token). A `/store/checkout/success` page confirms "check your email for your key + download," and links the download + a short setup guide.
- This surface is the **only** part on our infrastructure; it never touches the buyer's code.

### 11b. Local app UI (the actual tool) — runs on the buyer's machine

The app implements the doc 06 state machine **locally** (tokens, states, components reused as a local design system — no network for any of it except the two calls noted):

- **Onboarding / unlock:** a one-time **license key field** (paste from email) → "Activate" → one online `license/validate` call → unlocked. Shows activations remaining; explains offline behavior. If offline at first run, a clear "connect once to activate" state (§10 #4).
- **Empty / collecting input:** a **repo path picker** (OS folder picker if available, plus a path field), advanced (`subPath`, `projectContext` textarea), provider select + **BYOK key field** (with **"your AI key never leaves this machine — it's used only for the local AI call"** + "where do I get a key?" helper + a "your code is never executed, uploaded, or retained" badge), **Run** button (disabled until valid).
- **Validating key:** inline ✓/✗ on the key field (local ping; never a full-page block).
- **Running:** full-width **live progress** driven by the local pipeline's progress events — real labels ("Reading 1,240 files…", "Analyzing components 3/11…", "Found 18 issues so far", "Writing your migration roadmap…"), a progress bar, a rotating "did you know" about codebase health. `aria-live="polite"`. Sections skeleton-fill as the structured stream arrives.
- **Partial:** if the repo was sampled, a non-blocking "analyzed N of M files" banner; continue to success.
- **Success / artifact view (rendered in-app):**
  - Top: **overall grade + score** (big `ScoreRing`, animates in), the `headline` verdict, repo facts (framework · React version · language · "N of M files").
  - **`topRisks`** strip (the 1–3 things that matter most), above the fold.
  - **11 area cards** (`DimensionCard`): per-area score ring + status chip (good/partial/poor) + findings + explanation. A small `StatBar` viz of the 11 area scores for at-a-glance shape.
  - **The migration roadmap** — an ordered, numbered list of steps: priority chip, effort badge (S/M/L), title, rationale, affected files (collapsible), and a `blastRadiusHint` callout where present.
  - **Exports (local):** **Export PDF** (primary — the forwardable artifact, generated locally), **Export JSON** — both write to a local path the buyer chooses. No "email me a copy" (there's no server in the loop; the file is already on their disk).
  - **Upsell card** if `upsell.needsBlastRadius` → Blast-Radius Analyzer (links the store page); if `needsWcagAudit` → WCAG Audit Report; agency "want us to run this migration?" CTA.
- **Error:** clear message per §10 + retry; never lose entered input or the picked path.
- **License-locked:** if the license is invalid/over-activated/unactivated, a gentle state explaining the issue with a "manage license / contact us" link — the free deterministic engine may still run, but the AI roadmap is gated.

Components: reuse the shared store UI kit as a **local design system** — `KeyInput` (adapted: now also "your key stays local"), `RunProgress`, `ArtifactShell`, `ScoreRing`, `DimensionCard`, `StatBar`, plus a **repo-path picker** and a **license field** (new, shared across the three apps). The only product-specific component is the `codebase-health-report` artifact body (grade + area cards + roadmap). Apply doc 06 §1 tokens, §4 state chart, and §6 motion **locally**; copy tone per `PROJECT_VISION.md` — senior, plain, confident.

## 12. SEO

> SEO applies to the **store sales page** (the only indexable surface; the local app isn't a web page).

- **Target keyword:** "local codebase health check" / "offline React codebase audit tool" / "React migration plan tool (your code stays local)" (tool + informational intent; lean into local-first).
- **`generateMetadata`:** title `Codebase Health & Migration Report — Local React Audit App` (≤60); description: "A downloadable app that scores your React/TypeScript repo 0–100 and writes a prioritized migration roadmap — locally, on your own AI key. Your code never leaves your machine. $49." (≤155). Canonical `/store/codebase-health-report`. OG via `@vercel/og` (grade-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($49) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "Does my code leave my machine?" (no — it's a local app; only a one-time license check + your own AI call go out, never your code), "How do I run it?" (download, `pnpm install && pnpm dev`, paste your license + AI key, pick a folder), "What does the health score mean?" (0–100 from a deterministic 22-tool audit), "Which frameworks are supported?" (CRA, Vite, Next App/Pages router, Remix, Gatsby, bare React), "Do you store my API key?" (no — it stays on your machine), "How many machines can I use it on?" (your license covers N — see license terms), "Isn't the engine open source?" (yes — the MIT `legacy-analyzer`; you pay for the app, the AI roadmap, and the license), "Can you do the migration for us?" (yes — that's our agency service).
- **Internal links:** the OSS `mcp-toolkit` README/repo → here; blog posts on React migrations → here; sibling **Blast-Radius Analyzer** and **WCAG Audit Report** sales pages.
- **Programmatic surface (note):** anonymized example reports (e.g. our own engines' reports) could become indexable `/store/codebase-health-report/examples/<slug>` pages — defer to v2; the dog-food sample is the launch asset.

## 13. Usability & accessibility

> Applies to **both** the store sales page (web, axe-gated) **and** the local app UI (built to the same AA bar, axe-gated in the app's own test suite).

- WCAG 2.1 AA in the local app: every input labeled; the repo-path picker + license field are properly labeled; provider/key fields grouped in a `<fieldset>` with legend; progress region `aria-live="polite"` + `role="status"`; focus moves to the report `<h2>` on success; grade/status chips pair color with the letter + status word (never color alone, doc 06 §5).
- Mobile: the **store sales page** is mobile-first; the local app targets desktop (devs run it on a workstation) but degrades gracefully to a narrow window — area cards stack, roadmap is a vertical numbered list, export buttons full-width.
- Error recovery: errors inline + non-destructive (input + picked path preserved); "retry" re-runs without re-entering the key.
- Gate CI on `@axe-core/playwright` for the sales page **and** the local app's UI.

## 14. Payment integration

> Polar one-time → **generate a license key + email a download link** (NOT an in-browser access token). This is the model's key payment delta.

- Create Polar product **"Codebase Health & Migration Report" $49** (sandbox + live). Checkout metadata `{ slug: "codebase-health-report" }`. The base checkout flow is platform-spec §9, but the **webhook branch for Segment-5 SKUs issues a license instead of minting a tool access token**:
  - On `order.paid`: create `Purchase` + `License` (key bound to purchase + slug; license module §19), then **email the license key + the app download link** via Resend (doc 07 §5 receipt, extended with the key + download).
  - On `refund`: revoke the license (mark inactive; the app's next online validation fails closed, falling back to the free engine only).
- **License model (`OPEN QUESTION:` with a default):** **1 license = N machine activations** (default **N = 3 device activations**), tracked by an opaque device id at `license/validate`; a buyer can deactivate a device to free a slot. Per-seat / team licenses are a v2 tier. Decide N + the deactivation UX before launch; record in `DECISIONS.md`.
- **Validation contract** (the new endpoint — flag for doc 04): `POST /api/store/license/validate` → req `{ licenseKey: string, deviceId: string, slug: string }` → res `{ valid: boolean, activationsRemaining: number, reason?: 'invalid' | 'wrong_product' | 'over_activated' | 'revoked' }`. **Never receives buyer code.** Rate-limited per key/IP (doc 04 §10). The app caches a signed, time-bounded activation receipt for offline use (default 30 days; §10 #4–#5).
- **Refund stance:** one-click refund honored if the app never worked for the buyer. Refund → license revoked.

## 15. Security & privacy

> Under the local model the threat surface **shrinks dramatically** vs the old cloud-upload design: we never receive the buyer's code, so there's no untrusted-code-on-our-server risk at all. This section is the **segment-wide local threat model** (referenced by `blast-radius-analyzer.md` §15 and `wcag-audit-report.md` §15).

- **Buyer data:** the buyer's repo is read **from their own disk by the local app** — it is **never uploaded, cloned, transmitted, logged, or retained by us.** The produced report lives on the buyer's machine. We retain only the `Purchase`/`License`/`Activation` records (no code, no report). State this plainly at the app's input and on the sales page (doc 03 §5) — it's the headline selling point.
- **What the license endpoint sees:** only `{ licenseKey, deviceId, slug }`. **Never the BYOK key, never any source code, never the report.** The device id is an opaque, app-generated identifier (e.g. a hashed machine fingerprint or a random per-install uuid) — not PII.
- **Product-specific risks + mitigations:**
  - **Arbitrary code execution — still the #1 engine risk, now protecting the buyer's own machine.** The app **never** `npm install`s the target, builds it, runs a script, `eval`s, or executes any file. The engine is pure static AST/regex parsing (ts-morph / `@typescript-eslint/parser`) — it reads text, it doesn't run it. Enforce: no child-process spawn of repo scripts. This is a **launch blocker** if violated.
  - **Indirect prompt injection via repo content** — only the engine's **typed digest** (scores, counts, file paths) is sent to the AI provider, never raw file bodies, so a malicious comment in the buyer's code can't issue instructions to the model. Treat any string from the repo as data, never as a command. (Holds even though the AI call is on the buyer's own key.)
  - **BYOK key safety** — the key is entered locally and never transmitted to us; if the buyer opts to persist it, store it in the OS keychain or a local `.env`, never plaintext in app state on disk. Redact it from any local error/log.
  - **License integrity** — sign the activation receipt (the app verifies it offline); rate-limit `license/validate`; fail closed (no AI layer) on an invalid/revoked license, but never break the free deterministic engine.
  - **Supply-chain (the download itself)** — ship the app from a trusted source (signed tarball / private registry / verified repo); document an integrity check so the buyer trusts what they're running. (`OPEN QUESTION:` distribution channel + signing for the download.)
  - **Resource exhaustion on the buyer's machine** — hard caps + sampling so a giant repo doesn't hang the buyer's app; it's their machine, but a good tool still degrades gracefully.
- **Gone from the model entirely:** server-side untrusted-code execution, SSRF on a clone URL, zip-slip on an upload, our storage of buyer source. (The WCAG product's optional URL mode keeps an SSRF guard, but the network is the buyer's own — see that PRD §15.)
- Shared rules (license handling, rate-limit on the validate endpoint, webhook verify, env) per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

> Privacy-preserving: the local app emits **no telemetry about the buyer's code**. Store-side, we measure purchase + license; in-app, only opt-in, anonymous, non-code events (if any).

- Store-side events (platform-spec §13, adapted): `store_product_view`, `store_checkout_start`, `store_purchase`, plus `chr_license_issued`, `chr_license_validated` (first activation — our best "activation" proxy), `chr_download_started`.
- Optional in-app anonymous events (opt-in, no code/paths/keys): `chr_run_complete` (grade band only), `chr_pdf_export`, `chr_upsell_click`. Default **off** unless the buyer opts in — consistent with the local-first promise.
- **Activation:** purchase → first successful **license validation** from the installed app (the closest server-visible proxy for "they got it working"). **Target ≥ 80%.** A secondary, opt-in proxy is the first in-app `chr_run_complete`.
- Watch: license-validation success rate, over-activation rate (informs the N default), refund rate (<3%), download-to-activation drop-off (informs setup-guide quality), upsell CTR (from report copy → store).

## 17. Development phases

> Three workstreams: **the local app** (the bulk), **the store-side license issuance**, and **the engine integration**. Vertical slices, each shippable/testable. Assumes the spine's purchase/Polar/email primitives exist (platform-spec §9, the new license module §19).

- **Phase 0 — Scaffold (local app shell + store license stub).**
  - Local app: scaffold the downloadable app (`pnpm dev` runs it), the repo-path picker, license + BYOK fields, empty `CodebaseHealthOutput` schema, the doc-06 design system applied locally. _AC: `pnpm install && pnpm dev` opens the app; all inputs render._
  - Store: Polar sandbox product; webhook issues a stub `License` + emails a key + (placeholder) download link; `POST /api/store/license/validate` returns `{ valid, activationsRemaining }`. _AC: sandbox buy → license email arrives → app's validate call unlocks._
  - **Packaging (`OPEN QUESTION:`):** confirm the **pnpm-dev downloadable repo** for v1 (vs Electron/Tauri vs CLI) and the download/distribution channel + signing.
- **Phase 1 — Engine + contract (no AI), local.** Bundle + wire the `runLegacyAnalyzer` adapter in-process over a **local fixture repo**; input/output schemas; pipeline returns a schema-valid contract with the AI step mocked. _AC: unit test (in the app): fixture repo path → valid `CodebaseHealthOutput`; no-execute guard holds; `overallScore` equals the engine's `healthScore`._
- **Phase 2 — Real run + UI + license, local.** Wire BYOK + `ai.structured` (live AI on a test key) locally, all UI states, in-app report render + **local PDF/JSON export**; wire the real license validation + offline receipt cache + device-activation enforcement. _AC: end-to-end on a dev machine: activate license → pick a repo → run → see report → export PDF/JSON; offline-after-activation works; over-activation is enforced; all §10 cases handled._
- **Phase 3 — Store sales page + polish + Showcase Checklist.** Sales-page copy, metadata, JSON-LD, OG, a11y pass (axe) on the page **and** the app, analytics events, upsell cards, the setup guide. _AC: axe clean (page + app); events fire; Lighthouse ≥90 on the sales page._ **Embed doc 03 §6 Showcase Checklist as acceptance criteria:**
  - [ ] Sample output asset created (our own `mcp-toolkit` health report, anonymized) and shown on the sales page + storefront card.
  - [ ] Artifact leads with the headline verdict (answer-first) and the roadmap is prioritized by impact.
  - [ ] Output is provably repo-specific (eval check passes — §2.1): scores + file paths trace to the engine.
  - [ ] Designed data-viz: the `ScoreRing` + the 11-area `StatBar`, rendered in the app.
  - [ ] Branded, designed PDF export (generated locally), not a screenshot.
  - [ ] Running state streams real phases + "found N issues" counter (§3), locally.
  - [ ] All 8 UI states designed in the app — no default spinners/blank screens.
  - [ ] "Your code never leaves your machine / your key stays local / your code is never executed" + license terms + expected-cost visible (§5, §8).
  - [ ] AI-tells absent (filler/hallucination eval passes — §2.5); scores/paths never invented.
  - [ ] Senior copy throughout; open-core + local-first boundary stated plainly.
  - [ ] `impeccable` / `taste` pass on the artifact + sales page; `ui-ux-pro` + axe pass on the app UI.
  - [ ] App degrades gracefully in a narrow window; sales page is mobile-first.
- **Phase 4 — Launch.** Live Polar product, the real download channel + integrity/signing, license revocation-on-refund verified, monitoring on the license endpoint. _AC: platform-spec §15 Definition of Done (adapted: license issuance + download + local run, not a cloud artifact) all checked._

## 18. Testing strategy

> Tests run **in the local app** (engine + pipeline + Output Contract) and **on the store side** (license issuance + validation + webhook). E2E is the local activation flow, not a cloud run.

| Edge (§10)         | Test                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| #1 key invalid     | unit: pre-run ping mock rejects → error, no run consumed                                                                  |
| #2 license invalid | integration: `license/validate` with a bad key → `valid:false`, AI layer locked                                           |
| #3 over-activated  | integration: N+1th device → `over_activated`, AI layer locked                                                             |
| #4 offline first   | unit: no cached receipt + network fail → "connect once" state, free engine only                                           |
| #5 offline after   | unit: valid cached receipt + network fail → runs fully offline                                                            |
| #6 bad repo path   | unit: missing/non-dir path → clean error, no run                                                                          |
| no-execute (§15)   | unit: the app never spawns a repo script / never installs / never builds the target                                       |
| #7 no React/TS     | unit: empty/non-React fixture → honest low/empty areas, still valid contract                                              |
| #8 large repo      | unit: >cap fixture → `sampled:true`, accurate `filesAnalyzed`                                                             |
| score-fidelity     | unit: `overallScore` === engine `healthScore`; AI cannot alter it                                                         |
| no-code-leaves     | unit/integration: assert no source bytes ever leave the app; `license/validate` body is only `{licenseKey,deviceId,slug}` |

Full method, fixtures, the canonical mocks, the provider×input×failure **scenario matrix** (doc 05 §3 — clone it per this product, dropping the cloud-only rows like SSRF/zip-slip which the local model removes), and eval golden-set format + judges are in [`../05-testing-strategy.md`](../05-testing-strategy.md); for this product they run in the app's own Vitest + a small store-side suite for the license endpoint. Product-specific eval expectations: ~8 real repos (our own engines + a few public CRA/Vite/Next apps) with expected grade bands + `mustFlag` areas + `mustMention` files; judges `input_specific` ("could this report belong to a different repo? if yes, FAIL"), `no_ai_tells`, `factual` (every score/path traces to the engine output — zero invented files), `format_valid` (PDF renders, JSON validates).

**The one test that matters most:** local fixture repo (real source tree) → local pipeline (mocked AI returning a fixed object derived from the engine's real output) → **valid `CodebaseHealthOutput`** with `overallScore` equal to the engine's `healthScore` and every `affectedFiles` path present in the fixture.

## 19. Dependencies & platform integration

> **This product does NOT depend on the spine's in-browser run flow (platform-spec §6).** It depends on the spine's purchase/Polar/email primitives, and on a **new shared LICENSING module** (the segment's one net-new shared concern).

- **From the spine (store side):** Polar checkout + webhook §9 (extended with the license-issuance branch), Resend email §8/doc 07 §5 (extended with the key + download link), SEO scaffold §12, analytics §13. Import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `StoreErr`, the webhook/checkout contracts. It does **not** use `ProductPipeline`/`AiRunner`/`RunEvent` as cloud-runner types; the local app has its own (small) equivalents that mirror them.
- **New shared LICENSING module (net-new, scope = Segment 5 for now):** `lib/store/license.ts` (key generation bound to a purchase, validation, device-activation tracking against a `License`/`Activation` table) + the `POST /api/store/license/validate` route + a tiny client in each app (validate-once + cache a signed receipt). **Could be promoted to segment-0 spine if other downloadable products appear; for now scope it here.** **Flag (do not edit those docs here):** the validate endpoint contract, the `License`/`Activation` types, and the webhook license branch should be added to `04-implementation-contracts.md` and noted in `01-platform-spec.md §7` (data model) + §9 (Polar webhook). Surfaced to the orchestrator.
- **The local app (the product itself):** a small downloadable React/Vite (or Next standalone) app + a thin local core. New libs are minimal and **bundled into the app**: the **OSS `legacy-analyzer` engine** (depend on the published `mcp-react-toolkit` so `pnpm install` pulls it — `OPEN QUESTION:` import vs vendor), the AI SDK for the local BYOK call, a local HTML→PDF for export. **No clone/unzip/Blob libs** (the repo is on disk).
- **Cross-product reuse:** the **local-app shell** (license client, BYOK + repo-path inputs, run/progress/report UI, local PDF/JSON export) is shared with `blast-radius-analyzer` and `wcag-audit-report` — build it generic now. It's the segment's defining shared piece (replacing the old shared `ingestRepo`, which the local model eliminates).

## 20. Open questions & risks

- `OPEN QUESTION:` (packaging, segment-wide) **pnpm-dev downloadable repo vs Electron/Tauri vs global CLI** — default **pnpm-dev downloadable repo for v1** (matches the buyer instruction; tradeoffs in the segment README). Others v2.
- `OPEN QUESTION:` (license activation model) **1 license = how many machine activations + deactivation UX** — default **3 device activations**, deactivatable. Record in `DECISIONS.md`.
- `OPEN QUESTION:` (offline behavior) **activation-receipt offline validity window** — default **first activation online, then a signed receipt valid 30 days offline**, re-validated when online.
- `OPEN QUESTION:` (auto-update) **how the buyer gets new versions** — default **manual re-download for v1**; in-app update check v2.
- `OPEN QUESTION:` (engine bundling) **depend on the published npm engine vs vendor its source** — default **depend on it** (`pnpm install` pulls it).
- `OPEN QUESTION:` (distribution + integrity) the download channel + signing/integrity check for the app tarball.
- `OPEN QUESTION:` Polar product id + price confirm ($49, range $29–79); Postgres host (Supabase vs Neon) for the `License`/`Activation` tables — platform-spec §1.
- **Risk — code execution (security):** mitigation = the strict no-execute model (§15), tested; launch blocker. Now protects the buyer's machine.
- **Risk — license leakage / piracy** (a downloadable app is easier to share than a server tool): mitigation = device-activation cap + online-once validation + signed receipts; accept that a determined pirate can run the free engine anyway (it's MIT) — we sell the AI layer + app + support, and the license raises the friction enough for honest buyers. Don't over-engineer DRM on low-price tools (mirrors platform-spec §4 anti-share stance).
- **Risk — report reads generic on a clean repo:** mitigation = honest-confidence rule, `input_specific` eval judge, the repo-fact headline.
- **Risk — buyer surprised by their own API cost:** mitigation = show expected per-run cost in the app (§8) — bounded because only the typed digest hits the AI.
- **Risk — packaging friction (`pnpm dev` is too much for some buyers):** mitigation = a crisp setup guide; the buyer is a developer; Electron/Tauri as the v2 escape hatch.
