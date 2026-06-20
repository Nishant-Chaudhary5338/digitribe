/**
 * SSRF guard for the Segment-1 crawl spine. Canonical: platform-spec §10,
 * agent-ready-kit §15. Blocks private/loopback/link-local/metadata targets and
 * non-http(s) schemes BEFORE any fetch. Resolved IPs are re-checked at fetch time.
 */
import { storeError } from '../../../../lib/store/errors'

/** True if an IP literal is private, loopback, link-local, CGNAT, or metadata. */
export function isBlockedIp(ip: string): boolean {
  const v = ip.replace(/^\[|\]$/g, '').toLowerCase()
  if (v === '::1' || v === '::' || v === '0.0.0.0') return true
  if (/^f[cd][0-9a-f]{2}:/.test(v)) return true // fc00::/7 unique-local
  if (/^fe80:/.test(v)) return true // link-local
  const m = v.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false // not an IPv4 literal
  const a = Number(m[1])
  const b = Number(m[2])
  if (a === 127 || a === 0 || a === 10) return true
  if (a === 169 && b === 254) return true // link-local incl. 169.254.169.254 metadata
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT 100.64.0.0/10
  return false
}

/** Parse + validate a target URL. Throws StoreErr (INPUT_INVALID/INPUT_BLOCKED) if unsafe. */
export function assertPublicUrl(rawUrl: string): URL {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw storeError('INPUT_INVALID', 'Enter a valid website URL.')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw storeError('INPUT_BLOCKED', 'Only public http(s) websites can be processed.')

  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || isBlockedIp(host))
    throw storeError(
      'INPUT_BLOCKED',
      'For security we can only process public addresses — that one looks private or internal.'
    )
  return url
}
