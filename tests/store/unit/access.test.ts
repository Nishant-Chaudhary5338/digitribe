import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@vercel/kv', async () => ({ kv: (await import('../helpers/mock-vercel-kv')).kv }))

import { __resetKv } from '../helpers/mock-vercel-kv'
import {
  mintToken,
  verifyToken,
  decrementQuota,
  tokenJti,
  revokeToken,
} from '../../../lib/store/access'

const NOW = 1_700_000_000
const fields = { purchaseId: 'p1', slug: 'hello-store', email: 'a@b.co' }

function jtiOf(token: string): string {
  return JSON.parse(Buffer.from(token.split('.')[0]!, 'base64url').toString('utf8')).jti as string
}

beforeEach(() => __resetKv())

describe('access tokens', () => {
  it('mints and verifies a valid token', async () => {
    const token = await mintToken(fields, 3, NOW)
    const v = await verifyToken(token, NOW + 10)
    expect(v.ok).toBe(true)
    if (v.ok) {
      expect(v.payload.slug).toBe('hello-store')
      expect(v.payload.email).toBe('a@b.co')
      expect(v.runsRemaining).toBe(3)
    }
  })

  it('rejects a tampered signature', async () => {
    const token = await mintToken(fields, 1, NOW)
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa')
    expect(await verifyToken(tampered, NOW + 10)).toEqual({ ok: false, reason: 'invalid' })
  })

  it('reports expired after exp', async () => {
    const token = await mintToken(fields, 1, NOW)
    expect(await verifyToken(token, NOW + 31 * 24 * 3600)).toEqual({ ok: false, reason: 'expired' })
  })

  it('reports exhausted once the quota is spent', async () => {
    const token = await mintToken(fields, 1, NOW)
    await decrementQuota(jtiOf(token))
    expect(await verifyToken(token, NOW + 10)).toEqual({ ok: false, reason: 'exhausted' })
  })

  it('reports invalid (not expired) for a revoked token', async () => {
    const token = await mintToken(fields, 1, NOW)
    await revokeToken(jtiOf(token))
    expect(await verifyToken(token, NOW + 10)).toEqual({ ok: false, reason: 'invalid' })
  })

  it('tokenJti decodes the jti, and returns null for garbage', async () => {
    const token = await mintToken(fields, 1, NOW)
    expect(tokenJti(token)).toBe(jtiOf(token))
    expect(tokenJti('not-a-token')).toBeNull()
    expect(tokenJti('')).toBeNull()
  })
})
