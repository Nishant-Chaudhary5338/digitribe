import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@vercel/kv', async () => ({ kv: (await import('../helpers/mock-vercel-kv')).kv }))

import { __resetKv } from '../helpers/mock-vercel-kv'
import {
  setQuota,
  getQuota,
  decrQuota,
  restoreQuota,
  acquireRunLock,
  rateLimit,
} from '../../../lib/store/kv'

beforeEach(() => __resetKv())

describe('kv quota', () => {
  it('sets and reads a quota', async () => {
    await setQuota('jti1', 3)
    expect(await getQuota('jti1')).toEqual({ runsTotal: 3, runsUsed: 0 })
  })

  it('decrements down to zero and never below', async () => {
    await setQuota('jti1', 2)
    expect(await decrQuota('jti1')).toBe(1)
    expect(await decrQuota('jti1')).toBe(0)
    expect(await decrQuota('jti1')).toBe(0)
    expect((await getQuota('jti1'))?.runsUsed).toBeLessThanOrEqual(2)
  })

  it('restores a run after a system failure', async () => {
    await setQuota('jti1', 3)
    await decrQuota('jti1')
    await decrQuota('jti1')
    const remaining = await restoreQuota('jti1')
    expect(remaining).toBe(2)
  })

  it('returns null for an unknown token', async () => {
    expect(await decrQuota('nope')).toBeNull()
    expect(await getQuota('nope')).toBeNull()
  })

  // TDD: concurrent decrements must each count (no read-modify-write double-spend).
  it('counts concurrent decrements atomically', async () => {
    await setQuota('race', 5)
    await Promise.all([decrQuota('race'), decrQuota('race'), decrQuota('race')])
    expect((await getQuota('race'))?.runsUsed).toBe(3)
  })
})

describe('kv idempotency + rate limit', () => {
  it('acquireRunLock is exclusive (SETNX)', async () => {
    expect(await acquireRunLock('run1', 60)).toBe(true)
    expect(await acquireRunLock('run1', 60)).toBe(false)
  })

  it('rate limits after the limit is exceeded', async () => {
    const hits = []
    for (let i = 0; i < 4; i++) hits.push(await rateLimit('test', 'ip1', 3, 60))
    expect(hits[0]?.allowed).toBe(true)
    expect(hits[2]?.allowed).toBe(true)
    expect(hits[3]?.allowed).toBe(false)
  })
})
