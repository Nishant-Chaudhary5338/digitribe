# C2PA Content Credentials Stamper — PRD

**Slug:** `c2pa-stamper` · **Segment:** 2 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> This is the **reference PRD** and the **reference implementation** of Segment 2's **deterministic provenance core** (the C2PA signer + single-asset artifact). Build it first. `bulk-watermark` composes its signer for batches; the others reference it.
>
> ⚖️ **Tooling, not legal advice.** This product helps a business _implement_ the technical marking the EU AI Act / SB 942 reference. It is not a legal opinion and does not guarantee compliance. See §15, §20, and the segment README disclaimer.

---

## 1. TL;DR

- **One-liner:** Drop in an AI image or video → get the same file back with a signed C2PA "Content Credential" baked in, a visible badge, and a verifiable provenance receipt.
- **Problem:** New laws (EU AI Act Art. 50, California SB 942) require AI-generated media to carry **machine-readable provenance + a visible disclosure**, using the C2PA standard. Doing it by hand needs a Rust toolchain, an X.509 signing certificate, and spec knowledge almost no business has.
- **Buyer:** content teams, marketers, agencies, and creators who publish AI-generated/edited images or video and need them labeled — without standing up signing infrastructure.
- **Input → Output:** one asset (+ a short provenance form) → the **same asset re-encoded with an embedded, signed C2PA manifest** + a visible "Content Credentials" badge variant + a **provenance receipt** (on-screen + PDF) + a download bundle (zip).
- **Price:** **$19** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-haiku-4-5`), `openai`, `google` — **AI is optional** (only for auto-drafting disclosure text; signing needs **no key**).
- **Est. run time:** ~10–25s (encode/sign-bound, not AI-bound) · **Re-run quota:** 3.

## 2. Problem & market

**Today** a business that publishes an AI-generated image and wants it labeled per the law has to: learn the C2PA spec, install the Rust SDK or `c2pa` CLI, obtain a code-signing certificate from a conformant CA, write a manifest with the right assertions (`c2pa.actions`, AI/training-mining, generator info), embed it, and verify it round-trips. The realistic alternatives are an **enterprise platform with a sales call** (Adobe, Truepic, Digimarc) or **nothing**. There is no $19, paste-a-file, walk-away-with-the-signed-asset tool. That's this product.

**Competition:** Adobe Content Authenticity (tied to Adobe accounts/CC), Truepic/Digimarc (enterprise, contract sales), the open-source `c2pa` CLI (developer-only, BYO certificate). Consumer "add a watermark" apps add a _visible_ logo but **no signed, verifiable manifest** — they don't satisfy the _machine-readable_ requirement. **Gap:** instant, self-serve, correctly-signed C2PA with a verifiable receipt, for one asset, cheap. That's us.

**Urgency stat:** EU AI Act Article 50 transparency obligations apply from **2 Aug 2026**, with non-compliance in the **up to €15M / 3% of global turnover** penalty tier (Art. 99); California SB 942's manifest + latent disclosure requirements share the **2 Aug 2026** operative date (after AB 853). (See segment README for the citation list and the penalty-tier OPEN QUESTION.)

**Why Digitribe:** we ship AI systems and care about provenance; we can wire a _correct_ manifest (the right assertions, an honest generator string, a real signature) rather than a cosmetic badge. It also funnels: stamping one asset is the entry point to the bulk pipeline and the disclosure-page generator.

## 3. Pricing & packaging

- **$19**, one-time. Impulse-range; anchored far below any enterprise provenance contract and below an hour of a developer's time wrestling the SDK.
- **Includes:** 1 run (3 re-runs in quota to fix the provenance form or re-stamp after editing the asset), the **signed asset** download, the visible-badge asset variant, the on-screen + **PDF provenance receipt**, the raw C2PA manifest JSON, and an emailed copy of the bundle (Resend). One asset per run (batch is `bulk-watermark`).
- **Upsell path:** "stamping more than one file?" → **Bulk Watermark + Label Pipeline** ($49); "need the public disclosure page too?" → **AI Disclosure Page Generator** ($19); "not sure what the law needs?" → **AI-Content Compliance Audit** ($29); agency CTA "want us to wire signing into your publishing pipeline?" → Digitribe services.
- **Future tiers (note only):** a "bring your own certificate" mode (sign with the buyer's org cert for stronger trust-list standing) and a re-stamp subscription are v2 ideas; v1 ships one SKU signed with **our** service certificate (see §8 / §20).

## 4. User stories / JTBD

- As a **marketing lead**, when I publish an AI hero image, I want it to carry a verifiable Content Credential, so that we satisfy the labeling rule and customers can check provenance.
- As an **agency**, when I deliver AI creative to a client, I want each asset signed + badged, so that the client is covered and I look buttoned-up.
- As a **creator**, when I post AI art, I want a visible "AI-generated" badge **and** the embedded credential, so that platforms and viewers see the disclosure.
- As a **compliance-conscious founder**, when counsel says "mark your AI media," I want a one-click way to do it correctly, so that I'm not learning the C2PA SDK at 11pm.

**Primary job the artifact must nail:** produce a **genuinely valid, verifiable** C2PA-signed asset — one that passes a C2PA validator (e.g. the Content Credentials Verify tool) and embeds the _right_, _honest_ assertions from the buyer's input. A cosmetic badge with a broken or fake manifest is a **failure**, not a near-miss.

**Non-goals (v1):** does NOT make the buyer a C2PA-conformant _generator product_ on the official Trust List (we sign with our service cert; §8); does NOT guarantee the watermark survives every platform's re-encoding (durable invisible watermarking is gated — segment README shared-logic #2); does NOT provide legal certification of compliance; does NOT edit or improve the asset's content; does NOT handle assets over the size cap (§5) or unsupported formats.

## 5. Functional requirements

### Inputs

| Field             | Type                          | Validation                                                                                    | Example                      |
| ----------------- | ----------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| `asset`           | file (upload)                 | mime ∈ supported set (§ below); ≤ size cap; magic-byte sniff matches extension; not malformed | `hero.png`                   |
| `aiGenerated`     | boolean                       | required — was this fully AI-generated?                                                       | `true`                       |
| `aiEdited`        | boolean                       | required — was it AI-edited/manipulated?                                                      | `false`                      |
| `generatorName`   | string (≤80)                  | the tool that made it (free text or pick-list)                                                | `"Midjourney v7"`            |
| `creatorName`     | string (optional, ≤80)        | person/brand to credit in the manifest                                                        | `"Acme Studio"`              |
| `disclosureText`  | string (optional, ≤300)       | human-readable disclosure; **auto-draftable by AI** if left blank                             | `"Image generated with AI."` |
| `addVisibleBadge` | boolean (default `true`)      | also emit a badge-overlaid variant                                                            | `true`                       |
| `useAiForText`    | boolean (default `false`)     | turn on the optional AI step (needs a key)                                                    | `false`                      |
| `provider`        | enum (only if `useAiForText`) | one of product's `byokProviders`                                                              | `anthropic`                  |
| `byokKey`         | string (secret, conditional)  | **only required if `useAiForText`**; validated live pre-run (platform-spec §5)                | `sk-…`                       |

**Supported formats (v1):** `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`, `audio/mpeg`, `audio/wav`. Formats the C2PA SDK can embed get an **embedded** manifest; any it can't get a **sidecar** `.c2pa` file + a note in the receipt.

- `OPEN QUESTION:` confirm the exact embeddable-format set against the pinned C2PA library version (segment README shared-logic #1). GIF/HEIC/SVG out of scope for v1.

### Processing (requirements level; pipeline in §7)

Validate + sniff the file → build a C2PA **manifest definition** from the form (honest assertions only) → **(optional)** AI-draft `disclosureText` if blank and the toggle is on → **sign + embed** with the C2PA SDK and our service certificate → **re-read/validate** the signed asset to prove it round-trips → optionally render a **visible badge** variant → assemble the provenance receipt + zip → email.

### Outputs

The **signed asset** (embedded manifest, or sidecar where embedding isn't possible), an optional **badge-overlaid variant**, the **C2PA manifest JSON**, and a **Provenance Receipt** (on-screen + PDF). Exact shape in §6.

### Constraints

- **Size cap:** images ≤ 25 MB; video/audio ≤ 200 MB (Vercel Function payload + timeout budget; large video → recommend `bulk-watermark` or chunked upload). Reject over cap at input with a clear message.
- One asset per run.
- Total run under the Vercel function limit; signing is fast for images, slower for video (re-mux). Stream progress (§7).
- Artifact (signed asset + receipt) stored 30d (Blob/KV TTL) for re-download, then purged.

## 6. ⭐ Output Contract

> The locked schema. **Note the inversion vs Segment 1:** the artifact's _substance_ (the signed bytes, the manifest) is produced **deterministically** by the C2PA signer, **not** by the AI step. The AI step, if on, fills **only** `disclosure.text`. The contract is the _receipt_ describing what was signed.

```ts
// server/store/schemas/c2pa-stamper.ts
import { z } from 'zod'

const C2paAssertion = z.object({
  label: z.string(), // e.g. "c2pa.actions", "c2pa.training-mining", "stds.schema-org.CreativeWork"
  summary: z.string().max(160), // human label of what this assertion declares
})

const ValidationCheck = z.object({
  name: z.enum(['signature', 'manifest_embedded', 'assertions_present', 'roundtrip_read']),
  status: z.enum(['pass', 'warn', 'fail']),
  detail: z.string().max(200),
})

export const C2paStamperOutput = z.object({
  asset: z.object({
    originalFilename: z.string(),
    mimeType: z.string(),
    bytesIn: z.number().int(),
    bytesOut: z.number().int(), // signed size
    embedMode: z.enum(['embedded', 'sidecar']), // sidecar when format can't embed
  }),
  // Deterministic, produced by the C2PA signer — NOT by the model:
  manifest: z.object({
    manifestId: z.string(), // the C2PA manifest/active label from the signed asset
    generator: z.string(), // "Digitribe C2PA Stamper" + version (our claim_generator)
    signedAtISO: z.string().datetime(),
    signerKind: z.enum(['service-cert']), // v1: our service certificate (§8). 'byo-cert' is v2.
    trustListStatus: z.enum(['service_cert', 'trust_listed', 'unknown']), // honesty about CA standing
    assertions: z.array(C2paAssertion).min(2), // actions + ai/training-mining at minimum
  }),
  // What the buyer told us, reflected back so the receipt is self-explaining:
  disclosure: z.object({
    aiGenerated: z.boolean(),
    aiEdited: z.boolean(),
    generatorName: z.string(),
    text: z.string().max(300), // the disclosure line; AI-drafted ONLY if useAiForText
    textSource: z.enum(['user', 'ai-drafted', 'default-template']),
  }),
  validation: z.object({
    overall: z.enum(['verified', 'verified_with_warnings', 'failed']),
    checks: z.array(ValidationCheck).min(3), // the post-sign re-read proof
    verifyUrl: z.string().url().optional(), // link to a C2PA verifier preloaded with the asset
  }),
  files: z
    .array(
      z.object({
        path: z.string(), // "signed/hero.png", "badge/hero-badged.png", "manifest.json", "VERIFY.md"
        kind: z.enum(['signed-asset', 'badged-asset', 'sidecar', 'manifest-json', 'readme']),
        bytes: z.number().int(),
      })
    )
    .min(2),
  nextSteps: z.array(z.string()).min(2).max(4), // "Verify at contentcredentials.org/verify", "Add the badge to your post", …
  upsell: z.object({
    suggestBulk: z.boolean(), // → bulk-watermark
    suggestDisclosurePage: z.boolean(), // → disclosure-generator
    reason: z.string().max(160),
  }),
})
export type C2paStamperOutput = z.infer<typeof C2paStamperOutput>
```

- **Export formats:** on-screen receipt (React) · **PDF** (branded provenance receipt, platform-spec §8) · **JSON** (raw contract incl. `manifest.json`) · **ZIP** (the signed asset at its real filename + badged variant + `manifest.json` + a `VERIFY.md` "how to confirm this" readme).
- **Field notes:** `validation.checks` are the **product's proof of correctness** — generated by re-reading the signed asset through the C2PA Reader after signing (deterministic). `trustListStatus: 'service_cert'` is the honest v1 state (signed with our cert, not the buyer's CA). `textSource` makes it auditable whether a human or the model wrote the disclosure line.
- **Determinism:** **almost everything here is deterministic** — `asset.*`, `manifest.*`, `validation.*`, `files[].*` all come from the signer/encoder. The **only** model-generated field is `disclosure.text` (and only when `useAiForText` is on). This is the opposite of Agent-Ready Kit, where the model fills most of the contract. The pipeline (§7) builds this object directly; `runStructured` is **not** the producer of the artifact — it only supplies one string. That is the whole point of this segment.

## 7. System logic / pipeline (the Segment-2 reference deterministic core)

```
POST /api/store/run/c2pa-stamper  { token, byokKey?, input(+asset) }
  │
  ├─ [verify]   token + quota (platform-spec §4)               emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod) + magic-byte sniff  emit{phase:"validate",pct:12}
  │     - mime allow-list, size cap, malformed-file reject (§15)
  ├─ [key]      IF useAiForText: BYOK live ping (platform-spec §5)  emit{phase:"key",pct:16}
  │     - if useAiForText is OFF, NO key is required and this step is skipped
  │
  ├─ DISCLOSURE TEXT                                           emit{phase:"generate",pct:22}
  │     - if disclosureText provided → use it (textSource:"user")
  │     - else if useAiForText → ai.structured({ schema: DisclosureLine,
  │         effort:"low", model: claude-haiku-4-5 })  → one short line  (§9)
  │     - else → deterministic template from {aiGenerated,aiEdited,generatorName} (textSource:"default-template")
  │
  ├─ BUILD MANIFEST  buildManifestDefinition(input, disclosure)  emit{phase:"generate",pct:30}
  │     - assertions: c2pa.actions (created/edited per flags),
  │       c2pa.training-mining (allowed/notAllowed — honest default notAllowed),
  │       generator/claim_generator = "Digitribe C2PA Stamper/x",
  │       optional creator (stds.schema-org.CreativeWork author),
  │       AI disclosure as a custom/standard assertion + the human text
  │     - NO fabricated assertions; only what the form attests
  │
  ├─ SIGN + EMBED  signC2PA(assetBuf, manifestDef, serviceSigner)  emit{phase:"render",pct:45..70,
  │     - C2PA SDK Builder.sign(signer, input, output)              message:"Signing & embedding…"}
  │     - embeddable format → embedded manifest; else → sidecar .c2pa
  │     → SignedAsset { bytes, embedMode, manifestId }            (segment README shared-logic #1)
  │
  ├─ VERIFY (round-trip)  Reader.fromBuffer(signed)             emit{phase:"render",pct:75}
  │     - re-read the just-signed asset, assert: signature ok,
  │       manifest present, expected assertions present
  │     → validation.checks[] + overall  (this IS the quality proof)
  │
  ├─ BADGE (optional)  IF addVisibleBadge                       emit{phase:"render",pct:82}
  │     - composite the "Content Credentials" / "AI-generated" badge
  │       onto a copy (sharp for images; first-frame/overlay for video)  (§19)
  │     → badged variant
  │
  ├─ RENDER  report.build(output)                              emit{phase:"render",pct:92}
  │     - on-screen receipt, PDF, zip(signed + badged + manifest.json + VERIFY.md) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }   emit{phase:"done",pct:100}
```

- **The engine is the C2PA signer, not the LLM.** AI is called **zero or one** time (one short string, `effort:"low"`), and **only** when `useAiForText` is on. With the toggle off, the run never touches a provider and needs no key — yet still produces a complete, valid artifact. The contract's substance is created by `signC2PA` + the post-sign re-read.
- **Libraries:** the C2PA SDK from `contentauth/c2pa-js` (successor to `c2pa-node-v2`) for sign/read — **`OPEN QUESTION:` confirm exact package + version + Vercel native-binary support** (segment README shared-logic #1, §19, §20). `sharp` (already common on Vercel) for the badge composite on images. `file-type` for magic-byte sniffing.
- **Reuse:** `signC2PA` and `buildManifestDefinition` ARE the shared deterministic provenance core and are **reused by `bulk-watermark`** (batch) and the optional sign-toggle path. Build them generic in `server/store/tools/compliance/`.
- **Signing key handling:** the **service signing certificate + private key** live in env/secret store (`C2PA_SIGN_CERT`, `C2PA_SIGN_KEY` — add to `lib/store/env.ts`, never client-exposed), loaded server-side only. This is **our** secret, separate from the buyer's BYOK key. See §8 and §15.

## 8. BYOK handling

- **AI is optional and cheap.** Providers (only when `useAiForText`): `anthropic` (default model **`claude-haiku-4-5`** — a one-line disclosure needs nothing heavier; cheap/fast), `openai`, `google`. Per platform-spec §5. The default-off, deterministic-template path means **most runs use no key at all.**
- **Buyer cost expectation** (show in UI when the toggle is on): one tiny structured call (~hundreds of tokens) → **a fraction of a cent on the buyer's key.** Make clear the signing itself is free of key cost.
- **Pre-run validation:** only when `useAiForText` is on — a 1-token ping via the AI wrapper; on failure return error #1 **without spending quota** and **without blocking** the deterministic path (offer "stamp without AI text" as a one-click fallback).
- **Our signing key is NOT BYOK.** The C2PA signature uses Digitribe's **service certificate** (platform-managed secret, §15). `OPEN QUESTION:` how we obtain the cert (a CA on the C2PA interim Trust List — e.g. DigiCert/SSL.com — vs a self-issued test cert for beta). v1 honest stance: `trustListStatus: 'service_cert'`; "BYO certificate" for stronger trust-list standing is v2.

## 9. AI / prompt design

> AI is **only** invoked to draft the one-line disclosure when the buyer leaves it blank and turns the toggle on. Everything else is deterministic. There is **no** "main reasoning artifact" here — keep this proportionate.

**Model:** default `claude-haiku-4-5`, `effort: "low"`. Structured output enforced by AI SDK `generateObject` against a tiny one-field schema so the model returns exactly one clean line, never a paragraph or preamble.

```ts
// the only AI call's output schema — intentionally minimal
const DisclosureLine = z.object({
  text: z.string().max(300), // a single, plain disclosure sentence
})
```

**System prompt (draft):**

```
You write ONE short, plain disclosure sentence stating that a piece of media was
created or edited with AI. Rules:
- Output ONE sentence, ≤ 200 characters. No preamble, no "Here is", no markdown.
- State the truth from the provided facts ONLY: whether it was AI-generated,
  AI-edited, and the named tool. Do not invent tools, claims, or hedges.
- Plain and neutral. No marketing language, no "in an effort to", no emoji.
- If it was generated: "This image was generated with AI (<tool>)." style.
  If only edited: "This image was edited with AI (<tool>)." Adapt for video/audio.
```

**User prompt template:** `buildDisclosurePrompt({ aiGenerated, aiEdited, generatorName, mediaType })` → interpolates only the attested facts.

**Guardrails:** schema caps length and shape; "facts ONLY" rule prevents invented tools; the deterministic template is always available as a fallback, so an AI refusal/timeout **never blocks** the artifact (we fall back to the template, mark `textSource:"default-template"`, and continue — no quota wasted on the AI failure path). Anti-AI-tell rules (doc 03 §2.5) apply even to one sentence: ban "in today's landscape", "it's important to note", restated-prompt preambles.

## 10. Edge cases & failure modes

| #   | Trigger                                     | Detection                          | Behavior / message                                                                                       | Quota           |
| --- | ------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------- |
| 1   | Invalid/expired BYOK key (AI toggle on)     | pre-run ping fails                 | "Your `<provider>` key looks invalid. Stamp without AI-drafted text?" + one-click deterministic fallback | not spent       |
| 2   | Unsupported / malformed file                | mime allow-list + magic-byte sniff | "We can stamp JPEG, PNG, WebP, AVIF, MP4, MP3, WAV — this file isn't supported."                         | not spent       |
| 3   | File over size cap                          | input validation                   | "This file is over the 25 MB / 200 MB limit. For large or many files, try Bulk Watermark."               | not spent       |
| 4   | Format can't embed a manifest               | SDK embed unsupported              | proceed → produce **sidecar** `.c2pa`; receipt explains `embedMode:"sidecar"` + how to ship it together  | spent           |
| 5   | Signing fails (cert/SDK error)              | `signC2PA` throws                  | retry once; if still failing → `RUN_FAILED`, **quota restored**, "Signing failed on our side — retried." | restored        |
| 6   | Post-sign re-read fails (no round-trip)     | Reader validation `fail`           | treat as a hard failure → do NOT deliver a broken asset; `RUN_FAILED`, quota restored                    | restored        |
| 7   | AI text step times out/refuses              | AI wrapper error                   | **fall back to deterministic template**, mark `textSource:"default-template"`, **continue** (no block)   | spent (success) |
| 8   | Asset already has a C2PA manifest           | Reader pre-check                   | offer "add our manifest as a new claim (recommended)" vs "replace"; default add; note provenance chain   | spent           |
| 9   | Video too long / re-mux exceeds timeout     | duration/size heuristic            | "This video is too long to stamp here — try Bulk Watermark or trim it." (pre-run, before quota)          | not spent       |
| 10  | Buyer attests nothing AI (both flags false) | input check                        | warn "This tool is for AI media — nothing to disclose. Continue anyway?" still sign w/ honest actions    | spent           |
| 11  | Duplicate submit (double-click)             | same `runId` (idempotency §6)      | return in-flight/cached result; never double-charge                                                      | n/a             |
| 12  | Quota exhausted                             | token check                        | "You've used all 3 runs — buy again or contact us." + buy CTA                                            | n/a             |
| 13  | EXIF/PII in the uploaded file               | metadata scan                      | do not surface or persist raw EXIF GPS; note "we don't read your file's location data" (§15)             | spent           |

## 11. UX / UI flow

**Sales page** (`/store/c2pa-stamper`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** a **dropzone** (big, primary — "Drop your AI image or video"), the short provenance form (two toggles `aiGenerated`/`aiEdited`, `generatorName` pick-list+free-text, optional `creatorName`, optional `disclosureText`), an **"auto-write the disclosure with AI"** switch (off by default; reveals the `KeyInput` + provider select **only when on**, with the "we never store your key" note), a "show me a visible badge" toggle (on), **Stamp** button (disabled until a valid file is dropped). A live note: **"Signing is free of API cost — you only need a key if you switch on AI-drafted text."**
- **Validating key:** only if the AI switch is on — inline ✓/✗ on the key field; never blocks the deterministic path.
- **Running:** full-width **live progress** from SSE events — real labels ("Building manifest…", "Signing & embedding…", "Verifying the signed file…", "Adding the badge…"). A subtle "shield/seal" motion. A rotating micro-education tip ("What's inside a Content Credential?"). `aria-live="polite"`.
- **Partial:** sidecar fallback (#4) shows a non-blocking banner; continue to success.
- **Success / artifact view (the Provenance Receipt):**
  - Top: a big **"✓ Verified" badge** with the validation status, the asset thumbnail, and **embed mode** (embedded / sidecar).
  - **Validation checks** rendered as `SeverityChip`s (signature / embedded / assertions / round-trip) — color + icon + word.
  - **What's in the manifest:** the assertions list with plain summaries; the disclosure line + its `textSource`.
  - **Downloads:** **Signed asset** (primary), **Badged variant**, **manifest.json**, **PDF receipt**, **Download ZIP**, **Email me a copy** (pre-checked). A **"Verify this yourself"** link → an external C2PA verifier (e.g. contentcredentials.org/verify) preloaded with the asset (`validation.verifyUrl`) — letting the buyer _prove_ it, which is the trust moment.
  - **Upsell card:** `suggestBulk` → Bulk Watermark; `suggestDisclosurePage` → Disclosure Generator; agency CTA.
- **Error:** clear message per §10 + retry; **the uploaded file and form are preserved** (re-stamp without re-uploading where the session holds it).
- **Quota-exhausted:** message + buy-again CTA.

Components: shared store UI kit — `KeyInput` (conditional), `RunProgress`, `ArtifactShell`, `SeverityChip`, `FileViewer` ([`../06-ui-kit.md`](../06-ui-kit.md) §2). New components: `components/store/artifacts/c2pa-stamper.tsx` (the receipt body) + a small `Dropzone` (reusable; `bulk-watermark` reuses it). Run states follow the state chart in `06-ui-kit.md` §4. Copy tone per `PROJECT_VISION.md` — senior, plain, **calm about the law** (no fear-mongering). Density + tokens per `06-ui-kit.md` §1. **`ScoreRing` is not used here** — there's no 0–100 grade; the "✓ Verified" badge is the headline verdict instead (answer-first, doc 03 §2.2).

## 12. SEO

- **Target keyword(s):** "add C2PA content credentials", "sign image with content credentials", "AI image labeling tool EU AI Act", "C2PA generator online" (tool + compliance intent).
- **`generateMetadata`:** title `C2PA Content Credentials Stamper — Sign & Label AI Media` (≤60); description: "Drop in an AI image or video and get it back with a signed, verifiable C2PA Content Credential and a visible AI-disclosure badge. Instant, $19." (≤155). Canonical `/store/c2pa-stamper`. OG via `@vercel/og` (the ✓ Verified receipt visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What is a C2PA Content Credential?", "Does this satisfy the EU AI Act / SB 942?" (**answer: it implements the technical marking those laws reference — confirm your obligations with counsel; we provide tooling, not legal advice**), "Do you store my file or my API key?" (file 30d for re-download then purged; key never stored), "Will the credential survive Instagram?" (**honest:** embedded metadata can be stripped by some platforms; that's why durable watermarking exists — see Bulk Watermark / our roadmap), "Can I verify it myself?" (yes — link to a public C2PA verifier).
- **Internal links:** segment audit (`ai-compliance-audit`) → here as the "sign one asset" fix; blog posts on the AI Act/SB 942 deadline → here; sibling `bulk-watermark` (upsell) and `disclosure-generator` (companion).
- **Programmatic surface (note):** "how to add Content Credentials to a `<format>`" example pages per format could be indexable — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: the dropzone is keyboard-operable (button + file input, not drag-only) and labeled; the AI-switch reveals the key `<fieldset>` (legend) only when on; progress region `aria-live="polite"` + `role="status"`; on success, focus moves to the receipt heading; validation chips never rely on color alone (icon + "Verified"/"Warning"/"Failed" word).
- Mobile: dropzone → "choose file" button first-class; receipt cards stack; downloads full-width; the "verify yourself" link opens the external verifier.
- Error recovery: errors are inline + non-destructive (the uploaded asset + form preserved for the session); the **deterministic fallback** for any AI-text failure is always one click away; "retry" re-signs without re-upload.
- Gate CI on `@axe-core/playwright` for this route.

## 14. Payment integration

- Create Polar product **"C2PA Content Credentials Stamper" $19** (sandbox + live). Checkout metadata `{ slug: "c2pa-stamper" }`. Everything else per platform-spec §9.
- **Refund stance:** one-click refund honored if the run never produced a **validating** signed asset (the round-trip re-read is the bar). Quota auto-restores on system-side signing failures (§10 #5, #6).

## 15. Security & privacy

- **Buyer data:** the uploaded asset (an image/video/audio file) + the short provenance form + (only if AI toggle on) the BYOK key. The asset is processed transiently to sign it; the **signed** artifact is stored 30d (Blob/KV TTL) for re-download, then purged. The **original** is not retained beyond the run.
- **Product-specific risks:**
  - **Malformed/hostile media files** — the #1 risk. Sniff magic bytes (`file-type`), enforce the mime allow-list, cap size, and process untrusted media **without** invoking shell tools on attacker-controlled paths. Run image work via `sharp` (libvips) and any native C2PA/video binary with no buyer-controlled filenames in shell args; prefer in-memory buffers. If a Vercel **Sandbox** is used for the native signer, it isolates execution (segment README / §19 OPEN QUESTION).
  - **EXIF/PII** — uploaded photos may carry GPS/EXIF. Do not surface or persist raw EXIF location; strip or ignore it; disclose "we don't read your file's location data" (§10 #13).
  - **The service signing key is a high-value secret** — `C2PA_SIGN_CERT` / `C2PA_SIGN_KEY` live in Vercel env only, server-side, never in a client bundle, never logged. Compromise = anyone could forge our signature; treat like the webhook secret. Rotate-able. `OPEN QUESTION:` HSM/KMS-backed signer vs env-stored key for production (KMS preferred; CallbackSigner against a KMS, segment README shared-logic #1).
  - **Honest provenance** — we sign **only** what the buyer attests; we never auto-assert "AI-generated" facts we can't verify, and we never sign a _false_ "human-made" claim. The manifest reflects the form, nothing more.
  - **Zip safety** — generated file paths are sanitized (no `../`); only our own outputs are zipped.
- Shared rules (BYOK key handling, rate-limit, webhook verify, redaction) per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `c2pa_signed: { mimeType, embedMode, usedAi: boolean }`, `c2pa_validation: { overall }`, `c2pa_badge_added`, `c2pa_verify_click` (did the buyer click "verify yourself"), `c2pa_zip_download`.
- **Activation:** purchase → first run that produces a **validating** (`verified` / `verified_with_warnings`) signed asset. **Target ≥ 90%** (the engine is deterministic, so activation should be higher than AI-bound products; a failure here is usually format/size, caught pre-run).
- Watch: validation-fail rate (<2% — a hard quality alarm), sidecar-fallback rate (informs format support), refund rate (<2%), AI-toggle adoption, verify-click rate (a trust signal).

## 17. Development phases

> Vertical slices, each shippable/testable.

- **Phase 0 — Scaffold.** Registry entry (`c2pa-stamper`), Polar sandbox product, routes, empty `C2paStamperOutput` schema, blank tool UI behind a sandbox token. _AC: sandbox buy → token → tool UI (dropzone) loads._
- **Phase 1 — Deterministic core (no AI, no UI).** `buildManifestDefinition` + `signC2PA` + post-sign `Reader` round-trip + the input/output schemas; pipeline returns a schema-valid contract from a **fixture image** with the AI step **off**. _AC: unit test: fixture asset → signed asset that **re-reads as valid** through the C2PA Reader → valid `C2paStamperOutput`; sidecar path tested; magic-byte/size guards tested._
- **Phase 2 — Real run + UI + optional AI.** Wire the service signer (sandbox cert), the optional BYOK AI-text path + deterministic fallback, all UI states, badge composite (`sharp`), receipt render + PDF + ZIP(Blob) + Resend email, the "verify yourself" link. _AC: E2E activation path green in sandbox (file → signed → validates → download); the AI-off and AI-on paths both produce valid artifacts; all §10 cases handled._
- **Phase 3 — SEO + polish + showcase gate.** Sales page, metadata, JSON-LD, OG card, a11y pass (axe), analytics, upsell. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria** (sample receipt asset on the sales page; answer-first ✓Verified verdict; validation-chip data-viz; branded PDF; copy buttons on manifest/files; live streamed phases; all 8 states; key-safety + retention + cost visible; senior copy; `impeccable`/`taste`/`ui-ux-pro`/axe pass; mobile receipt first-class). _AC: checklist all green; Lighthouse ≥90._
- **Phase 4 — Launch.** **Production signing certificate** resolved (§8 / §20 OPEN QUESTION) — this is a launch blocker; live Polar product, monitoring/alerts on validation-fail rate, refund flow verified, our own AI visuals stamped with this tool (dog-fooding). _AC: platform-spec §15 Definition of Done all checked + a real signed asset passes an **external** C2PA verifier._

## 18. Testing strategy

| Edge (§10)               | Test                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------- |
| #2 unsupported/malformed | unit: mime/magic-byte allow-list rejects; a truncated PNG is rejected pre-sign     |
| #3 oversize              | unit: over-cap file rejected at validate, quota intact                             |
| #4 sidecar               | unit: a non-embeddable format → `embedMode:"sidecar"`, sidecar file present        |
| #5 signing fails         | integration: forced signer error → retry → `RUN_FAILED`, quota restored            |
| #6 round-trip fails      | unit: a corrupted post-sign buffer → Reader `fail` → no delivery, quota restored   |
| #7 AI text fails         | integration: AI ping/timeout → deterministic template fallback, run still succeeds |
| #8 pre-existing manifest | unit: asset with an existing manifest → add-claim path, chain noted                |
| #11 duplicate            | integration: same `runId` returns cached, no double quota                          |
| #13 EXIF                 | unit: GPS EXIF not surfaced/persisted in the contract or logs                      |

**The one test that matters most:** fixture asset (a small fixture PNG + MP4) → pipeline (**AI off**, deterministic path) → a signed asset that **re-reads as a valid C2PA manifest through the Reader** + a valid `C2paStamperOutput` with correct `files[]` paths. Because the engine is deterministic, this test is high-signal and stable.

**On evals:** the AI surface here is one short sentence, so the eval suite is **light** — a `no_ai_tells` + `factual` (no invented tool names) judge on the disclosure line only (doc 05 §7). The _real_ quality gate is the **deterministic validation test** above (does it actually verify?), plus a **`@live` external-verifier smoke test** (sign → upload to a public C2PA verifier → assert "valid") run pre-launch. Full method, fixtures, mocks, the scenario matrix, sandbox-E2E, and CI gates are in [`../05-testing-strategy.md`](../05-testing-strategy.md). Note: the §3 scenario matrix's _provider×failure_ axis mostly **doesn't apply** to the AI-off default path — substitute a **format × embed-mode × validation** matrix (jpeg/png/webp/avif/mp4/mp3 × embedded/sidecar × pass/warn/fail) as this product's core matrix.

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5 (only for the optional text), job runner/SSE §6, data model §7, report+PDF+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`. Spine modules must already pass `segment-0-spine` DoR.
- **New libs:** the **C2PA SDK** (from `contentauth/c2pa-js`, successor to `c2pa-node-v2` — `OPEN QUESTION:` exact package/version + native-binary support on Vercel's Node runtime; fallback = run signing in a **Vercel Sandbox** or a tiny separate signing service), `sharp` (badge composite — likely already available), `file-type` (magic-byte sniff). Vercel Blob for the signed-asset zip.
- **New env:** `C2PA_SIGN_CERT`, `C2PA_SIGN_KEY` (service signing certificate + key; add to `lib/store/env.ts`, Zod-validated, server-only). `OPEN QUESTION:` KMS-backed signer (CallbackSigner) vs env-stored key.
- **Cross-product reuse:** `server/store/tools/compliance/{sign,manifest,badge}.ts` are the deterministic provenance core — shared with `bulk-watermark`. Design generic now (single-asset is just batch-of-one).

## 20. Open questions & risks

- `OPEN QUESTION:` **(highest priority) the C2PA signing library** — pin the maintained package from `contentauth/c2pa-js` (successor to the archived `c2pa-node`/`c2pa-node-v2`), confirm version, confirm the native binary runs on Vercel's Node Function runtime (or commit to a Vercel Sandbox / external signer). This gates the whole segment.
- `OPEN QUESTION:` **the production signing certificate** — obtain from a C2PA interim-Trust-List CA (DigiCert/SSL.com) for real trust-list standing, vs a self-issued cert for beta (`trustListStatus:'service_cert'`). **Launch blocker.** Also: KMS/HSM-backed signing (CallbackSigner) vs env-stored key.
- `OPEN QUESTION:` exact embeddable-format set for the pinned library version (image set, MP4/audio support, what falls back to sidecar).
- `OPEN QUESTION:` video re-mux/sign within the Vercel function timeout for the size cap — confirm the cap, or move video to the Sandbox/async path.
- `OPEN QUESTION:` Polar product id + price confirm ($19); Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` exact EU Art. 50 penalty tier + the SB 942 operative date wording for sales copy (segment README — use €15M/3% and "Aug 2 2026", counsel to confirm).
- **Risk — legal overreach.** Selling "compliance" tooling against live law is reputationally and legally sensitive. **Mitigation:** the "tooling, not legal advice" disclaimer on every sales page, FAQ, and artifact; honest scope ("implements the technical marking these laws reference"); never claim guaranteed compliance; recommend counsel. Owner: Nishant + founder review.
- **Risk — the credential gets stripped by platforms.** Embedded metadata can be removed on upload to some social platforms. **Mitigation:** honest FAQ + receipt note; durable watermarking as a soft binding is the answer (gated — segment README shared-logic #2; cross-sell `bulk-watermark`). Never imply the embedded credential is unstrippable.
- **Risk — a broken/invalid signed asset shipped to a buyer.** The single worst outcome (we sold provenance and delivered a non-verifying file). **Mitigation:** the **mandatory post-sign round-trip re-read** (§7) — if it doesn't validate, we don't deliver, and we restore quota; alarm on validation-fail rate (§16).
- **Risk — our service certificate isn't trust-listed, so strict validators show "unknown issuer."** **Mitigation:** honest `trustListStatus` field + receipt copy; resolve a trust-listed CA before/at launch; BYO-cert in v2.
