import { describe, it, expect } from 'vitest'
import { mcpHardeningPipeline } from '../../../server/store/tools/mcp-hardening-kit'
import { McpHardeningOutput } from '../../../server/store/schemas/mcp-hardening-kit'
import { mockAi } from '../helpers/mock-ai'
import type { RunEvent } from '../../../lib/store/types'

const aiOut = {
  summary: 'adds auth + scope middleware',
  files: [
    { path: 'middleware/auth.ts', language: 'typescript', contents: 'export const auth = …' },
  ],
  scopeChanges: [{ tool: 'read_file', from: '**', to: './data/**', reason: 'least privilege' }],
  checklist: ['enable auth', 'scope tools', 'sanitize inputs'],
}

describe('mcp-hardening-kit', () => {
  it('requires at least one file and a 3+ item checklist', () => {
    expect(McpHardeningOutput.safeParse({ ...aiOut, files: [] }).success).toBe(false)
    expect(McpHardeningOutput.safeParse({ ...aiOut, checklist: ['x'] }).success).toBe(false)
  })
  it('pipeline produces a hardening kit', async () => {
    const events: RunEvent[] = []
    const out = await mcpHardeningPipeline({
      input: {
        framework: '@modelcontextprotocol/sdk',
        description: 'has a read_file tool with ** scope',
      },
      ai: mockAi({ structured: aiOut }),
      emit: (e) => events.push(e),
      signal: new AbortController().signal,
    })
    expect(McpHardeningOutput.safeParse(out).success).toBe(true)
    expect(out.files.length).toBeGreaterThanOrEqual(1)
    expect(events.length).toBeGreaterThan(0)
  })
})
