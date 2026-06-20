# WCAG Audit Report — PRD

**Slug:** `wcag-audit-report` · **Segment:** 5 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The **cheap, urgent entry point** to Segment 5: a scary, specific, lawsuit-framed a11y report for $29. Composes the segment's shared **local-app shell** (see `codebase-health-report.md`) with the bundled OSS `accessibility-checker` WCAG 2.1 rule engine, and adds the one input the others don't: a **URL** the local app fetches.
>
> **Delivery model (read first):** NOT a cloud tool. A **standalone downloadable local app** (D-13/14/15): the buyer runs `pnpm install && pnpm dev`, points it at a local repo (or a URL the app fetches), and gets the report — locally, on their own BYOK key. The store/cloud side does only purchase → license issuance → download delivery. **The buyer's code never leaves their machine.**

---

## 1. TL;DR

- **One-liner:** A local app you download and run on your machine — point it at your repo or a live URL and get a scored WCAG 2.1 accessibility report, violations ranked by severity, AI-written fixes, and an honest read on your ADA-lawsuit exposure. Your code never leaves your computer.
- **Problem:** ADA web-accessibility lawsuits hit thousands of US sites a year over WCAG failures; teams don't know if they're exposed and have no prioritized fix list. Generic linters bury the critical issues, and a cloud scanner means uploading proprietary front-end code.
- **Buyer:** founders / product owners / front-end leads who just heard "we could get sued over accessibility" or have a compliance checkbox to clear — DTC and SaaS alike.
- **Input → Output:** a **local repo path** _or_ a live site URL (fetched by the local app) → a **WCAG Audit Report**: an a11y score, violations grouped by severity with file/line + WCAG criterion, AI-written fixes, and an ADA financial-consequence framing. Rendered in-app, exported **locally** to branded PDF + JSON. The deliverable is the **downloadable app + license** plus the locally-generated report.
- **Price:** **$29** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite, **local app + license** · **Providers:** `anthropic` (default `claude-opus-4-8`), `openai`, `google`.
- **Est. run time:** ~30–75s · **Re-run quota:** unlimited local runs while the license is active (re-scan after fixes, scan a second target — free).

## 2. Problem & market

**Today** a team that worries about accessibility (because a customer complained, a lawyer's demand letter arrived, or a procurement form asks for "WCAG 2.1 AA compliance") has no fast, honest answer to "are we exposed, and what do we fix first?" They run a free browser extension that flags a few things on one page, or an enterprise scanner that costs a subscription and a setup, or they ignore it until the demand letter. None gives a small team a prioritized, written, forwardable report tied to real WCAG criteria — and the repo scanners that exist are cloud-hosted, a non-starter for proprietary front-end code.

**This is open-core (the strategy — see segment README).** The engine is Digitribe's **open-source, MIT** [`accessibility-checker`](https://github.com/Nishant-Chaudhary5338/mcp-toolkit) — a WCAG 2.1 rule engine (14 rules across image-alt, button/link/input/select/textarea labels, heading order, positive tabindex, invalid ARIA roles, aria-hidden-focus, click-without-keyboard, html-lang, redundant alt, autofocus), each producing a typed `A11yIssue` with `impact` (critical/serious/moderate/minor), `file`, `line`, `wcag` criterion, `description`, and `fix`. Anyone can `npx mcp-react-toolkit accessibility-checker` for free, forever — the funnel. What we **sell** is a **polished local app** the bare OSS isn't: a designed UI, repo-or-URL input, a scored report, AI-written fixes elaborated for the buyer's exact markup, the ADA financial-consequence framing, a local PDF/JSON export a buyer hands to their lawyer or boss — and the **local-first guarantee**. A fork gets the raw `A11yIssue[]` in a terminal; it doesn't get the app, the score narrative, the elaborated fixes, the legal framing, the design, or the license.

**Competition:** free browser extensions (axe DevTools, WAVE — one page at a time, no repo-wide scan, no narrative), enterprise platforms (deque/Level Access — subscription, sales-led, cloud, overkill for a small team), and consultants (slow, expensive). **Gap:** no instant, $29, self-serve, **local** report that scans the whole repo/site, prioritizes by severity, writes the fixes, and frames the legal risk without your code leaving the machine. That's us — and the price + fear make it the segment's top-of-funnel.

**Urgency:** ADA web-accessibility lawsuits run into the **thousands of US filings per year**, the large majority over WCAG failures (trace exact 2025–2026 figure in `../research-sources.md` before shipping). That's a direct, dated, financial reason to act now — exactly the framing this product leans into (honestly, never as fabricated legal advice — see §15).

**Why Digitribe:** we wrote the rule engine and we ship accessible UI for clients; our findings are deterministic, criterion-cited rule hits, not an LLM's guess about a screenshot. The AI elaborates the fix; the engine finds the violation.

## 3. Pricing & packaging

- **$29**, one-time — the impulse/urgency price; low enough that a worried founder buys without a meeting, high enough to be a real product. The engine is free OSS; the buyer pays for the **downloadable app + license** (the AI fixes, the lawsuit-framed report, the local-first experience), stated plainly.
- **What one purchase includes:** a **license key** + a **download link** (emailed via Resend). The license unlocks the paid AI layer and permits **N machine activations** (`OPEN QUESTION:` default **3 device activations** — shared default; segment README). Under an active license the buyer runs **as often as they want, locally** — re-scan after fixes, scan a second URL/repo — free. The deliverable is the app + license.
- **Upsell path:** the report's severity counts → **Codebase Health Report** ($49, separate SKU, "a11y is one of 11 areas — see the whole picture"); high-violation reports → agency CTA "want us to fix these for you?" (Digitribe ships accessible UI). The Health Report's `anti_patterns` a11y finding cross-sells _into_ this product, and this one sells _up_ — they reinforce. Cross-sell links back to the store sales pages.
- **Future tiers (note only):** scheduled local re-scans / a compliance-trend view, an Electron/Tauri double-click build, a CLI for CI are v2 ideas; v1 ships one SKU as a `pnpm dev` download.

## 4. User stories / JTBD

- As a **founder who got a demand letter**, when I need to know my exposure fast, I want a scored report tied to real WCAG criteria **without uploading our front-end code**, so that I can show my lawyer where we stand and what we're fixing.
- As a **front-end lead with a compliance checkbox**, when procurement asks for "WCAG 2.1 AA," I want a prioritized violation list with fixes, so that I can close the gap and document it.
- As a **product owner**, when I want to do right by users with disabilities, I want to know the critical issues first, so that I fix what matters most before the long tail.
- As an **agency / freelancer**, when I onboard a client site, I want an instant local a11y baseline I can run on the client's machine or against their URL, so that I can scope remediation in minutes.

**Primary job the artifact must nail:** a **site/repo-specific, severity-prioritized list of real WCAG violations with concrete, copy-pasteable fixes** — every violation cites its file/line (repo) or location (URL) and its exact WCAG criterion, leading with the criticals. Not a generic "improve your accessibility" essay.

**Non-goals (v1):** does NOT fix the code for the buyer (agency upsell); does NOT provide legal advice or certify compliance (it surfaces risk honestly — §15); does NOT run a full manual audit (it's an automated WCAG 2.1 rule scan — screen-reader/manual checks are out of scope and the report says so); does NOT execute the repo or browser-test interactions (URL mode fetches rendered HTML, it doesn't drive the page); does NOT upload or retain the buyer's code (local-first by design).

## 5. Functional requirements

### Inputs (entered in the LOCAL app)

| Field         | Type                          | Validation                                                                                        | Example                     |
| ------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| `source`      | discriminated union           | `localRepo` \| `url` (this product adds the **url** mode the others don't have)                   | `{ kind: "url", url: "…" }` |
| `source.path` | string (local FS path)        | when `kind:"localRepo"`: a path that exists + looks like a JS/TS project (shared local-app input) | `/Users/me/work/acme-app`   |
| `source.url`  | string (URL)                  | when `kind:"url"`: http/https, resolves; the app fetches it from the buyer's machine (§15)        | `https://acme.com`          |
| `maxPages`    | int (url mode only)           | 1–20, default 5 — how many internal pages the app fetches and scans                               | `5`                         |
| `subPath`     | string (optional, repo mode)  | path within the repo to scan                                                                      | `src`                       |
| `siteContext` | string (optional, ≤500 chars) | free text ("DTC store checkout flow", "B2B SaaS dashboard") — shapes fix examples + tone          | "DTC Shopify storefront"    |
| `licenseKey`  | string (entered once)         | unlocks the paid AI layer; validated online once (health PRD §14)                                 | `DGT-WCAG-XXXX-XXXX`        |
| `provider`    | enum                          | one of the app's supported `byokProviders`                                                        | `anthropic`                 |
| `byokKey`     | string (secret)               | entered in the local app; **never transmitted to us** (§8); used only for the local AI call       | `sk-…`                      |

### Processing (requirements level; the LOCAL pipeline is §7)

All on the buyer's machine, inside the app. **Repo mode:** read the local repo from `source.path` (no clone/upload, §15) → run the bundled **deterministic `accessibility-checker` engine** over `.jsx/.tsx/.html` source → typed `A11yIssue[]`. **URL mode:** the app fetches up to `maxPages` rendered HTML pages **from the buyer's machine** (SSRF-guarded — the network is the buyer's own, §15) → run the same rule engine over the HTML → `A11yIssue[]`. Then: compute a severity-weighted score + group violations → assemble a compact "a11y digest" → call the AI **on the buyer's BYOK key** to elaborate fixes + write the severity narrative + the ADA framing filling the Output Contract → render report in-app → export PDF/JSON locally. The only network calls are the one-time license validation, the buyer's own AI provider call, and (URL mode) the page fetches from the buyer's machine.

### Outputs

The **WCAG Audit Report** — rendered in-app + exported **locally** to branded PDF + JSON. Exact shape in §6.

### Constraints

- **Repo caps** as in the shared local-app model (the engine samples large trees).
- **URL mode caps:** ≤20 pages, 8s per-page fetch timeout, 60s total; respect `robots.txt`; identify as `DigitribeA11yBot/1.0`; **public pages only** by default, no auth walls. (Since the app runs on the buyer's machine, it can also reach the buyer's own localhost dev server if they point it there — that's a feature, not an SSRF risk to us.)
- **Scope honesty:** the engine is a static WCAG 2.1 rule scan (14 rules) — it does **not** do color-contrast computation, screen-reader testing, or full manual review. The report states its scope explicitly so the score isn't read as a compliance certificate.
- **Never execute the repo** (§15, shared); URL mode fetches HTML, it does not drive/script the page.

## 6. ⭐ Output Contract

> Same locked Zod schema, but **produced and rendered by the LOCAL app** and exported locally. The engine-pinned fields (violations, criteria, locations, counts, score) come straight from the deterministic engine, never the AI.

```ts
// (bundled in the local app) schemas/wcag-audit-report.ts
import { z } from 'zod'

// Mirror the accessibility-checker engine's own enums.
const Impact = z.enum(['critical', 'serious', 'moderate', 'minor']) // engine A11yIssue.impact

// The 14 rule ids the engine actually emits (do not invent rules).
const RuleId = z.enum([
  'image-alt',
  'button-name',
  'link-name',
  'label',
  'select-name',
  'heading-order',
  'tabindex',
  'aria-roles',
  'aria-hidden-focus',
  'click-events-have-key-events',
  'html-has-lang',
  'img-redundant-alt',
  'no-autofocus',
  'textarea-label',
])

const Violation = z.object({
  rule: RuleId, // engine A11yIssue.rule
  impact: Impact, // engine A11yIssue.impact
  wcag: z.string(), // engine A11yIssue.wcag, e.g. "1.1.1 Non-text Content (Level A)"
  location: z.string(), // file:line (repo) or page URL + element (url mode) — from engine
  element: z.string().max(200), // the offending snippet (engine A11yIssue.element)
  description: z.string().max(400), // what's wrong (engine description, AI may tighten)
  fix: z.string().max(600), // AI: concrete, copy-pasteable fix for THIS element (elaborates engine.fix)
  occurrences: z.number().int().min(1), // how many times this rule fired across the scan
})

const SeverityBucket = z.object({
  impact: Impact,
  count: z.number().int(),
  rules: z.array(RuleId), // which rules contributed
})

export const WcagAuditOutput = z.object({
  target: z.object({
    kind: z.enum(['localRepo', 'url']), // local repo path or a URL the app fetched
    name: z.string(), // repo folder name or site host
    filesOrPagesScanned: z.number().int(),
    scope: z.string().max(280), // honest scope statement ("automated WCAG 2.1 static scan of 14 rules; no contrast/SR testing")
  }),
  score: z.number().int().min(0).max(100), // severity-weighted, deterministic (see field notes)
  grade: z.enum(['A', 'B', 'C', 'D', 'F']), // deterministic from score
  headline: z.string().max(200), // answer-first: "32 WCAG violations — 7 critical (missing alt text, unlabeled inputs)."
  totalViolations: z.number().int(),
  bySeverity: z.array(SeverityBucket).length(4), // always critical/serious/moderate/minor
  violations: z.array(Violation).max(120), // prioritized: criticals first; top-N if huge, honest total above
  topFixes: z.array(z.string()).min(1).max(5), // the 3–5 highest-impact fixes to do first
  adaRisk: z.object({
    // honest financial-consequence framing — NOT legal advice (see §15)
    exposure: z.enum(['low', 'elevated', 'high']), // derived from critical/serious counts
    summary: z.string().max(500), // plain-English: what this means for ADA/lawsuit risk, with the "not legal advice" caveat
    criticalCriteria: z.array(z.string()).max(8), // the Level A/AA criteria most often cited in suits that you're failing
  }),
  upsell: z.object({
    needsHealthReport: z.boolean(), // many violations / wants the full picture → Codebase Health Report
    reason: z.string(),
  }),
})
export type WcagAuditOutput = z.infer<typeof WcagAuditOutput>
```

- **Export formats:** in-app report (React) · **PDF** (branded — the artifact a buyer forwards to a lawyer/boss, generated **locally**) · **JSON** (raw contract, saved locally). No file bundle, no server round-trip.
- **Field notes:**
  - `target.kind` is `localRepo` or `url` (no github/zip — the repo is local; the URL is fetched by the local app).
  - `violations` (rule, impact, wcag, location, element, occurrences), `totalViolations`, `bySeverity`, and `filesOrPagesScanned` are **deterministic engine facts** — straight from `A11yIssue[]`. The AI copies them exactly; it never invents a violation, a file, a line, or a WCAG criterion.
  - `score` is **deterministic**: a severity-weighted formula from the engine's counts (e.g. start 100, subtract weighted by critical/serious/moderate/minor counts, floored at 0 — locked in code, not chosen by the AI). `grade`: A ≥90, B ≥75, C ≥60, D ≥40, F <40. `adaRisk.exposure` is deterministically derived from critical+serious counts; the AI writes the prose around it.
  - The AI fills `fix` (elaborating the engine's terse `fix` into a concrete, copy-pasteable change for the buyer's exact `element`), `headline`, `topFixes`, `description` tightening, and `adaRisk.summary` — the narrative. All grounded in the engine's findings and the buyer's `siteContext`.
- **Determinism:** `bySeverity` always length 4; score/grade/exposure/violations are reproducible; only prose (fixes, summaries) is generative, constrained to the schema and the real findings (doc 03 §2.1, §2.5).

## 7. System logic / pipeline

> **Two surfaces.** (A) The **store/cloud** side does only purchase + license issuance + download delivery (thin — identical to codebase-health-report.md §7A). (B) The **local app** runs the pipeline below, on the buyer's machine. NOT the spine's serverless runner (platform-spec §6).

### (A) Store/cloud side — purchase → license → download (thin)

Identical to the flagship: Polar `order.paid` → `Purchase` + `License` (bound to `wcag-audit-report`) → email the license key + download link (no access token); `POST /api/store/license/validate { licenseKey, deviceId, slug }` → `{ valid, activationsRemaining }`, never receiving code. See codebase-health-report.md §7A / §14.

### (B) Local app — the analysis pipeline (runs on the buyer's machine)

```
LOCAL app  (pnpm dev)  →  buyer enters licenseKey + provider + BYOK key, picks a source (repo path | URL)
  │
  ├─ [license] validate once online → unlock paid AI layer; cache signed receipt (offline-tolerant)
  ├─ [validate] source input (zod)                           progress:"Checking input…"
  ├─ [key] BYOK key live ping (local)                         progress:"Validating your key…"
  │
  ├─ ACQUIRE source  (branch on source.kind)                 progress:"Reading source…" /
  │   - localRepo → read the local repo from disk (§15)         "Fetching 5 pages…"
  │   - url       → the app fetches up to maxPages, SSRF-guarded
  │                 (buyer's own network), public pages only
  │     → set of source/HTML strings to scan  (never leaves the machine)
  │
  ├─ SCAN  runAccessibilityChecker(sources)  [DETERMINISTIC OSS, in-process]   progress:"Scanning WCAG rules…",
  │     - the WCAG 2.1 rule engine over each .jsx/.tsx/.html     findingCount:<running total>
  │       (14 rules → A11yIssue[] with impact/file/line/wcag)
  │     - dedupe + count occurrences per rule
  │     → A11yIssue[]   // typed facts, NO AI yet
  │     - compute deterministic severity-weighted score +
  │       bySeverity buckets + adaRisk.exposure; assemble digest
  │
  ├─ GENERATE  ai.structured({   [LOCAL call on the buyer's BYOK key]   progress:"Writing your fixes…"
  │     system: WCAG_SYSTEM,                    // §9
  │     prompt: buildPrompt(a11yDigest, siteContext),
  │     schema: WcagAuditOutput,                // §6 — SDK-enforced
  │     effort: "high",
  │   })  → WcagAuditOutput                      // stream partials for progressive in-app UI
  │     - score/violations/bySeverity/exposure pre-filled FROM
  │       the engine; AI writes fixes, headline, ADA summary
  │     - POST-PROCESS: assert the "not legal advice" caveat is present
  │       in adaRisk.summary; regenerate that field once if missing (§9, §15)
  │
  └─ RENDER + EXPORT (local)                                 progress:"Building your report…"
        - in-app report; export branded PDF + JSON to a local path.
          Nothing persisted server-side; the report lives on the buyer's disk.
```

- **AI is called once** (generate), `effort: "high"` — the fix quality and the honest ADA framing are the value — **locally on the buyer's key**. Acquire + scan are deterministic Node — no AI cost to the buyer.
- **Engines/libraries (bundled in the app):** the scan is the **OSS `accessibility-checker` engine itself** (its `analyzeFile(path, content)` over the 14 `AXE_RULES`) — **never re-implemented.** URL mode uses a lightweight local fetch + HTML parse (the buyer's machine makes the request; no shared Segment-1 crawler infra is needed — a small local fetcher with the SSRF + robots guards is bundled into the app). No clone/unzip/Blob libs (the repo is on disk). _OPEN QUESTION: confirm the engine handles raw fetched HTML as well as JSX source (the rules are regex/string-based over markup, so HTML is in-scope — verify on a real page in Phase 1)._
- **Reuse:** the shared **local-app shell** (license client, BYOK + source inputs, run/progress/report UI, local PDF/JSON export); `runAccessibilityChecker` + the small local URL fetcher are this product's specifics.

## 8. BYOK handling

- Providers: `anthropic` (default, model `claude-opus-4-8` — best at writing precise, criterion-correct fixes and honest legal framing), `openai`, `google`. Cheaper option in the app: `claude-haiku-4-5` (fine for low-violation scans). Per platform-spec §5.
- **The key is entered in the LOCAL app and is NEVER transmitted to us** — same as the flagship (§8 there). The license endpoint never sees it.
- **Buyer cost expectation** (show in app): one structured generation over the typed a11y digest (the violation list + counts — a few K tokens; not the raw source) → typically **well under $0.10 on the buyer's key**. The deterministic scan is free. Show it (doc 03 §5).
- **Pre-run validation:** a 1-token ping, locally; on failure show error #1 (no run penalty — runs are unlimited under an active license).

## 9. AI / prompt design

**Model:** default `claude-opus-4-8`, `effort: "high"`, adaptive thinking on (platform-spec §5). Structured output enforced by AI SDK `generateObject` against `WcagAuditOutput` (doc 04 §7). **The call runs in the local app on the buyer's BYOK key, gated by a valid license.**

**System prompt (draft):**

```
You are an accessibility engineer writing a WCAG 2.1 audit report. You are given the
DETERMINISTIC output of a static WCAG rule engine: a list of violations, each with a
rule id, impact (critical/serious/moderate/minor), the exact WCAG criterion, the file/
line or page location, and the offending element. A deterministic severity-weighted
score, the severity buckets, and an ADA-exposure level are also provided.

Hard rules:
- The violations, their rules, WCAG criteria, locations, elements, counts, the score,
  the buckets, and the exposure level are FACTS from the engine. Copy them exactly.
  NEVER invent a violation, a file, a line, a WCAG criterion, or change the score.
- For each violation, write a concrete, copy-pasteable FIX for THAT specific element —
  the actual attribute/markup change (e.g. add `alt="Cart icon"` to this <img>, pair
  this <input> with a <label htmlFor>). Use the element the engine gave you; don't
  generalize when you can be specific. Adapt examples to the siteContext.
- The headline leads with the verdict: "<N> WCAG violations — <K> critical (<the top
  rules>)". Use real numbers.
- topFixes: the 3–5 highest-impact changes (criticals first) to do before the long tail.
- adaRisk.summary: explain in plain English what this severity profile means for ADA /
  web-accessibility lawsuit exposure, citing the Level A/AA criteria most often litigated
  that this target fails. ALWAYS include the caveat: this is an informational risk read,
  NOT legal advice, and an automated scan is not a compliance certification.
- Be honest about scope: this is an automated static scan of 14 rules; it does not test
  color contrast, screen readers, or manual criteria. State that in `target.scope`.
- Do not catastrophize and do not downplay. A clean target gets a high score, a short
  list, and "low" exposure honestly.
- Senior, plain, confident. No fluff, no "In today's…", no restated-prompt preamble,
  no "As an AI".
```

**User prompt template:** `buildPrompt(a11yDigest, siteContext)` → serializes the engine's `A11yIssue[]` (rule, impact, wcag, location, element, occurrences), the computed score + buckets + exposure level, the scan metadata (kind, filesOrPagesScanned), and the buyer's optional `siteContext`. **Only the typed digest is sent to the provider — never raw source/HTML bodies** (small, grounded, injection-safe).

**Model + effort per call:** one call, `effort: "high"` — the per-element fix precision and the legal-framing care are the product.

**Guardrails:** schema enforcement + "violations/criteria/locations are facts, copy them" rule prevent fabricated criteria or fake line numbers (a real ADA-framed report with an invented WCAG cite would be worse than useless); the mandatory "not legal advice / not a certification" caveat is enforced by both the prompt **and a local post-process check** (the app rejects/regenerates the `adaRisk.summary` field if the caveat is missing); the honest-scope statement keeps the score from being mis-sold. Handle refusal/empty per platform-spec §5 (retry once locally, then clean error).

## 10. Edge cases & failure modes

| #   | Trigger                                    | Detection                           | Behavior / message                                                                                   | License/run impact |
| --- | ------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| 1   | Invalid/expired BYOK key                   | pre-run ping fails (local)          | "Your `<provider>` key looks invalid or expired — check and retry."                                  | no run penalty     |
| 2   | License invalid / over-activated / offline | `license/validate` / cached receipt | per the shared license states (health PRD §10 #2–#5)                                                 | AI layer gated     |
| 3   | URL unreachable / DNS / 5xx (url mode)     | fetch fails (local)                 | "We couldn't reach `<url>`. Is it live and reachable from this machine?"                             | no run             |
| 4   | URL is a private/metadata IP (SSRF guard)  | URL validation (buyer's own net)    | warn + require confirm if it's a private address; block known cloud-metadata IPs outright            | no run             |
| 5   | Bad repo path (missing / not a dir)        | local FS check                      | "Pick the folder that contains your front-end source."                                               | no run             |
| 6   | Clean target (zero violations)             | empty `A11yIssue[]`                 | deliver a valid report: score 100 / grade A, "no automated WCAG violations found in scope," low risk | runs (valid)       |
| 7   | JS-only site, empty SSR HTML (url mode)    | near-empty fetched HTML             | scan what's there; note "limited HTML rendered — client-rendered content not scanned" honestly       | runs               |
| 8   | Huge target (many violations)              | violations over cap                 | prioritize + cap to top-N by severity; report honest total ("214 violations; showing the 120 worst") | runs               |
| 9   | Provider rate-limit / timeout mid-generate | AI wrapper error (local)            | retry once w/ backoff; if still failing, clean error, inputs preserved                               | no penalty         |
| 10  | Non-HTML / app URL (url mode)              | content-type check                  | "This URL isn't a scannable web page."                                                               | no run             |
| 11  | Repo has no markup files                   | no `.jsx/.tsx/.html` found          | honest "no scannable markup found at `<path/subPath>`."                                              | runs (honest)      |
| 12  | Engine error / unexpected crash            | top-level try/catch                 | clean in-app error, inputs preserved                                                                 | no penalty         |

> No "quota exhausted" row — runs are unlimited under an active license; re-scanning is a feature. The gating failure mode is **license** state (#2), not per-run quota.

## 11. UX / UI flow

> **Two surfaces** (doc 03 §1 applies to both): (a) the **STORE sales page + buy + license/download delivery** (spine); (b) the **LOCAL APP UI** (the tool), doc 06 tokens/states applied locally.

### 11a. Store surface (sales + buy + delivery) — uses the spine

- **Sales page** (`/store/wcag-audit-report`, server-rendered, SEO §12): hero outcome + a **grade + severity-bucket visual** + price + **Buy**. "How it works": **1) Buy → 2) Download the app + get your license key → 3) `pnpm install && pnpm dev`, paste your license + AI key, point it at your repo or a URL → 4) get the report — your code never leaves your machine.** "See a real example" expands our own anonymized a11y report. FAQ (JSON-LD), trust strip (local-first, key-safety, the honest "not legal advice" note), cross-sell to the Health Report + agency CTA.
- **Buy → Polar** → webhook issues a **License** + emails the **license key + download link** (no access token). `/store/checkout/success` confirms "check your email," links the download + setup guide.

### 11b. Local app UI (the tool) — runs on the buyer's machine

Implements the doc 06 state machine **locally**:

- **Onboarding / unlock:** one-time **license key field** → "Activate" → one online `license/validate` → unlocked (shared shell, health PRD §11b).
- **Empty / collecting input:** a **two-way source toggle** — "Local repo" (folder picker + path field) | "Website URL" (URL field + `maxPages`) — plus optional `siteContext` textarea, provider select + **BYOK key field** (key-safety + "public pages only · your code is never executed, uploaded, or retained · your AI key stays local" badge), **Run** button.
- **Validating key:** inline ✓/✗ (local ping).
- **Running:** live progress — "Fetching 5 pages…" / "Reading source…", "Scanning WCAG rules…", "Found 32 violations (7 critical)…", "Writing your fixes…". `aria-live="polite"`; violation count animates up.
- **Partial:** if capped or JS-only, a non-blocking honesty banner.
- **Success / artifact view (rendered in-app):**
  - Top: **score + grade** (`ScoreRing`, animates in), the `headline` verdict, the **ADA exposure chip** (low/elevated/high — color + word + icon), scan facts ("N pages/files scanned · WCAG 2.1 · automated scope").
  - **Severity summary** — a `StatBar`/matrix of the 4 buckets (critical/serious/moderate/minor counts), criticals visually dominant.
  - **`topFixes`** strip above the fold.
  - **Violations list** — grouped by severity (criticals first), each: rule + WCAG criterion chip, location (file:line or page+element), the offending `element` (monospace), and the **AI fix** with a **copy button** (the fix is the takeaway). Filter/sort by severity / rule / location.
  - **ADA risk panel** — the plain-English `adaRisk.summary` with the prominent **"informational, not legal advice / not a certification"** caveat (never buried — doc 03 §5, §15).
  - **Exports (local):** **Export PDF** (primary — the forwardable artifact, generated locally), **Export JSON** — both to a local path. No "email me a copy" (it's already on disk).
  - **Upsell card** if `upsell.needsHealthReport` → Codebase Health Report (links the store page); agency "want us to fix these?" CTA.
- **Error:** clear message per §10 + retry; input preserved.
- **License-locked:** gentle state if license invalid/over-activated/unactivated; the free engine may still scan, but the AI fixes/framing are gated.

Components: reuse the shared local design system — `KeyInput` (adapted "your key stays local"), `RunProgress`, `ArtifactShell`, `ScoreRing`, `SeverityChip`, `StatMatrix`, copy-button rows, the shared **source picker** + **license field**. The only product-specific component is the `wcag-audit-report` artifact body (score + severity buckets + violation list + ADA panel). Apply doc 06 §1 tokens, §4 state chart, §6 motion locally; copy tone per `PROJECT_VISION.md` — serious and honest, never fear-mongering.

## 12. SEO

> SEO applies to the **store sales page** only (the local app isn't a web page).

- **Target keyword:** "local WCAG audit tool" / "website accessibility checker app" / "ADA compliance scan (your code stays local)" / "is my website ADA compliant" (tool + high-intent informational; lean into local-first).
- **`generateMetadata`:** title `WCAG Audit Report — Local Accessibility & ADA-Risk App` (≤60); description: "A downloadable app that scans your React repo or a live URL for WCAG 2.1 violations, ranks them by severity with copy-paste fixes, and gives an honest ADA-risk read — locally, on your own AI key. Your code stays put. $29." (≤155). Canonical `/store/wcag-audit-report`. OG via `@vercel/og` (grade + severity-bucket visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($29) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "Does my code leave my machine?" (no — it's a local app; only a one-time license check + your own AI call go out; in URL mode your machine fetches the page), "What does the score mean?" (severity-weighted from a deterministic WCAG 2.1 rule scan), "Does this make me ADA-compliant?" (no — it's an informational risk read, not legal advice or certification), "Can I scan a live site or my code?" (both — a local repo or a URL), "What does it check?" (14 WCAG 2.1 rules: alt text, labels, ARIA, headings, keyboard, lang, more — not contrast/screen-reader/manual), "How do I run it?" (download, `pnpm install && pnpm dev`, paste license + AI key, pick a repo or URL), "Do you store my code or key?" (no — they stay on your machine), "Isn't the engine open source?" (yes — the MIT `accessibility-checker`; you pay for the app, the AI fixes, the report, and the license).
- **Internal links:** the OSS `mcp-toolkit` README → here; blog posts on accessibility / ADA → here; the **Codebase Health Report** sales page (whose a11y anti-pattern finding cross-sells here, and which this upsells to).
- **Programmatic surface (note):** anonymized example reports could become indexable `/store/wcag-audit-report/examples/<slug>` pages — a strong SEO play; defer to v2, our own dog-food report is the launch sample.

## 13. Usability & accessibility

> This product **must be exemplary** — a WCAG tool that fails axe is a credibility disaster. Hold **both** the sales page **and** the local app UI to a higher bar than the segment baseline.

- WCAG 2.1 AA (we eat our own dog food): every input labeled; the two-way source toggle is a real `radiogroup`; provider/key in a `<fieldset>`; the repo-path picker + URL field + license field are labeled; progress region `aria-live="polite"` + `role="status"`; focus moves to the report `<h2>` on success; severity always color + icon + word (never color alone); the violations list is a semantic structure with proper headings per severity group; copy buttons announce "copied."
- Mobile / narrow window: the **sales page** is mobile-first; the **local app** targets desktop but degrades — source toggle stacks, severity buckets stack, the violation list is an accordion grouped by severity, fixes have full-width copy buttons.
- Error recovery: inline, non-destructive; retry keeps input.
- Gate CI on `@axe-core/playwright` for the sales page **and** the app UI with **zero serious/critical violations** as a hard launch blocker (this product, of all of them).

## 14. Payment integration

> Polar one-time → **license key + download link** (NOT an access token) — identical mechanism to the flagship (codebase-health-report.md §14); only the slug, product name, and price differ.

- Create Polar product **"WCAG Audit Report" $29** (sandbox + live). Checkout metadata `{ slug: "wcag-audit-report" }`. Webhook `order.paid` → `Purchase` + `License` (bound to this slug) → email the **license key + download link** via Resend; `refund` → revoke license.
- **License model:** **1 license = N machine activations** (default **N = 3**, deactivatable — `OPEN QUESTION:`, shared). Unlimited local runs (re-scan, scan a second target) under an active license.
- **Validation contract:** the shared `POST /api/store/license/validate { licenseKey, deviceId, slug }` → `{ valid, activationsRemaining, reason? }` (the new endpoint, flagged for doc 04 in the flagship §14/§19). Never receives buyer code. Offline: signed cached receipt (default 30d).
- **Refund stance:** one-click refund if the app never worked. Refund → license revoked.

## 15. Security & privacy

- **Buyer data:** a **local repo** (read from the buyer's disk by the app) **or** a live URL (fetched **from the buyer's machine**) + crawled public HTML + optional `siteContext`. **Local-first guarantee:** the code/HTML is **never uploaded, transmitted, logged, or retained by us**; the report lives on the buyer's machine. We retain only the `Purchase`/`License`/`Activation` records. Repo mode inherits the **local threat model** from **codebase-health-report.md §15**.
- **What the license endpoint sees:** only `{ licenseKey, deviceId, slug }` — never the BYOK key, never source/HTML, never the report.
- **Product-specific risks + mitigations:**
  - **ADA / legal framing must be honest** — the unique risk here. The `adaRisk` narrative is an **informational risk read, not legal advice and not a compliance certification.** The caveat is enforced in the prompt, asserted by a **local post-process check** (reject/regenerate the `adaRisk.summary` if the AI omits it), and shown prominently in the UI and the exported PDF. Never imply we certify compliance or that fixing the listed items removes legal liability. (Trace the lawsuit-volume stat in `../research-sources.md`; don't cite a number we can't source.)
  - **Fabricated WCAG criteria / line numbers** — the engine supplies the criterion and location; the AI may only elaborate the fix. The `factual` eval judge rejects any violation whose criterion/location isn't in the engine output.
  - **SSRF in URL mode is now the buyer's own network** — the app makes the request from the buyer's machine, so the threat is to the buyer, not us. Still guard: block known cloud-metadata IPs (169.254.169.254), and warn/confirm before fetching a private-range address (a buyer may legitimately want to scan their own localhost dev server — allow with a confirm). Respect `robots.txt`; cap redirects; public pages only by default.
  - **No execution** (shared): repo mode never installs/builds/runs; URL mode fetches HTML, it does not drive the page. (Now protects the buyer's machine.)
  - **BYOK key + license integrity** per the shared local model (codebase-health-report.md §15).
- Shared rules (license handling, rate-limit on the validate endpoint, webhook verify, env) per platform-spec §10 and codebase-health-report.md §15 — only the deltas above are specific here. (Clone-SSRF and zip-slip are gone — there's no clone or upload; the only fetch is the buyer's own URL mode.)

## 16. Analytics & success metrics

> Privacy-preserving: the local app emits **no telemetry about the buyer's code/site**; store-side measures purchase + license; in-app events are opt-in + anonymous.

- Store-side events (platform-spec §13, adapted): `store_product_view`, `store_checkout_start`, `store_purchase`, plus `wcag_license_issued`, `wcag_license_validated` (first activation proxy), `wcag_download_started`.
- Optional in-app anonymous events (opt-in, no code/URLs/keys): `wcag_run_complete` (kind: localRepo|url, grade band, exposure level only), `wcag_fix_copy` (rule), `wcag_pdf_export`, `wcag_upsell_click`. Default off unless opted in.
- **Activation:** purchase → first successful **license validation** from the installed app. **Target ≥ 80%.** Secondary opt-in proxy: first in-app `wcag_run_complete`.
- Watch: license-validation success rate, over-activation rate, refund rate (<3%), download-to-activation drop-off, (opt-in) scan-mode split (url vs repo) + fix-copy rate (engagement) + upsell CTR.

## 17. Development phases

> Three workstreams — **the local app** (incl. the URL fetcher + the enforced ADA caveat), **store-side license issuance** (shared), **engine integration**. Assumes the flagship's **local-app shell** + license module exist.

- **Phase 0 — Scaffold.** Local app: instantiate the shared shell for this SKU; the two-way source toggle, empty `WcagAuditOutput` schema, doc-06 design system local. Store: Polar sandbox product; webhook issues a `License` for this slug + emails key + download link; reuse the shared `license/validate`. _AC: `pnpm dev` opens the app; sandbox buy → license email → app validate unlocks._
- **Phase 1 — Acquire + scan + contract (no AI), local.** Bundle + wire the `runAccessibilityChecker` adapter over both local-repo and URL acquisition (the small local SSRF-guarded fetcher) + the deterministic score/bucket/exposure computation + input/output schemas; pipeline returns a schema-valid contract from a **local fixture repo + a fixture HTML page**, AI mocked. _AC: unit test (in the app): fixtures → valid `WcagAuditOutput`; violations/criteria/locations equal the engine's `A11yIssue[]`; score is the deterministic formula; SSRF + no-execute guards pass._
- **Phase 2 — Real run + UI + license, local.** Wire BYOK + `ai.structured` (live AI on a test key) locally, all UI states, in-app report + **local PDF/JSON export**, the enforced ADA-caveat post-process; wire real license validation + offline receipt + device-activation. _AC: end-to-end on a dev machine (both URL and repo modes): activate → pick source → run → see report → export; offline-after-activation works; all §10 cases handled._
- **Phase 3 — Store sales page + polish + Showcase Checklist.** Sales page, metadata, JSON-LD, OG, a11y pass (axe — **the strictest gate of the segment**) on page **and** app, analytics, upsell, setup guide. _AC: axe zero serious/critical (page + app); events fire; Lighthouse ≥90 on the sales page._ **Embed doc 03 §6 Showcase Checklist:**
  - [ ] Sample output asset created (our own site/repo a11y report, anonymized) and shown on the sales page + storefront card.
  - [ ] Artifact leads with the headline verdict (answer-first); violations prioritized criticals-first.
  - [ ] Output is provably target-specific (eval — §2.1): every violation's location + criterion traces to the engine.
  - [ ] Designed data-viz: the `ScoreRing` + the 4-bucket severity `StatMatrix`, rendered in the app.
  - [ ] Branded, designed PDF export (the lawyer/boss-forwardable artifact, generated locally), not a screenshot.
  - [ ] Fixes have copy buttons + the offending element + the WCAG criterion (doc 03 §2.3).
  - [ ] Running state streams real phases + the violation counter (§3), locally.
  - [ ] All 8 UI states designed in the app — no default spinners/blank screens.
  - [ ] "Your code never leaves your machine / public pages only / your code is never executed / your key stays local" + license terms + expected-cost visible (§5, §8).
  - [ ] AI-tells absent; no invented violations or criteria (factual eval — §2.5); the **"not legal advice / not a certification" caveat present and prominent**.
  - [ ] Senior, honest copy (no fear-mongering); open-core + local-first boundary stated plainly.
  - [ ] `impeccable` / `taste` pass on the artifact + sales page; `ui-ux-pro` + axe pass on the app UI (held to the strictest a11y bar).
  - [ ] App degrades gracefully in a narrow window; sales page mobile-first.
- **Phase 4 — Launch.** Live Polar product, real download channel + signing, license revocation-on-refund verified, monitoring on the license endpoint. _AC: platform-spec §15 DoD (adapted to license + download + local run) all checked._

## 18. Testing strategy

> Tests run **in the local app** (engine + pipeline + contract + the ADA caveat) and **store-side** (license). E2E is the local activation flow.

| Edge (§10)         | Test                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| #1 key invalid     | unit: pre-run ping mock rejects → error, no run penalty                                             |
| #2 license states  | integration: bad/over-activated/offline → AI layer gated correctly                                  |
| #3 URL unreachable | unit: fetch failure (url mode) → clean error, no run                                                |
| #4 SSRF (url mode) | unit: metadata IP blocked; private-range requires confirm                                           |
| #5 bad repo path   | unit: missing/non-dir → clean error, no run                                                         |
| no-execute (§15)   | unit: never spawns a repo script; URL mode fetches, never drives the page                           |
| #6 clean target    | unit: zero-violation fixture → score 100 / grade A, low exposure, valid report                      |
| #7 JS-only         | unit: empty-SSR fixture → honest "limited HTML" note, still delivers                                |
| #8 huge target     | unit: many-violation fixture → capped top-N by severity, honest total                               |
| caveat-present     | unit/eval: `adaRisk.summary` always contains the "not legal advice" caveat                          |
| violation-fidelity | unit: violations' rule/wcag/location === engine `A11yIssue[]`; score formula matches                |
| no-code-leaves     | unit: no source/HTML bytes leave the app; `license/validate` body only `{licenseKey,deviceId,slug}` |

Full method, fixtures, the canonical mocks, the provider×input×failure **scenario matrix** (doc 05 §3 — clone per product, dropping cloud-only rows like zip-slip; keep the SSRF row for URL mode, now buyer-network-scoped), and eval golden-set + judges are in [`../05-testing-strategy.md`](../05-testing-strategy.md); for this product they run in the app's own Vitest + a small store-side license suite. Product-specific eval expectations: ~8 real targets (our own site/repo + public sites with known a11y issues) with expected severity bands + `mustFlag` rules + `mustCite` WCAG criteria; judges `input_specific`, `no_ai_tells`, `factual` (every violation + criterion + location traces to the engine — zero invented criteria), `format_valid` (WCAG cites are real 2.1 criteria; the legal caveat is present; PDF renders).

**The one test that matters most:** local fixture repo/HTML → local pipeline (mocked AI returning a fixed object built from the engine's real `A11yIssue[]`) → **valid `WcagAuditOutput`** whose `violations` rule/criterion/location exactly match the engine output, whose `score` equals the deterministic formula, and whose `adaRisk.summary` contains the legal caveat.

## 19. Dependencies & platform integration

> **Does NOT depend on the spine's in-browser run flow (platform-spec §6).** Depends on the spine's purchase/Polar/email primitives + the **shared LICENSING module** (flagship §19) + the **shared local-app shell** (flagship §19).

- **From the spine (store side):** Polar checkout + webhook §9 (license-issuance branch), Resend email (key + download), SEO scaffold §12, analytics §13. The **LICENSING module** (`license.ts` + `POST /api/store/license/validate` + the per-app client) is shared — built once in the flagship; **flagged for doc 04** there.
- **The local app (the product itself):** the shared local-app shell + new libs bundled into the app: the **OSS `accessibility-checker` engine** (depend on the published `mcp-react-toolkit` vs vendor the rule module — _OPEN QUESTION_) for the scan; a small **local SSRF-guarded HTML fetcher** for URL mode (the buyer's machine makes the request — a lightweight fetch + `cheerio`/`linkedom` parse + a `robots-parser`, bundled into the app, not the shared cloud crawler); the AI SDK for the local BYOK call; a local HTML→PDF for export. **No clone/unzip/Blob libs** (the repo is on disk).
- **Cross-product reuse:** the **local-app shell** (shared). `runAccessibilityChecker` + the local URL fetcher are this product's specifics.

## 20. Open questions & risks

- `OPEN QUESTION:` (packaging, segment-wide) **pnpm-dev downloadable repo vs Electron/Tauri vs CLI** — default pnpm-dev repo for v1 (segment README).
- `OPEN QUESTION:` (license activation model) **N machine activations + deactivation UX** — default 3, deactivatable (shared).
- `OPEN QUESTION:` (offline behavior) **activation-receipt offline validity** — default first activation online, then signed receipt valid 30d offline (shared).
- `OPEN QUESTION:` (auto-update) **manual re-download for v1** (shared).
- `OPEN QUESTION:` (engine bundling) **depend on the published `mcp-react-toolkit` vs vendor the `accessibility-checker` rules** — default depend; **does the regex/string rule engine perform as well on fetched HTML (url mode) as on JSX source — verify on real pages in Phase 1.**
- `OPEN QUESTION:` the exact lawsuit-volume stat for sales copy — source it in `../research-sources.md` or mark unverified; never ship an unsourced legal number.
- `OPEN QUESTION:` Polar product id + price confirm ($29); Postgres host for `License`/`Activation` — platform-spec §1.
- **Risk — overstating legal exposure:** the defining risk. Mitigation = the enforced "not legal advice / not a certification" caveat (prompt + local post-process + UI), honest-scope statement, no fabricated criteria; treat a missing caveat as a launch blocker.
- **Risk — code execution (security):** mitigation = shared no-execute model (§15), tested; launch blocker. Now protects the buyer's machine. (Clone-SSRF/zip-slip gone; URL-mode SSRF is buyer-network-scoped + guarded.)
- **Risk — a WCAG tool that itself fails a11y:** mitigation = the strictest axe gate in the segment (sales page + app), dog-food the tool on itself (§13).
- **Risk — report reads generic:** mitigation = per-element fixes tied to the real `element`, honest-confidence on clean targets, `input_specific` eval judge.
- **Risk — license leakage / piracy:** mitigation = device-activation cap + online-once validation + signed receipts; the free engine is MIT anyway — don't over-engineer DRM (flagship §20).
- **Risk — buyer surprised by their own API cost:** mitigation = expected per-run cost in the app (§8) — bounded because only the digest hits the AI.
