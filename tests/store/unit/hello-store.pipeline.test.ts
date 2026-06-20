import { describe, it, expect } from 'vitest'
import { helloStorePipeline } from '../../../server/store/tools/hello-store'
import { HelloStoreOutput } from '../../../server/store/schemas/hello-store'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

function ctx(aiResponse: unknown) {
  const events: RunEvent[] = []
  return {
    input: { text: 'make me sound senior' },
    ai: mockAi({ structured: aiResponse }),
    emit: (e: RunEvent) => events.push(e),
    signal: new AbortController().signal,
    events,
  }
}

describe('hello-store pipeline', () => {
  it('produces a schema-valid Output Contract and streams progress', async () => {
    const c = ctx({
      original: 'make me sound senior',
      restyled: 'Crafted with intent.',
      tone: 'casual',
      wordCount: 4,
    })
    const out = await helloStorePipeline(c)
    expect(HelloStoreOutput.safeParse(out).success).toBe(true)
    expect(out.restyled).toBe('Crafted with intent.')
    expect(c.events.length).toBeGreaterThan(0)
    expect(c.events.every((e) => e.pct >= 0 && e.pct <= 100)).toBe(true)
  })

  it('rejects an AI response that violates the Output Contract', async () => {
    const c = ctx({ restyled: 123, tone: 'x' }) // wrong shape / missing fields
    await expect(helloStorePipeline(c)).rejects.toThrow()
  })
})
