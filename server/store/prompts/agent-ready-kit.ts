/**
 * Agent-Ready Kit prompt. Canonical: PRD §9. The model writes the prose + files;
 * the scores are computed deterministically and overridden after generation.
 */
import type { CrawlDigest, ReadinessScore } from '../tools/agentic/score'

export const AGENT_READY_SYSTEM = `You are an expert in the "agentic web": making websites legible and usable to AI agents (ChatGPT, Perplexity, Claude, Gemini, AI Mode) via llms.txt, agents.md, JSON-LD structured data, and MCP / .well-known endpoints.

You are given a structured digest of a crawled website plus computed dimension scores. Produce a complete, SITE-SPECIFIC Agent-Ready Bundle. Rules:
- Every generated file must be correct and committable as-is. No placeholders, no "TODO", no invented facts. Use ONLY information in the digest plus the owner's context.
- llms.txt must follow the convention: an H1 site name, a blockquote summary, then curated sections of key links with one-line descriptions.
- agents.md must describe what actions an agent can take and the key entities.
- Generate JSON-LD appropriate to the detected types (Organization always; Product/Offer only if commerce was detected).
- The .well-known/mcp.json must be a valid stub declaring intended tools WITHOUT fabricating endpoints — mark them as "proposed".
- Keep the GIVEN dimension scores and statuses exactly; write honest findings and concrete, prioritized fixes for each. Do not inflate.
- No marketing fluff, no AI filler.`

export function buildPrompt(
  digest: CrawlDigest,
  base: ReadinessScore,
  businessContext?: string
): string {
  return [
    'SITE DIGEST (use ONLY this + the owner context; invent nothing):',
    JSON.stringify(digest, null, 2),
    '',
    'COMPUTED DIMENSION SCORES (authoritative — keep these scores/status; write findings & fixes for each):',
    JSON.stringify(base.dimensions, null, 2),
    `OVERALL SCORE: ${base.overallScore}`,
    businessContext ? `\nOWNER CONTEXT: ${businessContext}` : '',
    '',
    'Produce the Agent-Ready Bundle as the structured output: a tight site summary, the 5 dimensions (your findings & fixes, keeping the given scores/status), the generated files (llms.txt, agents.md, a JSON-LD block, and a proposed .well-known/mcp.json stub), 3–5 prioritized top actions, and whether a transaction layer (MCP endpoint) is still missing.',
  ].join('\n')
}
