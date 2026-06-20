/**
 * The single error envelope used across every store route. Canonical: contracts §5.
 * Never leak the BYOK key, stack traces, or internal codes to the buyer.
 */
export type StoreErrorCode =
  | 'KEY_INVALID'
  | 'KEY_RATE_LIMITED'
  | 'KEY_REFUSED'
  | 'INPUT_INVALID'
  | 'INPUT_UNREACHABLE'
  | 'INPUT_BLOCKED' // SSRF / private target
  | 'QUOTA_EXHAUSTED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'RUN_FAILED'
  | 'ARTIFACT_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'LICENSE_INVALID' // Segment 5 downloadable apps
  | 'LICENSE_EXHAUSTED' // no device activations left
  | 'INTERNAL'

export interface StoreError {
  code: StoreErrorCode
  /** shown to the buyer — human, no jargon, no key leakage */
  userMessage: string
  retryable: boolean
  /** did this consume a run? */
  quotaSpent: boolean
  /** server-log only; NEVER includes the BYOK key */
  detail?: string
}

export class StoreErr extends Error {
  constructor(public readonly payload: StoreError) {
    super(payload.code)
    this.name = 'StoreErr'
  }
}

const STATUS: Record<StoreErrorCode, number> = {
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

export function httpStatusFor(code: StoreErrorCode): number {
  return STATUS[code]
}

/** Convenience constructor with sensible defaults. */
export function storeError(
  code: StoreErrorCode,
  userMessage: string,
  opts?: { retryable?: boolean; quotaSpent?: boolean; detail?: string }
): StoreErr {
  return new StoreErr({
    code,
    userMessage,
    retryable: opts?.retryable ?? false,
    quotaSpent: opts?.quotaSpent ?? false,
    detail: opts?.detail,
  })
}

/** Build the canonical HTTP JSON response for any error (strips `detail`). */
export function toErrorResponse(err: unknown): {
  status: number
  body: { error: Omit<StoreError, 'detail'> }
} {
  if (err instanceof StoreErr) {
    const { detail: _detail, ...safe } = err.payload
    void _detail
    return { status: httpStatusFor(err.payload.code), body: { error: safe } }
  }
  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL',
        userMessage:
          'Unexpected error on our end. Your purchase is safe — please retry or contact support.',
        retryable: true,
        quotaSpent: false,
      },
    },
  }
}
