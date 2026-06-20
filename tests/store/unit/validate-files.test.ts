import { describe, it, expect } from 'vitest'
import { validateFiles, filesOf } from '../../../lib/store/validate-files'

describe('validateFiles', () => {
  it('passes valid JSON + non-JSON files', () => {
    expect(
      validateFiles([
        { path: 'a.json', language: 'json', contents: '{"x":1}' },
        { path: 'b.ts', language: 'typescript', contents: 'export const x = 1' },
      ]).ok
    ).toBe(true)
  })

  it('accepts JSONL (one object per line)', () => {
    expect(
      validateFiles([{ path: 'd.jsonl', language: 'json', contents: '{"a":1}\n{"a":2}' }]).ok
    ).toBe(true)
  })

  it('flags invalid JSON', () => {
    const r = validateFiles([{ path: 'a.json', language: 'json', contents: '{not json' }])
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.path).toBe('a.json')
  })

  it('flags empty files', () => {
    expect(validateFiles([{ path: 'a.ts', contents: '   ' }]).ok).toBe(false)
  })
})

describe('filesOf', () => {
  it('extracts a files array, else []', () => {
    expect(filesOf({ files: [{ path: 'a', contents: 'b' }] })).toHaveLength(1)
    expect(filesOf({})).toEqual([])
    expect(filesOf(null)).toEqual([])
  })
})
