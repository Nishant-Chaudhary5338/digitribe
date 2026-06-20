import { describe, it, expect } from 'vitest'
import { agentInjectionPipeline } from '../../../server/store/tools/agent-injection-suite'
import {
  AgentInjectionOutput,
  INJECTION_CATEGORIES,
} from '../../../server/store/schemas/agent-injection-suite'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const cases = INJECTION_CATEGORIES.map((category, i) => ({
  category,
  name: `c${i}`,
  attack: 'ignore prior',
  expectedSafe: 'refuses',
}))
const aiOut = {
  summary: 'covers 7 categories',
  cases,
  files: [{ path: 'injection.test.ts', language: 'typescript', contents: 'test()' }],
}

describe('agent-injection-suite', () => {
  it('requires at least 7 cases and 1 file', () => {
    expect(AgentInjectionOutput.safeParse({ ...aiOut, cases: cases.slice(0, 6) }).success).toBe(
      false
    )
    expect(AgentInjectionOutput.safeParse({ ...aiOut, files: [] }).success).toBe(false)
  })
  it('pipeline produces a corpus', async () => {
    const events: RunEvent[] = []
    const out = await agentInjectionPipeline({
      input: { agent: 'a customer-support agent with a refund tool', framework: 'vitest' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(AgentInjectionOutput.safeParse(out).success).toBe(true)
    expect(out.cases.length).toBeGreaterThanOrEqual(7)
    expect(events.length).toBeGreaterThan(0)
  })
})
