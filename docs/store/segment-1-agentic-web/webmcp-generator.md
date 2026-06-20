# WebMCP Endpoint Generator — PRD

**Slug:** `webmcp-generator` · **Segment:** 1 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The **transaction-layer flagship** of Segment 1 and the premium upsell from the Agent-Ready Kit ($29) and the AI Buyer Simulator ($39). It reuses the Kit's **crawl spine** ([`agent-ready-kit.md`](./agent-ready-kit.md) §7) to understand the site, then **generates a deployable MCP server (Node+TS)** exposing the owner's chosen actions as MCP tools. **Critically: it generates a STUB/scaffold the owner wires to their real backend — it does NOT auto-connect to their systems.** That honesty is a hard product invariant.

---

## 1. TL;DR

- **One-liner:** Describe the actions your site should expose to AI agents (search / add-to-cart / book / etc.) → get a deployable MCP server scaffold (Node+TS) that exposes them as MCP tools, ready for you to wire to your backend and ship.
- **Problem:** To be _transactable_ by agents (not just readable), a site needs a real agent endpoint — an MCP server exposing its actions, plus `.well-known` wiring. Standing one up correctly (protocol shape, tool schemas, transport, discovery) is genuine engineering most owners can't do, and consultants charge thousands for it.
- **Buyer:** technical founders / engineers at DTC & SaaS companies who got a "transaction layer: missing" finding (from the Kit or the Simulator) and want a correct, real starting point — not a blog tutorial.
- **Input → Output:** site URL + a short spec of the actions to expose → a downloadable **zip bundle**: a working MCP server scaffold (Node+TS, typed tool definitions matching the spec), an install/deploy README, and the `.well-known` wiring — each tool is a **stub with a clearly marked `// TODO: wire to your backend` boundary**.
- **Price:** **$149** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~60–120s (crawl + multi-file generation) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a site owner who's been told "you need an MCP endpoint so agents can act on your site" faces a real engineering project: learn the Model Context Protocol, design tool schemas for their actions, pick a transport, implement a server, and wire `.well-known` discovery. The standards are young and the examples sparse. Agencies charge $3k–$10k+ to build one. DIY means days of reading protocol specs.

**Competition:** there are MCP SDKs and a few starter templates, but they're generic boilerplate — not generated against _your_ site's actual actions and entities. Enterprise "agentic commerce" vendors sell hosted endpoints with sales calls and lock-in. **Gap:** an instant tool that reads your site, takes your action spec, and hands you a **correct, site-specific MCP server scaffold you own** — typed tools named after your real actions, with the wiring done and only the backend calls left as marked TODOs. That's us, and it's our deepest moat.

**Urgency stat:** MCP has ~97M monthly SDK downloads and 10k+ active servers, and was donated to the Linux Foundation's AAIF (Dec 2025) — it's the de-facto agent action standard. AI shopping traffic up ~4,700% YoY (Adobe). The transaction layer is where the readable-but-not-buyable sites are losing the channel. (See segment README for citations.)

**Why Digitribe (the strongest "why us" in the store):** **building MCP servers is our literal craft** — the open-source `mcp-toolkit` and the team's MCP work mean we generate a _correct_ scaffold (right protocol shape, sane tool schemas, working transport, valid `.well-known`), not a hallucinated template. No other instant tool in this space is run by people who ship MCP servers for a living.

## 3. Pricing & packaging

- **$149**, one-time — the **premium** SKU of Segment 1. Justified by: it produces real, committable engineering (a working server scaffold), it's anchored far below a consultant's $3k+ build, and it's the highest-skill artifact in the catalog. It's an impulse buy for a technical founder who values a correct head-start over days of protocol reading.
- **Includes:** 1 run (3 re-runs in quota to regenerate after refining the action spec), the full **zip bundle** download (server scaffold + README + `.well-known` files), the on-screen file viewer + a readiness summary, and the emailed copy (Resend) with the zip.
- **Upsell / cross-sell:** the buyer typically arrives **from** the Buyer Simulator ($39, "your checkout breaks for agents") or the Kit ($29, "transaction layer: missing") — this is the terminal product in that funnel. From here, the cross-sell is the **agency**: "want us to wire it to your backend, deploy it, and maintain it?" → Digitribe services (this is the warm-lead hand-off to the studio for a real engagement).
- **Future tiers (note only):** a managed/hosted variant (we host + maintain the endpoint) and per-platform generators (a Shopify-specific scaffold) are v2 ideas. v1 ships one self-serve scaffold SKU.

## 4. User stories / JTBD

- As a **technical founder**, when the Kit/Simulator told me my transaction layer is missing, I want a correct MCP server scaffold for my actions, so that I can wire my backend and ship instead of learning the whole protocol.
- As an **engineer at a DTC brand**, when I need to expose search + add-to-cart to agents, I want typed tool definitions named after my real catalog actions, so that the integration work is just my backend calls.
- As a **SaaS developer**, when I want agents to "book a demo" or "search docs," I want a deployable server with those tools and the `.well-known` discovery wired, so that I'm protocol-correct from day one.
- As a **CTO evaluating effort**, when I'm scoping "make us agent-transactable," I want a real starting codebase + README, so that I can estimate the remaining backend work accurately.

**Primary job the artifact must nail:** a **correct, deployable, site-specific MCP server scaffold** — tools named and typed for _this_ owner's stated actions and _this_ site's entities, that installs and runs, with the only remaining work being clearly-marked backend wiring. It must be obviously committable engineering, not a tutorial.

**Non-goals (v1) — stated loudly because they bound the promise:** does NOT auto-connect to the owner's backend / database / cart (every tool is a **stub** with a `// TODO: wire to your backend` boundary); does NOT deploy or host the server for the buyer; does NOT have access to the buyer's systems or credentials; does NOT guarantee the actions work end-to-end until the owner wires them; does NOT build a custom-protocol or proprietary endpoint (it targets MCP + `.well-known`).

## 5. Functional requirements

### Inputs

| Field         | Type                        | Validation                                                         | Example                                            |
| ------------- | --------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| `url`         | string (URL)                | http/https, public, resolves, not an IP/localhost (SSRF guard)     | `https://shop.acme.com`                            |
| `actions`     | array of `ActionSpec` (1–8) | each: a `verb` enum + a short `description`; at least 1, at most 8 | `[{verb:'search', description:'search products'}]` |
| `transport`   | enum                        | `'http'` (Streamable HTTP, default) \| `'stdio'`                   | `http`                                             |
| `packageName` | string (optional, ≤40)      | npm-name-safe; defaults to a slug of the site name                 | `acme-mcp-server`                                  |
| `provider`    | enum                        | one of product's `byokProviders`                                   | `anthropic`                                        |
| `byokKey`     | string (secret)             | non-empty; validated live pre-run (platform-spec §5)               | `sk-…`                                             |

```ts
// ActionSpec (part of the inputSchema, server/store/schemas/webmcp-generator.ts)
const ActionVerb = z.enum([
  'search', // search/browse catalog or content
  'get_item', // fetch a single product/record by id
  'add_to_cart', // commerce: add an item to a cart
  'checkout', // commerce: begin/return a checkout
  'book', // schedule/booking action
  'subscribe', // newsletter/lead capture
  'contact', // submit a contact/support request
  'custom', // owner-described action (description is required, name derived)
])
const ActionSpec = z.object({
  verb: ActionVerb,
  description: z.string().min(3).max(160), // what this action does, in the owner's words
})
```

> The `actions` spec is the owner's short description of what they want exposed. It is intentionally lightweight — the generator infers tool input/output schemas from the verb + description + what the crawl found (e.g. detected product fields), then leaves the backend call as a stub.

### Processing (requirements level; pipeline in §7)

Crawl the site (reusing the Kit's crawler) to understand its entities, commerce structure, and existing metadata → combine with the owner's `actions` spec → the AI step **generates the MCP server scaffold**: an `index.ts` server with one typed MCP tool per action (input schema, output schema, a stubbed handler with a marked backend-wiring TODO), `package.json`, a `README.md` (install/run/deploy + how to wire each tool), the `.well-known/mcp.json` (and an `agents.md` pointer) → validate the generated bundle (does it parse / is the JSON valid / are tool schemas well-formed) → render the file viewer + zip + email.

### Outputs

The **WebMCP Server Bundle** (zip of generated files) + an on-screen file viewer & readiness summary. Exact shape in §6.

### Constraints

- 1–8 actions per server (more than 8 → ask the owner to scope; a sprawling server is a worse starting point).
- Crawl cap as the Kit (≤40 pages, ≤60s) — we need site understanding, not a full mirror.
- Generated bundle is text files only (Node+TS source, JSON, markdown), ≤ a few hundred KB → zip to Vercel Blob.
- The generator emits a **stub** server: it MUST NOT fabricate the owner's backend endpoints, DB connections, or credentials; every handler's backend call is a clearly-marked TODO.

## 6. ⭐ Output Contract

> The locked schema the AI step is forced to fill (`AiRunner.structured`, doc 04 §7; platform-spec §5). For this product the contract **is the set of generated files** plus the deploy guide and a readiness summary. Answer-first hierarchy (doc 03 §2.2): the summary + what-you-got → the files → the deploy steps → the wiring TODOs the owner must complete.

```ts
// server/store/schemas/webmcp-generator.ts
import { z } from 'zod'

const GeneratedFile = z.object({
  path: z.string(), // e.g. "src/index.ts", "package.json", ".well-known/mcp.json", "README.md"
  language: z.enum(['typescript', 'json', 'markdown', 'text']),
  contents: z.string(), // the actual file body, committable as-is
  rationale: z.string().max(280), // "why this file" — shown next to it in the viewer
})

const GeneratedTool = z.object({
  name: z.string(), // MCP tool name, derived from the action, e.g. "search_products"
  fromVerb: z.enum([
    'search',
    'get_item',
    'add_to_cart',
    'checkout',
    'book',
    'subscribe',
    'contact',
    'custom',
  ]),
  description: z.string().max(200), // the tool's MCP description (what an agent reads)
  inputSchemaSummary: z.string().max(200), // human summary of the tool's input params
  outputSchemaSummary: z.string().max(200), // human summary of what it returns
  backendTodo: z.string().max(280), // the EXACT wiring the owner must do for this tool (the stub boundary)
})

export const WebMcpOutput = z.object({
  site: z.object({
    url: z.string().url(),
    title: z.string(),
    summary: z.string().max(500), // model's understanding of the business (from the digest only)
    isCommerce: z.boolean(),
    detectedEntities: z.array(z.string()).max(20), // catalog/brand/key concepts the tools reference
  }),
  server: z.object({
    packageName: z.string(),
    transport: z.enum(['http', 'stdio']),
    runtime: z.literal('node'), // Node + TS, always
    tools: z.array(GeneratedTool).min(1).max(8), // one per requested action
  }),
  files: z.array(GeneratedFile).min(4), // index.ts + package.json + .well-known/mcp.json + README.md, at minimum
  deploySteps: z.array(z.string()).min(3).max(8), // ordered, plain: install → run locally → deploy → register .well-known
  wiringChecklist: z.array(z.string()).min(1).max(12), // the TODOs the owner must complete to make it real
  readiness: z.object({
    // honest framing of what this is and isn't
    isStub: z.literal(true), // ALWAYS true — this is a scaffold, never a live integration (product invariant)
    worksOutOfBox: z.string().max(240), // what runs immediately (the server boots, tools list, return mock data)
    requiresWiring: z.string().max(240), // what the owner must do before it's real
  }),
  upsell: z.object({
    // the terminal cross-sell: the agency
    offerImplementation: z.literal(true),
    reason: z.string(), // "we can wire this to your backend + deploy it" — tied to the actual tools
  }),
})
export type WebMcpOutput = z.infer<typeof WebMcpOutput>
```

- **Export formats:** **ZIP** (the primary deliverable — `files[]` written to their real paths: `src/index.ts`, `package.json`, `tsconfig.json`, `.well-known/mcp.json`, `README.md`, etc.) · on-screen **file viewer** (React, `FileViewer` with per-file copy + rationale) · **JSON** (the raw contract) · **PDF** (a branded one-page "what you got + deploy steps + wiring checklist" cover for the team, not the code dump).
- **Field notes:** `readiness.isStub` is a `z.literal(true)` — the contract **cannot** express "this is a live integration," which encodes the product's honesty invariant at the type level. `backendTodo` per tool and `wiringChecklist` are the explicit stub boundary the owner sees everywhere. `summary`, `contents`, `rationale`, `deploySteps` are generative but constrained.
- **Determinism:** `server.tools.length === actions.length` (one tool per requested action, same order); `runtime` is always `'node'`; the file set always includes the 4 minimum files; the bundle must **parse/validate** (post-generation check, §7/§9). Tool/file _bodies_ are generative but shape-locked.

## 7. System logic / pipeline (reuses the Kit's crawler; adds an MCP-codegen + validation stage)

```
POST /api/store/run/webmcp-generator  { token, byokKey, input }
  │
  ├─ [verify] token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod; 1–8 actions)      emit{phase:"validate",pct:8}
  ├─ [validate] BYOK key live ping (platform-spec §5)        emit{phase:"key",pct:12}
  │
  ├─ CRAWL  crawlSite(url,{maxPages,maxDepth:2})             emit{phase:"crawl",pct:15..45,
  │     ── REUSES Agent-Ready Kit §7 crawler ──                message:"Understanding your site…"}
  │     server/store/tools/agentic/crawl.ts
  │     - detect entities, commerce structure, existing schema,
  │       fields an action would need (e.g. product attributes)
  │     → CrawlResult { pages[], signals, entities, commerceMap }
  │
  ├─ PLAN  buildToolPlan(actions, CrawlResult)               emit{phase:"analyze",pct:50}
  │     - deterministic: map each requested action → a tool name,
  │       a sensible input/output schema sketch from the verb +
  │       detected entities, and a backend-wiring TODO boundary
  │     → ToolPlan (anchors the AI so tools are site-specific)
  │
  ├─ GENERATE  ai.structured({                                emit{phase:"generate",pct:55..90,
  │     system: WEBMCP_SYSTEM,                   // §9          message:"Generating src/index.ts…"}
  │     prompt: buildPrompt(siteDigest, actions, ToolPlan, transport, packageName),
  │     schema: WebMcpOutput,                    // §6 — SDK-enforced
  │     effort: "high",                           // real code; quality is the product
  │   })  → WebMcpOutput                          // streamObject; stream files as they fill (doc 03 §3)
  │     - emits the full file set: src/index.ts (MCP server, one tool per action,
  │       typed, stub handlers w/ marked TODO), package.json, tsconfig.json,
  │       .well-known/mcp.json, README.md, agents.md pointer
  │
  ├─ VALIDATE  validateBundle(output)                        emit{phase:"render",pct:92}
  │     server/store/tools/agentic/mcp-validate.ts  (NEW)
  │     - .well-known/mcp.json is valid JSON; package.json parses;
  │       index.ts parses (TS parse / no syntax errors); tool count
  │       == actions; every handler contains the TODO marker
  │     - on failure: ONE targeted regenerate of the offending file,
  │       then surface honestly if still invalid (don't ship broken code)
  │
  ├─ RENDER  report.build(output)                            emit{phase:"render",pct:96}
  │     - file viewer + zip(files[]) → Blob + branded PDF cover
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the generate step), `effort: "high"` — it's producing real TypeScript; this is the most quality-sensitive generation in the store. The **crawl and the tool plan are deterministic** (they anchor the tools to the real site so the code isn't generic), and a **deterministic validation stage** parses the generated files so we never ship a bundle that doesn't even parse.
- **Libraries:** the Kit's crawler deps (`cheerio`/`linkedom`, `robots-parser`, `fast-xml-parser`); for `validateBundle`, a TS/JSON parse check — _OPEN QUESTION: lightweight parse (the `typescript` compiler's `transpileModule` for a syntax check, or `@babel/parser`) — confirm the lean choice; goal is "does it parse," not a full typecheck._ The **generated** server targets the official MCP TypeScript SDK (`@modelcontextprotocol/sdk`) — that's a dependency of the **owner's** generated `package.json`, **not** of our store app.
- **Reuse / Digitribe edge:** `crawlSite` is imported unchanged from `agentic/`. The MCP-codegen prompt + the `mcp-validate` module draw directly on Digitribe's `mcp-toolkit` MCP expertise — the generated scaffold mirrors patterns the team already ships, which is exactly why it's correct. `validateBundle` is built generic (a future "scan my MCP server" product in Segment 3 can reuse MCP-shape validation).

## 8. BYOK handling

- Providers: `anthropic` (**default `claude-opus-4-8`** — generating correct, idiomatic TypeScript and protocol-valid JSON is the highest-skill task in the catalog; the strong model is the right default), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (fine for a small 1–2 tool server; full-fat Opus recommended for a real multi-tool scaffold). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one large structured generation (multiple code files) → typically **$0.10–$0.40 on the buyer's key** depending on action count and model. This is the most token-heavy product in the store; **set the expectation clearly** so a buyer choosing Opus + 8 actions isn't surprised. `maxOutputTokens` capped per product (doc 04 §10) to bound it.
- **Pre-run validation:** a 1-token ping via `AiRunner.ping()`; on failure return error #1 without spending quota (doc 04 §7).

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by the AI SDK `generateObject` against `WebMcpOutput` (doc 04 §7) — the model returns the file set in the locked shape, never free-form. The deterministic `ToolPlan` is fed in so the tools are anchored to the real site.

**System prompt (draft):**

```
You are a senior engineer who builds Model Context Protocol (MCP) servers in
Node + TypeScript for a living. You generate correct, deployable MCP server
SCAFFOLDS that expose a website's actions as MCP tools — protocol-valid, typed,
and ready for the owner to wire to their own backend.

You are given (1) a digest of a crawled site, (2) the owner's requested actions,
(3) a deterministic tool plan (tool names + schema sketches + the backend-wiring
boundary per action), and the chosen transport and package name.

Produce a complete, SITE-SPECIFIC WebMCP server bundle. Rules:
- Generate REAL, committable Node+TS using the official MCP TypeScript SDK
  (@modelcontextprotocol/sdk). The server must boot and list its tools as-is.
- One MCP tool per requested action, named for the action and THIS site's
  entities (e.g. "search_products", not "search"). Give each tool a clear MCP
  description, a typed input schema, and a typed output schema.
- CRITICAL HONESTY: every tool handler is a STUB. Return realistic mock data and
  include an explicit `// TODO: wire to your backend — <what to call>` at the
  exact point the owner must call their real system. NEVER invent the owner's
  API endpoints, database, credentials, or cart system. NEVER claim the server is
  live or connected. readiness.isStub is always true.
- .well-known/mcp.json must be valid JSON declaring the server + its tools for
  discovery. package.json must be valid and installable. README.md must give
  ordered install/run/deploy steps and a per-tool "how to wire this" section.
- deploySteps and wiringChecklist must be concrete and specific to the generated
  tools (reference the real tool names and the real TODOs).
- Use ONLY facts from the digest + the owner's actions. No invented products,
  prices, or endpoints. If the site is thin, generate sensible tools but say in
  the summary that you inferred from limited content.
- Senior code: typed, no `any`, small handlers, comments only at the wiring
  boundary. No marketing fluff. No "In today's landscape", no preamble.
```

**User prompt template:** `buildPrompt(siteDigest, actions, toolPlan, transport, packageName)` → serializes the crawl digest (entities, commerce structure, existing schema) + the owner's `actions` + the deterministic `ToolPlan` (anchoring tool names/schemas) + transport + package name.

**How the §2 quality bars are met (doc 03):** _input-specific_ — tools are named after the owner's real actions and the site's detected entities, anchored by the deterministic `ToolPlan` (a generic "search" template would fail the eval's `input_specific` judge). _Structured/scannable_ — the file viewer leads with the readiness summary + what-you-got, then files, then deploy + wiring. _Beautiful_ — syntax-highlighted files with per-file rationale + copy buttons (doc 03 §2.3). _No AI-tells / no fabrication_ — the stub invariant + "no invented endpoints" rule; the validation stage rejects non-parsing output.

**Guardrails:** schema enforcement locks the file-set shape; `readiness.isStub: z.literal(true)` makes "this is live" inexpressible; the deterministic `validateBundle` stage (parse JSON/TS, assert TODO markers present, tool count == actions) catches broken or non-stub output and triggers one targeted regenerate. Handle `stop_reason:"refusal"`/empty per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

> Inherits the Kit's crawl/key/SSRF cases; adds codegen/validation-specific ones. Every row is also a test in §18.

| #   | Trigger                                        | Detection                                             | Behavior / message                                                                                         | Quota            |
| --- | ---------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | Invalid/expired BYOK key                       | pre-run ping fails                                    | "Your `<provider>` key looks invalid or expired — check and retry."                                        | not spent        |
| 2   | URL unreachable / DNS fail / 5xx               | fetch homepage fails                                  | "We couldn't reach `<url>`. Is it public and live?"                                                        | not spent        |
| 3   | URL is IP/localhost/private range              | input validation (SSRF guard)                         | reject at form: "Enter a public website URL."                                                              | not spent        |
| 4   | 0 actions or >8 actions submitted              | input validation                                      | reject at form: "Pick 1–8 actions to expose."                                                              | not spent        |
| 5   | JS-only / thin site (little entity signal)     | digest content heuristic                              | still generate from actions + what's found; `summary` notes limited content; tools more generic, honestly  | spent            |
| 6   | Generated bundle fails validation (parse/JSON) | `validateBundle`                                      | ONE targeted regenerate of the bad file; if still invalid → error + restore quota (don't ship broken code) | restored on fail |
| 7   | Model omits the stub TODO / claims it's live   | validation: TODO marker absent                        | regenerate that handler with a stricter reminder; if still non-stub → fail + restore quota                 | restored on fail |
| 8   | Provider rate-limit / timeout mid-generate     | AI wrapper error                                      | retry once w/ backoff; if still failing, error + restore quota                                             | restored         |
| 9   | Model invents owner endpoints/credentials      | post-gen scan for fabricated URLs/secrets in handlers | strip + regenerate the handler as a clean stub; flag in summary if persists                                | spent (cleaned)  |
| 10  | `custom` action with vague description         | description too thin to plan                          | generate a best-effort tool + a prominent TODO; README asks the owner to refine                            | spent            |
| 11  | Non-HTML (PDF/app) homepage                    | content-type check                                    | "This URL isn't a crawlable website."                                                                      | not spent        |
| 12  | Duplicate submit (double-click)                | same `runId` (idempotency §6)                         | return in-flight/cached result; never double-charge                                                        | n/a              |
| 13  | Quota exhausted                                | token check                                           | "You've used all 3 runs — buy again." + buy CTA                                                            | n/a              |
| 14  | Output too large (8 actions, verbose)          | `maxOutputTokens` cap hit                             | cap + ensure the core files complete; if truncated → regenerate with tighter budget                        | restored on fail |

## 11. UX / UI flow

**Sales page** (`/store/webmcp-generator`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states** (the generic 8-state machine, doc 06 §4):

- **Empty / collecting input:** URL field (primary), an **action builder** — add 1–8 actions, each a verb dropdown + a short description field (with examples per verb), transport toggle (HTTP default / stdio), optional package name, provider select + BYOK key (`KeyInput` with helper + "we never store your key" + the higher expected cost range $0.10–$0.40 stated honestly), and a clear **"You'll get a deployable scaffold you wire to your backend — we never touch your systems"** safety/scope line (doc 03 §5). **Generate my MCP server** button (disabled until valid).
- **Validating key:** inline ✓/✗ on the key field (`/key-check`).
- **Running (the showcase of the run, doc 03 §3):** `RunProgress` driven by SSE — "Understanding your site…", then **files filling in progressively** ("Generating src/index.ts…", "Writing .well-known/mcp.json…", "Validating the bundle…") via `streamObject`. The buyer watches their server get built. `aria-live="polite"`; a building/working animation.
- **Partial:** if validation triggered a regenerate, a non-blocking "tidying up the bundle" note; continue.
- **Success / artifact view** (the showcase, doc 03 §2):
  - Top: **readiness summary** answer-first — `worksOutOfBox` vs `requiresWiring`, the tool count, the transport. A clear **"This is a scaffold — here's what runs now and what you wire"** framing (the honest core).
  - **`FileViewer`** (doc 06 §2): tabbed/accordion over the generated files — `src/index.ts`, `package.json`, `.well-known/mcp.json`, `README.md`, etc. — **syntax-highlighted, monospace, filename header, per-file copy button, and the `rationale` ("why this file")**. The handler stubs visibly show their `// TODO: wire to your backend` markers (doc 03 §2.3).
  - **Deploy steps** (ordered) and the **wiring checklist** (the TODOs to make it real) as designed lists, not a wall of prose.
  - Actions: **Download ZIP** (primary — the whole bundle), **Download PDF** (the one-page deploy/wiring cover for the team), **Email me a copy** (pre-checked, auto-sent, includes the zip).
  - **Upsell card:** the terminal cross-sell — **"Want us to wire this to your backend and deploy it? — Digitribe"** agency CTA, tied to the actual generated tools.
- **Error:** clear message per §10 + retry; never lose entered input or the action spec.
- **Quota-exhausted:** message + buy-again CTA.

Components: the shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `FileViewer` (the centerpiece here), `SeverityChip` (doc 06 §2). New components: the input-side **action builder** and `components/store/artifacts/webmcp-generator.tsx` (the readiness summary + FileViewer + deploy/wiring + agency upsell body). Run states follow the state chart in `06-ui-kit.md` §4; copy tone per `PROJECT_VISION.md` — senior, plain, confident. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword(s):** "MCP server generator" / "WebMCP endpoint generator" / "generate MCP server for my website" / "make my site agent-transactable" (tool intent, developer-leaning).
- **`generateMetadata`:** title `WebMCP Generator — Deployable MCP Server for Your Site` (≤60); description: "Describe your site's actions and get a deployable MCP server scaffold (Node+TS) that exposes them as agent tools, with .well-known wiring and a deploy README. $149." (≤155). Canonical `/store/webmcp-generator`. OG via `@vercel/og` (a "your MCP server" code-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($149) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "Does it connect to my backend automatically?" (no — it generates a scaffold with marked TODOs you wire to your systems; we never touch your backend), "What do I get exactly?" (a deployable Node+TS MCP server, `.well-known` wiring, and a deploy README — a zip you own), "What's MCP?" (the Model Context Protocol — the standard way agents call a site's actions), "Do you store my API key?" (no), "Can you wire it up for me?" (yes — that's a Digitribe services engagement).
- **Internal links:** **AI Buyer Simulator** and **Agent-Ready Kit** are the primary inbound funnels (their "transaction layer missing" findings link here); marketing/blog posts on MCP and agentic commerce → here; agency services page ↔ here.
- **Programmatic surface (note):** anonymized example bundles as indexable `/store/webmcp-generator/examples/<slug>` pages would target "MCP server for <platform>" queries — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled (the action builder rows have labeled verb + description fields); provider/key grouped with `<fieldset>` + legend; progress region `role="status"` + `aria-live="polite"` announces generation phases; focus moves to the readiness summary heading (`<h2>`) on success; logical tab order through the action builder and the file tabs.
- **FileViewer a11y (doc 06 §5):** the file tabs are a real `tablist`; each copy button announces "copied"; code blocks are readable (contrast, monospace); the stub TODO markers are visible text, not color-only.
- Mobile: the action builder stacks; the FileViewer becomes an accordion (first-class, not a desktop afterthought); download buttons full-width.
- Error recovery: errors inline + non-destructive (the action spec + input preserved); "retry" re-runs without re-entering the key (kept in memory for the session only, platform-spec §5).
- Gate CI on `@axe-core/playwright` for this route — zero serious/critical violations.

## 14. Payment integration

- Create Polar product **"WebMCP Endpoint Generator" $149** (sandbox + live). Checkout metadata `{ slug: "webmcp-generator" }`. Everything else per platform-spec §9.
- **Refund stance:** at the premium price, a clear refund posture matters — one-click refund honored if the run never produced a **valid, parsing** bundle (the validation stage makes this rare and detectable). Quota auto-restores on system-side / validation failures (§10 #6–#8, #14). "I changed my mind after downloading working code" is not a refund (the artifact was delivered) — stated plainly in the FAQ/terms.

## 15. Security & privacy

- **Buyer data:** the target URL + crawled **public** site content + the owner's action descriptions + the generated bundle. **No buyer backend access, no credentials, no secrets are ever requested or handled** — the generator works only from public crawl + the action spec, which is the core of the honest-stub promise and also its security posture. Retention: crawl content transient; the bundle (files + JSON + PDF) stored 30d (KV/Blob TTL) for re-download; then purged.
- **Product-specific risks:**
  - **SSRF** — same #1 risk as the Kit (shared crawler). Block private IPs, localhost, link-local, metadata IPs (169.254.169.254), non-http(s) schemes; resolve + re-check DNS; cap redirects. Shared guard, shared test table (doc 05 §4).
  - **Generated-code safety** — we generate text files; we **never execute** the generated server. The validation stage **parses** (syntax check) but does **not run** the code. Zip paths are sanitized (no `../`). The generated handlers are stubs returning mock data — no live calls, no secrets baked in.
  - **No fabricated credentials/endpoints** — a post-generation scan rejects any handler that appears to embed a real-looking secret or invent an owner endpoint (§10 #9); the stub boundary is enforced, not just requested.
  - **Untrusted HTML** — parse, never execute; sanitize before display.
- Shared rules (key handling, rate-limit, webhook verify) per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13; doc 04 §9) + product events: `webmcp_generate_complete` (`{ toolCount, transport, valid }`), `webmcp_zip_download`, `webmcp_validation_retry` (`{ reason }`), `webmcp_agency_cta_click`.
- **Activation:** purchase → first run that produces a **valid, parsing** bundle the buyer downloads. **Target ≥ 80%** (the most complex generation in the store → the lowest activation target of the segment, guarded hard by the validation stage).
- **Strategic metric:** **WebMCP → agency lead conversion** (`webmcp_agency_cta_click` → a booked Digitribe engagement) — this premium product's secondary value is sourcing warm, qualified studio leads.
- Watch: validation-retry rate (quality signal on the codegen prompt — a rising rate means prompt/model drift), run-error rate (<8% given complexity), refund rate (<3%).

## 17. Development phases

> Vertical slices. **Depends on the Agent-Ready Kit's crawler existing** (`crawlSite`); the new work is the MCP codegen + the validation stage.

- **Phase 0 — Scaffold.** Registry entry (`webmcp-generator`), Polar sandbox product, empty `WebMcpOutput` schema, blank tool UI (incl. the action builder) behind a sandbox token. _AC: sandbox buy → token → tool UI loads with the action builder._
- **Phase 1 — Codegen contract + validation (mocked AI).** Import `crawlSite`; build `buildToolPlan` + the input/output schemas + `validateBundle`; pipeline returns a schema-valid contract from a **fixture site + fixture actions** with the AI step mocked. _AC: unit test: fixture → valid `WebMcpOutput`; `server.tools.length === actions.length`; `readiness.isStub === true`; `validateBundle` passes on the fixture and **rejects** a deliberately broken bundle (bad JSON / missing TODO marker)._
- **Phase 2 — Real run + UI.** Wire BYOK + `ai.structured` (live Opus), the progressive file-fill running state, `FileViewer` + zip(Blob) + PDF cover + Resend email. _AC: E2E activation path green in sandbox with a real test key — the generated `package.json`/`.well-known/mcp.json` parse, `index.ts` syntax-checks, every handler has the stub TODO; all §10 cases handled._
- **Phase 3 — SEO + polish + the Showcase Checklist (doc 03 §6).** Sales page copy (with a real anonymized example bundle behind "see a real example"), metadata, JSON-LD, OG, a11y pass (axe) incl. FileViewer, analytics events, agency upsell. _AC: every box in the doc 03 §6 Showcase Checklist ticked — **especially** "file/code outputs have copy buttons + filenames + rationale" (this product's centerpiece) and "branded PDF cover"; the bundle is provably site-specific (eval); axe clean; events fire; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring/alerts (validation-retry rate watched), refund flow verified. _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)               | Test                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| #1 key invalid           | unit: pre-run ping mock rejects → error, quota intact                                                |
| #3 SSRF                  | unit: IP/localhost/metadata URLs rejected at validate + fetch (shared table)                         |
| #4 action bounds         | schema: 0 actions and >8 actions rejected by `inputSchema`                                           |
| #5 thin site             | unit: sparse digest → still valid bundle, `summary` flags limited content                            |
| #6 invalid bundle        | unit: AI fixture returning bad JSON / unparseable TS → `validateBundle` fails → regen/quota restored |
| #7 missing stub TODO     | unit: AI fixture handler without the TODO marker → rejected (stub invariant), regen                  |
| #8 AI timeout            | integration: provider error → retry → quota restored on final fail                                   |
| #9 fabricated endpoint   | unit: handler with an invented real-looking URL/secret → stripped/regenerated                        |
| #12 duplicate            | integration: same `runId` returns cached, no double quota                                            |
| **stub invariant (sec)** | schema: `readiness.isStub` is `z.literal(true)` — a fixture with `isStub:false` fails `parse`        |

Full method, fixtures, the canonical mocks, the provider×input×failure **scenario matrix**, sandbox-E2E, eval golden-set format + judges, and CI gates are in [`../05-testing-strategy.md`](../05-testing-strategy.md). Product-specific eval expectations: ~8 real sites × action specs with expected tool names + `mustMention` entities; judges `input_specific` (tools named for the real site/actions, not generic), `no_ai_tells`, `factual` (no invented endpoints/credentials), and a **`format_valid`** judge specialized for this product — the generated `.well-known/mcp.json` is valid JSON, `package.json` parses, `index.ts` syntax-checks via `validateBundle`, and **every tool handler contains the stub TODO marker**. The eval also asserts `readiness.isStub === true` for every case.

**The one test that matters most:** fixture site + fixture actions → pipeline (mocked AI returning a fixed bundle) → **valid `WebMcpOutput`** where `validateBundle` passes (JSON valid, TS parses, one tool per action, every handler stubbed with a TODO) and the ZIP writes the files to correct paths.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF+**zip** §8 (the zip path matters here), Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. The spine modules must already pass `segment-0-spine` DoR.
- **From Segment 1 (reuse):** `server/store/tools/agentic/crawl.ts` (`crawlSite`) imported unchanged. **New module:** `server/store/tools/agentic/mcp-validate.ts` (`validateBundle`) — built generic for reuse by a future Segment-3 "scan my MCP server" product.
- **New libs (minimal):** a lightweight TS/JSON parse for `validateBundle` — _OPEN QUESTION: `typescript` (`transpileModule` syntax check) vs `@babel/parser`; lean to `typescript` since strict TS is already in the toolchain._ Note: the official MCP SDK (`@modelcontextprotocol/sdk`) is a dependency of the **generated** server's `package.json`, **not** of our store app — we generate against it, we don't import it.
- **Cross-product reuse / Digitribe edge:** the codegen prompt and `mcp-validate` embody the `mcp-toolkit` MCP expertise; designing `validateBundle` generic feeds the Segment-3 MCP-security line.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($149).
- `OPEN QUESTION:` Postgres host (Supabase vs Neon) — platform-spec §1 (one-time, store-wide).
- `OPEN QUESTION:` `cheerio` vs `linkedom` — inherited from the Kit; resolve once for the shared crawler.
- `OPEN QUESTION:` `validateBundle` parser — `typescript` `transpileModule` (syntax-only) vs `@babel/parser`. Goal is "does it parse," not a full typecheck (a typecheck against the owner's absent backend would never pass). Lean `typescript`.
- `OPEN QUESTION:` should the bundle target the **HTTP (Streamable) transport** as the default, given `.well-known` discovery favors a hosted HTTP endpoint? Default yes (`transport:'http'`); `stdio` offered for local/dev. Confirm against the current MCP transport guidance via the `claude-api` / mcp-builder references before locking the template.
- **Risk (the defining one) — the buyer expects it to "just work" / auto-connect.** A generated stub that doesn't talk to their backend could feel incomplete at $149 if the framing fails. Mitigation: the honest-stub framing is enforced **everywhere** — `readiness.isStub: z.literal(true)` in the contract, the per-tool `backendTodo`, the `wiringChecklist`, the sales-page FAQ, the "we never touch your systems" scope line, and the agency upsell as the "want it wired for you?" path. The product is sold as _a correct head-start you own_, not a finished integration. This framing is a launch blocker — the `taste`/copy review must verify it's unmissable.
- **Risk — generated code quality (it must actually run/parse).** Mitigation: the deterministic `validateBundle` stage gates every bundle (parse JSON/TS, tool count, stub markers) with one targeted regenerate; the eval `format_valid` judge guards against prompt drift; default to Opus for the hardest task.
- **Risk — buyer surprised by the higher API cost** ($0.10–$0.40, the store's most token-heavy run). Mitigation: show the expected range honestly at the key field (§8); `maxOutputTokens` cap.
- **Risk — SSRF.** Mitigation: shared strict guard, tested (§18); launch blocker, same posture as the Kit.
