/**
 * File-bundle ZIP builder for products that emit generated files (e.g. Agent-Ready
 * Kit). Canonical: contracts §8. Paths are sanitized against zip-slip.
 */
import JSZip from 'jszip'

export interface BundleFile {
  path: string
  contents: string
}

/** Strip leading slashes and any `..` segments so an entry can't escape the zip. */
export function safeZipPath(p: string): string {
  return p
    .replace(/^\/+/, '')
    .split('/')
    .filter((seg) => seg !== '' && seg !== '.' && seg !== '..')
    .join('/')
}

export async function buildFileBundle(files: BundleFile[], readme?: string): Promise<Buffer> {
  const zip = new JSZip()
  for (const f of files) {
    const path = safeZipPath(f.path)
    if (path) zip.file(path, f.contents)
  }
  if (readme) zip.file('README.md', readme)
  return zip.generateAsync({ type: 'nodebuffer' })
}
