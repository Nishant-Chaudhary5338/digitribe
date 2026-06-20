import { describe, it, expect } from 'vitest'
import {
  StoreErr,
  storeError,
  httpStatusFor,
  toErrorResponse,
  type StoreErrorCode,
} from '../../../lib/store/errors'

describe('errors', () => {
  it('maps every error code to a sane HTTP status', () => {
    const expected: Record<StoreErrorCode, number> = {
      INPUT_INVALID: 422,
      INPUT_BLOCKED: 422,
      INPUT_UNREACHABLE: 400,
      KEY_INVALID: 400,
      KEY_REFUSED: 400,
      KEY_RATE_LIMITED: 400,
      PROVIDER_TIMEOUT: 400,
      PROVIDER_ERROR: 400,
      TOKEN_INVALID: 403,
      TOKEN_EXPIRED: 403,
      LICENSE_INVALID: 403,
      LICENSE_EXHAUSTED: 403,
      QUOTA_EXHAUSTED: 402,
      RATE_LIMITED: 429,
      ARTIFACT_NOT_FOUND: 404,
      RUN_FAILED: 500,
      INTERNAL: 500,
    }
    for (const [code, status] of Object.entries(expected)) {
      expect(httpStatusFor(code as StoreErrorCode)).toBe(status)
    }
  })

  it('storeError builds a StoreErr with defaults', () => {
    const err = storeError('INPUT_INVALID', 'bad input')
    expect(err).toBeInstanceOf(StoreErr)
    expect(err.payload).toMatchObject({
      code: 'INPUT_INVALID',
      userMessage: 'bad input',
      retryable: false,
      quotaSpent: false,
    })
  })

  it('toErrorResponse strips the internal detail and uses the mapped status', () => {
    const err = storeError('QUOTA_EXHAUSTED', 'no runs left', { detail: 'jti=secret-internal' })
    const { status, body } = toErrorResponse(err)
    expect(status).toBe(402)
    expect(body.error.code).toBe('QUOTA_EXHAUSTED')
    expect(body.error).not.toHaveProperty('detail')
    expect(JSON.stringify(body)).not.toContain('secret-internal')
  })

  it('toErrorResponse maps an unknown throwable to INTERNAL/500', () => {
    const { status, body } = toErrorResponse(new Error('boom'))
    expect(status).toBe(500)
    expect(body.error.code).toBe('INTERNAL')
    expect(body.error.retryable).toBe(true)
  })
})
