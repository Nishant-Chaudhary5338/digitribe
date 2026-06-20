import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({ generateText: vi.fn() }))
vi.mock('ai', () => ({
  generateText: h.generateText,
  generateObject: vi.fn(),
  streamObject: vi.fn(),
}))

import { validateKey, makeAiRunner } from '../../../lib/store/ai'

const err = (msg: string, statusCode?: number) =>
  Object.assign(new Error(msg), statusCode ? { statusCode } : {})

beforeEach(() => vi.clearAllMocks())

describe('AI runner error mapping (BYOK)', () => {
  it('ping resolves when the key works', async () => {
    h.generateText.mockResolvedValueOnce({ text: 'ok' })
    await expect(makeAiRunner('anthropic', 'k').ping('claude-opus-4-8')).resolves.toBeUndefined()
  })

  it('maps a 401 to KEY_INVALID and validateKey returns false', async () => {
    h.generateText.mockRejectedValueOnce(err('unauthorized', 401))
    expect(await validateKey('anthropic', 'bad', 'claude-opus-4-8')).toBe(false)
  })

  it('maps a 429 to KEY_RATE_LIMITED (thrown, not a false)', async () => {
    h.generateText.mockRejectedValueOnce(err('rate limited', 429))
    await expect(makeAiRunner('anthropic', 'k').ping('claude-opus-4-8')).rejects.toMatchObject({
      payload: { code: 'KEY_RATE_LIMITED' },
    })
  })

  it('maps a timeout to PROVIDER_TIMEOUT, and validateKey rethrows it (not false)', async () => {
    h.generateText.mockRejectedValue(err('etimedout'))
    await expect(makeAiRunner('anthropic', 'k').ping('claude-opus-4-8')).rejects.toMatchObject({
      payload: { code: 'PROVIDER_TIMEOUT' },
    })
    await expect(validateKey('anthropic', 'k', 'claude-opus-4-8')).rejects.toMatchObject({
      payload: { code: 'PROVIDER_TIMEOUT' },
    })
  })

  it('requires an explicit model for non-anthropic providers', async () => {
    await expect(makeAiRunner('openai', 'k').ping()).rejects.toMatchObject({
      payload: { code: 'INPUT_INVALID' },
    })
  })
})
