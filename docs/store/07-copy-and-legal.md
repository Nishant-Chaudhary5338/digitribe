# 07 · Copy & Legal

> The canonical microcopy, error strings, email templates, and legal blocks. Products use these verbatim so voice and compliance are consistent. Voice per `PROJECT_VISION.md`: **senior, plain, confident — no hype, no emoji-soup, no "revolutionize."** Reference, don't reinvent.

---

## 1. Voice rules (quick)

- Say the outcome, then the detail. Short sentences. No filler ("In today's landscape…"), no hedging, no AI preambles.
- Address the buyer as "you." We are "we"/"Digitribe."
- Numbers and specifics over adjectives. Confidence without overpromising.
- Error copy is human and blameless; it tells the buyer what to do next.

## 2. Error string catalog (maps to `StoreErrorCode`, doc 04 §5)

Every `StoreError.userMessage` comes from here. Never leak keys, stack traces, or codes to the buyer.

| Code                 | `userMessage`                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `KEY_INVALID`        | "That {provider} API key didn't work — double-check it's active and try again. We never store it."              |
| `KEY_RATE_LIMITED`   | "Your {provider} account is rate-limited right now. Wait a moment and re-run — your purchase is safe."          |
| `KEY_REFUSED`        | "Your AI provider declined this request. Try again, or use a different provider key."                           |
| `INPUT_INVALID`      | "Something about that input isn't right: {field hint}."                                                         |
| `INPUT_UNREACHABLE`  | "We couldn't reach {target}. Make sure it's public and live, then retry."                                       |
| `INPUT_BLOCKED`      | "For security we can only process public addresses — that one looks private or internal."                       |
| `QUOTA_EXHAUSTED`    | "You've used all {n} runs for this purchase. Buy again to keep going."                                          |
| `TOKEN_INVALID`      | "This access link isn't valid. Check the link from your email, or contact us."                                  |
| `TOKEN_EXPIRED`      | "This access link has expired. We've emailed you a fresh one." (+ trigger re-mint)                              |
| `PROVIDER_TIMEOUT`   | "Your AI provider took too long. We've restored this run — try again."                                          |
| `PROVIDER_ERROR`     | "Your AI provider hit an error. We've restored this run — try again shortly."                                   |
| `RUN_FAILED`         | "Something went wrong on our side and we've restored your run. Try again, or contact us — we'll make it right." |
| `ARTIFACT_NOT_FOUND` | "We couldn't find that result. It may have expired (results are kept 30 days). Re-run to regenerate."           |
| `RATE_LIMITED`       | "Too many requests just now — give it a few seconds."                                                           |
| `INTERNAL`           | "Unexpected error on our end. Your purchase is safe — please retry or contact support."                         |

## 3. Run-phase labels (for `RunProgress`, doc 04 §4)

Default labels per `RunPhase`; products may override the product-specific phases with truthful, specific copy ("Crawling 12/20 pages…").

| Phase      | Label                                           |
| ---------- | ----------------------------------------------- |
| `auth`     | "Verifying your access…"                        |
| `validate` | "Checking your input…"                          |
| `key`      | "Validating your {provider} key…"               |
| `crawl`    | "Reading {target}…" / "Crawling {n}/{m} pages…" |
| `analyze`  | "Analyzing…"                                    |
| `generate` | "Generating your {artifact}…"                   |
| `render`   | "Building your report…"                         |
| `persist`  | "Finishing up…"                                 |
| `done`     | "Done."                                         |
| `error`    | (the §2 string)                                 |

## 4. Trust microcopy (doc 03 §5 — show, don't bury)

- Key field helper: **"We never store your API key. It's used only for this run, over an encrypted connection."** (Digibot is the one exception — see §6 disclaimer.)
- Expected-cost line: "This runs on your {provider} key — typically well under ${x} per run."
- Retention line: "Your result is saved for 30 days so you can re-download it, then permanently deleted."
- Public-only line (URL/repo tools): "We only read public {pages/code} — nothing behind a login."
- Code-safety line (Segment 5): "Your code is analyzed, never executed, and never retained after the run."

## 5. Email templates (Resend + react-email)

Two transactional emails. Branded with the store tokens (doc 06). Plain, no marketing.

**5.1 Receipt** (on `order.paid`)

- Subject: `Your Digitribe {product} purchase`
- Body: what they bought, price, the **access link** (`/store/use/[token]`), runs included, the 30-day note, support contact. Polar handles the tax invoice separately.

**5.2 Artifact delivery** (on run success)

- Subject: `Your {product} result is ready`
- Body: a one-line summary (e.g. "Grade: B — 4 priority fixes"), links to view / download PDF / download ZIP, the re-download window, and a soft cross-sell to the upsell product. Never embed the BYOK key or full sensitive content.

> Both: from `store@digitribe.world` (confirm sender domain in Resend — OPEN QUESTION SW). Include physical/business footer per email compliance.

## 6. Legal blocks (write final copy with counsel; these are the required pieces)

Polar (MoR) is the seller-of-record and handles tax + the purchase contract, but the store still needs:

- **Terms of Use** (`/store/terms`) — what each product does/doesn't guarantee; BYOK responsibility (the buyer's provider costs are theirs; they're responsible for their key); acceptable use (only scan/process assets you own or are authorized to); no-warranty on AI-generated output; that outputs are starting points, not professional advice.
- **Refund policy** (`/store/refunds`) — honored when a run never produced a valid artifact; quota auto-restores on system-side failures; one-click via Polar. State clearly given digital/instant delivery.
- **Privacy & data retention** (`/store/privacy`) — what's processed (URL/file/repo/content), 30-day artifact retention then deletion, BYOK keys never stored unless the buyer opts in (encrypted), no training on buyer data, sub-processors (Polar, Vercel, Resend, the buyer's AI provider).
- **BYOK disclaimer** (at the key field + Terms) — "Your key is transmitted securely and used only to run this tool on your behalf. We don't store it." For **`digibot-in-a-box`** add: "To power your live widget, your key is stored encrypted (AES-256-GCM) with your explicit consent and used only by your widget; you can delete it anytime."
- **Compliance-tool disclaimer** (Segment 2 + WCAG) — **"This is tooling, not legal advice. We help you implement provenance/accessibility/compliance measures; confirm your obligations with qualified counsel. We don't certify compliance."** This string is enforced as a `z.literal` in those products' Output Contracts.
- **AI-output disclaimer** (all AI products) — outputs may contain errors; review before use; we don't guarantee rankings, conversions, security, or legal outcomes.

## 7. Storefront / sales-page copy guardrails

- Hero = outcome in ≤10 words + the artifact visual + price + Buy.
- Always show a **real sample output** (doc 03 §1) — never lorem, never a fake screenshot.
- FAQs answer the real objections (key safety, what's included, will-it-improve-X, can-I-edit) and feed the JSON-LD `FAQPage`.
- Cross-sell/agency CTA is honest: "Want us to implement this for you?" → Digitribe services.

> Per-product copy decks (hero, FAQ, sample-output caption) live in each PRD's §11/§12; this doc is the shared catalog they draw from.
