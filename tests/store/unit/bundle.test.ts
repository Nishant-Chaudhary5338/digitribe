import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { buildFileBundle, safeZipPath } from '../../../lib/store/bundle'

describe('safeZipPath', () => {
  it('strips leading slashes and traversal segments', () => {
    expect(safeZipPath('/llms.txt')).toBe('llms.txt')
    expect(safeZipPath('../../etc/passwd')).toBe('etc/passwd')
    expect(safeZipPath('a/./b/../c')).toBe('a/b/c')
    expect(safeZipPath('.well-known/mcp.json')).toBe('.well-known/mcp.json')
  })
})

describe('buildFileBundle', () => {
  it('packs files (and an optional README) into a readable zip', async () => {
    const buf = await buildFileBundle(
      [
        { path: 'llms.txt', contents: '# Acme' },
        { path: '.well-known/mcp.json', contents: '{"tools":[]}' },
      ],
      'How to use this bundle'
    )
    const zip = await JSZip.loadAsync(buf)
    expect(await zip.file('llms.txt')?.async('string')).toBe('# Acme')
    expect(await zip.file('.well-known/mcp.json')?.async('string')).toBe('{"tools":[]}')
    expect(await zip.file('README.md')?.async('string')).toBe('How to use this bundle')
  })

  it('never writes a traversal path into the zip', async () => {
    const zip = await JSZip.loadAsync(
      await buildFileBundle([{ path: '../../evil.sh', contents: 'x' }])
    )
    expect(zip.file('../../evil.sh')).toBeNull()
    expect(zip.file('evil.sh')).not.toBeNull()
  })
})
