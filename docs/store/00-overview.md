# store.digitribe — Overview & Vision

> **Read this first.** It defines what the store is, how it's structured, the rules every product doc obeys, and the order we build in. Every product PRD assumes the reader has read this file and [`01-platform-spec.md`](./01-platform-spec.md).

---

## 1. What this is

A **self-serve store of instant, BYOK AI tools** mounted inside the existing Digitribe marketing site (`digitribe-web`) as a `(store)` route group, live at **`digitribe.world/store`**.

The buyer journey is the entire product thesis:

```
click buy → pay (Polar) → instant access (token) → use the tool themselves → done
```

**Zero human involvement.** No intake calls, no manual delivery, no founder in the loop. The founders earn while asleep.

## 2. The two non-negotiable models

Every product MUST be margin-safe under one of these. We never sell "unlimited AI we pay for."

| Model                            | Rule                                                                                                                                                         | Used by                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| **BYOK** (default, all products) | The buyer supplies their own AI provider key. **We never pay for inference.** The product is the _harness_ (prompts, structure, export, UX), not the tokens. | Every tool with an AI step |
| **Finite deliverable**           | Even with BYOK, each run produces **one bounded artifact** (a report, a file bundle). No open-ended chat loops.                                              | Audits, generators         |

> If a product can't be expressed as "one input → one locked artifact, run on the buyer's key," it does not belong in v1.

## 3. The anti-hallucination doctrine (why these docs exist)

Engineering agents hallucinate when a doc is ambiguous or when shared infrastructure is re-described per product (they read one, miss the canonical rule). So:

1. **Shared infra is documented once** in [`01-platform-spec.md`](./01-platform-spec.md). Product PRDs _reference_ it (e.g. "auth: platform-spec §4"), never restate it.
2. **Every product has a locked Output Contract** — an exact Zod schema + export format. The model fills the schema; we render it. Same artifact every time. This is the single most important section of any PRD.
3. **Every PRD follows** [`02-prd-template.md`](./02-prd-template.md) — same 20 sections, same order. An agent always knows where to find "edge cases" or "payment flow."
4. **Real facts only.** Model IDs, API shapes, dep names come from the codebase or the `claude-api` skill — never invented. When unknown, the PRD says "OPEN QUESTION," it does not guess.

## 4. The store map — 6 segments, ~27 products

Two audiences. One shared platform spine.

### 🟢 For businesses

- **Segment 1 — Agentic Web Readiness** — make a site readable/usable/buyable by AI agents. → [`segment-1-agentic-web/`](./segment-1-agentic-web/)
- **Segment 2 — AI Compliance & Provenance** — EU AI Act / SB 942 content labeling. ⏰ Aug 2026 deadline. → `segment-2-compliance/`

### 🔵 For builders

- **Segment 3 — MCP & Agent Security** — scan/harden MCP servers & agents. Our most defensible. → `segment-3-mcp-security/`
- **Segment 4 — Agent Reliability & Evals** — make agents testable. → `segment-4-evals/`
- **Segment 5 — Codebase Intelligence** — productized from the open-source `mcp-toolkit`. → `segment-5-codebase/`

### 🟣 For founders (Digitribe's own craft, productized)

- **Segment 6 — Conversion & Growth** — the CRO + paid-acquisition work the studio does for $5k clients, sold instant. Each product also funnels warm leads to the agency. Built on Digitribe's actual method (DTC + SaaS aware) and includes **Digibot-in-a-box** — the AI sales assistant the team already built. → `segment-6-conversion/`

Full product list with prices: see each segment's `README.md`.

## 5. Build order

Flagships first; each new product is a config + prompt + Zod schema on the same spine.

| #   | Product                    | Segment | Why this order                                                                        |
| --- | -------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 1   | **Agent-Ready Kit**        | 1       | Broadest demand, easiest input (a URL); establishes the crawl→score→report spine      |
| 2   | **Conversion Teardown**    | 6       | Reuses Kit's crawl→score→report pipeline; monetizes the existing free `/audit` funnel |
| 3   | **Digibot-in-a-box**       | 6       | The AI sales assistant is **already built** — lowest effort, highest uniqueness       |
| 4   | **Scan my MCP server**     | 3       | Most defensible, free CVE-driven marketing, _uniquely us_                             |
| 5   | **Codebase Health Report** | 5       | ~80% built already (`legacy-analyzer`)                                                |
| 6   | **C2PA Content Stamper**   | 2       | Rides the EU AI Act August 2026 deadline spike                                        |

After #1 proves the spine end-to-end, the rest clone the pattern. Products 2–3 are pulled early because they reuse #1's pipeline / already exist.

## 6. Where it lives (grounded in the real repo)

- **Host app:** `digitribe-web` (Next.js 16, React 19, Tailwind v4, TS strict), deployed on **Vercel**, domain **digitribe.world**.
- **Mount point:** `app/(store)/store/...` — a new route group, isolated from `(neutral)`, `(saas)`, `(dtc)`.
- **Reused infra already in the repo:** `@ai-sdk/react` + `ai` (BYOK inference), `@vercel/kv` (access tokens), `@vercel/og` (product/OG cards), `resend` + `react-email` (delivery), `zod` (output contracts), `schema-dts` (SEO JSON-LD).
- **To add:** Polar SDK (payments/MoR), a durable DB for purchases + optional accounts, an encrypted BYOK key vault, optional magic-link auth. See platform-spec.
- **Funnel tie-in:** the existing free `/audit` becomes the top-of-funnel that upsells the paid Agent-Ready Kit.

## 7. Glossary

| Term                   | Meaning                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **BYOK**               | Bring Your Own Key — buyer supplies their AI provider API key; we never pay inference |
| **Output Contract**    | The exact Zod schema + export format a product always produces                        |
| **Access token**       | Short-lived signed token granting use of a purchased tool (see platform-spec §4)      |
| **MoR**                | Merchant of Record (Polar) — handles global VAT/sales tax as legal seller             |
| **Finite deliverable** | A single bounded artifact per run (no open-ended usage)                               |
| **Spine**              | The shared platform layer all products are built on (platform-spec)                   |
| **Job runner**         | The server route that executes a tool's pipeline and streams progress                 |

## 8. Status

| Doc                                  | State                                       |
| ------------------------------------ | ------------------------------------------- |
| `00-overview.md`                     | ✅ this file                                |
| `01-platform-spec.md`                | ✅ shared spine (how it's built)            |
| `02-prd-template.md`                 | ✅ canonical PRD structure                  |
| `03-experience-and-design.md`        | ✅ showcase + output quality bar            |
| `04-implementation-contracts.md`     | ✅ exact types, API I/O, errors, env, ops   |
| `05-testing-strategy.md`             | ✅ fixtures, mocks, scenario matrix, evals  |
| `06-ui-kit.md`                       | ✅ components, wireframes, tokens, states   |
| `07-copy-and-legal.md`               | ✅ microcopy, errors, emails, legal blocks  |
| `segment-0-spine/README.md`          | ✅ build the spine FIRST + DoR              |
| `DECISIONS.md` / `OPEN-QUESTIONS.md` | ✅ locked ADRs + the open-question register |
| `research-sources.md`                | ✅ citation register (fill before launch)   |
| Segment 1 — README + 4 PRDs          | ✅ (Agent-Ready Kit = exemplar)             |
| Segment 2 — README + 4 PRDs          | ✅                                          |
| Segment 3 — README + 4 PRDs          | ✅                                          |
| Segment 4 — README + 4 PRDs          | ✅                                          |
| Segment 5 — README + 3 PRDs          | ✅                                          |
| Segment 6 — README + 8 PRDs          | ✅                                          |

**All ~27 product PRDs + 6 foundation docs + spine plan + registers are written.** Remaining before build: resolve the 🔴 blockers in `OPEN-QUESTIONS.md`, then build the spine (`segment-0`), then ship products in build order.

> **Reading order for an engineering agent:** `00` → `01` → `04` → `03` → `06` → `02` → `05` → `segment-0-spine` (build the spine first) → the target product's segment README → the product PRD.
>
> **Doc roles:** `01` what to build · `04` exact contracts to copy · `03` how good it must be · `06` how it looks · `05` how it's tested · `segment-0` build the spine before any product. These six are non-negotiable for every product; the per-product PRD only adds its input schema, Output Contract, pipeline, prompt, sales copy, and artifact view.
