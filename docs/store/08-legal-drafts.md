# 08 · Legal Drafts (for counsel review)

> ⚠️ **DRAFT — not legal advice. A qualified lawyer must review and adapt before publishing.** These are starting-point drafts so counsel edits rather than writes from scratch. Polar (Merchant of Record) is the seller-of-record and supplies its own checkout terms, tax handling, and invoices; these cover the _store/product_ relationship on top of that.
>
> Fill every `{{placeholder}}`. Entity, governing law, and contact details must be confirmed by counsel.
> Pages live at `/store/terms`, `/store/refunds`, `/store/privacy`. The short disclaimers also appear inline per doc 07 §6.

**Operator:** Digitribe ({{legal entity name + registration}}), {{address}}. **Contact:** {{support email}}. **Governing law:** {{jurisdiction — confirm}}.

---

## A) Terms of Use — `/store/terms`

**1. What we provide.** The Digitribe store sells one-time, self-serve digital tools ("Products"). Each Product takes your input and produces a digital artifact (a report, file bundle, generated code, or downloadable application). Products are described on their individual pages.

**2. Bring Your Own Key (BYOK).** Most Products run on **your own third-party AI provider API key** (e.g. Anthropic, OpenAI, Google). You are responsible for your provider account, your key, and **all usage costs your provider charges you**. We are not your AI provider and do not control or guarantee their availability, pricing, or output. We never use your key except to run the Product you purchased on your behalf, and we do not store it unless you explicitly opt in (see Privacy). _Exception:_ the **Digibot widget** stores your runtime key (encrypted) with your explicit consent so your live widget can operate — you may delete it anytime.

**3. Acceptable use.** You may only submit websites, files, repositories, content, or systems that **you own or are authorized to analyze, process, or modify.** You will not use the Products to violate any law, infringe rights, attack or scan systems you don't control, or process unlawful content. We may refuse or revoke access for misuse.

**4. License to outputs.** Artifacts a Product generates for you are **yours to use** for any lawful purpose. Downloadable applications are licensed to you under the license stated on the Product page (typically a single-buyer license; the underlying open-source engines remain under their own open-source licenses).

**5. No professional advice; no guaranteed outcomes.** Product outputs are **automated, AI-assisted starting points, not professional, legal, security, accessibility, or financial advice.** We do not guarantee any specific result — including search rankings, conversions, compliance, security, or accessibility outcomes. Review and validate outputs before relying on them.

**6. AI-generated content.** Outputs are produced with AI and **may contain errors, omissions, or inaccuracies.** You are responsible for reviewing them before use.

**7. Availability & changes.** Products are provided "as is" and "as available." We may modify, suspend, or discontinue any Product. We aren't liable for provider outages or third-party failures.

**8. Limitation of liability.** To the maximum extent permitted by law, our total liability for any Product is limited to **the amount you paid for that Product.** We are not liable for indirect, incidental, or consequential damages. {{counsel to finalize warranty disclaimers + liability cap per jurisdiction.}}

**9. Payments.** Purchases are processed by **Polar** as Merchant of Record; Polar's terms and tax handling also apply. Prices are shown at checkout.

**10. Changes to these terms.** We may update these Terms; the version at time of purchase governs that purchase.

---

## B) Refund Policy — `/store/refunds`

Because Products are digital and delivered instantly, we offer a **focused, fair refund policy**:

- **If a Product never produced a valid result** (e.g. a run failed on our side and could not complete), you're entitled to a **full refund**. For run-based tools, your run quota is automatically restored after a system-side failure, so you can simply retry first.
- **Re-runs:** each purchase includes a set number of runs (shown on the Product page) so honest mistakes don't cost you.
- **Downloadable apps (Segment 5):** if the licensed application can't be installed/activated and we can't resolve it, you're entitled to a refund.
- Refunds are issued via Polar to your original payment method. Request one at {{support email}} with your order details.
- We may decline refunds for misuse or where a valid artifact was delivered and used. {{counsel: align with EU consumer-rights/digital-content withdrawal rules — note the instant-delivery consent point.}}

---

## C) Privacy & Data Retention — `/store/privacy`

**What we process.** Depending on the Product: a URL we crawl (public pages only), a file you upload, a repository path (for downloadable apps, your code stays on **your** machine — we never receive it), text/content you paste, and your email (for delivery). We process this **only to run the Product and deliver your result.**

**Your AI key (BYOK).** Transmitted over an encrypted connection and used **only** for your run. **We do not store it**, except — with your explicit opt-in — to (a) save it to your optional account, or (b) power your Digibot widget; in both cases it is **encrypted at rest (AES-256-GCM)** and you can delete it anytime.

**Retention.** Generated artifacts are kept **up to 30 days** so you can re-download them, then permanently deleted. Crawled/uploaded source content is used transiently for the run and not retained beyond it unless a Product explicitly states otherwise. Purchase records are kept as required for accounting/tax.

**No training on your data.** We do not use your inputs, content, code, or outputs to train models. Your AI provider's own data policies apply to calls made with your key.

**Sub-processors.** Polar (payments/MoR), Vercel (hosting), Supabase (database/auth), Resend (email), and **your chosen AI provider** (inference, via your key). {{counsel to finalize the full list + any DPA needs.}}

**Your rights.** {{GDPR/CCPA rights — access, deletion, etc. — counsel to complete per jurisdiction.}} Contact {{support email}}.

---

## D) Inline disclaimers (reused across the UI — canonical strings)

These are enforced as `z.literal` text in the relevant Output Contracts (Segment 2, WCAG) and shown on the relevant pages:

- **Compliance tooling (Segment 2):** "This is tooling, not legal advice. We help you implement content-provenance and disclosure measures; we do **not** certify compliance with the EU AI Act, California AI Transparency Act, or any other law. Confirm your obligations with qualified counsel."
- **Accessibility (WCAG audit):** "This automated audit helps you find and fix accessibility issues. It is **not** a certification of ADA/WCAG conformance and is not legal advice."
- **Security (Segment 3):** "This scan surfaces likely issues; it is not a guarantee that your server or agent is secure. Review findings before acting."
- **AI output (all AI Products):** "Generated with AI — may contain errors. Review before use. No specific outcome (rankings, conversions, compliance, security) is guaranteed."
- **BYOK key (at the key field):** "We never store your API key — it's used only for this run, over an encrypted connection." (Digibot: "…stored encrypted, with your consent, only to power your widget. Delete anytime.")

---

## Counsel checklist (what we need confirmed before launch)

- [ ] Correct legal entity, address, governing law, dispute forum.
- [ ] Warranty disclaimer + liability cap enforceable in target markets (EU/US/UK).
- [ ] EU consumer digital-content **right-of-withdrawal** handling vs instant delivery (the consent-to-immediate-performance point).
- [ ] GDPR/CCPA rights sections + whether a DPA / sub-processor list page is required.
- [ ] Segment-2 compliance disclaimers are sufficient to avoid implying certification.
- [ ] Downloadable-app (Segment 5) license terms + the open-source engine licenses are compatible and correctly stated.
- [ ] Alignment with Polar's MoR terms (avoid conflicts).
