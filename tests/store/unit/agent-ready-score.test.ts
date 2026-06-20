import { describe, it, expect } from 'vitest'
import { scoreReadiness, type CrawlDigest } from '../../../server/store/tools/agentic/score'
import { DIMENSION_KEYS } from '../../../server/store/schemas/agent-ready-kit'

const base: CrawlDigest = {
  url: 'https://x.com',
  title: 'X',
  pagesCrawled: 10,
  hasLlmsTxt: false,
  hasAgentsMd: false,
  jsonLdTypes: [],
  hasSitemap: true,
  robotsBlocked: false,
  jsRenderedOnly: false,
  isCommerce: false,
  hasWellKnownMcp: false,
  entityClear: false,
}

const find = (d: ReturnType<typeof scoreReadiness>, key: string) =>
  d.dimensions.find((x) => x.key === key)!

describe('scoreReadiness', () => {
  it('returns the 5 fixed dimensions and a clamped score', () => {
    const r = scoreReadiness(base)
    expect(r.dimensions.map((d) => d.key)).toEqual([...DIMENSION_KEYS])
    expect(r.overallScore).toBeGreaterThanOrEqual(0)
    expect(r.overallScore).toBeLessThanOrEqual(100)
  })

  it('rewards a present description layer (llms.txt + agents.md)', () => {
    const d = find(
      scoreReadiness({ ...base, hasLlmsTxt: true, hasAgentsMd: true }),
      'description_layer'
    )
    expect(d.status).toBe('good')
    expect(d.score).toBe(100)
  })

  it('flags a missing description layer', () => {
    expect(find(scoreReadiness(base), 'description_layer').status).toBe('missing')
  })

  it('marks crawlability missing for JS-only sites and robots-blocked', () => {
    expect(find(scoreReadiness({ ...base, jsRenderedOnly: true }), 'crawlability').status).toBe(
      'missing'
    )
    expect(find(scoreReadiness({ ...base, robotsBlocked: true }), 'crawlability').status).toBe(
      'missing'
    )
  })

  it('a fully agent-ready site scores high', () => {
    const r = scoreReadiness({
      ...base,
      hasLlmsTxt: true,
      hasAgentsMd: true,
      jsonLdTypes: ['Organization', 'Product'],
      hasWellKnownMcp: true,
      entityClear: true,
    })
    expect(r.overallScore).toBeGreaterThanOrEqual(75)
  })
})
