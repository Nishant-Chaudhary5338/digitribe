import { describe, it, expect } from 'vitest'
import { adHookPipeline } from '../../../server/store/tools/ad-hook-generator'
import { AdHookInput, AdHookOutput } from '../../../server/store/schemas/ad-hook-generator'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const twentyHooks = Array.from({ length: 20 }, (_, i) => ({
  angle: `angle-${i % 5}`,
  hook: `Hook ${i}`,
}))
const aiOut = { channel: 'tiktok', hooks: twentyHooks, anglesCovered: ['a', 'b', 'c', 'd', 'e'] }

describe('ad-hook-generator schema', () => {
  it('defaults channel to meta', () => {
    expect(AdHookInput.parse({ product: 'a widget' }).channel).toBe('meta')
  })
  it('requires exactly 20 hooks', () => {
    expect(AdHookOutput.safeParse({ ...aiOut, hooks: twentyHooks.slice(0, 19) }).success).toBe(
      false
    )
  })
  it('requires at least 5 distinct angles covered', () => {
    expect(AdHookOutput.safeParse({ ...aiOut, anglesCovered: ['a', 'b', 'c', 'd'] }).success).toBe(
      false
    )
  })
})

describe('ad-hook-generator pipeline', () => {
  it('produces 20 hooks and forces the channel from input', async () => {
    const events: RunEvent[] = []
    const out = await adHookPipeline({
      input: { product: 'an eco water bottle', channel: 'google', audience: 'dtc' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(AdHookOutput.safeParse(out).success).toBe(true)
    expect(out.hooks).toHaveLength(20)
    expect(out.channel).toBe('google') // input, not the AI's 'tiktok'
    expect(events.length).toBeGreaterThan(0)
  })
})
