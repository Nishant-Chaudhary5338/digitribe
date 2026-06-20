import { describe, it, expect } from 'vitest'
import { toolPermissionPipeline } from '../../../server/store/tools/tool-permission-auditor'
import { ToolPermissionOutput } from '../../../server/store/schemas/tool-permission-auditor'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  score: 45,
  grade: 'A',
  summary: 'two over-broad tools',
  flags: [
    {
      tool: 'fs',
      currentScope: '**',
      risk: 'high',
      recommendedScope: './data/**',
      reason: 'too broad',
    },
  ],
}

describe('tool-permission-auditor', () => {
  it('rejects an out-of-range score', () => {
    expect(ToolPermissionOutput.safeParse({ ...aiOut, score: 150 }).success).toBe(false)
  })
  it('pipeline forces grade from score', async () => {
    const events: RunEvent[] = []
    const out = await toolPermissionPipeline({
      input: { config: '{"tools":[{"name":"fs","scope":"**"}]}' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(ToolPermissionOutput.safeParse(out).success).toBe(true)
    expect(out.grade).toBe('D') // letterGrade(45), not the AI's 'A'
    expect(events.length).toBeGreaterThan(0)
  })
})
