import { describe, it, expect } from 'vitest'
import { primaryInputField } from '../../../lib/store/input-field'
import { AgentReadyInput } from '../../../server/store/schemas/agent-ready-kit'
import { ScanMcpInput } from '../../../server/store/schemas/scan-my-mcp'
import { AdHookInput } from '../../../server/store/schemas/ad-hook-generator'

describe('primaryInputField', () => {
  it('detects a url field as url-typed', () => {
    const f = primaryInputField(AgentReadyInput)
    expect(f.key).toBe('url')
    expect(f.type).toBe('url')
    expect(f.label).toBe('Url')
  })

  it('detects the config field for scan-my-mcp as text', () => {
    const f = primaryInputField(ScanMcpInput)
    expect(f.key).toBe('config')
    expect(f.type).toBe('text')
  })

  it('humanizes the field label', () => {
    expect(primaryInputField(AdHookInput).key).toBe('product')
  })

  it('falls back for a non-object schema', () => {
    expect(primaryInputField('nope')).toEqual({ key: 'input', label: 'Input', type: 'text' })
  })
})
