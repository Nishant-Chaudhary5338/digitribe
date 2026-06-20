import { describe, it, expect } from 'vitest'
import { dtcEmailPipeline } from '../../../server/store/tools/dtc-email-flows'
import { DtcEmailOutput } from '../../../server/store/schemas/dtc-email-flows'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const email = (h: number) => ({ subject: 's', preview: 'p', delayHours: h, goal: 'g', body: 'b' })
const aiOut = {
  sequences: [
    { name: 'welcome', emails: [email(0), email(24)] },
    { name: 'abandoned_cart', emails: [email(1), email(24)] },
  ],
  subjectLineBank: ['a', 'b', 'c', 'd', 'e'],
}

describe('dtc-email-flows', () => {
  it('requires exactly 2 sequences and a subject-line bank of >=5', () => {
    expect(DtcEmailOutput.safeParse({ ...aiOut, sequences: [aiOut.sequences[0]] }).success).toBe(
      false
    )
    expect(DtcEmailOutput.safeParse({ ...aiOut, subjectLineBank: ['a'] }).success).toBe(false)
  })
  it('pipeline produces both sequences', async () => {
    const events: RunEvent[] = []
    const out = await dtcEmailPipeline({
      input: { brand: 'Acme', product: 'bottles' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(DtcEmailOutput.safeParse(out).success).toBe(true)
    expect(out.sequences.map((s) => s.name).sort()).toEqual(['abandoned_cart', 'welcome'])
    expect(events.length).toBeGreaterThan(0)
  })
})
