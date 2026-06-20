import { describe, it, expect, vi } from 'vitest'

// Mock the network crawl with a fixed digest (1 JSON-LD type, sitemap, entity-clear).
vi.mock('../../../server/store/tools/agentic/crawl', () => ({
  crawlSite: async () => ({
    url: 'https://x.com',
    title: 'X',
    pagesCrawled: 1,
    hasLlmsTxt: false,
    hasAgentsMd: false,
    jsonLdTypes: ['Organization'],
    hasSitemap: true,
    robotsBlocked: false,
    jsRenderedOnly: false,
    isCommerce: false,
    hasWellKnownMcp: false,
    entityClear: true,
  }),
}))

import { agentReadyPipeline } from '../../../server/store/tools/agent-ready-kit'
import { AgentReadyOutput, DIMENSION_KEYS } from '../../../server/store/schemas/agent-ready-kit'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

// The AI claims perfect scores — the pipeline must override them with the computed ones.
const aiOutput = {
  site: {
    url: 'https://x.com',
    title: 'X',
    summary: 's',
    pagesCrawled: 99,
    isCommerce: false,
    detectedEntities: ['X'],
  },
  overallScore: 99,
  grade: 'A',
  dimensions: DIMENSION_KEYS.map((key) => ({
    key,
    label: 'L',
    score: 99,
    status: 'good',
    findings: ['f'],
    fixes: ['x'],
  })),
  files: [
    { path: 'llms.txt', language: 'markdown', contents: '# X', rationale: 'r' },
    { path: 'agents.md', language: 'markdown', contents: '# X', rationale: 'r' },
    { path: '.well-known/mcp.json', language: 'json', contents: '{}', rationale: 'r' },
  ],
  topActions: ['a', 'b', 'c'],
  upsell: { needsTransactionLayer: true, reason: 'no mcp' },
}

describe('agent-ready-kit pipeline', () => {
  it('produces a schema-valid contract with deterministic scores, not the AI’s', async () => {
    const events: RunEvent[] = []
    const out = await agentReadyPipeline({
      input: { url: 'https://x.com', maxPages: 20 },
      ai: mockAi({ structured: aiOutput }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })

    expect(AgentReadyOutput.safeParse(out).success).toBe(true)
    // computed: desc missing(0) + structured partial(50) + crawl good(100) + txn missing(0) + entity good(100) = 50
    expect(out.overallScore).toBe(50)
    expect(out.grade).toBe('D')
    const desc = out.dimensions.find((d) => d.key === 'description_layer')!
    expect(desc.score).toBe(0) // overridden from the AI's 99
    expect(desc.status).toBe('missing')
    expect(out.site.pagesCrawled).toBe(1) // from the digest, not the AI's 99
    expect(events.length).toBeGreaterThan(0)
  })
})
