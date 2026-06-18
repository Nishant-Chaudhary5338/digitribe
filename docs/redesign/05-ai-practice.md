# 05 — The AI / MCP Practice

> The differentiator, made visible. Today the AI offering exists only as data (`lib/data/services.ts`, `category: 'automate'`) and four MDX files — it never appears as a *feeling* anywhere a founder scrolls. This file makes it the spine. It is the thing that makes Digitribe "not just another build+grow agency" (`PROJECT_VISION.md §5`).

## The core idea
Most agencies say "we do AI" with a stock illustration of a brain. Digitribe's edge is that **Nishant builds this stuff himself** — real MCP servers, real agents on Claude + the AI SDK, with evals and guardrails (`system-prompt.ts`). So the AI practice should be expressed as **working software, shown working** — never as an abstract concept. The proof *is* the design.

Three principles:
1. **Show a tool call, not a robot.** The visual vocabulary is the MCP/agent runtime itself — typed tool calls resolving, an MCP server exposing tools, an agent reasoning in steps. Honest, specific, ownable.
2. **It's a peer, not a footnote.** AI is the third anchor (`02 §C`), gets its own board (replaces the spreadsheet-row treatment), and gets one live moment per theme.
3. **"Our own site runs on it."** The site already has Digibot (`lib/chat/system-prompt.ts`, `app/api/chat/route.ts`). Frame that as evidence: *the assistant you're talking to is the kind of thing we build.*

---

## 1. AI as the third anchor — `AnchorTriad`
Covered in `02 §C` / `03 §3` / `04 §4`. The card is titled **"AI & Automation"**, featured, bullets pulled from `getServicesByCategory('automate')`:
- AI Readiness Sprint — `$1,700 · 1 week`
- AI Agent Development — `$6,500–$28,000 · 3–8 weeks`
- Custom MCP Server — `$5,000–$15,000 · 2–4 weeks`
- Automation Workflow — `$1,700–$9,000 · 1–3 weeks`

Lane accent: **electric blue** (Studio) / **plum `--color-quaternary`** (Garden).

---

## 2. The live moment — `<AICallout>` *(the on-page proof)*

A self-contained, **deterministic, scripted** animation of an MCP tool-call / agent step resolving. Not a real API call — a choreographed, reduced-motion-safe sequence. One component, two skins.

**File:** `components/sections/ai-callout.tsx` (used by DTC "AI strip" `03 §5` and SaaS "AI feature" `04 §5`).

**The sequence (≈4s loop, pauses on hover, respects reduced motion):**
```
┌─ digitribe-mcp ───────────────────────── ● ● ● ┐
│ ▷ agent.run("grow the loop")                    │
│   → tool: ads.fetch_performance()               │
│     ⤷ roas 3.8x · cac $24 · top_creative #7     │
│   → tool: page.propose_variant(creative #7)     │
│     ⤷ draft ready · lcp 0.9s · ship? [y]         │
│   ✓ build ⇄ grow, one loop. no handoff.         │
└─────────────────────────────────────────────────┘
```
- Each line types/reveals in sequence (mono), the active tool row highlighted in the lane accent. The closing line is the payoff and ties straight to "under one roof."
- **DTC skin:** terminal chrome, navy/blue, monospace JetBrains, hard 0-radius, a blinking block cursor, faint riso grain. Snappy reveal (`--duration-fast`).
- **Garden skin:** the *same content* rendered as elegant typographic rows on a warm card — no terminal chrome, IBM Plex Mono for the tool names, Fraunces caption above (`— how we think about your stack`), plum accents, soft radius. Slow reveal (`--duration-deliberate`).
- **Data-real, not fake-metric:** keep numbers plausible and labeled as illustrative (`// illustrative`), so it's honest per the voice. Never imply a specific client result.

**Reduced motion / no-JS:** render the full sequence statically (all lines visible, no typing). The component must be readable as a static image — it's a diagram first, animation second.

**Accessibility:** `aria-hidden` on the animated glyphs; provide a visually-hidden prose summary ("An illustration of an AI agent reading ad performance and proposing a landing-page variant — build and growth in one loop").

---

## 3. The MCP/agent services page treatment — `<AIPracticeBoard>`
Replaces the price-table rows for `automate` (`02 §H`). Each of the four AI services renders as an **object that looks like what it is:**
- **Custom MCP Server** → a card shaped like a server manifest: a list of exposed `tools[]` (mono), `auth: ✓`, `transport: stdio + http`, `validated: zod`. Pulls scope bullets from `services.ts`.
- **AI Agent Development** → an agent spec card: `inputs → tools → guardrails → evals → handoff` as a horizontal pipeline.
- **AI Readiness Sprint** → a one-week roadmap card: effort/impact scored chips.
- **Automation Workflow** → a flow card: `trigger → steps → docs`.

Price + timeline shown honestly (USD ranges, from `services.ts`). CTA → `/audit?service=<slug>` (existing pattern in `pricing-table.tsx`).

**File:** `components/sections/ai-practice-board.tsx`; mounted on `app/(dtc)/dtc/services/page.tsx` and `app/(saas)/saas/services/page.tsx` in place of `<PricingTable category="automate" …>`.

---

## 4. "This site runs on it" — Digibot as evidence
- In the footer or near the AI callout, a small honest line: `The assistant in the corner? We built it the way we'd build yours — Claude, the AI SDK, real guardrails. Ask it anything.` Links focus to the existing `chat-widget`.
- On `/about` and the AI services page, one sentence crediting the real stack (from `system-prompt.ts` / `founders.ts`): MCP servers, Claude + AI SDK, evals, observability. Specific, not buzzwordy.
- Do **not** over-promise. Voice rule (`system-prompt.ts`): "Never invent results." Keep AI copy to capability + method, not outcomes.

---

## 5. Where AI surfaces across the site (map)
| Surface | DTC (Studio) | SaaS (Garden) | File |
|---|---|---|---|
| Anchor | 3rd anchor, blue, featured | 3rd anchor, plum, offset feature row | `two-anchors.tsx` |
| Live moment | dark terminal "AI strip" | warm editorial "AI feature" | `ai-callout.tsx` (new) |
| Services | `AIPracticeBoard` (objects) | `AIPracticeBoard` (objects) | `ai-practice-board.tsx` (new) |
| Proof | Digibot "we built this" line | same | footer / `chat-widget.tsx` |
| Signature | seam pulses at AI section | vine "signals" at AI section | `07` |

---

## Acceptance criteria
- [ ] AI is the third anchor on both home pages, visually featured (not a footnote).
- [ ] `<AICallout>` exists, deterministic, both skins, pauses on hover, fully static under `prefers-reduced-motion`, with a visually-hidden text summary.
- [ ] AI/MCP numbers are labeled illustrative; no invented client results anywhere.
- [ ] `automate` services render via `AIPracticeBoard` (object cards), not the generic price table.
- [ ] A single honest "we built Digibot the same way" evidence line exists and links to the chat widget.
- [ ] AI lane accent is consistent: blue in Studio, plum in Garden.
