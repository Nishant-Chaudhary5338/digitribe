import { describe, it, expect } from 'vitest'
import { gradeAgentPipeline } from '../../../server/store/tools/grade-my-agent'
import {
  GradeAgentOutput,
  AGENT_DIMENSION_KEYS,
} from '../../../server/store/schemas/grade-my-agent'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  overallScore: 72,
  grade: 'F',
  dimensions: AGENT_DIMENSION_KEYS.map((key) => ({
    key,
    label: 'L',
    score: 70,
    status: 'okay',
    findings: ['f'],
    recommendations: ['r'],
  })),
  failureModes: [{ mode: 'loops', likelihood: 'medium', mitigation: 'cap steps' }],
  topActions: ['a', 'b', 'c'],
}

describe('grade-my-agent', () => {
  it('requires exactly 4 dimensions', () => {
    expect(
      GradeAgentOutput.safeParse({ ...aiOut, dimensions: aiOut.dimensions.slice(0, 3) }).success
    ).toBe(false)
  })
  it('pipeline forces grade from the overall score', async () => {
    const events: RunEvent[] = []
    const out = await gradeAgentPipeline({
      input: { description: 'a research agent' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(GradeAgentOutput.safeParse(out).success).toBe(true)
    expect(out.grade).toBe('C') // letterGrade(72), not the AI's 'F'
    expect(events.length).toBeGreaterThan(0)
  })
})
