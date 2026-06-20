import { describe, it, expect } from 'vitest'
import { regressionGuardPipeline } from '../../../server/store/tools/regression-guard'
import {
  RegressionGuardInput,
  RegressionGuardOutput,
} from '../../../server/store/schemas/regression-guard'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  summary: 'guards 2 invariants',
  coveredInvariants: ['always JSON', 'never reveals system prompt'],
  files: [{ path: 'guard.test.ts', language: 'typescript', contents: 'test()' }],
}

describe('regression-guard', () => {
  it('requires at least one invariant in the input', () => {
    expect(RegressionGuardInput.safeParse({ prompt: 'p', invariants: [] }).success).toBe(false)
  })
  it('requires at least one generated file', () => {
    expect(RegressionGuardOutput.safeParse({ ...aiOut, files: [] }).success).toBe(false)
  })
  it('pipeline produces a guard', async () => {
    const events: RunEvent[] = []
    const out = await regressionGuardPipeline({
      input: { prompt: 'always answer in JSON', invariants: ['output is valid JSON'] },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(RegressionGuardOutput.safeParse(out).success).toBe(true)
    expect(out.files.length).toBeGreaterThanOrEqual(1)
    expect(events.length).toBeGreaterThan(0)
  })
})
