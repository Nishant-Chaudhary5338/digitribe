# Segment 1 — Agentic Web Readiness

> Make a business **readable, usable, and transactable by AI agents.** Read [`../00-overview.md`](../00-overview.md) and [`../01-platform-spec.md`](../01-platform-spec.md) first.

---

## Thesis

The web is being rebuilt for AI agents, not humans. If an agent (ChatGPT, Perplexity, Claude, Gemini, AI Mode) can't read your site, use it, or buy from it, you go invisible as AI search/shopping grows. The tools to fix that barely exist self-serve — what's out there is enterprise consulting and a few "score-only" audit pages. We sell the **generated artifacts**, instant and BYOK.

**Why us:** Digitribe builds MCP servers and AI agents on Claude/AI-SDK. Agent-readiness is our home turf, and it's the natural paid upgrade to the site's existing free `/audit`.

### Market signals (cite in sales copy)

- AI shopping traffic up **~4,700% YoY** to US retail (Adobe Analytics, 2025).
- **93% of AI Mode sessions end without a click** — presence inside the AI answer is the only impression.
- MCP: **97M monthly SDK downloads, 10k+ active servers**; donated to the Linux Foundation's AAIF (Dec 2025).
- The standards are set: `llms.txt` + `agents.md` (description layer), `.well-known/` + MCP endpoint + UCP/ACP (transaction layer).

> Sources tracked in `../research-sources.md` (to be created with the citation list used across sales pages).

## Products

| Slug                      | Name                                | Price | Input → Artifact                                                         | Status          |
| ------------------------- | ----------------------------------- | ----- | ------------------------------------------------------------------------ | --------------- |
| `agent-ready-kit`         | **Agent-Ready Kit** ⭐              | $29   | URL → `llms.txt` + `agents.md` + JSON-LD + `.well-known/` MCP stub (zip) | PRD ✅ exemplar |
| `ai-buyer-simulator`      | "Can an AI buy from you?" Simulator | $39   | URL → agent buy-journey report of where checkout breaks                  | PRD ✅          |
| `webmcp-generator`        | WebMCP Endpoint Generator           | $149  | site spec → deployable MCP server scaffold exposing search/cart/book     | PRD ✅          |
| `agent-readiness-monitor` | Agent-Readiness Monitor             | $19   | URL → one-time score + fix diff                                          | PRD ✅          |

Funnel: `agent-readiness-monitor` ($19 score) → `agent-ready-kit` ($29 files) → `webmcp-generator` ($149 transaction layer). The free marketing `/audit` feeds the top.

## Shared logic across this segment (build once, reuse)

These products share a **crawl → analyze → generate** spine. Implement it once in `server/store/tools/agentic/` and have each product compose it. Documented in detail in `agent-ready-kit.md` §7; the others reference it.

1. **Crawler** (`crawlSite(url, {maxPages, maxDepth})`) — fetch + extract readable content, sitemap, key pages, existing meta/schema, robots, detect commerce. SSRF-guarded (platform-spec §10). Shared by all four.
2. **Analyzer** — score the site across the readiness dimensions (description layer present? transaction layer? structured data? crawlable?).
3. **Generator** — BYOK AI step that fills the product's Output Contract (the files, the report, or the server).

> `agent-ready-kit` is the **reference implementation** of this spine and the gold-standard PRD. Build it first; the other three are smaller compositions on top.

## Eat our own dog food

The store itself ships `llms.txt` + `agents.md` describing the catalog, so AI agents can discover and recommend our tools. This is both a credibility proof and a Segment-1 marketing asset. Track as a launch task.
