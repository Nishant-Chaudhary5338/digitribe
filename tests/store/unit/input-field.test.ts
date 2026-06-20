import { describe, it, expect } from 'vitest'
import { primaryInputField, inputFields } from '../../../lib/store/input-field'
import { AgentReadyInput } from '../../../server/store/schemas/agent-ready-kit'
import { ScanMcpInput } from '../../../server/store/schemas/scan-my-mcp'
import { DtcEmailInput } from '../../../server/store/schemas/dtc-email-flows'

describe('primaryInputField', () => {
  it('detects a url field as url-typed', () => {
    const f = primaryInputField(AgentReadyInput)
    expect(f.key).toBe('url')
    expect(f.type).toBe('url')
    expect(f.required).toBe(true)
  })

  it('detects the config field for scan-my-mcp as text', () => {
    expect(primaryInputField(ScanMcpInput).key).toBe('config')
  })

  it('falls back for a non-object schema', () => {
    expect(primaryInputField('nope')).toEqual({
      key: 'input',
      label: 'Input',
      type: 'text',
      required: true,
    })
  })
})

describe('inputFields', () => {
  it('marks defaulted/optional fields as not required, required first', () => {
    const fields = inputFields(AgentReadyInput)
    const url = fields.find((f) => f.key === 'url')
    const maxPages = fields.find((f) => f.key === 'maxPages')
    const ctx = fields.find((f) => f.key === 'businessContext')
    expect(url?.required).toBe(true)
    expect(maxPages?.required).toBe(false) // has a default
    expect(ctx?.required).toBe(false) // optional
    expect(fields[0]?.required).toBe(true) // required sorted first
  })

  it('returns multiple required fields for a multi-field product', () => {
    const fields = inputFields(DtcEmailInput)
    const required = fields
      .filter((f) => f.required)
      .map((f) => f.key)
      .sort()
    expect(required).toEqual(['brand', 'product'])
  })
})
