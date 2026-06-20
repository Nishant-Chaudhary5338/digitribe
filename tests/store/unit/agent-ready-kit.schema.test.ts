import { describe, it, expect } from 'vitest'
import {
  AgentReadyInput,
  AgentReadyOutput,
  DIMENSION_KEYS,
  gradeFor,
} from '../../../server/store/schemas/agent-ready-kit'

const dim = (key: (typeof DIMENSION_KEYS)[number]) => ({
  key,
  label: 'Label',
  score: 50,
  status: 'partial' as const,
  findings: ['f'],
  fixes: ['x'],
})

const validOutput = {
  site: {
    url: 'https://x.com',
    title: 'X',
    summary: 's',
    pagesCrawled: 5,
    isCommerce: false,
    detectedEntities: ['a'],
  },
  overallScore: 72,
  grade: 'B' as const,
  dimensions: DIMENSION_KEYS.map(dim),
  files: [
    { path: 'llms.txt', language: 'markdown' as const, contents: '# X', rationale: 'r' },
    { path: 'agents.md', language: 'markdown' as const, contents: '# X', rationale: 'r' },
    { path: 'schema.json', language: 'json' as const, contents: '{}', rationale: 'r' },
  ],
  topActions: ['a', 'b', 'c'],
  upsell: { needsTransactionLayer: true, reason: 'no mcp endpoint' },
}

describe('agent-ready-kit schema', () => {
  it('accepts a valid Output Contract', () => {
    expect(AgentReadyOutput.safeParse(validOutput).success).toBe(true)
  })

  it('requires exactly 5 dimensions', () => {
    expect(
      AgentReadyOutput.safeParse({
        ...validOutput,
        dimensions: DIMENSION_KEYS.slice(0, 4).map(dim),
      }).success
    ).toBe(false)
  })

  it('rejects an out-of-range overall score', () => {
    expect(AgentReadyOutput.safeParse({ ...validOutput, overallScore: 120 }).success).toBe(false)
  })

  it('requires at least 3 generated files', () => {
    expect(
      AgentReadyOutput.safeParse({ ...validOutput, files: validOutput.files.slice(0, 2) }).success
    ).toBe(false)
  })

  it('input defaults maxPages to 20 and rejects a bad url', () => {
    expect(AgentReadyInput.parse({ url: 'https://x.com' }).maxPages).toBe(20)
    expect(AgentReadyInput.safeParse({ url: 'not-a-url' }).success).toBe(false)
  })

  it('gradeFor maps scores to bands', () => {
    expect(gradeFor(95)).toBe('A')
    expect(gradeFor(80)).toBe('B')
    expect(gradeFor(65)).toBe('C')
    expect(gradeFor(45)).toBe('D')
    expect(gradeFor(10)).toBe('F')
  })
})
