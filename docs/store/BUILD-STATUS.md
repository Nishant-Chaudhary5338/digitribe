# Build Status — store.digitribe

> Living implementation tracker. Updated as work ships. Branch: `feat/store-foundation`.
> Last updated: 2026-06-20. Tests: **133 green** · Review passes: **7** (findings in `REVIEW-FINDINGS.md`). Products live: **15** — Segments **1, 3, 4 complete**; **6 at 6/8**.
>
> **Product-aware UI: ✅** — a generic artifact renderer (pure `toViewModel`) + schema-driven **multi-field** input (`inputFields`) make **all 15 in-browser products runnable end-to-end** in the tool UI (single + multi-field). Remaining products (Seg 2, 5, + 2 in Seg 6) need new infra (below).

## Platform spine (segment-0) — ✅ COMPLETE

S1 types/errors/events/env · S2 KV (atomic quota, bucketed rate-limit, idempotency) · S3 DB schema + **migrations** · S4 access tokens (+ revoke tombstone) · S5 BYOK vault · S6 AI runner · S7 registry + Polar checkout + webhook fulfilment + licensing · S8 job runner + 6 API routes · S9 blob + Resend emails · S10 tool UI · S11 storefront + checkout · S12 demo product.
Toolchain: corepack/pnpm fixed; `pnpm test:unit` + `pnpm typecheck` clean.

## Products

| Slug                     | Segment | Delivery   | Status          | Tests                            |
| ------------------------ | ------- | ---------- | --------------- | -------------------------------- |
| hello-store (demo)       | 1       | in-browser | ✅ built+tested | pipeline                         |
| agent-ready-kit          | 1       | in-browser | ✅ built+tested | schema/ssrf/crawl/score/pipeline |
| conversion-teardown      | 6       | in-browser | ✅ built+tested | schema/pipeline                  |
| ad-hook-generator        | 6       | in-browser | ✅ built+tested | schema/pipeline                  |
| saas-pricing-teardown    | 6       | in-browser | ✅ built+tested | schema/pipeline                  |
| positioning-generator    | 6       | in-browser | ✅ built+tested | schema/pipeline                  |
| dtc-email-flows          | 6       | in-browser | ✅ built+tested | schema/pipeline                  |
| shopify-pdp-optimizer    | 6       | in-browser | ✅ built+tested | schema/pipeline                  |
| prompt-eval-suite        | 4       | in-browser | ✅ built+tested | schema/pipeline                  |
| grade-my-agent           | 4       | in-browser | ✅ built+tested | schema/pipeline                  |
| golden-dataset-generator | 4       | in-browser | ✅ built+tested | schema/pipeline                  |
| regression-guard         | 4       | in-browser | ✅ built+tested | schema/pipeline                  |
| scan-my-mcp              | 3       | in-browser | ✅ built+tested | schema/pipeline                  |
| mcp-hardening-kit        | 3       | in-browser | ✅ built+tested | schema/pipeline                  |
| agent-injection-suite    | 3       | in-browser | ✅ built+tested | schema/pipeline                  |
| tool-permission-auditor  | 3       | in-browser | ✅ built+tested | schema/pipeline                  |

## Deferred — need new infrastructure (documented, not forgotten)

| Item                                                                     | Blocked on                                                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| ad-message-match (Seg 6)                                                 | multimodal/vision input on the AI runner (SW-6)                         |
| digibot-in-a-box (Seg 6)                                                 | multi-tenant widget hosting + runtime key vault (S6-1)                  |
| Segment 2 — Compliance (C2PA stamper, audit, disclosure, bulk-watermark) | C2PA signing micro-service + cert (S2-1/S2-2)                           |
| Segment 5 — Codebase (health/blast-radius/wcag)                          | downloadable local-app + license delivery (D-13/14/15)                  |
| Richer per-product artifact views + component tests                      | RTL/jsdom setup (generic renderer ✅ done; polish + a11y tests pending) |
| Eval / golden-set + generated-file parse-validation (all file products)  | a real AI key for LLM judges (parse-checks doable in CI)                |

## Test coverage (well-covered)

crypto (tokens/vault) · atomic quota incl. concurrency · SSRF · crawler · scorer · all pipeline score/boolean overrides · runner finalize order + failure-no-spend + replay · webhook fulfilment + durable refund-revoke · license cap · AI error taxonomy · every route handler (checkout/key-check/artifact token-gate+zip/license-validate) · zip bundle.

## Owner action items (unchanged)

Create Polar products · run the migration on a real DB · connect the test-generator MCP · counsel review (`08-legal-drafts.md`) · fill the 2 🔴 citations (`research-sources.md`).
