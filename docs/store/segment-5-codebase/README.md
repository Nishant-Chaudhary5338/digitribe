# Segment 5 — Codebase Intelligence

> Turn the founders' open-source static-analysis engines into **downloadable, local-first, BYOK codebase tools** the buyer runs on their own machine — their code never leaves it. Read [`../00-overview.md`](../00-overview.md) and [`../01-platform-spec.md`](../01-platform-spec.md) first. This is the segment with the **deepest existing engineering** behind it — it productizes shipped, CI-verified OSS, not a greenfield idea.
>
> **This segment is the store's one exception to the in-browser run flow (spine §6).** Per **D-13/D-14/D-15** these products are NOT cloud tools. Each is a standalone downloadable local app (`pnpm install && pnpm dev`, then point it at a local repo). The store/cloud side does only **purchase → license issuance → download delivery**; the engine + the paid AI narrative layer run **locally on the buyer's machine, on the buyer's BYOK key**. The buyer's code never reaches our servers — that is the headline selling point.

---

## Thesis

Every team that inherited a React/TypeScript codebase is flying blind. They can _feel_ the legacy weight — the 800-line components, the duplicated utilities, the file nobody dares touch — but they have no map, no score, and no plan. The existing options are either (a) a senior consultant who reads the repo for a week and charges $5k, or (b) a pile of disconnected linters that produce 4,000 warnings and zero priorities. Neither tells a tech lead the one thing they actually need before a migration, a refactor, or a risky change: **how bad is it, what breaks if I touch this, and what do I fix first.**

Digitribe already built the engines that answer those questions — and shipped them as open source. The [`mcp-toolkit`](https://github.com/Nishant-Chaudhary5338/mcp-toolkit) is **17 production MCP servers (450 tests, CI on Node 20 + 22)**, including `legacy-analyzer` (a 22-tool, 0–100 codebase health audit), `accessibility-checker` (a WCAG 2.1 rule engine), and the companion [`@mcp-toolkit/code-indexer`](https://www.npmjs.com/package/@mcp-toolkit/code-indexer) — a ts-morph-based engine that indexes any TS/React repo into a queryable **code graph** (files · components · functions, with `imports`/`renders`/`calls`/`references` edges) and answers structural questions: _who renders this, who calls this, find references, **blast radius**, cycles._

The store's job is to take those deterministic engines — which run today as CLIs and MCP servers — and wrap them in the thing the bare OSS can't be: **a polished, local desktop-grade app a tech lead pays $29–$59 for once, installs, points at any repo on their disk, and gets a designed, prioritized, AI-narrated report from — on their own AI key, with their code never leaving the machine.** The heavy lifting (AST analysis, the code graph, the a11y scan) stays **deterministic and reproducible**; the BYOK-AI layer adds what static analysis can't — the plain-English explanation, the prioritized migration roadmap, the "what breaks if you change this" narrative, and the fix guidance. The license unlocks that paid layer and the polished local UI.

**Why us:** we wrote these engines, we maintain them, and we run them in CI on our own repos. Our analysis isn't "ask the LLM if the code looks bad" — it's a deterministic engine producing typed findings, with AI reserved for reasoning and writing. That combination — a real static-analysis core, a senior studio's taste for presentation, and a local-first privacy guarantee no SaaS competitor can credibly match — is the moat a clone of the OSS can't replicate.

### Market signals (cite in sales copy)

- Maintenance is **~60–80% of total software cost over a product's life** — the codebase you inherit is the bill you keep paying. (Common SWE-economics figure; trace exact source in `../research-sources.md` before shipping.)
- React/TS is the default front-end stack; the long tail of CRA / Vite / pages-router apps that need to migrate (to App Router, to strict TS, to React 19) is enormous and growing as each major release lands.
- ADA web-accessibility lawsuits run **~4,000+ federal + state filings per year** in the US, the large majority over WCAG failures on websites and apps — a direct financial-consequence framing for the WCAG product (trace exact 2025–2026 figure in `../research-sources.md`).

> Sources tracked in `../research-sources.md` (the shared citation list used across sales pages). Mark any stat you can't trace there as `OPEN QUESTION:` rather than ship it unverified.

## The delivery model (read this — it's the whole strategy, D-13/14/15)

This segment is delivered as **downloadable local apps**, not cloud tools. The boundary, and why it's safer and more salable than an upload-to-our-server model:

| Runs on OUR servers (the store/cloud side — thin)                                                                                                                         | Runs on the BUYER's machine (the local app — does the real work)                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The **storefront + sales page** (uses the spine: storefront, Polar checkout, SEO, OG). The buyer browses and buys here.                                                   | **Nothing of the store spine.** The local app is its own small repo / package the buyer downloads and runs.                                                                                                                    |
| **Purchase → license issuance**: Polar one-time order → generate a **license key** → email (Resend) the key + a **download link**. (No in-browser access token here.)     | **Repo ingestion happens locally** — the buyer points the app at any folder on their disk. No clone, no zip upload, no server round-trip with code.                                                                            |
| **One license-validation endpoint** (`POST /api/store/license/validate`) the app calls once to unlock the paid AI layer. It sees only the key + a device id — never code. | The **deterministic mcp-toolkit engine** (bundled into the app) + the **paid AI narrative layer** run locally on the **buyer's own BYOK key**. The buyer's code is read from disk, analyzed in-process, **never transmitted**. |
| Nothing about the buyer's code, ever.                                                                                                                                     | The **report renders locally** and exports **locally to PDF/JSON** from the app itself.                                                                                                                                        |

The OSS remains the top of the funnel: every star, every `npx`, every MCP install is a warm lead who already trusts the engine. **A fork of the MIT repo cannot replicate the paid product** because the value the store adds — the AI layer, the polished local UI, the license-gated experience, the export — lives in the paid app, not in the bare engine. We never gate the engine; we sell the experience, the intelligence, and the license on top. (Open-core framing stays in every PRD §2/§3.)

> **Determinism rule for this segment** (mirrors Segment 3): a finding's _existence_, _location_, and _class_ come from the deterministic engine. The AI's job is _reasoning, prioritization, narrative, and fix generation_ — grounded in the engine's findings, which are passed in as facts. The model must never "discover" an issue the engine can't point at; that's how you get a fabricated line number or an invented vulnerability. (Enforced by the `factual` eval judge, doc 05 §7 — run locally in the app's own test suite.)

## Products — three separate downloadable apps / SKUs (D-14)

Each is its own standalone download, its own PRD, its own Polar product. A buyer pays only for the tool they want; each maps to a distinct `mcp-toolkit` engine.

| Slug                     | Name                                      | Price | Engine (bundled)            | Input → Artifact                                                                                                               | Status                |
| ------------------------ | ----------------------------------------- | ----- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `codebase-health-report` | **Codebase Health & Migration Report** ⭐ | $49   | `legacy-analyzer`           | local repo path → scored 0–100 health audit + AI-written prioritized migration roadmap, rendered in-app, exported to PDF/JSON  | PRD ✅ flagship       |
| `blast-radius-analyzer`  | Impact / Blast-Radius Analyzer            | $59   | `@mcp-toolkit/code-indexer` | local repo path + a target symbol/file → impact graph + AI "what breaks if you change this" + safe-change checklist (PDF/JSON) | PRD ✅ differentiated |
| `wcag-audit-report`      | WCAG Audit Report                         | $29   | `accessibility-checker`     | local repo path _or_ a local/served URL → scored a11y report, violations by severity + AI fixes, ADA framing (PDF/JSON)        | PRD ✅                |

Each SKU = **download (the local app) + license key**. The buyer runs `pnpm install && pnpm dev`, enters their license key + BYOK key in the app, points it at a repo, and gets the report — all locally.

**Funnel:** the free OSS (`legacy-analyzer`, `code-indexer`, `accessibility-checker`) feeds the top — anyone running the engines is a warm lead. `wcag-audit-report` ($29, narrow + cheap, scary lawsuit framing — the curiosity/urgency entry) → `codebase-health-report` ($49 flagship, the full audit + roadmap) → `blast-radius-analyzer` ($59, the rare differentiated one reached for right before a risky change). Because each is a separate download, cross-sell happens **in the report copy and the sales pages** (each app's footer links the store), not via a shared session. The health report's roadmap cross-sells the blast-radius analyzer ("before you start refactoring `<X>`, check its blast radius") and the WCAG report (when it flags a11y anti-patterns). Each report's footer also funnels the agency CTA: "want us to do the migration for you?"

## Shared logic across this segment (build once, reuse)

The three products share a **local-app shell** pattern. Build the shell once and have each app compose the parts it needs; `codebase-health-report` is the reference implementation, the others reference it.

1. **The local-app shell** (`apps/<slug>/` — a small downloadable repo per SKU, or a shared template instantiated three times). Each app is a minimal local React/Vite (or Next standalone) UI + a thin local server/CLI core that: takes a **local repo path** (a folder picker / path input — no upload, no clone), runs the bundled engine in-process over that path, calls the AI layer on the buyer's BYOK key, renders the report, and exports it to PDF/JSON locally. The shell also holds the **license + BYOK key fields**, the license-validation client, and the doc-06 design tokens/states applied locally. The three apps differ only in: which engine adapter they bundle, their Output Contract + ArtifactView, and their AI prompt — exactly the same "thin per-product surface" invariant as the cloud spine (doc 04 §11), but local.
   _OPEN QUESTION (packaging): three separate repos vs one template-instantiated-thrice vs a monorepo with three app targets — default to **a shared local-app template instantiated per SKU** so each download is self-contained and the buyer's `pnpm dev` is dead simple. See "Packaging" below._

2. **The license module** (`lib/store/license.ts` server-side + a tiny client in each app) — **the segment's single most important NEW shared piece, and the one that does not exist in the OSS or the cloud spine.** It is the only thing the store/cloud side adds for these products:
   - **Issuance** (store side, on Polar `order.paid`): generate a license key bound to the purchase, persist it (`License` row), email it + the download link via Resend.
   - **Validation** (`POST /api/store/license/validate`): the local app calls this **once** with `{ licenseKey, deviceId, slug }`; the endpoint verifies the key, checks it's for this product, records/checks a **device activation**, and returns `{ valid, activationsRemaining }`. It **never receives the buyer's code** — only the key + an opaque device id.
   - **Activation tracking**: a license = **N machine activations** (default below). The endpoint enforces the cap.
   - **Graceful offline**: after a successful online validation the app caches a signed, time-bounded **activation receipt** locally, so the app keeps working offline until the receipt expires (then it re-validates when back online). A first-ever activation requires being online once.
     > Scope it to Segment 5 for now. If other downloadable products appear later, promote it to the segment-0 spine. **Flag for doc 04:** the new `POST /api/store/license/validate` contract + the `License`/`Activation` data model should be added to `04-implementation-contracts.md` and `01-platform-spec.md §7` (do not edit those here; tracked in this README's open questions and surfaced to the orchestrator).

3. **Engine adapters** (`runLegacyAnalyzer`, `runCodeIndexer`, `runAccessibilityChecker`) — thin wrappers, **bundled into each local app**, that invoke the deterministic OSS engines against the local repo path and return their typed output as **grounded facts** for the AI step. These are the OSS itself, imported in-process — never re-implemented. This is the deterministic, free-to-the-buyer, reproducible core, and it runs entirely on the buyer's machine.

> The engines are **deterministic Node, no AI cost to the buyer** — the buyer's BYOK key is spent only on the single AI reasoning/generation call, made locally from the app. That keeps per-run cost well-bounded and predictable (doc 03 §5), and it's why a finding's facts are always reproducible regardless of which provider the buyer brings.

## Packaging (how the buyer actually runs it) — OPEN QUESTION with a default

Per the founder's stated preference and the D-13 buyer instruction (`pnpm install && pnpm dev`):

- **Default (v1): a downloadable repo the buyer runs via `pnpm dev`.** Simplest to build (it's just our React/Vite/Next app, shipped as a zip or a private repo/registry tarball gated by the license), matches the buyer instruction verbatim, no native packaging/signing, easiest to update (re-download). Tradeoff: requires Node + pnpm on the buyer's machine (acceptable — the buyer is a developer); not a double-click app for non-devs (but the buyer of a codebase tool is a dev).
- **Alternative A — Electron/Tauri desktop app:** double-click, no Node prerequisite, OS-native file picker; but adds native build/signing/notarization per OS, larger downloads, and an auto-update channel to maintain. Defer to v2 if non-dev demand appears.
- **Alternative B — global npm CLI (`npx @digitribe/codebase-health`):** zero download step, familiar to devs, trivial updates; but a CLI UI can't deliver the designed in-app report/graph (doc 03 §2.3), so we'd lose the showcase artifact that justifies the price. Could ship as a companion to the app, not the primary.

> `OPEN QUESTION:` (packaging, segment-wide) confirm **pnpm-dev downloadable repo for v1**; Electron/Tauri and the CLI as v2 options. Record in `DECISIONS.md`. Sub-questions: how the engine is bundled into the download (vendored vs an `npm i` of the published engine at install — default: **declare the published engine as a dependency so `pnpm install` pulls it**, keeping our app repo small and the OSS link explicit); auto-update strategy (default: **manual re-download for v1**, an in-app "update available" check is v2).

## Getting the buyer's repo to the tool (now trivial — it's local)

Under the old cloud model this was the segment's hard problem (clone/upload, SSRF, zip-slip, untrusted code on our server). **Under the local model it largely evaporates** — the app reads a folder the buyer already has on their own machine:

- **Input is a local filesystem path** (a folder picker or a path field), validated to exist and to look like a JS/TS project. No GitHub clone, no zip upload, no Vercel Blob.
- **The buyer's code never leaves their machine.** The only things that ever touch the network from the app are: (a) the one license-validation call (key + device id, no code), and (b) the AI provider call on the buyer's own BYOK key — which sends only the engine's **typed digest** (scores, counts, file paths), never raw source bodies (indirect-injection defense; doc 03 §2.5).
- **Never execute buyer code.** No `npm install` of the target, no build, no scripts, no `eval`. The engines parse source statically (ts-morph / regex / AST) — nothing runs. Still the core safety property (now also protecting the buyer's own machine, not our server).
- **Retention:** there is nothing for us to retain — the report lives on the buyer's disk. We retain only the `License`/`Activation` records and the purchase. Disclose per product (§15).

> The residual SSRF concern is **only** in the WCAG product's optional URL mode (fetching a page), and it's the buyer's own local network — still guarded, but the threat is to the buyer, not us. Zip-slip and clone-SSRF are **gone** from the model entirely.

## Eat our own dog food

The `mcp-toolkit` and `code-indexer` repos are the obvious first golden-set fixtures — we know their exact health scores, graphs, and a11y posture — and running each app against our own published repos is both a local regression test and a credibility proof for the sales page ("here's our health report on the engine that generated it"). The `code-indexer`'s own README already shows it indexing a real React 19 app (261 nodes · 538 edges in ~2.7s) — that becomes the blast-radius sample output. Track as a launch task.

## Segment open questions (defaults locked unless vetoed)

- `OPEN QUESTION:` (packaging) **pnpm-dev downloadable repo vs Electron/Tauri vs global CLI.** Default: **pnpm-dev downloadable repo for v1**; others v2. (Supersedes the old S5-1 ingest question, which the local model dissolves.)
- `OPEN QUESTION:` (license activation model) **1 license = how many machine activations?** Default: **3 device activations per license**, deactivatable (a buyer changing machines can free a slot); per-seat upgrades are a v2 tier. Mark in `DECISIONS.md`.
- `OPEN QUESTION:` (offline behavior) **how long does the cached activation receipt stay valid offline?** Default: **first activation must be online; then a signed receipt valid 30 days offline**, re-validated on next online run. Tune in Phase 2.
- `OPEN QUESTION:` (auto-update) **how does the buyer get new versions?** Default: **manual re-download for v1**; an in-app update check is v2.
- `OPEN QUESTION:` (engine bundling) **vendor the engine source vs depend on the published npm engine.** Default: **declare the published engine as a dependency** so `pnpm install` pulls it; vendor only if patching is needed. (Refines the old S5-3.)
- **Flag to shared docs (do NOT edit here):** the new `POST /api/store/license/validate` endpoint + the `License`/`Activation` data model + the license-issuance webhook branch must be added to `04-implementation-contracts.md` (§6 API contracts, §2 types, §10 ops) and noted in `01-platform-spec.md §7` (data model) and §9 (Polar webhook now also issues a license for Segment-5 SKUs). Surfaced to the orchestrator.
