import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const h = vi.hoisted(() => ({
  getProduct: vi.fn((slug: string) =>
    slug === 'p' ? { slug: 'p', polarProductId: 'pp' } : undefined
  ),
  createCheckout: vi.fn(async () => 'https://checkout.test/x'),
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 19 })),
}))

vi.mock('../../../lib/store/products', () => ({ getProduct: h.getProduct }))
vi.mock('../../../lib/store/polar', () => ({ createCheckout: h.createCheckout }))
vi.mock('../../../lib/store/kv', () => ({ rateLimit: h.rateLimit }))

import { POST } from '../../../app/api/store/checkout/route'

const req = (body: unknown): NextRequest =>
  ({ headers: { get: () => '1.1.1.1' }, json: async () => body }) as unknown as NextRequest

beforeEach(() => vi.clearAllMocks())

describe('POST /api/store/checkout', () => {
  it('returns a checkout url for a known product', async () => {
    const res = await POST(req({ slug: 'p' }))
    expect(res.status).toBe(200)
    expect((await res.json()).checkoutUrl).toBe('https://checkout.test/x')
  })

  it('maps an unknown product to 422 INPUT_INVALID (detail stripped)', async () => {
    const res = await POST(req({ slug: 'nope' }))
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error.code).toBe('INPUT_INVALID')
    expect(body.error).not.toHaveProperty('detail')
  })

  it('enforces the per-IP rate limit (429)', async () => {
    h.rateLimit.mockResolvedValueOnce({ allowed: false, remaining: 0 })
    const res = await POST(req({ slug: 'p' }))
    expect(res.status).toBe(429)
    expect((await res.json()).error.code).toBe('RATE_LIMITED')
    expect(h.createCheckout).not.toHaveBeenCalled()
  })
})
