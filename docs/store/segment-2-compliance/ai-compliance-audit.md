# AI-Content Compliance Audit — PRD

**Slug:** `ai-compliance-audit` · **Segment:** 2 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The **diagnostic** of Segment 2: scores how ready a business is for the AI-content transparency laws and tells them exactly what to fix. Reuses Segment 1's crawl spine for the URL case. AI-assisted (explains/prioritizes); the _checks_ are deterministic so the score is defensible.
>
> ⚖️ **Tooling, not legal advice.** This report is an automated technical readiness assessment against the _publicly stated_ requirements of the EU AI Act Art. 50 and California SB 942. It is **not** a legal opinion, a certification, or a guarantee of compliance. Confirm your specific obligations with qualified counsel. See §15, §20, and the segment README disclaimer.

---

## 1. TL;DR

- **One-liner:** Paste your site URL (or your content) → get a scored "Are you ready for the AI-content transparency laws?" report with the prioritized fixes.
- **Problem:** EU AI Act Art. 50 and California SB 942 require visible + machine-readable AI labeling, disclosures, and (for some) a detection tool — but businesses have **no idea where they stand** or what to do first. "Am I compliant?" is unanswerable without an expert.
- **Buyer:** founders, marketers, and compliance owners at businesses that publish AI-generated content and are spooked by the Aug 2026 deadline.
- **Input → Output:** one URL **or** pasted content → a **Compliance Readiness Report**: an overall readiness score + grade, per-requirement findings (visible label? machine-readable C2PA/IPTC marking? disclosure page? detection tool? licensee notice?), and a **prioritized fix list** — each fix linking the matching paid tool.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–75s URL (crawl-bound) / ~10–20s pasted content · **Re-run quota:** 3.

## 2. Problem & market

**Today** a business that wants to know "are we ready for the AI transparency laws?" has to read the EU AI Act Art. 50 text, the SB 942 / AB 853 amendments, the C2PA spec, and a dozen law-firm explainers — then somehow audit their own site against it. Law firms sell a readiness assessment for thousands; SaaS "AI governance" platforms (enterprise) target legal departments with annual contracts. **Gap:** no instant, affordable, self-serve tool that scans a real site and says "here's your score and the three things to fix, in order." That's us — and it's the **diagnostic that sells the rest of the segment.**

**Competition:** enterprise AI-governance/GRC suites (Holistic AI, OneTrust-style — contract sales), law-firm readiness memos (expensive, slow), generic "EU AI Act checklist" blog posts (no scan, no score). **Differentiation:** we actually _crawl the site_, detect the technical markings (or their absence), score it, prioritize, and hand the buyer the exact cheap fix.

**Urgency stat:** both regimes converge on **2 Aug 2026** (EU Art. 50 application; SB 942 operative date after AB 853), with EU non-compliance in the **up to €15M / 3% of global turnover** tier. The deadline _is_ the demand. (See segment README citations + penalty-tier OPEN QUESTION.)

**Why Digitribe:** we already crawl and score sites (Segment 1's spine) — this reuses it, swapping the readiness dimensions for compliance ones. And every fix the report recommends is a tool **we** sell instant.

## 3. Pricing & packaging

- **$29**, one-time. Anchored against a law-firm readiness memo (thousands) and an enterprise GRC seat (annual contract). A founder's "tell me where I stand for less than a dinner" price.
- **Includes:** 1 run (3 re-runs to re-scan after fixes), the on-screen report, the **branded PDF** ("forward to your boss / counsel"), the JSON, an emailed copy (Resend).
- **Upsell path:** every finding links its fix — "no disclosure page" → **Disclosure Generator** ($19); "AI images unlabeled" → **C2PA Stamper** ($19) / **Bulk Watermark** ($49); agency CTA "want us to make you compliant end-to-end?" → Digitribe services. **This product is the segment's funnel hub.**
- **Future tiers (note only):** scheduled re-audits / monitoring is a v2 idea; v1 is one SKU.

## 4. User stories / JTBD

- As a **founder**, when counsel says "the AI labeling law hits in August," I want to know if my site is ready, so that I can act before the deadline.
- As a **marketer**, when my boss asks "are we compliant?", I want a credible scored report + a to-do list, so that I can show progress and prioritize.
- As a **compliance owner**, when I'm building the AI-content program, I want a baseline assessment of our public surface, so that I know the gaps.
- As an **agency**, when a client publishes AI content, I want to audit them quickly, so that I can sell the fixes.

**Primary job the artifact must nail:** a **site-specific, honest, prioritized** verdict — not a generic "here's the EU AI Act" explainer. It must reference _their_ detected pages, _their_ missing/present markings, and rank the fixes by impact. A reader must not be able to swap another site's report in (doc 03 §2.1).

**Non-goals (v1):** does NOT give a legal opinion or certify compliance; does NOT audit non-public/auth-gated pages; does NOT scan native apps; does NOT _fix_ anything (the fixes are the other products); does NOT assess obligations beyond the AI-content transparency surface (it's not a full EU AI Act risk classification).

## 5. Functional requirements

### Inputs (one of two modes)

| Field             | Type                        | Validation                                                                     | Example                              |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| `mode`            | enum `'url' \| 'content'`   | required                                                                       | `url`                                |
| `url`             | string (URL, if `mode:url`) | http/https, public, resolves, not IP/localhost (SSRF guard, platform-spec §10) | `https://acme.com`                   |
| `maxPages`        | int (if `mode:url`)         | 5–30, default 15                                                               | `15`                                 |
| `content`         | string (if `mode:content`)  | ≤ 50,000 chars; the pasted HTML/text/page source to assess                     | `"<html>…"`                          |
| `jurisdictions`   | enum[] (multi)              | subset of `['eu','california','both']`, default `both` — scopes the ruleset    | `['both']`                           |
| `businessContext` | string (optional, ≤500)     | "we're a DTC brand publishing AI product photos" — tunes recommendations       | `"DTC skincare, AI lifestyle shots"` |
| `provider`        | enum                        | one of product's `byokProviders`                                               | `anthropic`                          |
| `byokKey`         | string (secret)             | non-empty; validated live pre-run (platform-spec §5)                           | `sk-…`                               |

### Processing (requirements level; pipeline in §7)

URL mode: **reuse Segment 1's `crawlSite`** to gather pages + their meta, then **deterministically detect** the compliance markings (visible AI labels in text, machine-readable C2PA/IPTC provenance in images, a disclosure/policy page, a detection-tool link, a robots/`ai.txt`-style signal). Content mode: skip the crawl, run the same detectors on the pasted source. Then the **AI step explains, prioritizes, and writes the verdict** against the deterministic check results.

### Outputs

A **Compliance Readiness Report** — score + grade, per-requirement dimension cards, a prioritized fix list (each linking a product), an evidence appendix. Exact shape in §6.

### Constraints

- URL mode: max 30 pages; respect robots; same SSRF guard + crawl caps as Agent-Ready Kit (platform-spec §10; Seg-1 §7). Content mode: 50k-char cap.
- Image-provenance detection samples up to N images (cost/time cap); report says "sampled N of M."
- Artifact stored 30d, then purged.

## 6. ⭐ Output Contract

> The deterministic detectors set each dimension's `status` + base `score`; the AI step fills the **explanation, prioritization, and prose** within the locked shape. Same hierarchy every run: headline verdict → dimensions → prioritized fixes → evidence.

```ts
// server/store/schemas/ai-compliance-audit.ts
import { z } from 'zod'

const ComplianceDimension = z.object({
  key: z.enum([
    'visible_disclosure', // human-visible "AI-generated" labels on content
    'machine_readable_marking', // C2PA / IPTC / metadata provenance on media
    'disclosure_page', // a public AI-use / AI-disclosure policy page
    'detection_tool', // SB 942: a free public detection tool (covered providers)
    'licensee_notice', // SB 942: informing downstream licensees / API users
  ]),
  label: z.string(),
  appliesTo: z.array(z.enum(['eu', 'california'])).min(1), // which law drives this dimension
  score: z.number().int().min(0).max(100),
  status: z.enum(['missing', 'partial', 'good', 'not_applicable']),
  findings: z.array(z.string()).max(8), // SPECIFIC: cite the buyer's pages/assets
  fixes: z.array(z.string()).max(6), // prioritized, actionable
  fixProduct: z.enum(['c2pa-stamper', 'bulk-watermark', 'disclosure-generator', 'none']), // cross-sell link
})

const Evidence = z.object({
  kind: z.enum(['page', 'image', 'header', 'page_absent']),
  ref: z.string(), // the URL/path/selector the finding is based on
  observation: z.string().max(200), // what we found there (or didn't)
})

export const AiComplianceAuditOutput = z.object({
  subject: z.object({
    mode: z.enum(['url', 'content']),
    url: z.string().optional(),
    title: z.string(),
    pagesScanned: z.number().int(),
    imagesSampled: z.number().int(),
    jurisdictions: z.array(z.enum(['eu', 'california'])).min(1),
    publishesAiContent: z.enum(['detected', 'declared', 'unknown']), // did we find AI media, or only the form said so
  }),
  verdict: z.object({
    overallScore: z.number().int().min(0).max(100),
    grade: z.enum(['A', 'B', 'C', 'D', 'F']),
    readiness: z.enum(['ready', 'mostly_ready', 'gaps', 'not_ready']),
    headline: z.string().max(220), // the single answer-first sentence
  }),
  dimensions: z.array(ComplianceDimension).length(5),
  topFixes: z
    .array(
      z.object({
        priority: z.number().int().min(1).max(5),
        action: z.string().max(160),
        why: z.string().max(200), // ties to the specific gap + the law
        product: z.enum(['c2pa-stamper', 'bulk-watermark', 'disclosure-generator', 'none']),
        effort: z.enum(['quick', 'moderate', 'project']),
      })
    )
    .min(3)
    .max(5),
  evidence: z.array(Evidence).max(30), // the audit trail — what the verdict is based on
  disclaimer: z.literal(
    'Automated technical readiness assessment, not legal advice. Confirm obligations with counsel.'
  ),
})
export type AiComplianceAuditOutput = z.infer<typeof AiComplianceAuditOutput>
```

- **Export formats:** on-screen report (React) · **PDF** (branded "Compliance Readiness Report", platform-spec §8 — designed to forward to counsel) · **JSON** (raw contract).
- **Field notes:** `score`/`grade` use the fixed 0–100 / A–F scale (A ≥90, B ≥75, C ≥60, D ≥40, F <40); the **deterministic detectors set the base scores** so the grade is defensible, the model may not inflate. `status:'not_applicable'` (e.g. `detection_tool`/`licensee_notice` for a non-"covered provider" under SB 942) keeps the report honest. `disclaimer` is a `z.literal` so the legal line is **structurally guaranteed** in every artifact — it cannot be omitted by the model.
- **Determinism:** `dimensions` always the same 5, always length 5; `status` + base `score` come from the deterministic ruleset (`evaluateCompliance`, segment README shared-logic #4). `findings`, `fixes`, `headline`, `why` are generative but constrained, and must cite real evidence (`evidence[]`).

## 7. System logic / pipeline

```
POST /api/store/run/ai-compliance-audit  { token, byokKey, input }
  │
  ├─ [verify]   token + quota (platform-spec §4)              emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                    emit{phase:"validate",pct:10}
  ├─ [key]      BYOK live ping (platform-spec §5)             emit{phase:"key",pct:14}
  │
  ├─ GATHER
  │   IF mode=url:
  │     CRAWL  reuse Seg-1 crawlSite(url,{maxPages,maxDepth:2})  emit{phase:"crawl",pct:18..50,
  │       - SSRF-guarded, robots-respecting (Seg-1 §7)            message:"Scanning 9/15 pages…"}
  │       → pages[] w/ html, meta, <img> list, headers
  │   IF mode=content:
  │     parse the pasted source directly (no network)         emit{phase:"crawl",pct:30}
  │
  ├─ DETECT (deterministic — the defensible part)             emit{phase:"analyze",pct:55..70,
  │   evaluateCompliance(evidence) → per-dimension status+score  message:"Checking for AI labels…"}
  │     - visible_disclosure: scan text for AI-label patterns near media/content
  │     - machine_readable_marking: sample images → read C2PA/IPTC (reuse Seg-2
  │         compliance core Reader) → present? signed? AI assertion?
  │     - disclosure_page: look for /ai-policy, /ai-disclosure, footer links, policy text
  │     - detection_tool: look for a public detection-tool link (SB 942 covered providers)
  │     - licensee_notice: look for ToS/API/licensee AI-use language
  │     → DimensionScores + Evidence[]  (segment README shared-logic #4)
  │
  ├─ EXPLAIN  ai.structured({                                 emit{phase:"generate",pct:75..92}
  │     provider, apiKey, model: claude-opus-4-8, effort:"high",
  │     system: COMPLIANCE_AUDIT_SYSTEM,            // §9
  │     prompt: buildPrompt(detectorResults, evidence, jurisdictions, businessContext),
  │     schema: AiComplianceAuditOutput,            // §6 — SDK-enforced; scores PINNED from detectors
  │   })  → AiComplianceAuditOutput                  // streamObject for progressive fill
  │     - model writes findings/headline/prioritized fixes; it does NOT move the
  │       deterministic scores (passed in, echoed back) — guardrail in §9
  │
  ├─ RENDER  report.build(output)                             emit{phase:"render",pct:95}
  │     - on-screen report, branded PDF → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **AI is called once** (the explain step), `effort: "high"` (the verdict + prioritization is the value). The **detection is deterministic** — the score is computed by `evaluateCompliance`, _passed into_ the prompt, and **echoed back** by the model, never invented. This keeps the score defensible (important for a legal-adjacent product).
- **Libraries:** **reuses** Segment 1's `crawlSite` (`cheerio`/`linkedom`, `robots-parser`, `fast-xml-parser`) and **Segment 2's compliance-core Reader** (the C2PA library) to detect machine-readable markings in sampled images.
- **Reuse:** the crawler is the Seg-1 spine; the C2PA Reader is the Seg-2 deterministic core; `evaluateCompliance` is the new shared ruleset (segment README shared-logic #4), built generic so a future "compliance monitor" can reuse it.

## 8. BYOK handling

- Providers: `anthropic` (default `claude-opus-4-8` — the report's reasoning/prioritization is the artifact; quality matters), `openai`, `google`. Cheaper option offered in UI: `claude-haiku-4-5` (faster, ~fine for small sites / content mode). Per platform-spec §5.
- **Buyer cost expectation** (show in UI): one structured generation over a compact compliance digest (~few K tokens) → typically **well under $0.10 on the buyer's key**.
- **Pre-run validation:** a 1-token ping via the AI wrapper; on failure return error #1 without spending quota.

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject` against `AiComplianceAuditOutput`.

**System prompt (draft):**

```
You are a senior compliance analyst assessing whether a business's PUBLIC web
presence meets the technical transparency requirements of the EU AI Act Article 50
and California's SB 942 (AI Transparency Act) for AI-generated content.

You are given (1) deterministic detector results with a status and a base score per
requirement dimension, and (2) the evidence those results are based on. Produce a
SITE-SPECIFIC readiness report. Rules:
- Do NOT change the provided per-dimension scores or the overall score. They are
  computed deterministically; echo them exactly. You write the explanation, the
  findings, the headline verdict, and the prioritized fixes.
- Every finding must cite SPECIFIC evidence from the input (a real page, image, or
  the absence of one). Use ONLY the provided evidence. No invented pages, laws,
  statistics, fines, or facts.
- Prioritize the top 3–5 fixes by impact toward readiness, tagging each with the
  product that addresses it (c2pa-stamper / bulk-watermark / disclosure-generator).
- Scope to the selected jurisdictions. Mark dimensions not_applicable honestly
  (e.g. SB 942's detection-tool duty applies to large "covered providers").
- This is a technical readiness assessment, NOT legal advice. Do not assert that the
  business "is compliant" or "is non-compliant" as a legal conclusion; frame as
  readiness/gaps. Do not state specific penalty amounts unless present in the input.
- Plain, senior, calm. No fear-mongering, no filler, no "in today's landscape", no
  restated prompt, no emoji.
```

**User prompt template:** `buildPrompt(detectorResults, evidence, jurisdictions, businessContext)` → serializes the deterministic dimension scores + statuses, the evidence list, the selected jurisdictions, and the optional business context.

**Guardrails:** schema enforcement prevents shape drift; **scores are pinned** (passed in, echoed — the model can't inflate a grade, the #1 integrity risk for a compliance score); the "evidence ONLY / no invented laws or fines" rule curbs hallucinated legal facts (critical here); the `disclaimer` `z.literal` guarantees the not-legal-advice line; honest `not_applicable` handling. Handle `stop_reason:"refusal"`/empty per platform-spec §5 (retry once, then clean error, no quota spent).

## 10. Edge cases & failure modes

| #   | Trigger                                      | Detection                       | Behavior / message                                                                                   | Quota           |
| --- | -------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------- |
| 1   | Invalid/expired BYOK key                     | pre-run ping fails              | "Your `<provider>` key looks invalid or expired — check and retry."                                  | not spent       |
| 2   | URL unreachable / 5xx (url mode)             | fetch homepage fails            | "We couldn't reach `<url>`. Is it public and live?"                                                  | not spent       |
| 3   | URL is IP/localhost/private (SSRF)           | input validation (Seg-1 guard)  | reject at form: "Enter a public website URL."                                                        | not spent       |
| 4   | No AI content detected at all                | detectors find nothing          | still deliver: honest "we didn't detect AI media; if you publish it elsewhere, here's what's needed" | spent           |
| 5   | robots disallows crawl                       | robots-parser                   | scan allowed paths only + content the homepage exposes; note coverage in report                      | spent (partial) |
| 6   | Very large site                              | maxPages cap                    | sample top pages; report "scanned N of M"                                                            | spent           |
| 7   | Pasted content empty/too short (content)     | length check                    | reject: "Paste the page source or content you want assessed."                                        | not spent       |
| 8   | Provider rate-limit/timeout mid-generate     | AI wrapper error                | retry once; if still failing → error + quota restored                                                | restored        |
| 9   | Model tries to inflate the score             | post-parse score reconciliation | **overwrite** model scores with the deterministic ones (defense in depth)                            | spent           |
| 10  | Model emits a legal conclusion / a penalty # | output scan                     | regex/judge strips/flags; the `z.literal` disclaimer + "readiness not compliance" framing enforced   | spent           |
| 11  | Duplicate submit                             | same `runId` (idempotency §6)   | return cached; never double-charge                                                                   | n/a             |
| 12  | Quota exhausted                              | token check                     | "You've used all 3 runs — buy again or contact us." + buy CTA                                        | n/a             |
| 13  | Image sampling times out / unreadable media  | per-image try/catch             | skip; mark `machine_readable_marking` from what was readable; note sample size                       | spent           |

## 11. UX / UI flow

**Sales page** (`/store/ai-compliance-audit`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** a **mode toggle** (URL ⟷ Paste content); URL field (big, primary) or a content textarea; a **jurisdiction selector** (EU / California / Both, default Both); advanced (maxPages slider, businessContext); provider select + `KeyInput` (+ "we never store your key"); **Run audit** button (disabled until valid).
- **Validating key:** inline ✓/✗ on the key field.
- **Running:** full-width **live progress** from SSE — real labels ("Scanning 9/15 pages…", "Checking for AI labels…", "Reading image metadata…", "Writing your verdict…"). Surface intermediate "show the work" (e.g. "Found a disclosure page ✓", "3 unlabeled AI images so far"). Rotating micro-education ("What SB 942 actually requires"). `aria-live="polite"`.
- **Partial:** robots-limited / sampled banner; continue.
- **Success / artifact view (the Compliance Readiness Report):**
  - Top: **`ScoreRing` (0–100) + grade + a readiness pill** (Ready / Mostly ready / Gaps / Not ready) + the one-line `headline` verdict (answer-first).
  - **5 dimension cards** (`DimensionCard`: score, status chip with the law tag (EU/CA), findings citing real pages/images, fixes) — each with its **fix-product link**.
  - **Top 3–5 prioritized fixes** as a numbered, effort-tagged list, each a **CTA to the matching tool** (this is the funnel).
  - **Evidence appendix** (collapsible): what the verdict is based on.
  - **A persistent disclaimer banner** ("readiness assessment, not legal advice — confirm with counsel").
  - **Downloads:** **PDF** (primary — "forward to counsel"), JSON, **Email me a copy** (pre-checked). Agency CTA "want us to fix all of this?".
- **Error:** clear message per §10 + retry; input preserved.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared store UI kit — `KeyInput`, `RunProgress`, `ArtifactShell`, `ScoreRing`, `DimensionCard`, `SeverityChip`, `StatMatrix` ([`../06-ui-kit.md`](../06-ui-kit.md) §2). New: `components/store/artifacts/ai-compliance-audit.tsx` (the report body + the law-tagged dimension cards + the disclaimer banner). Run states per `06-ui-kit.md` §4. Copy tone per `PROJECT_VISION.md` — senior, plain, **calm** (no scare tactics — the deadline is real but we don't fear-monger). Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword(s):** "EU AI Act compliance checker", "SB 942 compliance audit", "am I compliant with AI labeling law", "AI content disclosure audit" (high-intent, deadline-driven).
- **`generateMetadata`:** title `AI-Content Compliance Audit — EU AI Act & SB 942 Readiness` (≤60); description: "Scan your site and get a scored EU AI Act (Art. 50) & California SB 942 readiness report with prioritized fixes. Instant, $29. Tooling, not legal advice." (≤155). Canonical `/store/ai-compliance-audit`. OG via `@vercel/og` (grade-card visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What do the EU AI Act and SB 942 require for AI content?", "Is this legal advice?" (**no — a technical readiness assessment; confirm with counsel**), "What does the score mean?", "Do you store my site content or API key?" (transient crawl; artifact 30d; key never stored), "What do I do with the fixes?" (each links the tool that solves it).
- **Internal links:** marketing `/audit` → here; blog posts on the AI Act/SB 942 deadline → here (this is the **landing target** for deadline-driven search); out to every sibling fix product. **This page is the segment's SEO + funnel hub.**
- **Programmatic surface (note):** "EU AI Act Art. 50 / SB 942 readiness checklist" content + (with consent) anonymized example reports could be indexable — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every input labeled; mode toggle is a real radiogroup; jurisdiction selector is a labeled group; progress region `aria-live="polite"` + `role="status"`; focus to the report heading on success; grade/status chips carry the letter + status word + the law tag, never color alone; the disclaimer banner is announced.
- Mobile: single column; dimension cards stack; evidence appendix is an accordion; downloads full-width.
- Error recovery: inline, non-destructive (input preserved); retry without re-entering the key (session-only, platform-spec §5).
- Gate CI on `@axe-core/playwright`.

## 14. Payment integration

- Create Polar product **"AI-Content Compliance Audit" $29** (sandbox + live). Checkout metadata `{ slug: "ai-compliance-audit" }`. Everything else per platform-spec §9.
- **Refund stance:** refund honored if the run never produced a valid report (rare). Quota auto-restores on system-side failures (§10 #8).

## 15. Security & privacy

- **Buyer data:** the target URL + crawled public content (url mode) **or** the pasted content (content mode) + optional businessContext + the BYOK key. Crawl/content used transiently for the run; artifact (report) stored 30d, then purged. We crawl **public** pages only.
- **Product-specific risks:**
  - **SSRF** (url mode) — same #1 risk as Agent-Ready Kit; reuse the Seg-1 guard (block private/link-local/metadata IPs, re-check resolved IP, cap redirects, http(s) only). Tested as a launch blocker.
  - **Untrusted HTML/content** — parse, never execute; sanitize before display; no `dangerouslySetInnerHTML` of crawled/pasted content.
  - **Image metadata reads** — reading C2PA/IPTC from sampled images uses the same hardened path as `c2pa-stamper` (no shell on attacker paths, in-memory buffers).
  - **Legal risk** — a wrong/over-confident verdict on a legal-adjacent product. **Mitigation:** deterministic, defensible scores; the `z.literal` disclaimer in every artifact; "readiness not compliance" framing; no penalty numbers from the model (§9, §10 #10). This is the product's central risk — see §20.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `audit_grade: { grade, readiness }`, `audit_mode: { mode }`, `audit_fix_click: { product }` (the funnel signal), `audit_pdf_download`.
- **Activation:** purchase → first run that produces a valid report. **Target ≥ 88%.**
- Watch: run-error rate (<5%), refund rate (<3%), **fix-click-through rate** (the cross-sell engine — a key business metric for the whole segment), grade distribution (sanity check the detectors aren't all-F or all-A).

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`ai-compliance-audit`), Polar sandbox product, routes, empty `AiComplianceAuditOutput` schema, blank tool UI. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Detectors + contract (no AI).** Reuse `crawlSite`; build `evaluateCompliance` (the 5 deterministic detectors) + input/output schemas; pipeline returns a schema-valid contract from a **fixture site/content** with the AI step mocked. _AC: unit test: fixture → valid `AiComplianceAuditOutput` with correct deterministic scores; SSRF + content-mode guards pass._
- **Phase 2 — Real run + UI.** Wire BYOK + `runStructured` (live AI, scores pinned), all UI states, report render + PDF + email, the fix-product links. _AC: E2E activation path green in sandbox; score-pinning verified (model can't inflate); all §10 cases handled._
- **Phase 3 — SEO + polish + showcase gate.** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics, the disclaimer banner. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria** (sample report on the sales page; answer-first verdict + readiness pill; ScoreRing + law-tagged dimension data-viz; branded PDF; input-specific eval passes; live streamed phases + show-the-work; all 8 states; key-safety + retention + cost visible; disclaimer present; senior calm copy; `impeccable`/`taste`/`ui-ux-pro`/axe pass; mobile first-class). _AC: checklist all green; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring, refund flow verified, **founder + (ideally) counsel sign-off on the disclaimer/framing copy.** _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)           | Test                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| #1 key invalid       | unit: pre-run ping mock rejects → error, quota intact                          |
| #3 SSRF (url mode)   | unit: IP/localhost/metadata URLs rejected (reuse Seg-1 SSRF table)             |
| #4 no AI content     | unit: empty-detector fixture → honest report, not all-F nonsense               |
| #7 content too short | unit: short paste rejected at validate                                         |
| #8 AI timeout        | integration: provider error → retry → quota restored on final fail             |
| #9 score inflation   | unit: model returns inflated scores → reconciliation overwrites with detectors |
| #10 legal conclusion | unit/eval: model emits "you are non-compliant" / a fine € → flagged/stripped   |
| #11 duplicate        | integration: same `runId` returns cached, no double quota                      |

**The one test that matters most:** fixture site/content → pipeline (mocked AI returning a fixed object, **deterministic scores fixed**) → valid `AiComplianceAuditOutput`, and a **score-reconciliation test** proving the model cannot move the grade.

**Evals (doc 05 §7):** golden set of ~8–12 real sites (a fully-compliant one, a fully-bare one, mixed) with expected grade bands + `mustFlag` dimensions + `mustMention` evidence; judges `input_specific` (cites the buyer's real pages), `no_ai_tells`, `factual` (no invented laws/fines/pages), plus a **`legal_safety` judge** (no legal conclusions, no fabricated penalties, disclaimer present) — threshold ≥0.85, **zero `legal_safety` failures allowed**. Full method/fixtures/mocks/matrix/E2E/CI in [`../05-testing-strategy.md`](../05-testing-strategy.md).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5, job runner/SSE §6, data model §7, report+PDF §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`.
- **Reuses (no new heavy libs):** Segment 1's `server/store/tools/agentic/crawl.ts` (the crawler) and Segment 2's `server/store/tools/compliance/` C2PA **Reader** (image-marking detection). New code: `server/store/tools/compliance/evaluate.ts` (`evaluateCompliance` — the 5 detectors + ruleset).
- **Cross-product reuse:** `evaluateCompliance` is shared-logic #4 — build generic so a future compliance monitor reuses it; the fix-product enums are the spine for the segment's cross-sell.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($29); Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` exact EU Art. 50 penalty tier + SB 942 operative-date wording (segment README — €15M/3%, "Aug 2 2026"; do not state a number in the verdict, only context with a cited source on the sales page; counsel to confirm).
- `OPEN QUESTION:` how granular the deterministic detectors get for "visible disclosure" (text-pattern matching for AI labels is heuristic and may miss/over-flag) — set conservative thresholds and let the AI _explain_ rather than the detector over-claim; tune against the golden set.
- `OPEN QUESTION:` SB 942 "covered provider" applicability (the >1M-user threshold) — the report should ask/infer and mark `not_applicable` honestly rather than scoring a small site against duties it doesn't have.
- **Risk — legal mis-statement (the central risk).** A compliance score that reads as a legal verdict, or a hallucinated fine/law, is reputationally and legally dangerous. **Mitigation:** deterministic defensible scores, score-pinning, the `z.literal` disclaimer guaranteed in every artifact, "readiness not compliance" framing, the `legal_safety` eval judge with zero tolerance, founder/counsel copy review at launch. Owner: Nishant + founder review.
- **Risk — over/under-detection** producing a misleading grade. **Mitigation:** conservative detector thresholds, the evidence appendix (the buyer can see _why_), honest `not_applicable`, the golden-set eval guarding regressions.
- **Risk — buyer expects the tool to _make_ them compliant.** **Mitigation:** clear scope ("this diagnoses; these tools fix"), the prioritized fixes link the actual products, agency CTA for done-for-you.
