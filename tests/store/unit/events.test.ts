import { describe, it, expect } from 'vitest'
import { runEvent, sseFrame, sseDone, sseError } from '../../../lib/store/events'

describe('events', () => {
  it('clamps pct to 0–100 and rounds', () => {
    expect(runEvent('crawl', 150, 'x').pct).toBe(100)
    expect(runEvent('crawl', -5, 'x').pct).toBe(0)
    expect(runEvent('crawl', 42.6, 'x').pct).toBe(43)
  })

  it('omits optional fields unless provided', () => {
    const e = runEvent('analyze', 50, 'working')
    expect(e).not.toHaveProperty('partial')
    expect(e).not.toHaveProperty('findingCount')
    const e2 = runEvent('analyze', 50, 'working', { findingCount: 3, partial: { a: 1 } })
    expect(e2.findingCount).toBe(3)
    expect(e2.partial).toEqual({ a: 1 })
  })

  it('sseFrame serializes a RunEvent as an SSE data frame', () => {
    const frame = sseFrame(runEvent('done', 100, 'Done.'))
    expect(frame.startsWith('data: ')).toBe(true)
    expect(frame.endsWith('\n\n')).toBe(true)
    expect(JSON.parse(frame.slice(6).trim())).toMatchObject({ phase: 'done', pct: 100 })
  })

  it('sseDone / sseError carry their payloads', () => {
    expect(JSON.parse(sseDone({ runId: 'r1', artifactUrl: '/a' }).slice(6))).toMatchObject({
      done: true,
      runId: 'r1',
    })
    const errFrame = sseError({
      code: 'RUN_FAILED',
      userMessage: 'oops',
      retryable: true,
      quotaSpent: false,
    })
    expect(JSON.parse(errFrame.slice(6)).error.code).toBe('RUN_FAILED')
  })
})
