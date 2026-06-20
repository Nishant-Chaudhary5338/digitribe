import { describe, it, expect, vi } from 'vitest'

vi.mock('../../../server/store/tools/agentic/crawl', () => ({
  crawlSite: async () => ({
    url: 'https://x.com',
    title: 'X Landing',
    pagesCrawled: 1,
    headings: ['Hero headline'],
    contentExcerpt: 'Buy now, limited time',
    metaDescription: 'desc',
    hasLlmsTxt: false,
    hasAgentsMd: false,
    jsonLdTypes: [],
    hasSitemap: true,
    robotsBlocked: false,
    jsRenderedOnly: false,
    isCommerce: true,
    hasWellKnownMcp: false,
    entityClear: true,
  }),
}))

import { conversionTeardownPipeline } from '../../../server/store/tools/conversion-teardown'
import {
  ConversionTeardownInput,
  ConversionTeardownOutput,
  CRO_DIMENSION_KEYS,
  croGrade,
} from '../../../server/store/schemas/conversion-teardown'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  site: { url: 'https://WRONG.com', title: 'WRONG', audience: 'saas' },
  overallScore: 64,
  grade: 'A',
  dimensions: CRO_DIMENSION_KEYS.map((key) => ({
    key,
    label: 'L',
    score: 60,
    status: 'okay',
    findings: ['f'],
    fixes: [{ issue: 'i', currentText: 'old', rewrite: 'new' }],
  })),
  topActions: ['a', 'b', 'c'],
}

describe('conversion-teardown schema', () => {
  it('input defaults audience to unknown', () => {
    expect(ConversionTeardownInput.parse({ url: 'https://x.com' }).audience).toBe('unknown')
  })
  it('requires exactly 5 dimensions', () => {
    expect(
      ConversionTeardownOutput.safeParse({ ...aiOut, dimensions: aiOut.dimensions.slice(0, 4) })
        .success
    ).toBe(false)
  })
  it('croGrade maps bands', () => {
    expect(croGrade(64)).toBe('C')
    expect(croGrade(92)).toBe('A')
  })
})

describe('conversion-teardown pipeline', () => {
  it('produces a valid contract, forcing audience from input + grade from score + url from digest', async () => {
    const events: RunEvent[] = []
    const out = await conversionTeardownPipeline({
      input: { url: 'https://x.com', audience: 'dtc' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(ConversionTeardownOutput.safeParse(out).success).toBe(true)
    expect(out.site.audience).toBe('dtc') // input, not the AI's 'saas'
    expect(out.site.url).toBe('https://x.com') // digest, not the AI's WRONG.com
    expect(out.grade).toBe('C') // croGrade(64), not the AI's 'A'
    expect(events.length).toBeGreaterThan(0)
  })
})
