import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { storeError } from '../../../lib/store/errors'

// Spies must be hoisted so the vi.mock factories can reference them.
const h = vi.hoisted(() => ({
  decrementQuota: vi.fn(async () => 2),
  setRun: vi.fn(async () => {}),
  getRun: vi.fn(async (): Promise<unknown> => null),
  acquireRunLock: vi.fn(async () => true),
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 9 })),
  ping: vi.fn(async () => {}),
  kvSet: vi.fn(async () => 'OK'),
  pipeline: vi.fn(async (ctx: { emit: (e: unknown) => void }) => {
    ctx.emit({ phase: 'generate', pct: 50, message: 'x' })
    return { ok: true }
  }),
}))

vi.mock('@vercel/kv', () => ({ kv: { set: h.kvSet } }))
vi.mock('../../../lib/store/access', () => ({
  verifyToken: async () => ({
    ok: true,
    payload: { jti: 'j1', slug: 'p', email: 'e@x.co', purchaseId: 'pu', iat: 0, exp: 9 },
    runsRemaining: 3,
  }),
  decrementQuota: h.decrementQuota,
}))
vi.mock('../../../lib/store/kv', () => ({
  acquireRunLock: h.acquireRunLock,
  setRun: h.setRun,
  getRun: h.getRun,
  rateLimit: h.rateLimit,
}))
vi.mock('../../../lib/store/email', () => ({ sendArtifactReady: async () => {} }))
vi.mock('../../../lib/store/env', () => ({
  storeEnv: () => ({ STORE_BASE_URL: 'https://s.test' }),
}))
vi.mock('../../../lib/store/ai', () => ({
  makeAiRunner: () => ({
    ping: h.ping,
    structured: async () => ({}),
    structuredStream: async () => ({}),
  }),
}))
vi.mock('../../../lib/store/products', () => ({
  getProduct: (slug: string) =>
    slug === 'p'
      ? {
          slug: 'p',
          name: 'P',
          byokProviders: ['anthropic'],
          defaultModel: { anthropic: 'claude-opus-4-8' },
          estRunSeconds: 10,
          inputSchema: async () => z.object({ text: z.string() }),
          pipeline: async () => h.pipeline,
        }
      : undefined,
}))

import { runProduct } from '../../../lib/store/runner'

async function drain(res: Response): Promise<string> {
  const reader = res.body!.getReader()
  const dec = new TextDecoder()
  let out = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out += dec.decode(value, { stream: true })
  }
  return out
}

const baseReq = {
  slug: 'p',
  token: 't',
  byokKey: 'k',
  provider: 'anthropic' as const,
  input: { text: 'hi' },
  ip: '1.1.1.1',
}

beforeEach(() => vi.clearAllMocks())

describe('runProduct finalize order', () => {
  it('on success: spends quota exactly once, AFTER persisting the result', async () => {
    const out = await drain(runProduct(baseReq))
    expect(out).toContain('"phase":"done"')
    expect(h.setRun).toHaveBeenCalledTimes(1)
    expect(h.decrementQuota).toHaveBeenCalledTimes(1)
    expect(h.setRun.mock.invocationCallOrder[0]!).toBeLessThan(
      h.decrementQuota.mock.invocationCallOrder[0]!
    )
  })

  it('on an invalid key: never spends quota', async () => {
    h.ping.mockRejectedValueOnce(storeError('KEY_INVALID', 'bad key'))
    const out = await drain(runProduct(baseReq))
    expect(out).toContain('"phase":"error"')
    expect(out).toContain('KEY_INVALID')
    expect(h.decrementQuota).not.toHaveBeenCalled()
  })

  it('on a pipeline/provider failure: emits error and never spends quota (PRD §10 #7)', async () => {
    h.pipeline.mockRejectedValueOnce(
      storeError('PROVIDER_TIMEOUT', 'provider timed out', { retryable: true })
    )
    const out = await drain(runProduct(baseReq))
    expect(out).toContain('"phase":"error"')
    expect(out).toContain('PROVIDER_TIMEOUT')
    expect(h.setRun).not.toHaveBeenCalled()
    expect(h.decrementQuota).not.toHaveBeenCalled()
  })

  it('idempotent replay: a cached success re-emits done without spending quota', async () => {
    h.getRun.mockResolvedValueOnce({
      runId: 'r',
      slug: 'p',
      status: 'success',
      artifactUrl: '/a',
      finishedAt: 1,
      ownerJti: 'j1',
    })
    const out = await drain(runProduct({ ...baseReq, runId: 'r' }))
    expect(out).toContain('"phase":"done"')
    expect(h.pipeline).not.toHaveBeenCalled()
    expect(h.decrementQuota).not.toHaveBeenCalled()
  })
})
