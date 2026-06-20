import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const h = vi.hoisted(() => ({
  verifyToken: vi.fn(async () => ({ ok: true, payload: { jti: 'j1' } })),
  getRun: vi.fn(async () => ({
    runId: 'r',
    slug: 'agent-ready-kit',
    status: 'success',
    ownerJti: 'j1',
    artifactUrl: '/a',
    finishedAt: 1,
  })),
  kvGet: vi.fn(async () => ({ grade: 'B', files: [{ path: 'llms.txt', contents: '# X' }] })),
}))

vi.mock('../../../lib/store/access', () => ({ verifyToken: h.verifyToken }))
vi.mock('../../../lib/store/kv', () => ({ getRun: h.getRun }))
vi.mock('@vercel/kv', () => ({ kv: { get: h.kvGet } }))

import { GET } from '../../../app/api/store/artifact/[runId]/route'

const req = (qs: string): NextRequest =>
  ({
    nextUrl: { searchParams: new URLSearchParams(qs) },
    headers: { get: () => null },
  }) as unknown as NextRequest
const ctx = (runId = 'r') => ({ params: Promise.resolve({ runId }) })

beforeEach(() => vi.clearAllMocks())

describe('GET /api/store/artifact/[runId]', () => {
  it('rejects a missing token with 403', async () => {
    const res = await GET(req(''), ctx())
    expect(res.status).toBe(403)
    expect((await res.json()).error.code).toBe('TOKEN_INVALID')
  })

  it('rejects a token whose jti does not own the run (403)', async () => {
    h.getRun.mockResolvedValueOnce({
      runId: 'r',
      slug: 'p',
      status: 'success',
      ownerJti: 'someone-else',
      artifactUrl: '/a',
      finishedAt: 1,
    })
    const res = await GET(req('token=t'), ctx())
    expect(res.status).toBe(403)
  })

  it('returns the artifact JSON for the owning token', async () => {
    const res = await GET(req('token=t'), ctx())
    expect(res.status).toBe(200)
    expect((await res.json()).grade).toBe('B')
  })

  it('serves a zip when fmt=zip and the artifact has files', async () => {
    const res = await GET(req('token=t&fmt=zip'), ctx())
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/zip')
  })
})
