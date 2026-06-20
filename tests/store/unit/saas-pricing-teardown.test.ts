import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../server/store/tools/agentic/crawl', () => ({
  crawlSite: async () => ({
    url: 'https://x.com',
    title: 'X Pricing',
    pagesCrawled: 1,
    headings: ['Pricing'],
    contentExcerpt: 'Starter $9, Pro $29',
    hasLlmsTxt: false,
    hasAgentsMd: false,
    jsonLdTypes: [],
    hasSitemap: true,
    robotsBlocked: false,
    jsRenderedOnly: false,
    isCommerce: false,
    hasWellKnownMcp: false,
    entityClear: true,
  }),
}))

import { saasPricingPipeline } from '../../../server/store/tools/saas-pricing-teardown'
import {
  SaasPricingOutput,
  PRICING_DIMENSION_KEYS,
  pricingGrade,
} from '../../../server/store/schemas/saas-pricing-teardown'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  site: { url: 'https://WRONG.com', title: 'WRONG' },
  overallScore: 80,
  grade: 'F',
  valueMetric: 'seats',
  dimensions: PRICING_DIMENSION_KEYS.map((key) => ({
    key,
    label: 'L',
    score: 80,
    status: 'okay',
    findings: ['f'],
    fixes: [{ issue: 'i', rewrite: 'r' }],
  })),
  tiers: [{ name: 'Pro', read: 'good' }],
  topActions: ['a', 'b', 'c'],
}

describe('saas-pricing-teardown', () => {
  it('requires exactly 4 dimensions', () => {
    expect(
      SaasPricingOutput.safeParse({ ...aiOut, dimensions: aiOut.dimensions.slice(0, 3) }).success
    ).toBe(false)
  })
  it('pricingGrade maps bands', () => {
    expect(pricingGrade(80)).toBe('B')
  })
  it('pipeline forces grade from score and url/title from digest', async () => {
    const events: RunEvent[] = []
    const out = await saasPricingPipeline({
      input: { url: 'https://x.com' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(SaasPricingOutput.safeParse(out).success).toBe(true)
    expect(out.grade).toBe('B') // pricingGrade(80), not the AI's 'F'
    expect(out.site.url).toBe('https://x.com') // digest, not the AI's WRONG.com
    expect(events.length).toBeGreaterThan(0)
  })
})
