/**
 * Access tokens for in-browser products. Canonical: contracts §3, platform-spec §4.
 * Token = base64url(payload) + "." + HMAC-SHA256(payload, ACCESS_TOKEN_SECRET).
 * Quota lives in KV keyed by the token's `jti`.
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import type { AccessTokenPayload } from './types'
import { storeEnv } from './env'
import { setQuota, getQuota, decrQuota, restoreQuota, deleteToken } from './kv'

const DAY = 60 * 60 * 24
const TOKEN_TTL_SECONDS = 30 * DAY

function sign(payloadB64: string): string {
  return createHmac('sha256', storeEnv().ACCESS_TOKEN_SECRET).update(payloadB64).digest('base64url')
}

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url')
}

/**
 * Mint a signed token and seed its run quota in KV.
 * `iat`/`exp`/`jti` are assigned here. Pass the product's run quota as `runsTotal`.
 */
export async function mintToken(
  fields: Omit<AccessTokenPayload, 'jti' | 'iat' | 'exp'>,
  runsTotal: number,
  nowSeconds: number
): Promise<string> {
  const jti = randomUUID()
  const payload: AccessTokenPayload = {
    ...fields,
    jti,
    iat: nowSeconds,
    exp: nowSeconds + TOKEN_TTL_SECONDS,
  }
  await setQuota(jti, runsTotal)
  const payloadB64 = b64url(payload)
  return `${payloadB64}.${sign(payloadB64)}`
}

export type VerifyResult =
  | { ok: true; payload: AccessTokenPayload; runsRemaining: number }
  | { ok: false; reason: 'invalid' | 'expired' | 'exhausted' }

export async function verifyToken(token: string, nowSeconds: number): Promise<VerifyResult> {
  const dot = token.indexOf('.')
  if (dot <= 0) return { ok: false, reason: 'invalid' }
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expected = sign(payloadB64)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'invalid' }

  let payload: AccessTokenPayload
  try {
    payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as AccessTokenPayload
  } catch {
    return { ok: false, reason: 'invalid' }
  }
  if (typeof payload.exp !== 'number' || payload.exp < nowSeconds)
    return { ok: false, reason: 'expired' }

  const quota = await getQuota(payload.jti)
  if (!quota) return { ok: false, reason: 'expired' } // KV TTL elapsed
  const runsRemaining = Math.max(0, quota.runsTotal - quota.runsUsed)
  if (runsRemaining <= 0) return { ok: false, reason: 'exhausted' }

  return { ok: true, payload, runsRemaining }
}

/** Spend one run. Returns runs remaining, or null if the token is unknown. */
export function decrementQuota(jti: string): Promise<number | null> {
  return decrQuota(jti)
}

/** Restore a run after a system-side failure. */
export function refundQuota(jti: string): Promise<number | null> {
  return restoreQuota(jti)
}

/** Revoke a token (e.g. on refund). */
export function revokeToken(jti: string): Promise<void> {
  return deleteToken(jti)
}
