import { describe, it, expect } from 'vitest'
import { assertPublicUrl, isBlockedIp } from '../../../server/store/tools/agentic/ssrf'
import { StoreErr } from '../../../lib/store/errors'

describe('ssrf guard', () => {
  it('allows public http(s) URLs and returns the parsed URL', () => {
    expect(assertPublicUrl('https://example.com/page').hostname).toBe('example.com')
    expect(assertPublicUrl('http://acme.io').hostname).toBe('acme.io')
    expect(() => assertPublicUrl('http://93.184.216.34')).not.toThrow()
  })

  it('blocks non-http(s) schemes', () => {
    for (const u of ['file:///etc/passwd', 'ftp://x.com', 'gopher://x', 'data:text/html,x'])
      expect(() => assertPublicUrl(u)).toThrow(StoreErr)
  })

  it('blocks localhost and loopback', () => {
    for (const u of [
      'http://localhost',
      'http://localhost:3000',
      'http://127.0.0.1',
      'http://127.1.2.3',
      'http://[::1]',
      'http://0.0.0.0',
    ])
      expect(() => assertPublicUrl(u)).toThrow()
  })

  it('blocks private ranges, CGNAT, and link-local/metadata', () => {
    for (const u of [
      'http://10.0.0.5',
      'http://192.168.1.1',
      'http://172.16.0.1',
      'http://172.31.255.255',
      'http://169.254.169.254',
      'http://100.64.1.1',
    ])
      expect(() => assertPublicUrl(u)).toThrow()
  })

  it('rejects unparseable input', () => {
    expect(() => assertPublicUrl('not a url')).toThrow()
  })

  it('isBlockedIp flags private + metadata, allows public', () => {
    for (const ip of [
      '127.0.0.1',
      '169.254.169.254',
      '10.1.2.3',
      '192.168.0.1',
      '172.20.5.5',
      '::1',
      'fe80::1',
    ])
      expect(isBlockedIp(ip)).toBe(true)
    for (const ip of ['8.8.8.8', '93.184.216.34', '1.1.1.1']) expect(isBlockedIp(ip)).toBe(false)
  })
})
