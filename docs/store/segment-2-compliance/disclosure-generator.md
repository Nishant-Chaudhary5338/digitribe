# AI Disclosure Page + Badge Generator — PRD

**Slug:** `disclosure-generator` · **Segment:** 2 · **Status:** draft
**Owner:** Nishant (Build & AI) · **Last updated:** 2026-06-20 · **Spine:** [`../01-platform-spec.md`](../01-platform-spec.md)

> The **fix for the disclosure-page gap** in Segment 2. Mostly templated; a light AI step customizes tone and specifics to the business. The cheapest, fastest product in the segment.
>
> ⚖️ **Tooling, not legal advice.** This generates a _template_ AI-disclosure page and labeling snippets a business can publish. It is **not** legal drafting, not a legal opinion, and not a guarantee of compliance. Have counsel review the published policy. See §15, §20, and the segment README disclaimer.

---

## 1. TL;DR

- **One-liner:** Answer a few questions → get a paste-ready AI-disclosure policy page, a footer "AI Content" badge component, and content-label snippets.
- **Problem:** The transparency laws expect a **public AI-use disclosure** and consistent content labels, but most businesses have no policy page and no standard label — and don't want to write legal-ish copy from scratch.
- **Buyer:** founders, marketers, and small-team site owners who need the disclosure surface up before the deadline and want it done in two minutes.
- **Input → Output:** a short business-info form → a **Disclosure Kit**: a ready-to-paste **policy page** (HTML + Markdown + MDX), a **footer badge** component (React/HTML), and **content-label snippets** (visible caption + machine-readable JSON-LD/`meta`) — as an on-screen preview + a downloadable bundle (zip).
- **Price:** **$19** (Polar product `OPEN QUESTION: create`) · **Model:** BYOK-finite · **Providers:** `anthropic` (default `claude-haiku-4-5`), `openai`, `google` — AI is **light** (customizes a template; a deterministic default always works without a key).
- **Est. run time:** ~8–15s · **Re-run quota:** 3.

## 2. Problem & market

**Today** a business that needs an AI-disclosure page either (a) copies a competitor's, (b) asks ChatGPT and pastes raw prose with no structure or labels, or (c) pays a lawyer to draft one. None gives a _designed, consistent_ kit — the page **plus** the footer badge **plus** the per-content labels that the machine-readable requirement actually needs. **Gap:** an instant generator that outputs a coherent, on-brand, paste-ready disclosure surface (page + badge + label snippets) tuned to the business. That's us.

**Competition:** generic "privacy policy generator" sites (don't cover AI disclosure), law firms (expensive, slow, no badge/snippets), raw ChatGPT (unstructured, no machine-readable label, easy to get wrong). **Differentiation:** a _complete_ disclosure surface (page + visible badge + machine-readable label), DTC/SaaS-aware copy (Digitribe's dual DNA, doc 03 §2.4), and a deterministic-template floor so it's correct even with the AI off.

**Urgency stat:** the same **2 Aug 2026** EU Art. 50 + SB 942 deadline; SB 942 specifically expects user- and licensee-facing AI-use disclosures. (See segment README citations.)

**Why Digitribe:** we ship branded, on-message client copy and components for a living — a _designed_ disclosure kit is squarely our craft, productized. It also pairs naturally with the audit (which flags "no disclosure page") and the stamper (which labels the assets the page describes).

## 3. Pricing & packaging

- **$19**, one-time. Impulse-range; far below a lawyer's drafting fee, priced as a "just get it up" purchase.
- **Includes:** 1 run (3 re-runs to tweak the business info / regenerate), the full **Disclosure Kit** zip (page in HTML/MD/MDX, the badge component, the label snippets, a `README`), the on-screen preview, an emailed copy (Resend).
- **Upsell path:** "now label your actual assets" → **C2PA Stamper** ($19) / **Bulk Watermark** ($49); "not sure what else you need?" → **AI-Content Compliance Audit** ($29); agency CTA "want us to wire this into your site + components?" → Digitribe services.
- **Future tiers (note only):** multi-language disclosure pages, auto-PR to a repo, are v2 ideas; v1 is one SKU.

## 4. User stories / JTBD

- As a **founder**, when the audit says "no AI-disclosure page," I want one generated and ready to paste, so that I can close the gap today.
- As a **marketer**, when I publish AI content, I want a consistent footer badge + content label, so that disclosure is uniform across the site.
- As a **developer**, when asked to "add the AI policy page," I want HTML/MDX + a component I can drop in, so that I just commit it.
- As a **small-team owner**, when I can't afford a lawyer for a disclosure page, I want a solid template I can have counsel review, so that I'm not starting from a blank page.

**Primary job the artifact must nail:** a **coherent, on-brand, paste-ready** disclosure surface — page + badge + machine-readable label that actually fit _this_ business (its name, what it makes, DTC vs SaaS tone), not generic boilerplate a reader could swap for any other company (doc 03 §2.1). And the output must be **committable as-is** (valid HTML/MDX/JSON-LD).

**Non-goals (v1):** does NOT deploy anything; does NOT give legal advice or a reviewed legal document; does NOT sign or watermark assets (that's the stamper / bulk pipeline); does NOT generate a full privacy policy or ToS (AI-disclosure only).

## 5. Functional requirements

### Inputs

| Field            | Type                         | Validation                                                                                 | Example                 |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------ | ----------------------- |
| `businessName`   | string (≤80)                 | required                                                                                   | `"Acme Skincare"`       |
| `businessType`   | enum                         | `'dtc' \| 'saas' \| 'agency' \| 'media' \| 'other'` — tunes tone/examples                  | `dtc`                   |
| `siteUrl`        | string (URL, optional)       | http/https if provided — used for canonical/links only, not crawled                        | `https://acme.com`      |
| `aiUses`         | enum[] (multi)               | which AI uses to disclose: `['images','text','video','audio','chatbot','recommendations']` | `['images','text']`     |
| `tools`          | string (optional, ≤200)      | named AI tools to mention ("Midjourney, GPT")                                              | `"Midjourney, ChatGPT"` |
| `humanOversight` | enum                         | `'reviewed' \| 'mixed' \| 'automated'` — honesty about review process                      | `reviewed`              |
| `jurisdictions`  | enum[] (multi)               | `['eu','california','general']`, default `general` — adjusts framing                       | `['eu','california']`   |
| `tone`           | enum (optional)              | `'plain' \| 'formal' \| 'friendly'`, default `plain`                                       | `plain`                 |
| `useAiForCopy`   | boolean (default `true`)     | customize the template with AI; off → deterministic template only                          | `true`                  |
| `provider`       | enum (if `useAiForCopy`)     | one of product's `byokProviders`                                                           | `anthropic`             |
| `byokKey`        | string (secret, conditional) | **only if `useAiForCopy`**; validated live pre-run (platform-spec §5)                      | `sk-…`                  |

### Processing (requirements level; pipeline in §7)

Assemble a **deterministic template** from the form (page sections, badge, label snippets) → **(optional)** AI step rewrites the prose to the business's specifics + tone within the same structure → validate the generated HTML/MDX/JSON-LD parses → render preview + zip → email. The structure is fixed by the template; AI only fills/refines the prose.

### Outputs

A **Disclosure Kit**: the policy page (HTML/MD/MDX), the footer badge component (React + plain HTML), the content-label snippets (visible caption + machine-readable JSON-LD + `meta`), and a README. Exact shape in §6.

### Constraints

- Output is text/code only (small zip).
- Generated HTML/MDX/JSON-LD must parse/validate (gate in pipeline — §7).
- Artifact stored 30d, then purged.

## 6. ⭐ Output Contract

> **Inversion vs Segment 1 again:** the _structure_ (which files, which page sections, the badge, the label) is deterministic from the template; the AI step refines **prose fields only** (the page section bodies + the disclosure caption), within the locked shape. With the AI off, a deterministic template fills the same fields.

```ts
// server/store/schemas/disclosure-generator.ts
import { z } from 'zod'

const GeneratedFile = z.object({
  path: z.string(), // "ai-disclosure.html", "ai-disclosure.mdx", "AiDisclosureBadge.tsx", "labels/snippets.html", "README.md"
  language: z.enum(['html', 'markdown', 'mdx', 'tsx', 'json']),
  kind: z.enum(['policy-page', 'badge-component', 'label-snippet', 'readme']),
  contents: z.string(), // committable as-is
  rationale: z.string().max(240), // why this file / where it goes
})

const PageSection = z.object({
  heading: z.string().max(80),
  body: z.string().max(1200), // AI-refined (or template) prose
  source: z.enum(['template', 'ai-customized']),
})

export const DisclosureGeneratorOutput = z.object({
  business: z.object({
    name: z.string(),
    type: z.enum(['dtc', 'saas', 'agency', 'media', 'other']),
    aiUses: z
      .array(z.enum(['images', 'text', 'video', 'audio', 'chatbot', 'recommendations']))
      .min(1),
    jurisdictions: z.array(z.enum(['eu', 'california', 'general'])).min(1),
  }),
  page: z.object({
    title: z.string().max(80), // "AI Use & Content Disclosure"
    sections: z.array(PageSection).min(4).max(8), // what AI we use, how, labeling, human oversight, contact, etc.
    copySource: z.enum(['ai-customized', 'template']), // honest provenance of the prose
  }),
  badge: z.object({
    label: z.string().max(40), // "AI-Assisted Content" / "Contains AI-generated media"
    componentSummary: z.string().max(200), // what the component renders + how to use it
  }),
  contentLabel: z.object({
    visibleCaption: z.string().max(160), // the per-asset visible label ("Image generated with AI")
    machineReadable: z.object({
      jsonLd: z.string(), // a schema.org/CreativeWork + a disclosure-statement JSON-LD block (valid JSON)
      metaTags: z.string(), // <meta> AI-disclosure tags
    }),
  }),
  files: z.array(GeneratedFile).min(4), // page (html+mdx), badge, label snippets, readme
  installSteps: z.array(z.string()).min(2).max(5), // "Add ai-disclosure.html at /ai-disclosure", "Import the badge into your footer", …
  disclaimer: z.literal(
    'Template disclosure copy, not legal advice. Have counsel review before publishing.'
  ),
  upsell: z.object({
    suggestStamper: z.boolean(), // → c2pa-stamper / bulk-watermark to label the actual assets
    reason: z.string().max(160),
  }),
})
export type DisclosureGeneratorOutput = z.infer<typeof DisclosureGeneratorOutput>
```

- **Export formats:** on-screen preview (rendered page + code tabs) · **JSON** (raw contract) · **ZIP** (the `files[]` at real paths + README). _(No PDF here — the deliverable is code/files, not a report; a PDF "preview" is optional, OPEN QUESTION §20.)_
- **Field notes:** `copySource`/`PageSection.source` make it auditable whether prose is AI-customized or template. `contentLabel.machineReadable.jsonLd` must be **valid JSON** and `metaTags` valid HTML (gated in §7) — this is the machine-readable half the law wants. `disclaimer` is a `z.literal` so the not-legal-advice line is **structurally guaranteed**.
- **Determinism:** the **file set, the section list, the badge, and the label structure are deterministic** from the template; the model refines only `sections[].body`, `badge.label` wording, and `contentLabel.visibleCaption`. With `useAiForCopy:false`, the deterministic template fills these and `copySource:'template'`. The schema guarantees structure regardless of the AI.

## 7. System logic / pipeline

```
POST /api/store/run/disclosure-generator  { token, byokKey?, input }
  │
  ├─ [verify]   token + quota (platform-spec §4)              emit{phase:"auth",pct:5}
  ├─ [validate] input vs inputSchema (zod)                    emit{phase:"validate",pct:14}
  ├─ [key]      IF useAiForCopy: BYOK live ping (platform-spec §5)  emit{phase:"key",pct:18}
  │     - if the AI toggle is OFF, no key is required; step skipped
  │
  ├─ TEMPLATE  buildDisclosureTemplate(input)                 emit{phase:"generate",pct:25}
  │     - assemble the page sections, badge, and label snippets
  │       deterministically from {businessType, aiUses, jurisdictions, tone, …}
  │     - DTC vs SaaS vs agency variants change examples/tone (doc 03 §2.4)
  │     → a complete, valid DisclosureGeneratorOutput skeleton (template prose)
  │
  ├─ CUSTOMIZE (optional)                                     emit{phase:"generate",pct:35..75}
  │     IF useAiForCopy:
  │       ai.structured({ provider, apiKey, model: claude-haiku-4-5, effort:"medium",
  │         system: DISCLOSURE_SYSTEM,            // §9
  │         prompt: buildPrompt(template, input),
  │         schema: DisclosureProsePatch,         // refines section bodies + captions ONLY
  │       })  → merge the refined prose back into the skeleton (copySource:"ai-customized")
  │     ELSE keep template prose (copySource:"template")
  │
  ├─ VALIDATE OUTPUT (deterministic gate)                     emit{phase:"render",pct:82}
  │     - parse the generated HTML (no script), the MDX, and JSON.parse the JSON-LD
  │     - if JSON-LD/meta invalid → repair from template (never ship broken machine-readable)
  │
  ├─ RENDER  report.build(output)                             emit{phase:"render",pct:92}
  │     - on-screen preview (rendered page + FileViewer code tabs), zip(files[]) → Blob
  │
  └─ PERSIST + EMAIL + decrement quota → { runId, artifactUrl }  emit{phase:"done",pct:100}
```

- **The engine is the template.** AI is called **zero or one** time, `effort:"medium"`, refining prose **within** the fixed structure — it never invents the file set, the badge, or the machine-readable label. With the toggle off, the template alone produces a complete, valid kit (no key). The **output-validation gate** guarantees the machine-readable snippets actually parse.
- **Libraries:** an HTML/MDX validator + `JSON.parse` for the JSON-LD gate (lightweight; reuse the repo's existing tooling where possible). No crawl, no heavy deps — this is the lightest product.
- **Reuse:** the badge/label snippet shapes are consistent with what `c2pa-stamper` embeds (the visible badge wording + the disclosure caption), so the segment speaks one labeling vocabulary. The deterministic-template-then-AI-refine pattern is shared with `bulk-watermark`'s optional shared-disclosure step.

## 8. BYOK handling

- **AI is light and optional.** Providers (only when `useAiForCopy`): `anthropic` (default **`claude-haiku-4-5`** — refining template prose needs nothing heavier; cheap/fast), `openai`, `google`. Per platform-spec §5. Default-on for nicer copy, but the deterministic template means a missing/failed key never blocks the artifact.
- **Buyer cost expectation** (show in UI): one structured generation refining a few short prose blocks (~1–2K tokens) → **a fraction of a cent on the buyer's key.**
- **Pre-run validation:** only when `useAiForCopy` is on — a 1-token ping; on failure, offer "generate from template (no AI)" as a one-click fallback without spending quota.

## 9. AI / prompt design

> AI **refines template prose to the business**; it does not author structure. Keep it proportionate (`effort:"medium"`, cheap model).

**Model:** default `claude-haiku-4-5`, `effort:"medium"`. Structured output enforced by AI SDK `generateObject` against a **prose-patch** schema (section bodies + caption + badge label only), so the model can't restructure the kit or add files.

```ts
// the AI call refines ONLY prose, never structure
const DisclosureProsePatch = z.object({
  sections: z
    .array(z.object({ heading: z.string(), body: z.string().max(1200) }))
    .min(4)
    .max(8),
  badgeLabel: z.string().max(40),
  visibleCaption: z.string().max(160),
})
```

**System prompt (draft):**

```
You refine the prose of a pre-structured AI-disclosure page for a specific business.
You are given the template (sections, badge, label) and the business facts. Rules:
- Keep the section headings and the overall structure. Rewrite ONLY the body prose to
  fit THIS business: its name, what it makes, which AI uses it disclosed, its tone
  (plain/formal/friendly), and DTC vs SaaS vs agency context.
- Use ONLY the provided facts. Do not invent AI uses, tools, claims, or commitments
  the business didn't state. Do not state legal conclusions or cite specific laws as
  binding the business — describe disclosure, not legality.
- Plain, clear, human. No filler ("in today's landscape"), no hedging, no restated
  prompt, no emoji, no marketing fluff. This is a policy page, not an ad.
- Be honest about human oversight per the provided 'humanOversight' value.
```

**User prompt template:** `buildPrompt(template, input)` → the template sections + the business form values + tone/jurisdiction context.

**Guardrails:** prose-patch schema prevents structural drift / invented files; "facts ONLY / no legal conclusions" rule curbs hallucinated commitments and legal overreach; the **deterministic template fallback** means an AI failure never blocks delivery (mark `copySource:'template'`, continue, no quota wasted); the **output-validation gate** (§7) guarantees the machine-readable snippets parse even if the model fumbles them; anti-AI-tell rules (doc 03 §2.5).

## 10. Edge cases & failure modes

| #   | Trigger                                 | Detection                     | Behavior / message                                                                          | Quota           |
| --- | --------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- | --------------- |
| 1   | Invalid/expired BYOK key (AI toggle on) | pre-run ping fails            | "Your `<provider>` key looks invalid. Generate from template (no AI)?" + one-click fallback | not spent       |
| 2   | Required form field missing             | input validation              | inline field error; can't run until businessName + ≥1 aiUse set                             | not spent       |
| 3   | AI step times out / refuses             | AI wrapper error              | **fall back to deterministic template**, mark `copySource:'template'`, continue             | spent (success) |
| 4   | Model returns invalid JSON-LD / HTML    | output-validation gate        | repair the machine-readable snippet from the template; never ship broken code               | spent (success) |
| 5   | Model invents an AI use / a legal claim | output scan vs input          | strip to declared uses; "no legal conclusions" enforced; reconcile against the form         | spent           |
| 6   | Business declares no AI use at all      | `aiUses` empty                | reject at form: "Pick at least one AI use to disclose."                                     | not spent       |
| 7   | Duplicate submit                        | same `runId` (idempotency §6) | return cached; never double-charge                                                          | n/a             |
| 8   | Quota exhausted                         | token check                   | "You've used all 3 runs — buy again or contact us." + buy CTA                               | n/a             |

## 11. UX / UI flow

**Sales page** (`/store/disclosure-generator`) → **Buy** → Polar → **success** mints token → **tool UI** (`/store/use/[token]`).

**Tool UI states:**

- **Empty / collecting input:** a compact **form** (businessName, businessType segmented control, the `aiUses` checkboxes, optional tools/siteUrl, humanOversight, jurisdictions, tone), an **"customize copy with AI"** switch (on by default; reveals `KeyInput` + provider only when on, with "we never store your key" + the "works without a key — template floor" note), **Generate** button (disabled until businessName + ≥1 aiUse).
- **Validating key:** inline ✓/✗ (only if AI on); never blocks the template path.
- **Running:** **live progress** from SSE — "Assembling your disclosure kit…", "Tailoring the copy to Acme…", "Validating the machine-readable label…". Fast (≤15s); still narrated, never a bare spinner. `aria-live="polite"`.
- **Success / artifact view (the Disclosure Kit):**
  - Top: a **rendered preview of the policy page** (the headline outcome — they see the actual page), with the badge rendered inline.
  - **Code tabs** (`FileViewer`): `ai-disclosure.html` / `.mdx`, `AiDisclosureBadge.tsx`, the label snippets (caption + JSON-LD + meta) — each with a **per-file copy button**, filename header, and "why this file" rationale (doc 03 §2.3).
  - **Install steps** (numbered), the **machine-readable label** highlighted (this is the part the law cares about).
  - **Downloads:** **Download ZIP** (primary), JSON, **Email me a copy** (pre-checked).
  - **A persistent disclaimer line** ("template copy, not legal advice — have counsel review").
  - **Upsell card:** `suggestStamper` → C2PA Stamper / Bulk Watermark ("now label your actual assets"); agency CTA.
- **Error:** clear message per §10 + retry; form preserved.
- **Quota-exhausted:** message + buy-again CTA.

Components: shared store UI kit — `KeyInput` (conditional), `RunProgress`, `ArtifactShell`, `FileViewer` ([`../06-ui-kit.md`](../06-ui-kit.md) §2). New: `components/store/artifacts/disclosure-generator.tsx` (the rendered-page preview + code tabs + install steps). Run states per `06-ui-kit.md` §4. Copy tone per `PROJECT_VISION.md` — senior, plain. **No `ScoreRing`** (no score); the rendered page preview is the answer-first headline. Density + tokens per `06-ui-kit.md` §1.

## 12. SEO

- **Target keyword(s):** "AI disclosure page generator", "AI content disclosure policy template", "AI use policy page", "AI labeling badge" (template/tool intent).
- **`generateMetadata`:** title `AI Disclosure Page + Badge Generator — Paste-Ready` (≤60); description: "Generate a ready-to-paste AI-disclosure policy page, a footer badge, and machine-readable content-label snippets tuned to your business. Instant, $19." (≤155). Canonical `/store/disclosure-generator`. OG via `@vercel/og` (the rendered page + badge visual).
- **JSON-LD** (`schema-dts`): `Product` + `Offer` ($19) + `FAQPage` + `BreadcrumbList`.
  - FAQs (real, on page): "What goes in an AI-disclosure page?", "Is this legal advice?" (**no — a template to have counsel review**), "What's the machine-readable label for?" (some laws expect a machine-readable AI marking, not just a visible note), "Can I edit the files?" (yes — they're yours), "Do you store my info or API key?" (artifact 30d; key never stored).
- **Internal links:** `ai-compliance-audit` ("no disclosure page" finding) → here; blog posts on AI disclosure → here; out to `c2pa-stamper`/`bulk-watermark` (label the assets the page describes).
- **Programmatic surface (note):** "AI disclosure page for `<DTC/SaaS/agency>`" template variants could be indexable example pages — defer to v2.

## 13. Usability & accessibility

- WCAG 2.1 AA: every form field labeled; the segmented controls / checkbox groups are real labeled groups; the AI switch reveals the key `<fieldset>` (legend) only when on; progress region `aria-live="polite"` + `role="status"`; on success, focus to the preview heading; FileViewer tabs are a real tablist; copy buttons announce "copied."
- Mobile: form single-column; preview + code tabs become an accordion; downloads full-width.
- Error recovery: inline, non-destructive (form preserved); the template fallback is always one click; retry without re-entering the key (session-only).
- Gate CI on `@axe-core/playwright`.

## 14. Payment integration

- Create Polar product **"AI Disclosure Page + Badge Generator" $19** (sandbox + live). Checkout metadata `{ slug: "disclosure-generator" }`. Everything else per platform-spec §9.
- **Refund stance:** refund honored if the run never produced a valid kit (rare — the template floor makes this near-impossible). Quota auto-restores on system-side failures.

## 15. Security & privacy

- **Buyer data:** the business-info form + (only if AI on) the BYOK key. No crawl, no file upload, no untrusted media — the **lowest-risk product** in the segment. Artifact (the kit) stored 30d, then purged. The form values are used transiently to fill the template.
- **Product-specific risks:**
  - **Generated-code safety** — we emit HTML/MDX/TSX for the buyer to commit. Ensure the badge component and page contain no script/injection vectors; the rendered **preview** must sanitize (no `dangerouslySetInnerHTML` of model output; render via a safe MDX/HTML pipeline). The JSON-LD/meta gate (§7) prevents shipping malformed machine-readable code.
  - **Legal overreach** — a template that reads as a binding legal document. **Mitigation:** the `z.literal` disclaimer in every artifact + on-screen + the FAQ "have counsel review"; "describe disclosure, not legality" prompt rule.
- Shared rules per platform-spec §10 — only the deltas above are product-specific.

## 16. Analytics & success metrics

- Standard events (platform-spec §13 / doc 04 §9) + product events: `disclosure_generated: { businessType, usedAi: boolean }`, `disclosure_zip_download`, `disclosure_copy: { file }`, `disclosure_upsell_click`.
- **Activation:** purchase → first run that produces a valid kit. **Target ≥ 92%** (template floor → very high; failure is essentially only a missing form field caught pre-run).
- Watch: refund rate (<2%), AI-toggle adoption, copy/download rate (engagement with the files), upsell CTR.

## 17. Development phases

- **Phase 0 — Scaffold.** Registry entry (`disclosure-generator`), Polar sandbox product, routes, empty `DisclosureGeneratorOutput` schema, blank tool UI. _AC: sandbox buy → token → tool UI loads._
- **Phase 1 — Template + contract (no AI).** `buildDisclosureTemplate` (DTC/SaaS/agency variants) + the output-validation gate (HTML/MDX/JSON-LD parse) + input/output schemas; pipeline returns a complete schema-valid kit from a **fixture form** with the AI step **off**. _AC: unit test: fixture form → valid `DisclosureGeneratorOutput`; generated JSON-LD `JSON.parse`s; HTML/MDX validate._
- **Phase 2 — Real run + UI + optional AI.** Wire the optional BYOK prose-refine path + template fallback, all UI states, the rendered-page preview + FileViewer + ZIP(Blob) + Resend email. _AC: E2E activation green in sandbox; AI-on and AI-off both produce valid kits; output gate repairs invalid model JSON-LD; all §10 cases handled._
- **Phase 3 — SEO + polish + showcase gate.** Sales page, metadata, JSON-LD, OG, a11y (axe), analytics. **Embed the doc 03 §6 Showcase Checklist as acceptance criteria** (sample kit on the sales page; the rendered page IS the answer-first artifact; code files have copy buttons + filenames + rationale; DTC vs SaaS customization visibly shows (doc 03 §2.4); branded preview; live streamed phases; all 8 states; key-safety + retention + cost visible; disclaimer present; senior copy; `impeccable`/`taste`/`ui-ux-pro`/axe pass; mobile first-class). _AC: checklist all green; Lighthouse ≥90._
- **Phase 4 — Launch.** Live Polar product, monitoring, refund flow verified, founder copy review of the template + disclaimer, `digitribe.world`'s own AI-disclosure page generated by this tool (dog-fooding). _AC: platform-spec §15 Definition of Done all checked._

## 18. Testing strategy

| Edge (§10)             | Test                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| #1 key invalid (AI on) | unit: pre-run ping rejects → template fallback offered, quota intact        |
| #2 missing field       | unit: no businessName / no aiUse → rejected at validate                     |
| #3 AI fails            | integration: AI timeout → deterministic template, run succeeds              |
| #4 invalid JSON-LD     | unit: model emits broken JSON-LD → gate repairs from template, output valid |
| #5 invented use/claim  | unit/eval: model adds an undeclared AI use → reconciled to the form         |
| #6 no AI use           | unit: empty `aiUses` rejected                                               |
| #7 duplicate           | integration: same `runId` returns cached, no double quota                   |

**The one test that matters most:** fixture form → pipeline (**AI off**, template path) → a valid `DisclosureGeneratorOutput` whose `contentLabel.machineReadable.jsonLd` **`JSON.parse`s** and whose page HTML/MDX validate. Because the template floor is deterministic, this is high-signal.

**Evals (doc 05 §7 — light):** golden set of ~6 business profiles (DTC/SaaS/agency/media) with expected sections + customization; judges `input_specific` (does a DTC kit read DTC? does it name the right AI uses?), `no_ai_tells`, `factual` (no invented uses/tools/laws), `format_valid` (HTML/MDX/JSON-LD parse), plus a **`legal_safety` judge** (no legal conclusions, disclaimer present). Threshold ≥0.85, zero `legal_safety`/`format_valid` failures. Full method/fixtures/mocks/E2E/CI in [`../05-testing-strategy.md`](../05-testing-strategy.md).

## 19. Dependencies & platform integration

- **From the spine:** access/quota §4, BYOK/AI wrapper §5 (only for the optional refine), job runner/SSE §6, data model §7, report+zip §8, Polar §9, security §10, design §11, SEO §12, analytics §13. Exact types/contracts to import (don't redefine): [`../04-implementation-contracts.md`](../04-implementation-contracts.md) — `ProductPipeline`, `AiRunner`, `RunEvent`, `StoreErr`.
- **New libs (minimal):** an MDX/HTML validator + a safe render path for the preview (reuse the repo's existing MDX tooling — the marketing site already renders MDX). No crawl, no media, no C2PA library here — the lightest product.
- **Cross-product reuse:** the badge/label vocabulary is consistent with `c2pa-stamper` (one labeling language across the segment); the template-then-AI-refine pattern is shared with `bulk-watermark`'s shared-disclosure step.

## 20. Open questions & risks

- `OPEN QUESTION:` Polar product id + price confirm ($19); Postgres host (Supabase vs Neon) — platform-spec §1.
- `OPEN QUESTION:` should the kit include a **PDF** of the page preview, or files-only? (Lean files-only; PDF adds little for committable code — confirm in Phase 2.)
- `OPEN QUESTION:` how many `businessType` / jurisdiction template variants to maintain (DTC/SaaS/agency/media × EU/CA/general) — start with the 4 types × general, layer EU/CA framing on top, expand from demand.
- `OPEN QUESTION:` MDX render/validate path on Vercel for the live preview — confirm the marketing site's MDX pipeline is reusable server-side.
- **Risk — legal overreach (a template read as legal advice).** **Mitigation:** the `z.literal` disclaimer everywhere, "describe disclosure, not legality" prompt rule, the `legal_safety` eval judge, FAQ + on-screen "have counsel review", founder copy review. Owner: Nishant + founder review.
- **Risk — generic, swappable output (the template feels boilerplate).** **Mitigation:** real DTC/SaaS/agency variants + the AI customization to the business's name/uses/tone (doc 03 §2.4); the `input_specific` eval judge gates it; the template floor must itself be genuinely good, not lorem.
- **Risk — broken machine-readable label shipped.** **Mitigation:** the deterministic output-validation gate (§7) that parses/repairs JSON-LD + HTML before delivery; the `format_valid` eval judge.
