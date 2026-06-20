import { describe, it, expect } from 'vitest'
import { scanMcpPipeline } from '../../../server/store/tools/scan-my-mcp'
import { ScanMcpOutput } from '../../../server/store/schemas/scan-my-mcp'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  postureScore: 55,
  grade: 'A',
  toolsFound: ['read_file', 'run_shell'],
  findings: [
    {
      threatClass: 'over_privilege',
      severity: 'high',
      title: 'shell tool',
      evidence: 'run_shell',
      fix: 'remove it',
      confidence: 'high',
    },
  ],
  topActions: ['a', 'b', 'c'],
}

describe('scan-my-mcp', () => {
  it('rejects an out-of-taxonomy threat class', () => {
    const bad = { ...aiOut, findings: [{ ...aiOut.findings[0], threatClass: 'made_up' }] }
    expect(ScanMcpOutput.safeParse(bad).success).toBe(false)
  })
  it('pipeline forces grade from posture score', async () => {
    const events: RunEvent[] = []
    const out = await scanMcpPipeline({
      input: { config: '{"tools":["run_shell"]}' },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(ScanMcpOutput.safeParse(out).success).toBe(true)
    expect(out.grade).toBe('D') // letterGrade(55), not the AI's 'A'
    expect(events.length).toBeGreaterThan(0)
  })
})
