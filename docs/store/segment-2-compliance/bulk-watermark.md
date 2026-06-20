# Bulk Watermark + Label Pipeline — PRD

**Slug:** `bulk-watermark` · **Segment:** 2 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The **batch** product of Segment 2: a folder/zip of AI assets in → all of them watermarked + C2PA-manifested + a manifest report, out as a zip. **Deterministic engine, batched.** Composes `c2pa-stamper`'s provenance core (segment README shared-logic #1–#3) over many files.
>
> ⚖️ **Tooling, not legal advice.** This applies technical marking (visible label, C2PA manifest, and — where available — a durable watermark) at scale. It is **not** a legal opinion and does **not** guarantee compliance. Confirm obligations with counsel. See §15, §20, and the segment README disclaimer.

---

## 1. TL;DR

- **One-liner:** Upload a zip of AI assets → get them all back watermarked, C2PA-signed, and labeled, with a manifest report — one bundle, one run.
- **Problem:** A business with _dozens_ of AI images/videos can't stamp them one-by-one. The laws expect every published AI asset marked; doing a catalog by hand is a project.
- **Buyer:** content teams, DTC brands, agencies, media sites with a library of AI-generated assets to label before the deadline.
- **Input → Output:** a zip/folder of assets (+ shared provenance settings) → a **labeled bundle** zip: every asset visibly badged + C2PA-manifested (+ durable watermark where supported) + a **Manifest Report** (per-asset: what was applied, manifest id, validation status) on-screen + PDF.
- **Price:** **$49** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-haiku-4-5`), `openai`, `google` — **AI is optional** (one shared disclosure line for the batch; signing/watermarking need **no key**).
- **Est. run time:** ~30–120s (asset-count-bound; streams per-asset progress) · **Re-run quota:** 2 (fewer than the $19 tools — a batch run is heavier).

## 2. Problem & market

**Today** a business that's been generating AI content for a year has a catalog of unlabeled assets and a deadline. The single-asset stamper (or any one-file tool) doesn't scale to 80 product photos; enterprise platforms do bulk but need a contract and a sales call. **Gap:** a self-serve "drop your zip, get a labeled zip" pipeline that signs + badges (+ watermarks where possible) **every** asset and hands back a report proving it. That's us — the bulk upgrade to `c2pa-stamper`, built on the same deterministic core.

**Competition:** Adobe/Truepic/Digimarc bulk (enterprise contracts), DIY scripting against the `c2pa` CLI (developer-only, no report, no badge, BYO cert), "batch watermark" apps (visible logo only — **no signed manifest, no machine-readable marking**). **Differentiation:** the _complete_ per-asset treatment (visible + signed + machine-readable + watermark-where-available) at batch scale, with a verifiable manifest report, self-serve and cheap.

**Urgency stat:** same **2 Aug 2026** EU Art. 50 + SB 942 deadline; the bulk pain is exactly what makes a catalog owner pay. (See segment README citations.)

**Why Digitribe:** the deterministic provenance core is already built for `c2pa-stamper`; bulk is the composition we get nearly for free, and it's the highest-AOV product in the segment.

## 3. Pricing & packaging

- **$49**, one-time — the segment's highest price, justified by batch value (one run labels a whole catalog) and the heavier compute. Anchored against doing it one-by-one (impractical) or an enterprise contract (overkill).
- **Includes:** 1 run over up to the asset cap (§5), **2 re-runs** in quota (a batch is heavier than the $19 single-asset tools — fewer re-runs), the **labeled bundle** zip (all processed assets at their original relative paths), the **Manifest Report** (on-screen + PDF + JSON), an emailed link (Resend; the bundle lives in Blob).
- **Upsell path:** "ongoing? wire it into your pipeline" → agency CTA / a future API; "need the public page too?" → **Disclosure Generator** ($19); "want to verify your readiness first?" → **AI-Content Compliance Audit** ($29).
- **Future tiers (note only):** an API / watched-folder subscription and per-asset overage pricing are v2 ideas; v1 is one SKU with a hard asset cap.

## 4. User stories / JTBD

- As a **DTC brand**, when I have 80 AI product photos, I want them all labeled in one go, so that my catalog is compliant before the deadline without manual work.
- As an **agency**, when I deliver a campaign's AI assets, I want the whole set signed + badged + reported, so that the client is covered and I have proof.
- As a **media site**, when I publish AI illustrations at volume, I want a repeatable bulk pass, so that labeling keeps up with publishing.
- As a **content lead**, when audited, I want a per-asset manifest report, so that I can show every asset is marked.

**Primary job the artifact must nail:** **every** asset in the batch is correctly processed (signed manifest that re-reads as valid, visible badge, watermark where supported) **or** is honestly reported as failed/skipped with a reason — **no silent drops**. The Manifest Report is the proof; a buyer must trust that "labeled" means labeled.

**Non-goals (v1):** does NOT guarantee the invisible watermark survives every platform (durable watermarking is gated — segment README shared-logic #2; v1 may ship visible-badge + C2PA only, see §7/§20); does NOT edit asset content; does NOT process assets over the per-file or batch caps; does NOT give legal advice; does NOT make the buyer a Trust-Listed generator (signed with our service cert, like `c2pa-stamper` §8).

## 5. Functional requirements

### Inputs

| Field            | Type                         | Validation                                                                                                    | Example                |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `bundle`         | file (zip upload)            | `.zip`; ≤ batch size cap; ≤ asset-count cap; contains supported assets; safe paths (no `../`, zip-bomb guard) | `ai-assets.zip`        |
| `aiGenerated`    | boolean                      | shared default for the batch — fully AI-generated?                                                            | `true`                 |
| `aiEdited`       | boolean                      | shared default — AI-edited?                                                                                   | `false`                |
| `generatorName`  | string (≤80)                 | the tool that made them (shared)                                                                              | `"Firefly"`            |
| `creatorName`    | string (optional, ≤80)       | credit in every manifest                                                                                      | `"Acme Studio"`        |
| `applyWatermark` | boolean (default per §7)     | apply the durable/visible watermark layer (capability-gated — §7/§20)                                         | `true`                 |
| `applyBadge`     | boolean (default `true`)     | composite the visible badge onto each asset                                                                   | `true`                 |
| `disclosureText` | string (optional, ≤300)      | shared disclosure line; **auto-draftable by AI** if blank                                                     | `"Generated with AI."` |
| `useAiForText`   | boolean (default `false`)    | turn on the optional one-shot AI disclosure draft                                                             | `false`                |
| `provider`       | enum (if `useAiForText`)     | one of product's `byokProviders`                                                                              | `anthropic`            |
| `byokKey`        | string (secret, conditional) | **only if `useAiForText`**; validated live pre-run (platform-spec §5)                                         | `sk-…`                 |

**Supported assets (v1):** same set as `c2pa-stamper` (jpeg/png/webp/avif/mp4/mp3/wav). Unsupported entries in the zip are **skipped and reported**, not failed silently.

### Processing (requirements level; pipeline in §7)

Unzip safely → enumerate supported assets → **(optional, once)** AI-draft the shared `disclosureText` → for **each** asset: build the manifest definition (shared settings) → sign + embed (C2PA core) → re-read/validate (round-trip) → optional badge composite → optional watermark (capability-gated) → record a per-asset result → re-zip the processed assets + a `MANIFEST-REPORT.json`/`.md` → render the report + email.

### Outputs

A **labeled bundle** (zip: every processed asset at its original relative path + a per-asset manifest report file) + an on-screen + PDF **Manifest Report**. Exact shape in §6.

### Constraints

- **Caps:** ≤ **50 assets** per batch and ≤ **500 MB** total zip (and per-file caps from `c2pa-stamper` §5). Over cap → reject at input with a clear message + "split into batches / contact us for more."
- Process within the Vercel function budget; **stream per-asset progress** ("Signing 14/50…"); for batches near the cap or with video, the work may need a **Vercel Sandbox / chunked/async path** (`OPEN QUESTION:` §20).
- Bundle (zip) stored 30d in Blob, then purged.

## 6. ⭐ Output Contract

> **Most-deterministic product in the segment.** The artifact is a **batch report** built entirely by the signer/watermarker/encoder — the AI step (if on) contributes **one** shared `disclosureText` string and nothing else. The contract is the per-asset proof, not model prose.

```ts
// server/store/schemas/bulk-watermark.ts
import { z } from 'zod'

const AssetResult = z.object({
  path: z.string(), // original relative path inside the zip, e.g. "products/hero-01.png"
  mimeType: z.string(),
  status: z.enum(['done', 'skipped', 'failed']),
  applied: z.object({
    c2paSigned: z.boolean(),
    embedMode: z.enum(['embedded', 'sidecar', 'none']),
    manifestId: z.string().optional(), // present when c2paSigned
    badge: z.boolean(),
    watermark: z.enum(['durable', 'visible-only', 'none']), // honest about which layer ran (§7/§20)
  }),
  validation: z.enum(['verified', 'verified_with_warnings', 'failed', 'n/a']), // post-sign round-trip
  note: z.string().max(200).optional(), // reason for skipped/failed/warning — never silent
})

export const BulkWatermarkOutput = z.object({
  batch: z.object({
    originalFilename: z.string(),
    assetsFound: z.number().int(),
    assetsProcessed: z.number().int(),
    assetsSkipped: z.number().int(),
    assetsFailed: z.number().int(),
    totalBytesIn: z.number().int(),
    totalBytesOut: z.number().int(),
  }),
  settings: z.object({
    // the shared provenance settings echoed back (deterministic from input):
    aiGenerated: z.boolean(),
    aiEdited: z.boolean(),
    generatorName: z.string(),
    disclosureText: z.string().max(300),
    textSource: z.enum(['user', 'ai-drafted', 'default-template']),
    watermarkMode: z.enum(['durable', 'visible-only', 'off']), // batch-level capability state (§7/§20)
    signerKind: z.literal('service-cert'), // v1, like c2pa-stamper §8
  }),
  summary: z.object({
    overall: z.enum(['all_verified', 'partial', 'mostly_failed']),
    verifiedCount: z.number().int(),
    headline: z.string().max(200), // answer-first: "48 of 50 assets labeled & verified."
  }),
  results: z.array(AssetResult).min(1), // EVERY enumerated asset, incl. skipped/failed — no silent drops
  bundle: z.object({
    zipPath: z.string(), // the Blob path of the labeled bundle
    reportFiles: z.array(z.string()).min(1), // MANIFEST-REPORT.json / .md included in the zip
  }),
  nextSteps: z.array(z.string()).min(1).max(4),
  upsell: z.object({
    suggestDisclosurePage: z.boolean(), // → disclosure-generator
    suggestAudit: z.boolean(), // → ai-compliance-audit
    reason: z.string().max(160),
  }),
})
export type BulkWatermarkOutput = z.infer<typeof BulkWatermarkOutput>
```

- **Export formats:** on-screen Manifest Report (React) · **PDF** (branded batch report, platform-spec §8) · **JSON** (raw contract) · **ZIP** (the labeled bundle — every processed asset at its original relative path + `MANIFEST-REPORT.json`/`.md`).
- **Field notes:** **`results[]` contains every enumerated asset** including `skipped`/`failed` ones with a `note` — the no-silent-drops guarantee is structural. `applied.watermark` / `settings.watermarkMode` are **honest about which watermark layer actually ran** (durable vs visible-only vs none) given the gated capability (§7/§20). `validation` per asset comes from the post-sign round-trip re-read (the `c2pa-stamper` proof, applied per asset). `signerKind` is a `z.literal` — v1 always our service cert.
- **Determinism:** the **entire contract is deterministic** except `settings.disclosureText` (one shared string, only model-written if `useAiForText`). Counts, statuses, manifest ids, validation, watermark mode — all from the engine. The pipeline builds this object directly; `runStructured` is **not** the artifact producer (it supplies at most one string for the whole batch).

## 7. System logic / pipeline (the batch composition of the deterministic core)

```
POST /api/store/run/bulk-watermark  { token, byokKey?, input(+bundle.zip) }
  │
  ├─ [verify]   token + quota (platform-spec §4)              emit{phase:"auth",pct:4}
  ├─ [validate] input vs inputSchema (zod)                    emit{phase:"validate",pct:8}
  │     - zip safety: safe paths (no ../), zip-bomb guard, count + size caps (§15)
  ├─ [key]      IF useAiForText: BYOK live ping (platform-spec §5)  emit{phase:"key",pct:10}
  │     - toggle OFF → no key required; skipped
  │
  ├─ UNZIP + ENUMERATE  safeUnzip(bundle)                     emit{phase:"validate",pct:14}
  │     - list entries, classify supported vs unsupported (unsupported → skipped+noted)
  │     → assets[] (in-memory buffers / temp), assetsFound
  │
  ├─ SHARED DISCLOSURE TEXT (once for the whole batch)        emit{phase:"generate",pct:16}
  │     - provided → use it; else useAiForText → ai.structured({ schema: DisclosureLine,
  │         effort:"low", model: claude-haiku-4-5 })  (one call for the batch, §9)
  │       else → deterministic template  (textSource accordingly)
  │
  ├─ FOR EACH asset  (stream per-asset progress)              emit{phase:"render",pct:18..92,
  │     buildManifestDefinition(sharedSettings, asset)          message:"Signing 14/50…",
  │     signC2PA(buf, manifestDef, serviceSigner)               findingCount: doneSoFar}
  │       → embedded | sidecar | (skip+note if unsupported)   ← shared core (segment README #1)
  │     Reader.fromBuffer(signed) → validation (round-trip)   ← per-asset proof (c2pa-stamper §7)
  │     IF applyBadge: composite visible badge (sharp)        ← shared core (#3)
  │     IF applyWatermark: embedWatermark(buf, payload)       ← shared core (#2) — CAPABILITY-GATED:
  │       - if a durable engine is wired → watermark:"durable"
  │       - else → visible-only overlay → watermark:"visible-only" (honest)  (§20)
  │     record AssetResult (done | skipped | failed + note)   ← NO silent drops
  │     - per-asset try/catch: one bad asset never kills the batch
  │
  ├─ REPACK  zip(processedAssets@originalPaths + MANIFEST-REPORT.json/.md) → Blob  emit{phase:"persist",pct:94}
  │
  ├─ RENDER  report.build(output)                             emit{phase:"render",pct:97}
  │     - on-screen Manifest Report, branded PDF
  │
  └─ PERSIST + EMAIL link + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **The engine is the signer + watermarker + encoder, batched.** AI is called **zero or one** time **total** (one shared disclosure line, `effort:"low"`), never per asset. With the toggle off, the whole batch runs with **no key**. Every contract field but that one string is deterministic.
- **Per-asset isolation:** each asset is a try/catch; a malformed or unsupported file becomes a `skipped`/`failed` result **with a note**, never a silent drop and never a batch-killer. The **post-sign round-trip re-read runs per asset** (the `c2pa-stamper` quality bar, applied 50×).
- **Libraries:** the **C2PA SDK** + `sharp` + `file-type` (shared with `c2pa-stamper`), a **safe unzip** (`yauzl`/`adm-zip` with zip-bomb + path-traversal guards — `OPEN QUESTION:` confirm lib), the **watermark engine** (capability-gated — segment README shared-logic #2; `OPEN QUESTION:` durable engine unresolved, v1 may ship visible-only).
- **Reuse:** this is `c2pa-stamper`'s `server/store/tools/compliance/{sign,manifest,badge}.ts` **looped**; build the single-asset path as "batch of one" so the code is literally shared. `embedWatermark` and the manifest-report builder are the segment's shared-logic #2 and #3.
- **Signing key:** the same **service certificate** as `c2pa-stamper` (§8 there), server-side secret (`C2PA_SIGN_CERT`/`C2PA_SIGN_KEY`), not BYOK.

## 8. BYOK handling

- **AI is optional, one call for the whole batch, cheap.** Providers (only when `useAiForText`): `anthropic` (default **`claude-haiku-4-5`**), `openai`, `google`. Per platform-spec §5. **Most batch runs use no key** (signing + watermarking are key-free).
- **Buyer cost expectation** (show in UI): at most one tiny structured call for the shared disclosure line → **a fraction of a cent**, independent of asset count. The expensive part (signing) costs the buyer's key **nothing**.
- **Pre-run validation:** only if `useAiForText` — a 1-token ping; on failure, fall back to the deterministic disclosure template without spending quota or blocking the batch.

## 9. AI / prompt design

> Identical to `c2pa-stamper` §9 but invoked **once for the batch**: one shared disclosure line. There is no per-asset AI and no "main reasoning artifact." Reuse the same `DisclosureLine` schema, `claude-haiku-4-5`, `effort:"low"`, and the same system prompt (one plain disclosure sentence from attested facts only; ban filler/preambles/invented tools — doc 03 §2.5).

```ts
// reused from c2pa-stamper — the only AI call, run once per batch
const DisclosureLine = z.object({ text: z.string().max(300) })
```

**Guardrails:** schema caps shape; the deterministic template is always the fallback so an AI failure never blocks the (key-free) batch — mark `textSource:'default-template'`, continue, no quota wasted. No legal claims in the disclosure line.

## 10. Edge cases & failure modes

| #   | Trigger                                 | Detection                     | Behavior / message                                                                                    | Quota           |
| --- | --------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------- | --------------- |
| 1   | Invalid/expired BYOK key (AI toggle on) | pre-run ping fails            | "Key looks invalid. Run the batch without AI-drafted text?" + one-click deterministic fallback        | not spent       |
| 2   | Not a zip / corrupt zip                 | unzip fails                   | "Upload a `.zip` of your assets." (pre-run)                                                           | not spent       |
| 3   | Zip over count/size cap                 | input validation              | "Max 50 assets / 500 MB per batch — split it or contact us." (pre-run)                                | not spent       |
| 4   | Zip-bomb / path-traversal entry         | safe-unzip guard              | reject the bundle: "This archive looks unsafe." (pre-run, §15)                                        | not spent       |
| 5   | Some entries are unsupported formats    | per-entry classify            | **skip + report** (`status:'skipped'`, note); process the rest; report counts honestly                | spent           |
| 6   | One asset fails to sign / round-trip    | per-asset try/catch + re-read | **mark that asset `failed` with a note**; continue the batch; report it — no silent drop              | spent (partial) |
| 7   | Durable watermark engine unavailable    | capability check (§7/§20)     | fall back to `visible-only`; `applied.watermark:'visible-only'`; report honestly (no false "durable") | spent           |
| 8   | Entire batch fails (signer/cert down)   | all assets fail               | `RUN_FAILED`, **quota restored**, "Signing was unavailable — we restored your run."                   | restored        |
| 9   | Batch too big for the function timeout  | size/count heuristic          | route to the Sandbox/chunked path, or pre-run "this batch is large — try fewer assets" (§20)          | not spent (pre) |
| 10  | AI shared-text step fails (toggle on)   | AI wrapper error              | deterministic template fallback; batch continues                                                      | spent (success) |
| 11  | Duplicate submit                        | same `runId` (idempotency §6) | return in-flight/cached result; never double-charge                                                   | n/a             |
| 12  | Quota exhausted                         | token check                   | "You've used both runs — buy again or contact us." + buy CTA                                          | n/a             |
| 13  | EXIF/PII across many files              | metadata handling             | don't surface/persist raw EXIF GPS for any asset (§15)                                                | spent           |

## 11. UX / UI flow

**Sales page** (`/store/bulk-watermark`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** a **zip dropzone** (big, primary — "Drop a .zip of your AI assets"; shows detected count after drop), the shared provenance form (the two toggles, `generatorName`, optional `creatorName`, optional `disclosureText`), **badge** toggle (on), **watermark** toggle (label honestly: "Durable watermark" if the engine is wired, else "Visible watermark" — §20), the optional **"auto-write disclosure with AI"** switch (off; reveals `KeyInput` only when on, with key-safety note), **Run batch** button (disabled until a valid zip). A note: **"Signing & watermarking are free of API cost — a key is only for the optional AI-drafted text."** Show the per-run cap (50 assets / 500 MB) and expected time.
- **Validating key:** inline ✓/✗ (only if AI on).
- **Running:** full-width **live progress** — a **per-asset counter** ("Signing 14/50…"), a running tally ("46 verified, 1 skipped so far"), the current filename, a subtle "assembly-line" motion. This is the segment's most satisfying progress view (real batch counts, doc 03 §3). `aria-live="polite"` (announce milestones, not every file).
- **Partial:** skipped/failed assets shown as a non-blocking running list; the batch keeps going.
- **Success / artifact view (the Manifest Report):**
  - Top: the **answer-first `summary.headline`** ("48 of 50 assets labeled & verified") + a **`StatMatrix`/donut** of done / skipped / failed (data-viz, doc 03 §2.3).
  - **Per-asset results table** (`StatMatrix` + rows): path, type, `SeverityChip` for validation, what was applied (signed / badge / watermark mode), and the `note` for any skip/fail — **every asset visible** (the no-silent-drops promise made visual).
  - **Downloads:** **Download labeled bundle (ZIP)** (primary), the **Manifest Report PDF**, JSON, **Email me the link** (pre-checked; the zip lives in Blob).
  - **Honest watermark banner** if `visible-only` (no durable engine): "Visible badge + C2PA manifest applied; durable invisible watermarking is on our roadmap — see FAQ."
  - **Upsell card:** `suggestDisclosurePage` → Disclosure Generator; `suggestAudit` → Compliance Audit; agency CTA "label assets on every publish?".
- **Error:** clear message per §10 + retry; **the uploaded zip + settings preserved** for the session.
- **Quota-exhausted:** message + buy-again CTA (2 runs here).

Components: shared store UI kit — `KeyInput` (conditional), `RunProgress` (per-asset counter), `ArtifactShell`, `SeverityChip`, `StatMatrix`, `FileViewer` ([`../06-ui-kit.md`](../06-ui-kit.md) §2). New: `components/store/artifacts/bulk-watermark.tsx` (the summary + per-asset results table) + reuse `c2pa-stamper`'s `Dropzone` (zip mode). Run states per `06-ui-kit.md` §4. Copy tone per `PROJECT_VISION.md` — senior, plain, **honest about the watermark capability**. Density + tokens per `06-ui-kit.md` §1. **No `ScoreRing`** — the verified/skipped/failed matrix + the headline count is the answer-first verdict.

## 12. SEO

- **Target keyword(s):** "bulk C2PA watermark", "batch AI content labeling", "watermark AI images in bulk", "label AI assets EU AI Act" (batch/tool intent).
- **`generateMetadata`:** title `Bulk Watermark + Label Pipeline — Sign AI Assets at Scale` (≤60); description: "Upload a zip of AI assets and get them all back watermarked, C2PA-signed, and labeled, with a manifest report. Instant, $49." (≤155). Canonical `/store/bulk-watermark`. OG via `@vercel/og` (the manifest-report visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($49) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "How many assets per run?" (up to 50 / 500 MB), "What gets applied to each asset?" (visible badge + C2PA manifest + watermark where supported), "Is the invisible watermark durable?" (**honest:** v1 may be visible badge + manifest; durable invisible watermarking is gated on a confirmed engine — see roadmap), "Does this satisfy the EU AI Act / SB 942?" (**implements the technical marking those laws reference — confirm with counsel; tooling, not legal advice**), "Do you store my files or key?" (bundle 30d for re-download then purged; key never stored).
- **Internal links:** `c2pa-stamper` ("stamping more than one?") → here; `ai-compliance-audit` ("AI images unlabeled") → here; blog posts on AI labeling at scale → here.
- **Programmatic surface (note):** "bulk-label AI `<format>` assets" per-format pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: the zip dropzone is keyboard-operable + labeled; toggles labeled; the AI switch reveals the key `<fieldset>` (legend) only when on; the running per-asset region is `aria-live="polite"` + `role="status"` (announce milestones, not every file, to avoid screen-reader spam); on success, focus to the report heading; the results table is a real table with header scope; validation chips carry icon + word, not color alone.
- Mobile: dropzone "choose file" first-class; the results table collapses to stacked cards; downloads full-width.
- Error recovery: inline, non-destructive (zip + settings preserved); the deterministic (AI-off) fallback is one click; retry without re-upload where the session holds the bundle.
- Gate CI on `@axe-core/playwright`.

## 14. Payment integration

- Create Polar product **"Bulk Watermark + Label Pipeline" $49** (sandbox + live). Checkout metadata `{ slug: "bulk-watermark" }`. Everything else per platform-spec §9.
- **Refund stance:** refund honored if the run produced **no** validating assets (a whole-batch failure; partial success with an honest report is a completed run). Quota auto-restores on system-side whole-batch failures (§10 #8). Note: quota is **2** here (heavier runs).

## 15. Security & privacy

- **Buyer data:** the uploaded zip of assets + the shared provenance form + (only if AI on) the BYOK key. Assets processed transiently; the **labeled bundle** stored 30d in Blob for re-download, then purged. Originals not retained beyond the run.
- **Product-specific risks:**
  - **Malicious archive** — the headline risk for a zip-input product: **zip-bombs** (decompression bombs) and **path traversal** (`../` entries). The safe-unzip layer MUST enforce a decompressed-size ceiling, an entry-count ceiling, and reject/sanitize any path escaping the extract root. (§10 #4 — pre-run, launch blocker.)
  - **Malformed/hostile media at scale** — same as `c2pa-stamper` §15 (magic-byte sniff, allow-list, no shell on attacker paths, in-memory buffers / Sandbox isolation), applied per asset; a hostile file becomes a `failed` result, never an exploit.
  - **EXIF/PII across many files** — don't surface/persist raw EXIF GPS for any asset.
  - **The service signing key** — same high-value secret as `c2pa-stamper` §15 (`C2PA_SIGN_*`, server-only, never logged; KMS-backed preferred — `OPEN QUESTION:` §20).
  - **Resource exhaustion** — a 50-asset video batch could blow the function budget; enforce caps + route big batches to the Sandbox/chunked path (§20); rate-limit per token (platform-spec §10).
  - **Honest provenance + zip safety** — sign only what the buyer attests; sanitize output paths in the produced zip.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `bulk_batch: { assetsFound, assetsProcessed, assetsFailed, watermarkMode }`, `bulk_summary: { overall }`, `bulk_bundle_download`, `bulk_pdf_download`.
- **Activation:** purchase → first run that produces a bundle with **≥1 verified asset** and an honest report. **Target ≥ 90%** (deterministic engine; failures are usually bad-zip/over-cap caught pre-run).
- Watch: per-asset **failure rate** (<3% — a quality alarm; investigate format coverage), skip rate (informs supported formats), whole-batch-fail rate (<1% — signer health), refund rate (<3%), watermark-mode distribution (tracks the durable-engine rollout).

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`bulk-watermark`, `runsPerPurchase: 2`), Polar sandbox product, routes, empty `BulkWatermarkOutput` schema, blank tool UI (zip dropzone). _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Batch core (no AI, no UI).** Safe-unzip + enumerate + the per-asset loop over the **shared `c2pa-stamper` provenance core** (sign + round-trip + badge) + re-zip + the manifest report; pipeline returns a schema-valid contract from a **fixture zip** (mixed: supported + unsupported + one malformed) with AI **off**. _AC: unit test: fixture zip → every asset in `results[]` (done/skipped/failed honestly), signed assets re-read as valid, output zip has assets at original paths + report file; zip-bomb/traversal guards tested._
- **Phase 2 — Real run + UI + optional AI + watermark layer.** Wire the service signer, the optional one-shot BYOK disclosure text + fallback, the **watermark engine (capability-gated — durable if wired, else visible-only)**, all UI states (per-asset progress), report render + PDF + bundle ZIP(Blob) + Resend email. _AC: E2E activation green in sandbox (zip → labeled bundle → download → every asset validates); partial-failure path reported honestly; all §10 cases handled._
- **Phase 3 — SEO + polish + showcase gate.** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics, the honest watermark banner. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria** (sample manifest report on the sales page; answer-first headline count + done/skipped/failed data-viz; branded PDF; per-asset results table; live per-asset streamed progress + show-the-work tally; all 8 states; key-safety + retention + cost + cap visible; honest watermark-capability copy; senior copy; `impeccable`/`taste`/`ui-ux-pro`/axe pass; mobile results table first-class). _AC: checklist all green; Lighthouse ≥90._
- **Phase 4 — Launch.** **Production signing certificate** (shared with `c2pa-stamper`; launch blocker) + a **resolved watermark stance** (durable engine confirmed, or ship visible-only + roadmap copy — §20); live Polar product, monitoring/alerts on per-asset + whole-batch fail rates, refund flow verified, our own asset library bulk-labeled (dog-fooding). _AC: platform-spec §15 Definition of Done all checked + an external C2PA verifier validates a sampled output asset._

## 18. Testing strategy

| Edge (§10)            | Test                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------ |
| #2 not a zip          | unit: non-zip / corrupt zip rejected pre-run                                         |
| #3 over cap           | unit: >50 assets or >500 MB rejected pre-run, quota intact                           |
| #4 zip-bomb/traversal | unit: decompression-bomb + `../` entry rejected by safe-unzip (launch blocker)       |
| #5 unsupported entry  | unit: mixed zip → unsupported entries `skipped` + noted, rest processed              |
| #6 one asset fails    | unit: one malformed asset → `failed` + note, batch completes, others verified        |
| #7 watermark fallback | unit: durable engine absent → `visible-only`, reported honestly (no false "durable") |
| #8 whole batch fails  | integration: signer down → `RUN_FAILED`, quota restored                              |
| #10 AI text fails     | integration: shared-text AI fails → template fallback, batch continues               |
| #11 duplicate         | integration: same `runId` returns cached, no double quota                            |

**The one test that matters most:** fixture zip (supported + unsupported + malformed entries) → pipeline (**AI off**) → a `BulkWatermarkOutput` where **every enumerated asset appears in `results[]` with an honest status**, each `done` asset's signed bytes **re-read as valid C2PA**, and the output zip contains the processed assets at their original paths + the manifest report. This proves the no-silent-drops + per-asset-validity guarantees.

**On evals:** AI surface is one shared line, so evals are **minimal** (the same `no_ai_tells`/`factual` judge on the disclosure line as `c2pa-stamper`). The real gates are the **deterministic batch test** above + the **per-asset round-trip validation** + a **`@live` external-verifier smoke** on a sampled output asset (doc 05 §7). Note: substitute a **batch-composition matrix** (all-supported / mixed / all-unsupported / one-malformed / over-cap / video-heavy × watermark durable|visible|off) for the standard provider×failure matrix, since the default path is AI-free. Full method/fixtures/mocks/E2E/CI in [`../05-testing-strategy.md`](../05-testing-strategy.md).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5 (only the optional one-shot text), job runner/SSE §6, data model §7, report+PDF+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`.
- **Reuses (shared with `c2pa-stamper`):** `server/store/tools/compliance/{sign,manifest,badge}.ts` (the deterministic provenance core — single-asset is batch-of-one), `sharp`, `file-type`, the C2PA SDK. New: a **safe-unzip** lib (`OPEN QUESTION:` `yauzl` vs `adm-zip` with bomb/traversal guards), the **watermark engine** (`embedWatermark`, capability-gated — segment README shared-logic #2, `OPEN QUESTION:` durable engine).
- **New env:** shares `C2PA_SIGN_CERT`/`C2PA_SIGN_KEY` with `c2pa-stamper`; if a durable watermark vendor is wired, its credential (`OPEN QUESTION:` §20).
- **Cross-product reuse:** this product _is_ the proof that the Seg-2 deterministic core is built generic — if `c2pa-stamper` is batch-of-one, bulk is the loop. Design accordingly.

## 20. Open questions & risks

- `OPEN QUESTION:` **(shared, highest priority) the C2PA signing library + production certificate** — inherited from `c2pa-stamper` §20 (pin the `contentauth/c2pa-js` package, confirm Vercel native-binary support or use a Sandbox/external signer; obtain a Trust-Listed CA cert). Launch blocker.
- `OPEN QUESTION:` **the durable watermark engine** — the segment's open hardware. Robust invisible watermarking (Digimarc / SynthID-class) is largely commercial/closed; open options (`invisible-watermark`/DWT-DCT) are fragile and **not** regulator-grade. **Default v1 stance: ship visible-badge + C2PA manifest, mark `watermarkMode:'visible-only'`, and never claim durability we can't deliver;** gate true durable watermarking behind a confirmed vendor/partner (segment README shared-logic #2). Resolve the stance before launch and set the FAQ/banner copy accordingly.
- `OPEN QUESTION:` safe-unzip library + the exact bomb/traversal limits (`yauzl` streaming is safer than `adm-zip` in-memory — lean `yauzl`).
- `OPEN QUESTION:` batch execution model for big/video-heavy zips — in-function vs **Vercel Sandbox** vs chunked/async with email-on-complete. Confirm the 50-asset/500-MB caps against the function budget; bigger batches may need the async path.
- `OPEN QUESTION:` Polar product id + price confirm ($49); quota = 2 confirm; Postgres host (Supabase vs Neon).
- **Risk — silent drops / a buyer trusting "labeled" assets that aren't.** The worst outcome for a batch product. **Mitigation:** `results[]` includes **every** enumerated asset with an honest status + note (structural), the **per-asset round-trip validation**, the visible results table, alarms on failure rates (§16). No asset is "done" unless it re-reads as valid.
- **Risk — over-claiming watermark durability** (legal/repute risk on a compliance product). **Mitigation:** honest `watermark`/`watermarkMode` fields, the visible-only banner + FAQ, never marketing "unstrippable"; resolve the engine before claiming durable.
- **Risk — malicious archive (zip-bomb/traversal) or hostile media at scale.** **Mitigation:** the safe-unzip guards + per-asset sandboxing (§15), tested as launch blockers.
- **Risk — cost/time blowout on big batches.** **Mitigation:** hard caps, per-asset streaming, the Sandbox/async path for large jobs, rate-limit per token.
- **Risk — legal overreach (selling "compliance" at scale).** **Mitigation:** the "tooling, not legal advice" disclaimer on the sales page + report + FAQ; honest scope; recommend counsel. Owner: Nishant + founder review.
