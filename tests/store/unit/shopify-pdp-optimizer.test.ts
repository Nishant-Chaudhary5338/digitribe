import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../server/store/tools/agentic/crawl', () => ({
  crawlSite: async () => ({
    url: 'https://shop.com/p',
    title: 'Widget',
    pagesCrawled: 1,
    headings: ['Widget'],
    contentExcerpt: 'A great widget',
    hasLlmsTxt: false,
    hasAgentsMd: false,
    jsonLdTypes: ['Product'],
    hasSitemap: true,
    robotsBlocked: false,
    jsRenderedOnly: false,
    isCommerce: true,
    hasWellKnownMcp: false,
    entityClear: true,
  }),
}))

import { shopifyPdpPipeline } from '../../../server/store/tools/shopify-pdp-optimizer'
import { ShopifyPdpOutput, pdpGrade } from '../../../server/store/schemas/shopify-pdp-optimizer'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  site: { url: 'https://WRONG.com', title: 'WRONG' },
  overallScore: 88,
  grade: 'F',
  rewrittenCopy: { title: 'Better Widget', description: 'desc', bullets: ['b1', 'b2'] },
  croFixes: [{ area: 'above the fold', issue: 'i', fix: 'f' }],
  trustRecommendations: ['add reviews'],
  topActions: ['a', 'b', 'c'],
}

describe('shopify-pdp-optimizer', () => {
  it('pdpGrade maps bands', () => {
    expect(pdpGrade(88)).toBe('B')
  })
  it('pipeline forces grade from score and site from digest', async () => {
    const events: RunEvent[] = []
    const out = await shopifyPdpPipeline({
      input: { url: 'https://shop.com/p' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(ShopifyPdpOutput.safeParse(out).success).toBe(true)
    expect(out.grade).toBe('B') // pdpGrade(88), not the AI's 'F'
    expect(out.site.url).toBe('https://shop.com/p') // digest, not the AI's WRONG.com
    expect(events.length).toBeGreaterThan(0)
  })
})
