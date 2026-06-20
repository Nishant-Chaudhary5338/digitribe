import { describe, it, expect } from 'vitest'
import { goldenDatasetPipeline } from '../../../server/store/tools/golden-dataset-generator'
import {
  GoldenDatasetInput,
  GoldenDatasetOutput,
} from '../../../server/store/schemas/golden-dataset-generator'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const rows = Array.from({ length: 5 }, (_, i) => ({
  input: `i${i}`,
  expectedOutput: `o${i}`,
  confidence: 'high' as const,
}))
const aiOut = {
  task: 'classify sentiment',
  rows,
  howToUse: 'run it',
  files: [{ path: 'golden.jsonl', language: 'json', contents: '{}' }],
}

describe('golden-dataset-generator', () => {
  it('input defaults rowCount to 30 and caps at 100', () => {
    expect(GoldenDatasetInput.parse({ task: 't' }).rowCount).toBe(30)
    expect(GoldenDatasetInput.safeParse({ task: 't', rowCount: 200 }).success).toBe(false)
  })
  it('requires at least 5 rows and 1 file', () => {
    expect(GoldenDatasetOutput.safeParse({ ...aiOut, rows: rows.slice(0, 4) }).success).toBe(false)
    expect(GoldenDatasetOutput.safeParse({ ...aiOut, files: [] }).success).toBe(false)
  })
  it('pipeline produces a valid dataset', async () => {
    const events: RunEvent[] = []
    const out = await goldenDatasetPipeline({
      input: { task: 'classify sentiment', rowCount: 30 },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(GoldenDatasetOutput.safeParse(out).success).toBe(true)
    expect(events.length).toBeGreaterThan(0)
  })
})
