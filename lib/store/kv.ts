/**
 * Typed KV helpers + namespaces. Canonical: contracts §3, §10.
 * Namespaces: tok:{jti} · run:{runId} · rl:{scope}:{id} · idem:{runId}
 */
import { kv } from '@vercel/kv'
import type { RunResult } from './types'

const DAY = 60 * 60 * 24
export const TOKEN_TTL = 30 * DAY
export const RUN_TTL = 30 * DAY

const k = {
  tok: (jti: string) => `tok:${jti}`,
  run: (runId: string) => `run:${runId}`,
  idem: (runId: string) => `idem:${runId}`,
  rl: (scope: string, id: string) => `rl:${scope}:${id}`,
}

// ── Token quota ────────────────────────────────────────────────────────────

export interface TokenQuota {
  runsTotal: number
  runsUsed: number
}

export async function setQuota(jti: string, runsTotal: number): Promise<void> {
  await kv.set<TokenQuota>(k.tok(jti), { runsTotal, runsUsed: 0 }, { ex: TOKEN_TTL })
}

export async function getQuota(jti: string): Promise<TokenQuota | null> {
  return kv.get<TokenQuota>(k.tok(jti))
}

/** Returns runs remaining after the decrement, or null if the token is unknown. */
export async function decrQuota(jti: string): Promise<number | null> {
  const q = await kv.get<TokenQuota>(k.tok(jti))
  if (!q) return null
  const used = Math.min(q.runsTotal, q.runsUsed + 1)
  await kv.set<TokenQuota>(k.tok(jti), { ...q, runsUsed: used }, { ex: TOKEN_TTL })
  return Math.max(0, q.runsTotal - used)
}

/** Give a run back after a system-side failure. Returns runs remaining. */
export async function restoreQuota(jti: string): Promise<number | null> {
  const q = await kv.get<TokenQuota>(k.tok(jti))
  if (!q) return null
  const used = Math.max(0, q.runsUsed - 1)
  await kv.set<TokenQuota>(k.tok(jti), { ...q, runsUsed: used }, { ex: TOKEN_TTL })
  return q.runsTotal - used
}

export async function deleteToken(jti: string): Promise<void> {
  await kv.del(k.tok(jti))
}

// ── Run results (artifact metadata) ────────────────────────────────────────

export async function setRun(runId: string, result: RunResult): Promise<void> {
  await kv.set<RunResult>(k.run(runId), result, { ex: RUN_TTL })
}

export async function getRun(runId: string): Promise<RunResult | null> {
  return kv.get<RunResult>(k.run(runId))
}

// ── Idempotency lock ───────────────────────────────────────────────────────

/** SETNX a lock for a runId. Returns true if acquired (first attempt). */
export async function acquireRunLock(runId: string, ttlSeconds: number): Promise<boolean> {
  const res = await kv.set(k.idem(runId), '1', { nx: true, ex: ttlSeconds })
  return res === 'OK'
}

export async function releaseRunLock(runId: string): Promise<void> {
  await kv.del(k.idem(runId))
}

// ── Rate limiting (fixed window) ───────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export async function rateLimit(
  scope: string,
  id: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = k.rl(scope, id)
  const count = await kv.incr(key)
  if (count === 1) await kv.expire(key, windowSeconds)
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
}
