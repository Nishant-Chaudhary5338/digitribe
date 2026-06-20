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
  used: (jti: string) => `tok:${jti}:u`,
  run: (runId: string) => `run:${runId}`,
  idem: (runId: string) => `idem:${runId}`,
  rl: (scope: string, id: string) => `rl:${scope}:${id}`,
}

// ── Token quota ────────────────────────────────────────────────────────────
// Total is stored once; usage is a separate atomic counter (kv.incr/decr) so
// concurrent runs can never double-spend (read-modify-write would).

export interface TokenQuota {
  runsTotal: number
  runsUsed: number
}

export async function setQuota(jti: string, runsTotal: number): Promise<void> {
  await kv.set(k.tok(jti), { runsTotal }, { ex: TOKEN_TTL })
  await kv.set(k.used(jti), 0, { ex: TOKEN_TTL })
}

export async function getQuota(jti: string): Promise<TokenQuota | null> {
  const meta = await kv.get<{ runsTotal: number }>(k.tok(jti))
  if (!meta) return null
  const rawUsed = (await kv.get<number>(k.used(jti))) ?? 0
  return { runsTotal: meta.runsTotal, runsUsed: Math.min(Math.max(0, rawUsed), meta.runsTotal) }
}

/** Atomically spend a run. Returns runs remaining, or null if the token is unknown. */
export async function decrQuota(jti: string): Promise<number | null> {
  const meta = await kv.get<{ runsTotal: number }>(k.tok(jti))
  if (!meta) return null
  const used = await kv.incr(k.used(jti))
  return Math.max(0, meta.runsTotal - used)
}

/** Give a run back after a system-side failure. Returns runs remaining. */
export async function restoreQuota(jti: string): Promise<number | null> {
  const meta = await kv.get<{ runsTotal: number }>(k.tok(jti))
  if (!meta) return null
  const used = await kv.decr(k.used(jti))
  return Math.max(0, meta.runsTotal - Math.max(0, used))
}

export async function deleteToken(jti: string): Promise<void> {
  await kv.del(k.tok(jti), k.used(jti))
}

/** Tombstone so a revoked token reads as `invalid`, not `expired` (TTL elapsed). */
export async function markTokenRevoked(jti: string): Promise<void> {
  await kv.set(`tok:${jti}:rev`, 1, { ex: TOKEN_TTL })
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  return (await kv.get(`tok:${jti}:rev`)) != null
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
  // Time-bucketed key: each window is its own key, so a missed expire can't
  // wedge the limiter — old buckets are simply abandoned (TTL cleans them up).
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds)
  const key = `${k.rl(scope, id)}:${bucket}`
  const count = await kv.incr(key)
  if (count === 1) await kv.expire(key, windowSeconds * 2)
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
}
