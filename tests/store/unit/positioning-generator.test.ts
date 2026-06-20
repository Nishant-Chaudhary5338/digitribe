import { describe, it, expect } from 'vitest'
import { positioningPipeline } from '../../../server/store/tools/positioning-generator'
import { PositioningOutput } from '../../../server/store/schemas/positioning-generator'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const angle = (audience: 'dtc' | 'saas') => ({
  audience,
  valueProp: 'vp',
  headlines: ['h1', 'h2', 'h3'],
  icp: 'icp',
  messageHierarchy: ['m1', 'm2', 'm3'],
})
const aiOut = {
  product: 'a water bottle',
  category: 'hydration',
  angles: [angle('dtc'), angle('saas')],
  recommendation: { leadWith: 'dtc', why: 'because' },
}

describe('positioning-generator', () => {
  it('requires exactly 2 angles', () => {
    expect(PositioningOutput.safeParse({ ...aiOut, angles: [angle('dtc')] }).success).toBe(false)
  })
  it('pipeline produces a valid dual-angle artifact', async () => {
    const events: RunEvent[] = []
    const out = await positioningPipeline({
      input: { product: 'a water bottle' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(PositioningOutput.safeParse(out).success).toBe(true)
    expect(out.angles.map((a) => a.audience).sort()).toEqual(['dtc', 'saas'])
    expect(events.length).toBeGreaterThan(0)
  })
})
