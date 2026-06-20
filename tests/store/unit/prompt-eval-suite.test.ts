import { describe, it, expect } from 'vitest'
import { promptEvalPipeline } from '../../../server/store/tools/prompt-eval-suite'
import { PromptEvalInput, PromptEvalOutput } from '../../../server/store/schemas/prompt-eval-suite'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const cases = Array.from({ length: 5 }, (_, i) => ({
  name: `c${i}`,
  input: `in${i}`,
  assertions: ['a'],
}))
const aiOut = {
  summary: 'covers happy + adversarial',
  cases,
  files: [{ path: 'eval.test.ts', language: 'typescript', contents: 'test()' }],
}

describe('prompt-eval-suite', () => {
  it('input defaults framework to vitest', () => {
    expect(PromptEvalInput.parse({ prompt: 'do x' }).framework).toBe('vitest')
  })
  it('requires at least 5 cases and 1 file', () => {
    expect(PromptEvalOutput.safeParse({ ...aiOut, cases: cases.slice(0, 4) }).success).toBe(false)
    expect(PromptEvalOutput.safeParse({ ...aiOut, files: [] }).success).toBe(false)
  })
  it('pipeline produces a valid suite', async () => {
    const events: RunEvent[] = []
    const out = await promptEvalPipeline({
      input: { prompt: 'summarize the text', framework: 'vitest' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(PromptEvalOutput.safeParse(out).success).toBe(true)
    expect(out.cases.length).toBeGreaterThanOrEqual(5)
    expect(out.files.length).toBeGreaterThanOrEqual(1)
    expect(events.length).toBeGreaterThan(0)
  })
})
