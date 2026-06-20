import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const h = vi.hoisted(() => ({
  validateKey: vi.fn(async () => true),
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 19 })),
}))
vi.mock('../../../lib/store/ai', () => ({ validateKey: h.validateKey }))
vi.mock('../../../lib/store/kv', () => ({ rateLimit: h.rateLimit }))

import { POST } from '../../../app/api/store/key-check/route'

const req = (body: unknown): NextRequest =>
  ({ headers: { get: () => '1.1.1.1' }, json: async () => body }) as unknown as NextRequest

beforeEach(() => vi.clearAllMocks())

describe('POST /api/store/key-check', () => {
  it('returns { valid: true } for a working key', async () => {
    const res = await POST(req({ provider: 'anthropic', apiKey: 'k', model: 'claude-opus-4-8' }))
    expect(res.status).toBe(200)
    expect((await res.json()).valid).toBe(true)
  })

  it('returns { valid: false } for a bad key (no quota spent)', async () => {
    h.validateKey.mockResolvedValueOnce(false)
    expect((await (await POST(req({ provider: 'anthropic', apiKey: 'bad' }))).json()).valid).toBe(
      false
    )
  })

  it('422 on a malformed body', async () => {
    const res = await POST(req({ provider: 'anthropic' }))
    expect(res.status).toBe(422)
  })

  it('429 when rate limited', async () => {
    h.rateLimit.mockResolvedValueOnce({ allowed: false, remaining: 0 })
    const res = await POST(req({ provider: 'anthropic', apiKey: 'k' }))
    expect(res.status).toBe(429)
    expect(h.validateKey).not.toHaveBeenCalled()
  })
})
