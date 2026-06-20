import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const h = vi.hoisted(() => ({
  validateLicense: vi.fn(async () => ({ valid: true, activationsRemaining: 2 }) as unknown),
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 19 })),
}))
vi.mock('../../../lib/store/license', () => ({ validateLicense: h.validateLicense }))
vi.mock('../../../lib/store/kv', () => ({ rateLimit: h.rateLimit }))

import { POST } from '../../../app/api/store/license/validate/route'

const req = (body: unknown): NextRequest =>
  ({ headers: { get: () => '1.1.1.1' }, json: async () => body }) as unknown as NextRequest
const valid = { licenseKey: 'DGT-X', deviceId: 'd1', slug: 'codebase-health-report' }

beforeEach(() => vi.clearAllMocks())

describe('POST /api/store/license/validate', () => {
  it('returns valid + remaining activations', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ valid: true, activationsRemaining: 2 })
  })

  it('maps an exhausted license to 403 LICENSE_EXHAUSTED', async () => {
    h.validateLicense.mockResolvedValueOnce({ valid: false, reason: 'exhausted' })
    const res = await POST(req(valid))
    expect(res.status).toBe(403)
    expect((await res.json()).error.code).toBe('LICENSE_EXHAUSTED')
  })

  it('maps an unknown/revoked license to 403 LICENSE_INVALID', async () => {
    h.validateLicense.mockResolvedValueOnce({ valid: false, reason: 'invalid' })
    const res = await POST(req(valid))
    expect(res.status).toBe(403)
    expect((await res.json()).error.code).toBe('LICENSE_INVALID')
  })

  it('422 on a malformed body', async () => {
    expect((await POST(req({ licenseKey: 'x' }))).status).toBe(422)
  })
})
