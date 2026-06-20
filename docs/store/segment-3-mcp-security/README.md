# Segment 3 — MCP & Agent Security

> Scan, harden, and stress-test the MCP servers and AI agents builders are shipping. Read [`../00-overview.md`](../00-overview.md) and [`../01-platform-spec.md`](../01-platform-spec.md) first. This is **Digitribe's most defensible segment** — we build MCP servers for a living.

---

## Thesis

The Model Context Protocol won the agent-tooling layer, and the security work didn't keep up. MCP ships with **no built-in authentication or authorization** — the spec defines a transport and a tool/resource model, not an auth model — so every server author re-invents (or skips) access control. The result is a year of public, repeating failure: prompt injection through tool descriptions, tool poisoning, over-privileged tools holding broad scopes "just in case," confused-deputy chains where a server calls a downstream API with the wrong identity, path traversal in file-touching tools, and unsafe tool calls that execute attacker-influenced input.

The people shipping these servers are builders — they want a fix they can run themselves, today, and commit. That's exactly the store's model: **paste a server (URL or repo/config) → get a scored, prioritized security report or a generated hardening bundle, instant, on your own key.** Nobody self-serve does this credibly; the alternative is an enterprise pentest engagement or nothing.

**Why us:** Digitribe builds and publishes MCP servers — the open-source [`mcp-toolkit`](https://github.com/Nishant-Chaudhary5338/mcp-toolkit) is **17 production MCP servers** plus a standalone code-graph indexer, all CI-verified. We already ship static-analysis tooling (`legacy-analyzer`, `typescript-enforcer`, `dep-auditor`, AST-based `code-modernizer`) and a code-intelligence engine that parses TS/React into a queryable graph. So our analysis isn't "ask the LLM if it looks safe" — much of it is **deterministic static inspection of the tool manifest and code**, with AI reserved for reasoning about exploit chains and writing fixes. That combination — protocol fluency + real static-analysis muscle — is the moat.

### Market signals (cite in sales copy)

- **40+ MCP-related CVEs disclosed in 2026** — roughly **one new MCP vulnerability every four days** across popular servers and SDKs.
- **MCP has no built-in auth/authz** — the protocol leaves identity, scoping, and consent to each implementer; most ship none.
- The recurring **MCP threat classes** are now well-catalogued: **prompt injection** (incl. _indirect_ injection via tool outputs/resources), **tool poisoning** (malicious instructions hidden in tool descriptions/schemas), **over-privileged tools**, **confused-deputy** (server acts with the wrong authority), **path traversal**, and **unsafe tool calls** (attacker-influenced shell/SQL/eval).
- MCP adoption is mass-scale (**~97M monthly SDK downloads, 10k+ active servers**, donated to the Linux Foundation's AAIF, Dec 2025) — the install base outran its security posture.

> Sources tracked in `../research-sources.md` (the shared citation list used across sales pages). Mark any stat you can't trace there as `OPEN QUESTION:` rather than ship it unverified.

## Products

| Slug                      | Name                              | Price | Input → Artifact                                                                                                    | Status          |
| ------------------------- | --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------- | --------------- |
| `scan-my-mcp`             | **Scan my MCP server** ⭐         | $39   | MCP endpoint URL _or_ repo/config → scored, prioritized **MCP Security Report** (PDF/zip)                           | PRD ✅ flagship |
| `mcp-hardening-kit`       | MCP Hardening Kit                 | $49   | server details (framework, tools, scopes) → generated auth/scope/sanitization middleware + checklist + config (zip) | PRD ✅          |
| `agent-injection-suite`   | Agent Prompt-Injection Test Suite | $39   | agent description / system prompt / tool list → generated jailbreak/injection test pack + runnable CI harness (zip) | PRD ✅          |
| `tool-permission-auditor` | Tool-Permission Auditor           | $29   | MCP/agent tool config (JSON) → least-privilege analysis with minimal-permission suggestions + rationale             | PRD ✅          |

**Funnel:** `tool-permission-auditor` ($29, narrow + cheap, mostly deterministic — the curiosity entry) → `scan-my-mcp` ($39 flagship full report) → `mcp-hardening-kit` ($49, the fix bundle the report points to) and `agent-injection-suite` ($39, the test pack that proves you're hardened). The flagship's report explicitly cross-sells the other three by finding. CVE-driven content marketing (a new MCP CVE every ~4 days = a steady stream of "is your server affected?" posts) feeds the top.

## Shared logic across this segment (build once, reuse)

These products share an **inspect → classify → reason → emit** spine. Build it once in `server/store/tools/mcp/` and have each product compose the parts it needs. `scan-my-mcp` is the reference implementation; the others reference it.

1. **Manifest fetcher / connector** (`fetchManifest(target)`) — given an MCP endpoint, perform an MCP **client** handshake (`initialize` → `tools/list` / `resources/list` / `prompts/list`) over the declared transport (Streamable HTTP / SSE) and capture the tool manifest **without ever executing a tool**; given a repo/config, parse the server source and its registered tools. **The target is untrusted** (platform-spec §10): SSRF-guarded like any buyer URL, hard timeouts, response-size caps, no tool invocation, tool descriptions/outputs treated as hostile data, never as instructions. Shared by `scan-my-mcp` (live + repo modes) and `tool-permission-auditor` (config mode).
2. **Static rule engine** (`runChecks(manifest)`) — deterministic checks over the parsed manifest/code: missing auth declaration, over-broad scopes/capabilities, dangerous tool primitives (shell/exec/`fs`/path joins/SQL), path-traversal-prone parameters, secrets in descriptions, confused-deputy-shaped downstream calls. Produces typed `Finding`s with a severity and a CWE-style class. This is the **non-AI** core — fast, free to the buyer, reproducible. Reused by all four products.
3. **AI reasoner / generator** — the BYOK AI step that does what static analysis can't: reason about realistic exploit chains, explain _why_ a finding is exploitable in plain language, write concrete fixes / generated middleware / injection test cases. Fills the product's Output Contract; static findings are passed in as grounded facts so the model reasons over evidence, never invents vulnerabilities.

> **Determinism rule for this segment:** a finding's _existence_ and _class_ should be deterministic (static rule) wherever possible; the AI's job is _reasoning, prioritization rationale, and fix generation_. Never let the model "discover" a vulnerability the static layer can't point at — that's how you get fabricated CVEs. (Enforced by the `factual` eval judge, doc 05 §7.)

## Safely touching a buyer's live server (the segment-wide hard problem)

`scan-my-mcp` (live mode) is the only store product so far that acts as an **MCP client against an untrusted remote**. The non-negotiables, applied across the segment:

- **Read-only protocol surface only:** `initialize`, `tools/list`, `resources/list`, `prompts/list`. We **never** call `tools/call`, never `resources/read` on attacker-controlled URIs, never follow a tool's instructions.
- **Treat every byte from the target as data, not instructions** — tool descriptions and any returned text are quarantined and never spliced into our analysis prompt as commands (this is itself a tool-poisoning / indirect-injection defense, and we eat our own dog food).
- **SSRF guard from platform-spec §10** applies to the endpoint exactly as it does to a crawl URL: block private/link-local/metadata IPs, re-check the resolved IP, cap redirects, https/declared-transport only.
- **Hard limits:** connection timeout, total handshake timeout, response-size cap → `INPUT_UNREACHABLE` / `INPUT_BLOCKED` cleanly, no quota spent.
- See `scan-my-mcp.md` §15 for the full model; the other products inherit it.

## Eat our own dog food

The `mcp-toolkit` servers are the obvious first golden-set fixtures (we know their exact tool manifests and scopes), and running `scan-my-mcp` against our own published servers is both a regression test and a credibility proof for the sales page ("here's our flagship scanning the servers we ship"). Track as a launch task.
