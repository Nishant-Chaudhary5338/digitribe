# Segment 2 — AI Compliance & Provenance

> Make a business **provably compliant** with the new AI-content transparency laws — sign, label, disclose, and watermark AI media so an agent, a regulator, or a customer can verify it. Read [`../00-overview.md`](../00-overview.md) and [`../01-platform-spec.md`](../01-platform-spec.md) first.

---

## Thesis

A hard regulatory deadline just turned "AI content provenance" from a nice-to-have into a legal obligation, and almost nobody is ready. Two laws now require businesses that publish AI-generated or AI-altered media to **mark it, disclose it, and make the marking machine-readable** — using exactly the standards (C2PA Content Credentials + watermarking) that are hard to implement by hand. The tooling that exists is either enterprise platforms with sales calls (Adobe, Digimarc, Truepic) or raw open-source SDKs that need a Rust toolchain and an X.509 certificate to even start. There is **no instant, affordable, self-serve way** for a small business or content team to make one asset compliant and walk away with the file. That gap is this segment.

Unlike Segment 1, the engine here is **mostly deterministic**. The value is cryptographic signing (C2PA), metadata embedding, and watermarking — not an LLM. The AI step is small or optional (auto-writing a disclosure paragraph, scoring a site's compliance, customizing policy copy). We say this loudly in every PRD so an engineering agent doesn't reach for `runStructured` where a signing call belongs. **BYOK still applies wherever there is an AI step** (platform-spec §5); the signing/watermarking steps cost us nothing per run and need no buyer key.

> ⚖️ **Legal-adjacent disclaimer (applies to every product in this segment, restate on every sales page and in every artifact).** We provide **tooling, not legal advice.** These products help a business _implement_ the technical measures the law references (signed provenance, visible + invisible marking, disclosure pages). They do **not** constitute a legal opinion, do not guarantee compliance, and do not create an attorney–client relationship. Buyers should confirm their specific obligations with qualified counsel. See each PRD §15 and §20.

**Why us:** Digitribe builds AI systems and ships them for clients — we already think about provenance, and we can credibly wire a _correct_ C2PA manifest and a _correct_ disclosure page rather than a generic template. Compliance anxiety is also the highest-intent, deadline-driven traffic on the open web right now.

### Market signals & the deadline (cite in sales copy — verify against `../research-sources.md`)

- **EU AI Act, Article 50 (transparency).** Providers and deployers of generative AI must ensure AI-generated/manipulated content (incl. deepfakes) is marked in a **machine-readable format** and disclosed. Obligations apply from **2 August 2026** (per Article 113's staged application). Non-compliance with transparency obligations sits in the penalty tier of **up to €15M or 3% of global annual turnover**, whichever is higher (Article 99). The accompanying **GPAI/transparency Code of Practice** points implementers at C2PA-style signed metadata **plus** durable watermarking. _(Sources: artificialintelligenceact.eu Art. 50/99; EU transparency Code of Practice.)_
  - `OPEN QUESTION:` The brief cites the August 2026 enforcement window and a **€7.5M / 1.5%** penalty figure. Current statute puts Art. 50 transparency violations in the **€15M / 3%** tier; the **€7.5M / 1%** tier applies to supplying incorrect/misleading information to authorities. **Use the €15M / 3% figure as the headline number** for Art. 50 in sales copy, and have counsel confirm the exact tier per claim before launch. Do **not** publish a specific penalty number we can't cite.
- **California SB 942 (AI Transparency Act).** Requires covered GenAI providers to apply **manifest (visible) and latent (embedded/invisible) disclosures** to AI-generated image/video/audio, expose a free public detection tool, and inform licensees. Signed **2024**; **AB 853 (Oct 2025) moved the operative date to 2 Aug 2026** (originally Jan 1, 2026). Applies to providers with **>1,000,000 monthly users** accessible in California. _(Sources: leginfo.ca.gov SB 942; AB 853.)_
  - `OPEN QUESTION:` The brief states SB 942 is "live Jan 1 2026." Per AB 853 the operative date is now **2 Aug 2026**. Sales copy must say "**takes effect Aug 2 2026**" and reference both laws' shared deadline — do not claim a Jan 1 date.
- **The standard has converged.** Regulators and platforms point at the same two-layer stack: **C2PA Content Credentials** (a signed, tamper-evident metadata manifest — the "AI nutrition label") **+ imperceptible watermarking** as a C2PA _soft binding_ so the credential survives a screenshot or a metadata strip. C2PA is steered by the **Content Authenticity Initiative** (Adobe, Microsoft, Google, OpenAI, BBC, …); spec is at **v2.x**; an interim **Trust List** of conformant CAs (DigiCert, SSL.com) exists. _(Sources: c2pa.org spec 2.x; contentauthenticity.org.)_
- **Adoption is live but shallow.** Major generators (OpenAI/DALL·E, Adobe Firefly, Google) now _emit_ Content Credentials, and TikTok/LinkedIn _read_ them — but **the long tail of businesses publishing AI media has no way to sign their own output.** That long tail is the buyer.

> Sources tracked in `../research-sources.md` (citation list shared across sales pages). Every regulatory claim on a sales page must link a primary source and carry the "tooling, not legal advice" line.

## Products

| Slug                   | Name                                    | Price | Input → Artifact                                                                                                   | Engine                                                            | Status |
| ---------------------- | --------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------ |
| `c2pa-stamper`         | **C2PA Content Credentials Stamper** ⭐ | $19   | one image/video + provenance metadata → same asset with a signed C2PA manifest + visible badge + downloadable file | **C2PA signing** (deterministic); AI optional for disclosure text | PRD ✅ |
| `ai-compliance-audit`  | AI-Content Compliance Audit             | $29   | site URL **or** pasted content → scored "are you SB 942 / EU Art. 50 ready?" report with prioritized fixes         | AI-assisted analysis (reuses Seg-1 crawl)                         | PRD ✅ |
| `disclosure-generator` | AI Disclosure Page + Badge Generator    | $19   | business info (form) → paste-ready AI-disclosure policy page + footer badge component + content-label snippets     | Templated + light AI customization                                | PRD ✅ |
| `bulk-watermark`       | Bulk Watermark + Label Pipeline         | $49   | folder/zip of AI assets → all assets watermarked + C2PA-manifested + a manifest report, delivered as a zip         | **Watermark + C2PA signing** (deterministic, batch)               | PRD ✅ |

**Funnel:** `ai-compliance-audit` ($29 — "are you ready?") is the diagnostic that surfaces the gaps → `disclosure-generator` ($19 — fix the _page_) and `c2pa-stamper` ($19 — fix _one asset_) are the cheap point fixes → `bulk-watermark` ($49 — fix _everything at once_) is the bulk upgrade. The free marketing `/audit` and any blog post on "EU AI Act / SB 942 deadline" feed the top. The audit's report explicitly recommends the matching paid fix.

## Shared logic across this segment (build once, reuse)

These products share a **deterministic provenance core** — the part that is _not_ an LLM. Implement it once in `server/store/tools/compliance/` and have each product compose it. This is the segment's analogue of Segment 1's crawl→score spine.

1. **C2PA signer** (`signC2PA(asset, manifest, signer) → SignedAsset`) — wraps the C2PA SDK Builder/Signer. Takes an asset buffer + a manifest definition (assertions: `c2pa.actions`, `c2pa.training-mining`, generator info, optional AI-disclosure) and a signer, returns the asset with the manifest embedded (or sidecar for formats that can't embed). **Shared by `c2pa-stamper` and `bulk-watermark`.**
   - `OPEN QUESTION:` **the C2PA library choice is the single most important technical decision in this segment.** Candidates: (a) **`c2pa-node`** (`contentauth/c2pa-node`, on npm) — Node bindings, but the original repo is **deprecated/archived**; (b) **`c2pa-node-v2`** (binds the C2PA **v2.x / "v24" Rust API**, also archived, work continuing in the **`contentauth/c2pa-js` monorepo**); (c) the **Rust `c2pa` crate via WASM** for a portable build. **Default recommendation: pin the maintained package out of `contentauth/c2pa-js` (the successor to c2pa-node-v2), running in a Node Vercel Function** (native prebuilt binaries exist for linux-x64/arm64). Confirm the exact published package name + version, that Vercel's Node runtime supports its native binary (or fall back to a Vercel **Sandbox**/separate signing service), and re-check before build. Record in `DECISIONS.md`.
2. **Watermark embedder** (`embedWatermark(asset, payload) → WatermarkedAsset`) — applies an **imperceptible, durable** watermark that doubles as a C2PA _soft binding_ so the credential is recoverable after a screenshot/recompression. **Shared by `bulk-watermark`** (and an optional add-on toggle in `c2pa-stamper`).
   - `OPEN QUESTION:` **watermarking engine is unresolved and may not ship in v1.** Robust invisible watermarking (Digimarc, SynthID/equivalent) is largely commercial/closed; permissive open-source options (e.g. `invisible-watermark` / DWT-DCT-style) are **fragile** and not regulator-grade. **Default v1 stance:** ship a _visible_ badge/overlay + C2PA manifest (which itself can carry a soft-binding assertion), and gate true durable invisible watermarking behind a confirmed library/partner. The PRDs mark every watermark claim accordingly and never overstate robustness.
3. **Manifest/report builder** — turns a batch of sign/watermark results into the per-asset manifest report (what was applied, the C2PA `manifest_id`, validation status) rendered via the spine's report renderer (platform-spec §8). **Shared by `bulk-watermark`** and reused for the single-asset receipt in `c2pa-stamper`.
4. **Compliance ruleset** (`evaluateCompliance(evidence) → DimensionScores`) — the deterministic checks behind `ai-compliance-audit` (is there a visible label? a machine-readable C2PA/IPTC marking? a disclosure page? a detection tool link?), mapped to SB 942 / EU Art. 50 requirements. The AI step _explains and prioritizes_; the _checks_ are deterministic so the score is defensible.

> `c2pa-stamper` is the **reference implementation** of the deterministic provenance core (the C2PA signer + the single-asset artifact). Build it first; `bulk-watermark` is the batch composition on top, `ai-compliance-audit` reuses Segment 1's crawler, and `disclosure-generator` is the lightest (template + small AI).

## Where AI is — and isn't — in this segment (read before building)

| Product                | Deterministic engine                 | AI role                                               | BYOK key needed?     |
| ---------------------- | ------------------------------------ | ----------------------------------------------------- | -------------------- |
| `c2pa-stamper`         | **C2PA signing** (the whole product) | _Optional_ — auto-draft the disclosure text           | Only if AI toggle on |
| `ai-compliance-audit`  | Deterministic compliance checks      | **Yes** — explains/prioritizes findings, summary      | Yes                  |
| `disclosure-generator` | Template assembly                    | **Light** — customize tone/specifics to the business  | Yes (small/cheap)    |
| `bulk-watermark`       | **Watermark + C2PA signing** (batch) | _Optional_ — one shared disclosure line for the batch | Only if AI toggle on |

> Doctrine: **never spend a buyer's BYOK key or a quota run on a step that is pure crypto/metadata.** Where the AI step is optional, the product still produces a complete, valid artifact with the AI toggle **off** (signing/watermarking always succeed without a key). This is the inverse of Segment 1, where AI _is_ the artifact — call it out so agents don't mis-architect.

## Eat our own dog food

Every AI image Digitribe publishes (blog heroes, OG cards, social) gets stamped with Content Credentials by our own `c2pa-stamper`, and `digitribe.world` ships its own AI-disclosure page from `disclosure-generator`. The store's `/store` sales pages display the "Content Credentials" badge on AI visuals — visible proof we use the thing we sell. Track as a launch task.
