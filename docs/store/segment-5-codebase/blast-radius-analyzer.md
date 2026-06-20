# Impact / Blast-Radius Analyzer — PRD

**Slug:** `blast-radius-analyzer` · **Segment:** 5 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The **rare, differentiated** product in this segment. There is no instant, self-serve tool that answers "what breaks if I change this?" with a real code graph plus a plain-English narrative. Lean into it: this is the one a buyer reaches for in the tense moment right before a risky change. It composes the segment's shared **local-app shell** (see `codebase-health-report.md`) with a different bundled engine — the `@mcp-toolkit/code-indexer` code graph.
>
> **Delivery model (read first):** NOT a cloud tool. A **standalone downloadable local app** (D-13/14/15): the buyer runs `pnpm install && pnpm dev`, points it at a local repo, names a symbol, and gets the impact report — locally, on their own BYOK key. The store/cloud side does only purchase → license issuance → download delivery. **The buyer's code never leaves their machine.**

---

## 1. TL;DR

- **One-liner:** A local app you download and run on your machine — point it at your repo and name a file or symbol, and get the exact blast radius of changing it: everything that breaks, drawn as a graph, explained in plain English, with a safe-change checklist. Your code never leaves your computer.
- **Problem:** Before touching a shared component, hook, or util, an engineer has no reliable way to know what depends on it. "Find all references" in an IDE misses transitive impact and renders; guessing wrong ships a regression. And nobody will paste proprietary code into a web tool to find out.
- **Buyer:** senior engineers / tech leads about to refactor, rename, delete, or change the API of a widely-used symbol in a React/TS codebase.
- **Input → Output:** a **local repo path** + a target symbol/file → an **Impact Report**: the dependency/impact graph (who renders / who calls / references, transitively), an AI "what breaks if you change this" summary, and a safe-change checklist. Rendered in the app, exportable **locally** to branded PDF + JSON. The deliverable is the **downloadable app + license** plus the locally-generated report.
- **Price:** **$59** (range $39–99) (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite, **local app + license** · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~45–90s (local graph-index-bound) · **Re-run quota:** unlimited local runs while the license is active — crucially, **re-run against a different target symbol** for free (a refactor touches several).

## 2. Problem & market

**Today** an engineer about to change a shared symbol — a `Button`, a `useAuth` hook, an API client, a context provider — opens their editor's "Find all references" and hopes. That misses three things that matter most: (1) **transitive** impact (B uses A, C uses B — change A and C breaks too); (2) **render** edges (`<Button/>` usages, not just imports); (3) a human read on _which_ of the impacted call sites is actually risky. So they either over-test everything defensively (slow) or under-test and ship a regression (worse). There's no instant tool that draws the true impact set and tells them where the danger is — and a cloud tool is a non-starter for proprietary code.

**This is open-core (the strategy — see segment README).** The engine is Digitribe's **open-source, MIT** companion [`@mcp-toolkit/code-indexer`](https://www.npmjs.com/package/@mcp-toolkit/code-indexer) — a ts-morph code-graph engine that indexes any TS/React repo (nodes: `repo`/`app`/`package`/`folder`/`file`/`component`/`function`; edges: `contains`/`imports`/`calls`/`renders`/`references`/`depends-on`) and ships a real `blast-radius` query: a DFS transitive closure of all **dependents** over dependency edges. It also exposes `who-renders`, `who-calls`, `find-references`, and `find-cycles`. Anyone can `npx @mcp-toolkit/code-indexer query blast-radius --id <node>` for free, forever — that's the funnel. What we **sell** is a **polished local app** the bare CLI isn't: a designed UI, a target-picker that resolves "roughly what it's called" to the right graph node, a drawn impact graph, an AI narrative of what actually breaks, a safe-change checklist, a local PDF/JSON export — and the **local-first guarantee**. A fork of the MIT engine gets a JSON list of impacted node ids in a terminal; it does not get the app, the picker, the narrative, the design, or the license.

**Competition:** IDE "find references" (no transitive, no renders, no narrative), dependency-cruiser / madge (module-level graphs, no symbol-level blast radius, no reasoning), enterprise code-intelligence platforms (Sourcegraph-class — heavy, subscription, dev-setup, often cloud-indexed). **Gap:** nothing instant, self-serve, and **local** answers "what breaks if I change _this symbol_, in plain English." This is genuinely rare — it's the product's whole pitch.

**Urgency:** regressions from "I didn't know that depended on it" are a constant, costly class of bug; this is the cheap insurance you buy in the five minutes before a scary refactor — and you can buy it once and keep it on your machine. It pairs naturally with the Health Report (whose roadmap flags risky shared-code changes).

**Why Digitribe:** we built the code-graph engine and the blast-radius query itself; we run it live (the engine's own README indexes a real React 19 app: 261 nodes · 538 edges in ~2.7s). Our impact set is a deterministic graph traversal, not an LLM guess — the AI only narrates it.

## 3. Pricing & packaging

- **$59**, one-time (range $39–99; priced above the Health Report because it's rarer, higher-stakes, and reached for at a high-intent moment — right before a change). The engine is free OSS; buyers pay for the **downloadable app + license** (the resolver, the AI narrative, the designed graph report, the local-first experience), stated plainly on the sales page.
- **What one purchase includes:** a **license key** + a **download link** (emailed via Resend). The license unlocks the paid AI layer and permits **N machine activations** (`OPEN QUESTION:` default **3 device activations** — segment README / health PRD §14). Under an active license the buyer runs the tool **as often as they want, locally**, and crucially **re-runs against a different target symbol** at no extra cost (a refactor touches several). The deliverable is the app + license.
- **Upsell / cross-sell:** the **Codebase Health Report** ($49, separate SKU) is the natural precursor ("audit first, then check blast radius before each fix") — and its roadmap copy points here per risky step. Agency CTA in the report footer: "want us to do the refactor safely?" Cross-sell links back to the store sales pages.
- **Future tiers (note only):** a CI mode that fails a PR when a change's blast radius exceeds a threshold is a strong v2 idea (the engine already ships a `check` command — and a local CLI build fits the local model naturally); v1 ships one interactive app SKU.

## 4. User stories / JTBD

- As a **senior engineer about to refactor a shared component**, when I'm changing its props API, I want the exact set of render + call sites that will break, **without uploading our code**, so that I update them all and ship no regression.
- As a **tech lead reviewing a risky PR**, when someone touched a core hook, I want a blast-radius read locally, so that I know how much to scrutinize and test.
- As an **engineer deleting "dead" code**, when I want to remove a file, I want proof nothing still depends on it (and a cycle check), so that I delete safely.
- As a **developer planning a rename**, when a symbol is used widely, I want a checklist of every place to touch in dependency order, so that the rename is mechanical, not archaeological.

**Primary job the artifact must nail:** correctly identify the **transitive impact set** for the named target (renders + calls + references + imports, deduped, with the direct vs transitive distinction), and explain in plain English **what specifically breaks** at the highest-risk sites — grounded in real graph edges, never invented call sites.

**Non-goals (v1):** does NOT auto-apply the change or the rename (agency upsell); does NOT execute or build the repo; does NOT do runtime/dynamic-import call graphs (the engine is static — it says so honestly); does NOT analyze non-JS/TS code; does NOT upload, clone, or transmit the buyer's code (local-first by design).

## 5. Functional requirements

### Inputs (entered in the LOCAL app)

| Field           | Type                          | Validation                                                                                                                  | Example                               |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `repoPath`      | string (local FS path)        | exists, is a directory, looks like a JS/TS project — identical to the shared local-app input (codebase-health-report.md §5) | `/Users/me/work/acme-app`             |
| `target`        | discriminated union           | how the buyer names what they're changing — `nodeId` \| `symbol` \| `file` (see below)                                      | `{ kind: "symbol", query: "Button" }` |
| `target.nodeId` | string                        | exact graph node id when known (advanced)                                                                                   | `cmp:src/Button.tsx#Button`           |
| `target.query`  | string                        | a name to resolve via `search_nodes` (an in-app picker disambiguates)                                                       | `useAuth`                             |
| `target.file`   | string                        | a file path → analyze the file node (and offer its exported symbols)                                                        | `src/lib/api.ts`                      |
| `subPath`       | string (optional)             | app root within a monorepo                                                                                                  | `packages/web`                        |
| `changeContext` | string (optional, ≤500 chars) | what the buyer intends ("renaming the `variant` prop", "deleting this hook")                                                | "changing Button's onClick signature" |
| `licenseKey`    | string (entered once)         | unlocks the paid AI layer; validated online once (health PRD §14)                                                           | `DGT-BRA-XXXX-XXXX`                   |
| `provider`      | enum                          | one of the app's supported `byokProviders`                                                                                  | `anthropic`                           |
| `byokKey`       | string (secret)               | entered in the local app; **never transmitted to us** (§8); used only for the local AI call                                 | `sk-…`                                |

### Processing (requirements level; the LOCAL pipeline is §7)

All of this runs **on the buyer's machine, inside the app**: read the repo from `repoPath` (no clone/upload, §15) → **index it into the code graph** with the bundled `@mcp-toolkit/code-indexer` (deterministic ts-morph) → **resolve the target** to a graph node (`search_nodes` + an in-app picker if `query`/`file`) → run the deterministic graph queries: `blast-radius` (transitive dependents), `who-renders`, `who-calls`, `find-references`, plus `find-cycles` on the impacted subgraph and a `find-orphans` check → assemble an "impact digest" of typed graph facts → call the AI **on the buyer's BYOK key** to generate the narrative + risk ranking + safe-change checklist filling the Output Contract → render the graph + report in the app → export PDF/JSON locally. The only network calls are the one-time license validation and the buyer's own AI provider call.

### Outputs

The **Impact Report**: a drawn impact graph + the AI "what breaks" narrative + a safe-change checklist. Rendered in-app + exported **locally** to branded PDF + JSON. Exact shape in §6.

### Constraints

- **Repo caps** as in the shared local-app model (the engine samples; large repos honored by source-dir detection). The graph is built once and queried many times within a run.
- **Impact set cap:** if the blast radius is huge (e.g. a foundational util used everywhere), cap the rendered/listed sites at the **top N by directness + churn** and report the honest total count ("impacts 312 sites; showing the 40 most direct"). Mirrors the engine's `get_context_pack` truncation.
- **Static-only honesty:** the report explicitly notes the engine is static — dynamic `import()`/runtime dispatch isn't tracked (the engine documents this; we surface it, never hide it).
- **Never execute the repo** (§15). The indexer is pure ts-morph AST parsing; nothing runs.

## 6. ⭐ Output Contract

> Same locked Zod schema, but **produced and rendered by the LOCAL app** and exported locally. The engine-pinned graph fields (impact set, counts, edges, cycles, orphan status) come straight from the deterministic indexer, never the AI.

```ts
// (bundled in the local app) schemas/blast-radius-analyzer.ts
import { z } from 'zod'

// Mirror the code-indexer graph vocabulary exactly (engine's Zod enums).
const NodeType = z.enum([
  'repo',
  'app',
  'package',
  'folder',
  'file',
  'component',
  'function',
  'external',
])
const EdgeType = z.enum(['contains', 'imports', 'calls', 'renders', 'references', 'depends-on'])

const ImpactedNode = z.object({
  id: z.string(), // graph node id, e.g. "cmp:src/Card.tsx#Card" (engine convention)
  name: z.string(),
  type: NodeType,
  path: z.string().nullable(), // file path when filesystem-backed
  edgeType: EdgeType, // how it reaches the target (renders | calls | references | imports)
  directness: z.enum(['direct', 'transitive']), // direct dependent vs reached via the closure
  distance: z.number().int().min(1), // hops from the target in the reverse-dep graph
  risk: z.enum(['low', 'medium', 'high']), // AI-ranked, grounded in edge type + position
  whatBreaks: z.string().max(280), // AI: the concrete failure mode at THIS site
})

const ImpactEdge = z.object({
  from: z.string(), // node id (the dependent)
  to: z.string(), // node id (closer to the target)
  type: EdgeType,
})

const ChecklistItem = z.object({
  order: z.number().int().min(1), // safe order to make the change
  action: z.string().max(200), // imperative ("Update the 4 <Button onClick={…}> call sites in src/forms")
  files: z.array(z.string()).max(20), // real paths from the graph
  why: z.string().max(240),
})

export const BlastRadiusOutput = z.object({
  repo: z.object({
    name: z.string(),
    source: z.literal('local'), // always local — read from the buyer's disk
    nodeCount: z.number().int(), // graph size (engine reports this)
    edgeCount: z.number().int(),
  }),
  target: z.object({
    id: z.string(), // resolved node id
    name: z.string(),
    type: NodeType,
    path: z.string().nullable(),
    signature: z.string().nullable(), // engine: symbol signature when known
  }),
  summary: z.object({
    headline: z.string().max(200), // answer-first: "Changing Button touches 47 sites across 18 files; 6 are high-risk."
    impactCount: z.number().int(), // total blast-radius size (engine's count)
    directCount: z.number().int(),
    filesTouched: z.number().int(),
    highRiskCount: z.number().int(),
    isOrphan: z.boolean(), // engine find-orphans: nothing depends on it (safe to delete)
    inCycle: z.boolean(), // engine find-cycles: target participates in a circular dependency
    staticOnlyCaveat: z.string().max(240), // honest note: dynamic imports/runtime dispatch not tracked
  }),
  impacted: z.array(ImpactedNode).max(100), // top-N by directness + churn; honest total in summary
  graph: z.object({
    // the subgraph to draw: the target + its impacted nodes + the edges between them
    nodes: z
      .array(
        z.object({ id: z.string(), name: z.string(), type: NodeType, path: z.string().nullable() })
      )
      .max(120),
    edges: z.array(ImpactEdge).max(400),
  }),
  whatBreaks: z.array(z.string()).min(1).max(6), // the prioritized plain-English "here's what breaks" list
  safeChangeChecklist: z.array(ChecklistItem).min(1).max(10), // ordered, dependency-aware
  cycles: z.array(z.array(z.string())).max(10), // any cycles the target sits in (node-id sequences)
  upsell: z.object({
    needsHealthReport: z.boolean(), // big/risky impact → recommend the full audit
    reason: z.string(),
  }),
})
export type BlastRadiusOutput = z.infer<typeof BlastRadiusOutput>
```

- **Export formats:** in-app report **with an interactive impact graph** (React) · **PDF** (branded, with a rendered static graph image + the lists, generated **locally**) · **JSON** (the raw contract, saved locally). No file bundle, no server round-trip.
- **Field notes:**
  - `repo.source` is always `'local'`.
  - `impacted`, `graph`, `impactCount`, `directCount`, `isOrphan`, `inCycle`, `cycles`, `target.signature`, `nodeCount`/`edgeCount` are **deterministic engine facts** — straight from `blast-radius` / `who-renders` / `who-calls` / `find-references` / `find-cycles` / `find-orphans` / `get_node`. The AI must copy them exactly.
  - `directness` = the engine's direct-dependent set vs the transitive-closure remainder; `distance` = hops in the reverse-dependency graph; `edgeType` is the real edge from the graph.
  - The AI fills `headline`, per-node `risk` + `whatBreaks`, the `whatBreaks[]` summary, the `safeChangeChecklist`, and `staticOnlyCaveat` — the reasoning layer — grounded entirely in the graph facts.
- **Determinism:** the impact set, counts, edges, cycles, and orphan status are reproducible across providers (it's a graph traversal). Only the narrative, risk ranking, and checklist are generative, and they're constrained to the schema and the real nodes (doc 03 §2.1).

## 7. System logic / pipeline

> **Two surfaces.** (A) The **store/cloud** side does only purchase + license issuance + download delivery (thin — identical to codebase-health-report.md §7A; the only difference is the slug + email). (B) The **local app** runs the analysis pipeline below, on the buyer's machine. NOT the spine's serverless runner (platform-spec §6).

### (A) Store/cloud side — purchase → license → download (thin)

Identical to the flagship: Polar `order.paid` → create `Purchase` + `License` (bound to `blast-radius-analyzer`) → email the license key + download link (no access token); `POST /api/store/license/validate { licenseKey, deviceId, slug }` → `{ valid, activationsRemaining }`, never receiving code. See codebase-health-report.md §7A / §14.

### (B) Local app — the analysis pipeline (runs on the buyer's machine)

```
LOCAL app  (pnpm dev)  →  buyer enters licenseKey + provider + BYOK key, picks repoPath + a target
  │
  ├─ [license] validate once online → unlock paid AI layer; cache signed receipt (offline-tolerant)
  ├─ [validate] repoPath + target input (zod)                 progress:"Checking project…"
  ├─ [key] BYOK key live ping (local)                         progress:"Validating your key…"
  │
  ├─ READ    read the repo from disk (read-only, §15)          progress:"Reading source…"
  │     - NEVER install/build/execute; nothing leaves the machine
  │
  ├─ INDEX   runCodeIndexer(repoPath)  [DETERMINISTIC OSS, in-process]   progress:"Indexing 261 nodes, 538 edges…"
  │     - @mcp-toolkit/code-indexer: ts-morph parse → code graph
  │       (nodes + imports/renders/calls/references edges)
  │     → GraphSnapshot { meta:{nodeCount,edgeCount}, nodes, edges }   // in memory, never stored
  │
  ├─ RESOLVE target → nodeId                                  progress:"Resolving target…"
  │     - if target.nodeId: use it; if missing → INPUT_INVALID
  │     - if target.query/file: search_nodes(query) → ranked candidates.
  │       If exactly one strong match, use it; if ambiguous, surface
  │       candidates to the in-app picker (§11b) — buyer chooses
  │
  ├─ QUERY  [DETERMINISTIC OSS, no AI]                         progress:"Tracing blast radius…",
  │     - blastRadius(id)      → impacted set (transitive)       findingCount:<impactCount>
  │     - whoRenders(id), whoCalls(id), findReferences(id)
  │       → direct dependents + edge types + distances
  │     - findOrphans / is-orphan check → isOrphan
  │     - findCycles → cycles the target participates in
  │     - get_context_pack(id) → signature + truncation
  │     → impactDigest (typed graph facts, capped top-N)
  │
  ├─ GENERATE  ai.structured({   [LOCAL call on the buyer's BYOK key]   progress:"Writing the safe-change plan…"
  │     system: BLAST_SYSTEM,                   // §9
  │     prompt: buildPrompt(impactDigest, changeContext),
  │     schema: BlastRadiusOutput,              // §6 — SDK-enforced
  │     effort: "high",
  │   })  → BlastRadiusOutput                    // stream partials for progressive in-app UI
  │     - graph/impacted/counts pre-filled FROM the engine;
  │       AI writes risk ranking, whatBreaks, the checklist
  │
  └─ RENDER + EXPORT (local)                                  progress:"Building your report…"
        - in-app interactive graph + report; export PDF (static graph
          image + lists) + JSON to a local path. Nothing persisted server-side.
```

- **AI is called once** (generate), `effort: "high"` — the risk read and checklist are the value — **locally on the buyer's key**. Read + index + all graph queries are deterministic Node — no AI cost to the buyer.
- **Engines/libraries (bundled in the app):** the graph + queries are the **OSS `@mcp-toolkit/code-indexer` engine itself** — its `index` builds the graph; its query functions (`blastRadius`, `whoRenders`, `whoCalls`, `findReferences`, `findCycles`, `findOrphans`, `searchNodes`, `getContextPack`) are called in-process against the snapshot. **Never re-implemented.** No clone/unzip libs (the repo is on disk). _OPEN QUESTION: depend on the published `@mcp-toolkit/code-indexer` package vs vendor the engine (default: depend); the graph build is the heaviest deterministic step — measure index time on a large local repo in Phase 2._
- **Reuse:** shares the **local-app shell** (license client, BYOK + repo-path inputs, run/progress/report UI, local PDF/JSON export) with the other two products; the `runCodeIndexer` adapter + the impact-graph viewer are this product's specifics.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at reasoning over a dependency graph and ranking real risk), `openai`, `google`. Cheaper option in the app: `claude-haiku-4-5` (fine for small impact sets). Per platform-spec §5.
- **The key is entered in the LOCAL app and is NEVER transmitted to us** — same as the flagship (§8 there): in-memory (or local keychain if the buyer opts in), used only for the local AI call. The license endpoint never sees it.
- **Buyer cost expectation** (show in app): one structured generation over the typed impact digest (the graph facts for the target + its top-N dependents — a few K tokens; **not** the whole graph or the source) → typically **well under $0.15 on the buyer's key**. The deterministic graph traversal is free. Show it (doc 03 §5).
- **Pre-run validation:** a 1-token ping, locally; on failure show error #1 (no run penalty — runs are unlimited under an active license).

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject` against `BlastRadiusOutput` (doc 04 §7). **The call runs in the local app on the buyer's BYOK key, gated by a valid license.**

**System prompt (draft):**

```
You are a principal engineer doing impact analysis before a code change. You are given
the DETERMINISTIC output of a code-graph engine (code-indexer): the target symbol/file,
its blast radius (the transitive set of dependents), the direct renderers/callers/
referencers with edge types and distances, whether it's an orphan, and any dependency
cycles it sits in. Every node id, edge, count, and path is a FACT from the graph.

Hard rules:
- NEVER invent a call site, a file, an edge, or a dependent. Use ONLY the nodes and
  edges in the provided impact digest. If the graph says 47 dependents, you say 47.
- Copy impactCount, directCount, filesTouched, the impacted nodes, the graph, isOrphan,
  inCycle, and cycles exactly from the engine facts.
- Rank each impacted site's risk (low/medium/high) using edge type and position: a
  `renders` site whose props you're changing is high; a transitive `imports`-only node
  three hops away is low. Explain whatBreaks at each high/medium site concretely.
- The headline leads with the verdict: "Changing <target> touches N sites across M files;
  K are high-risk" — specific numbers from the graph.
- Write safeChangeChecklist as an ORDERED, dependency-aware plan: change leaf dependents
  before shared ones; update render sites before deleting the old prop; verify cycles.
- Be honest about the engine's limits: set staticOnlyCaveat noting that dynamic import()
  and runtime dispatch are NOT in the static graph, so the buyer should still test.
- If isOrphan is true, say so plainly ("nothing depends on this — safe to delete") and
  keep the report short. If inCycle, flag the cycle as a hazard.
- Senior, plain, confident. No fluff, no "In today's…", no restated-prompt preamble,
  no "As an AI".
```

**User prompt template:** `buildPrompt(impactDigest, changeContext)` → serializes the target node (id, type, path, signature), the capped impacted set (id, name, type, path, edgeType, directness, distance), the subgraph edges, `isOrphan`, the cycles, the totals, and the buyer's `changeContext`. **Only graph facts are sent to the provider — never raw source bodies** (small prompt, grounded, no injected instructions from buyer code).

**Model + effort per call:** one call, `effort: "high"` — risk reasoning and ordering are the product.

**Guardrails:** schema enforcement + "use only the provided nodes/edges, copy the counts" rule make fabrication structurally hard (the model reasons _over_ a fixed graph, not discovering edges); the static-only caveat keeps the claim honest; the orphan/cycle facts anchor the verdict. Handle refusal/empty per platform-spec §5 (retry once locally, then clean error).

## 10. Edge cases & failure modes

| #   | Trigger                                         | Detection                           | Behavior / message                                                                                | License/run impact |
| --- | ----------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | Invalid/expired BYOK key                        | pre-run ping fails (local)          | "Your `<provider>` key looks invalid or expired — check and retry."                               | no run penalty     |
| 2   | License invalid / over-activated / offline      | `license/validate` / cached receipt | per the shared license states (health PRD §10 #2–#5)                                              | AI layer gated     |
| 3   | Bad repo path (missing / not a dir / not JS-TS) | local FS / engine check             | clean error: "Pick the folder that contains your package.json."                                   | no run             |
| 4   | Target not found in graph                       | `search_nodes` returns nothing      | "We couldn't find `<query>` in this repo. Pick from the symbols we found." → in-app search picker | no run             |
| 5   | Target ambiguous (multiple matches)             | `search_nodes` multi-candidate      | in-app picker: list candidate nodes (name · path · type) → buyer chooses → continue               | no run yet         |
| 6   | Target is an orphan (nothing depends on it)     | `find-orphans` / empty blast radius | deliver a valid short report: `isOrphan:true`, "nothing depends on this — safe to delete"         | runs (valid)       |
| 7   | Huge blast radius (foundational symbol)         | `impactCount` over cap              | cap to top-N by directness+churn; report honest total ("312 impacts; showing 40 most direct")     | runs               |
| 8   | Target sits in a dependency cycle               | `find-cycles`                       | `inCycle:true`, surface the cycle as a hazard in the checklist                                    | runs               |
| 9   | Provider rate-limit / timeout mid-generate      | AI wrapper error (local)            | retry once w/ backoff; if still failing, clean error, inputs + resolved target preserved          | no penalty         |
| 10  | Repo has no React/TS (empty graph)              | `nodeCount` ~0                      | "No analyzable TS/React graph found here." honest empty result                                    | runs (honest)      |
| 11  | Dynamic-only usage (runtime import of target)   | static graph misses it              | report delivers; `staticOnlyCaveat` warns dynamic dispatch isn't tracked — test before shipping   | runs               |
| 12  | Engine error / unexpected crash                 | top-level try/catch                 | clean in-app error, inputs preserved                                                              | no penalty         |

> No "quota exhausted" row — runs are unlimited under an active license; re-running against a new target is a feature. The gating failure mode is **license** state (#2), not per-run quota.

## 11. UX / UI flow

> **Two surfaces** (doc 03 §1 applies to both): (a) the **STORE sales page + buy + license/download delivery** (spine); (b) the **LOCAL APP UI** (the tool), doc 06 tokens/states applied locally.

### 11a. Store surface (sales + buy + delivery) — uses the spine

- **Sales page** (`/store/blast-radius-analyzer`, server-rendered, SEO §12): hero outcome + a **stylized impact-graph visual** + price + **Buy**. "How it works": **1) Buy → 2) Download the app + get your license key → 3) `pnpm install && pnpm dev`, paste your license + AI key, point it at your repo, name a symbol → 4) get the impact report — your code never leaves your machine.** "See a real example" expands our own anonymized `Button`-style impact report. FAQ (JSON-LD), trust strip, cross-sell to the Health Report + agency CTA.
- **Buy → Polar** → webhook issues a **License** + emails the **license key + download link** (no access token). `/store/checkout/success` confirms "check your email," links the download + setup guide.

### 11b. Local app UI (the tool) — runs on the buyer's machine

Implements the doc 06 state machine **locally**, plus a target-resolution sub-state:

- **Onboarding / unlock:** one-time **license key field** → "Activate" → one online `license/validate` → unlocked; shows activations remaining + offline behavior (shared shell, health PRD §11b).
- **Empty / collecting input:** **repo path picker** (OS folder picker + path field), a **target field** (type a symbol/file name; advanced: paste an exact node id), optional `changeContext` textarea, provider select + **BYOK key field** (key-safety + "your AI key never leaves this machine" + "your code is never executed, uploaded, or retained" badge), **Run** button.
- **Validating key:** inline ✓/✗ (local ping).
- **Resolving / picker:** if the target is ambiguous, a designed **candidate picker** appears after indexing (name · path · type · a usage-count hint) — the buyer selects the right node, then the run continues. The one extra interactive state beyond the standard machine; it must not feel like an error (doc 03 §3).
- **Running:** live progress — "Reading source…", "Indexing 261 nodes, 538 edges…", "Tracing blast radius… 47 dependents found", "Writing the safe-change plan…". `aria-live="polite"`; the impact count animates up.
- **Partial:** if the impact set was capped, a non-blocking "showing 40 of 312" banner.
- **Success / artifact view (rendered in-app):**
  - Top: the **headline verdict** + the key numbers (impacts · files touched · high-risk count) as stat chips; if `isOrphan`, a prominent "safe to delete" badge; if `inCycle`, a hazard chip.
  - **The impact graph** — an interactive, accessible SVG/canvas graph (target at center; direct dependents close, transitive further; edges colored by type: renders / calls / references). Hover a node → its `whatBreaks`. This is the showcase centerpiece (the engine ships a 3D viewer; we render a focused 2D impact view in the app). Respect `prefers-reduced-motion`; provide a list fallback for a11y.
  - **"What breaks" list** — the prioritized plain-English failures, high-risk first.
  - **Impacted sites table** — sortable by risk / directness / distance; each row links its file path and shows the edge-type chip.
  - **Safe-change checklist** — ordered steps with files and "why," a real do-this-in-order plan.
  - **Cycles** panel if any.
  - **Exports (local):** **Export PDF** (primary, includes a rendered graph image, generated locally), **Export JSON** — both to a local path. No "email me a copy" (it's already on disk).
  - **Upsell card** if `upsell.needsHealthReport` → Codebase Health Report (links the store page); agency "want us to do the refactor?" CTA.
- **Error:** clear message per §10 + retry; input + resolved target preserved.
- **License-locked:** gentle state if license invalid/over-activated/unactivated; the free engine may still index, but the AI narrative is gated.

Components: reuse the shared local design system — `KeyInput` (adapted "your key stays local"), `RunProgress`, `ArtifactShell`, `SeverityChip`, `StatBar`, the shared **repo-path picker** + **license field**. New components: the `blast-radius-analyzer` artifact body (graph + lists) and a focused **impact-graph viewer** (built on `motion` + an accessible SVG/canvas graph — not the engine's full 3D `react-force-graph`; keep it light + a11y-first). The target picker reuses a generic combobox. Apply doc 06 §1 tokens, §4 state chart (+ the resolve/picker sub-state), §6 motion locally; copy tone per `PROJECT_VISION.md`.

## 12. SEO

> SEO applies to the **store sales page** only (the local app isn't a web page).

- **Target keyword:** "what breaks if I change this code" / "code impact analysis tool (local)" / "blast radius refactoring app" / "find all references transitive" (tool + informational intent; lean into local-first).
- **`generateMetadata`:** title `Blast-Radius Analyzer — See What Breaks Before You Change It` (≤60); description: "A downloadable app: name a file or symbol in your React/TS repo and get its full impact graph, a plain-English 'what breaks' read, and a safe-change checklist — locally, on your own AI key. Your code stays put. $59." (≤155). Canonical `/store/blast-radius-analyzer`. OG via `@vercel/og` (a stylized impact-graph visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($59) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What's a blast radius?" (every symbol that transitively depends on what you're changing — renders, calls, references), "Does my code leave my machine?" (no — it's a local app; only a one-time license check + your own AI call go out), "How is this different from my IDE's Find References?" (transitive + render edges + risk narrative, not just direct imports), "Does it run my code?" (no — static graph only), "What if my target is used dynamically?" (we flag that the static graph can't see runtime dispatch), "How do I run it?" (download, `pnpm install && pnpm dev`, paste license + AI key, pick a folder + a symbol), "Isn't the engine open source?" (yes — `@mcp-toolkit/code-indexer`; you pay for the app, the narrative, the graph report, and the license).
- **Internal links:** the OSS `code-indexer` README → here; the **Codebase Health Report** sales page (precursor) → here; blog posts on safe refactoring → here.
- **Programmatic surface (note):** an anonymized example impact report (our own engine's `Button`-style symbol) is the launch sample; indexable example pages defer to v2.

## 13. Usability & accessibility

> Applies to **both** the store sales page (web, axe-gated) **and** the local app UI (same AA bar, axe-gated in the app's test suite).

- WCAG 2.1 AA in the local app: every input labeled; the **candidate picker** is a real listbox with keyboard selection; the repo-path picker + target field + license field are labeled; provider/key in a `<fieldset>`; progress region `aria-live="polite"` + `role="status"`; focus moves to the report `<h2>` on success.
- **The graph is the a11y hard part:** the interactive graph must have a **fully equivalent accessible alternative** — the impacted-sites table is keyboard-navigable and is the source of truth; the graph is `role="img"` with an `aria-label` summary ("impact graph: 47 nodes, target at center"); never color-only for edge types (color + a labeled legend + chips). Respect `prefers-reduced-motion`.
- Mobile / narrow window: the **sales page** is mobile-first; the **local app** targets desktop but degrades — the graph collapses to the impacted-sites table + the "what breaks" list (table is the primary narrow view), checklist is a vertical numbered list.
- Error recovery: inline, non-destructive; retry keeps the resolved target so the buyer doesn't re-pick.
- Gate CI on `@axe-core/playwright` for the sales page **and** the app UI (including the graph alternative).

## 14. Payment integration

> Polar one-time → **license key + download link** (NOT an access token) — identical mechanism to the flagship (codebase-health-report.md §14); only the slug, product name, and price differ.

- Create Polar product **"Blast-Radius Analyzer" $59** (sandbox + live). Checkout metadata `{ slug: "blast-radius-analyzer" }`. Webhook `order.paid` → `Purchase` + `License` (bound to this slug) → email the **license key + download link** via Resend; `refund` → revoke license.
- **License model:** **1 license = N machine activations** (default **N = 3**, deactivatable — `OPEN QUESTION:`, shared default; segment README). Unlimited local runs (including re-running on different targets) under an active license.
- **Validation contract:** the shared `POST /api/store/license/validate { licenseKey, deviceId, slug }` → `{ valid, activationsRemaining, reason? }` (the new endpoint, flagged for doc 04 in the flagship §14/§19). Never receives buyer code. Offline: signed cached receipt (default 30d).
- **Refund stance:** one-click refund if the app never worked. Re-running against a different target is a feature, not a refund case. Refund → license revoked.

## 15. Security & privacy

- **Buyer data:** the repo is read **from the buyer's own disk by the local app** + the target + optional `changeContext`. Same **local-first guarantee** as the flagship — the full local threat model is **codebase-health-report.md §15** (the shared local-app shell enforces it). This product inherits it verbatim. The code is **never uploaded, cloned, transmitted, logged, or retained by us**; the report lives on the buyer's machine.
- **What the license endpoint sees:** only `{ licenseKey, deviceId, slug }` — never the BYOK key, never source, never the graph, never the report.
- **Product-specific deltas:**
  - The **indexing step builds a graph in memory** from the source, **on the buyer's machine**; the graph snapshot is transient (held only for the run) — it is never stored or transmitted. Only the produced artifact persists, **on the buyer's disk**.
  - **Indirect injection:** only the typed graph digest (node ids, edges, counts) reaches the AI provider — never raw source bodies — so buyer code can't inject prompt instructions.
  - **No execution** (shared rule): the indexer is pure ts-morph AST parsing; it reads source and resolves modules, it never runs the repo, installs deps, or executes a script. Launch blocker if violated. (Now protects the buyer's own machine.)
- Shared rules (license handling, rate-limit on the validate endpoint, BYOK-key locality, webhook verify) per platform-spec §10 and codebase-health-report.md §15 — only the deltas above are specific here. (SSRF/zip-slip are gone from the model — there's no clone or upload.)

## 16. Analytics & success metrics

> Privacy-preserving: the local app emits **no telemetry about the buyer's code**; store-side measures purchase + license; in-app events are opt-in + anonymous.

- Store-side events (platform-spec §13, adapted): `store_product_view`, `store_checkout_start`, `store_purchase`, plus `bra_license_issued`, `bra_license_validated` (first activation proxy), `bra_download_started`.
- Optional in-app anonymous events (opt-in, no code/paths/keys): `bra_run_complete` (impactCount bucket only), `bra_target_resolved` (resolution: exact|picker|nodeId), `bra_rerun_new_target`, `bra_pdf_export`, `bra_upsell_click`. Default off unless opted in.
- **Activation:** purchase → first successful **license validation** from the installed app. **Target ≥ 80%.** Secondary opt-in proxy: first in-app `bra_run_complete`.
- Watch: license-validation success rate, over-activation rate, refund rate (<3%), download-to-activation drop-off, (opt-in) target-resolution-failure + re-run-new-target rates (healthy signs), upsell CTR.

## 17. Development phases

> Three workstreams — **the local app** (the bulk, incl. the graph viewer), **store-side license issuance** (shared with the flagship), **engine integration**. Assumes the flagship's **local-app shell** + the license module exist (build the flagship first).

- **Phase 0 — Scaffold.** Local app: instantiate the shared local-app shell for this SKU; repo-path + target fields, empty `BlastRadiusOutput` schema, doc-06 design system local. Store: Polar sandbox product; webhook issues a `License` for this slug + emails key + download link; reuse the shared `license/validate`. _AC: `pnpm dev` opens the app; sandbox buy → license email → app validate unlocks._
- **Phase 1 — Index + graph queries + contract (no AI), local.** Bundle + wire the `runCodeIndexer` adapter + the deterministic queries (`blastRadius`/`whoRenders`/`whoCalls`/`findReferences`/`findCycles`/`findOrphans`/`searchNodes`) + the resolver + input/output schemas; pipeline returns a schema-valid contract from a **local fixture repo** + a known target, AI mocked. _AC: unit test (in the app): fixture repo + target → valid `BlastRadiusOutput` whose `impactCount` + node ids equal the engine's `blast-radius` output; orphan + cycle fixtures handled; no-execute guard holds._
- **Phase 2 — Real run + UI + graph viewer + license, local.** Wire BYOK + `ai.structured` (live AI on a test key) locally + the candidate-picker sub-state + the accessible impact-graph viewer + table fallback + **local PDF (with graph image)/JSON export**; wire real license validation + offline receipt + device-activation enforcement. _AC: end-to-end on a dev machine: activate → pick repo + target → run → see graph report → export; resolution + picker work; offline-after-activation works; all §10 cases handled._
- **Phase 3 — Store sales page + polish + Showcase Checklist.** Sales page, metadata, JSON-LD, OG, a11y pass (axe, incl. the graph alternative) on page **and** app, analytics, upsell, setup guide. _AC: axe clean; events fire; Lighthouse ≥90 on the sales page._ **Embed doc 03 §6 Showcase Checklist:**
  - [ ] Sample output asset created (our own engine's `Button`-style symbol impact report) and shown on the sales page + storefront card.
  - [ ] Artifact leads with the headline verdict (answer-first); "what breaks" is prioritized high-risk-first.
  - [ ] Output is provably repo-specific (eval — §2.1): every impacted node id + path traces to the graph.
  - [ ] Designed data-viz: the impact graph **and** an accessible table fallback (the graph is the centerpiece — beautiful and a11y-complete).
  - [ ] Branded, designed PDF export (with a rendered graph image, generated locally), not a screenshot.
  - [ ] Running state streams real phases + the impact-count counter (§3); the resolve/picker state is designed.
  - [ ] All 8 UI states + the picker sub-state designed — no default spinners/blank screens.
  - [ ] "Your code never leaves your machine / your key stays local / your code is never executed" + license terms + expected-cost visible (§5, §8).
  - [ ] AI-tells absent; no invented call sites (factual eval — §2.5); static-only caveat present.
  - [ ] Senior copy; open-core + local-first boundary stated plainly.
  - [ ] `impeccable` / `taste` pass on the artifact + sales page; `ui-ux-pro` + axe pass on the app UI (graph alternative included).
  - [ ] App degrades gracefully in a narrow window (table + checklist + PDF); sales page mobile-first.
- **Phase 4 — Launch.** Live Polar product, real download channel + signing, license revocation-on-refund verified, monitoring on the license endpoint. _AC: platform-spec §15 DoD (adapted to license + download + local run) all checked._

## 18. Testing strategy

> Tests run **in the local app** (engine + graph + pipeline + contract) and **store-side** (license). E2E is the local activation flow.

| Edge (§10)          | Test                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| #1 key invalid      | unit: pre-run ping mock rejects → error, no run penalty                                        |
| #2 license states   | integration: bad/over-activated/offline key → AI layer gated correctly                         |
| #3 bad repo path    | unit: missing/non-dir/non-JS-TS → clean error                                                  |
| #4 target not found | unit: unknown query → `search_nodes` empty → INPUT_INVALID                                     |
| #5 ambiguous target | integration: multi-candidate → picker payload returned, no run yet                             |
| #6 orphan           | unit: orphan-fixture target → `isOrphan:true`, empty blast radius, valid report                |
| #7 huge radius      | unit: foundational-symbol fixture → capped top-N, honest total count                           |
| #8 cycle            | unit: cyclic fixture → `inCycle:true`, cycle surfaced                                          |
| graph-fidelity      | unit: `impactCount` + impacted node ids === engine `blastRadius()` output                      |
| no-code-leaves      | unit: no source bytes leave the app; `license/validate` body only `{licenseKey,deviceId,slug}` |

Full method, fixtures, the canonical mocks, the provider×input×failure **scenario matrix** (doc 05 §3 — clone per product, dropping cloud-only rows like SSRF/zip-slip), and eval golden-set + judges are in [`../05-testing-strategy.md`](../05-testing-strategy.md); for this product they run in the app's own Vitest + a small store-side license suite. Product-specific eval expectations: ~8 real (repo, target) pairs (our own engines + public apps) with expected `impactCount` bands, `mustInclude` known dependents, and orphan/cycle flags; judges `input_specific` ("could this impact report belong to a different target/repo? if yes, FAIL"), `no_ai_tells`, `factual` (every impacted node id + path exists in the graph; counts match — zero invented sites), `format_valid` (graph nodes/edges reference real ids; PDF renders).

**The one test that matters most:** local fixture repo + a known target → local pipeline (mocked AI returning a fixed object built from the engine's real graph output) → **valid `BlastRadiusOutput`** whose `impacted` node ids and `impactCount` exactly equal `code-indexer`'s deterministic `blastRadius(id)` for that target, and every `graph.nodes[].id` exists in the indexed snapshot.

## 19. Dependencies & platform integration

> **Does NOT depend on the spine's in-browser run flow (platform-spec §6).** Depends on the spine's purchase/Polar/email primitives + the **shared LICENSING module** (flagship §19) + the **shared local-app shell** (flagship §19).

- **From the spine (store side):** Polar checkout + webhook §9 (license-issuance branch), Resend email (key + download), SEO scaffold §12, analytics §13. The **LICENSING module** (`license.ts` + `POST /api/store/license/validate` + the per-app client) is shared with the other Segment-5 products — built once in the flagship; **flagged for doc 04** there.
- **The local app (the product itself):** the shared local-app shell + new libs bundled into the app: the **OSS `@mcp-toolkit/code-indexer` engine** (depend on the package vs vendor — _OPEN QUESTION_), invoked for index + the graph queries; an accessible 2D graph renderer for the viewer (lightweight — `motion` + SVG/canvas; do **not** pull in the engine's full `react-force-graph-3d`); the AI SDK for the local BYOK call; a local HTML→PDF for export. **No clone/unzip/Blob libs** (the repo is on disk).
- **Cross-product reuse:** the **local-app shell** (shared). The `runCodeIndexer` adapter + the impact-graph viewer are this product's specifics.

## 20. Open questions & risks

- `OPEN QUESTION:` (packaging, segment-wide) **pnpm-dev downloadable repo vs Electron/Tauri vs CLI** — default pnpm-dev repo for v1 (segment README). A v2 CI/CLI mode fits this product especially (the engine ships a `check` command).
- `OPEN QUESTION:` (license activation model) **N machine activations + deactivation UX** — default 3, deactivatable (shared).
- `OPEN QUESTION:` (offline behavior) **activation-receipt offline validity** — default first activation online, then signed receipt valid 30d offline (shared).
- `OPEN QUESTION:` (auto-update) **manual re-download for v1** (shared).
- `OPEN QUESTION:` (engine bundling) **depend on the published `@mcp-toolkit/code-indexer` vs vendor** — default depend; the 2D impact-graph renderer choice; how to pick the top-N when the blast radius is huge (directness + churn vs other ranking) — confirm in Phase 1.
- `OPEN QUESTION:` Polar product id + price confirm ($59, range $39–99); Postgres host for `License`/`Activation` — platform-spec §1.
- **Risk — code execution (security):** mitigation = shared no-execute model (§15 / flagship §15), tested; launch blocker. Now protects the buyer's machine.
- **Risk — graph index time / memory on a large local repo** (the heaviest deterministic step): mitigation = caps + sampling; measure on a big repo in Phase 2. (No longer a Vercel cold-start concern — it's the buyer's machine.)
- **Risk — false confidence from a static graph** (dynamic imports/runtime dispatch missed): mitigation = the mandatory `staticOnlyCaveat`, FAQ honesty, "still test" framing — never sell it as complete.
- **Risk — graph viewer a11y:** mitigation = the table fallback is the source of truth, graph is enhancement; axe-gated.
- **Risk — license leakage / piracy:** mitigation = device-activation cap + online-once validation + signed receipts; the free engine is MIT anyway — don't over-engineer DRM (flagship §20).
- **Risk — buyer surprised by their own API cost:** mitigation = expected per-run cost in the app (§8) — bounded because only the graph digest hits the AI.
