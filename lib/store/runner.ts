/**
 * Job runner — the SSE engine for in-browser products. Canonical: contracts §6,
 * platform-spec §6. Fixed order: verify token+quota -> validate input -> validate
 * key -> run pipeline (streaming progress) -> persist -> decrement quota.
 *
 * Quota is spent only on success; system/provider failures never decrement.
 */
import { randomUUID } from 'node:crypto'
import { kv } from '@vercel/kv'
import type { AiProvider, RunEvent, RunResult } from './types'
import { getProduct } from './products'
import { verifyToken, decrementQuota } from './access'
import { makeAiRunner } from './ai'
import { acquireRunLock, setRun, getRun, rateLimit } from './kv'
import { runEvent, sseFrame, sseDone, sseError, encodeSse } from './events'
import { StoreErr, storeError, toErrorResponse } from './errors'
import { sendArtifactReady } from './email'
import { storeEnv } from './env'

const DAY = 60 * 60 * 24

export interface RunInput {
  slug: string
  token: string
  byokKey: string
  provider: AiProvider
  input: unknown
  runId?: string
  /** caller IP for per-IP rate limiting (contracts §10) */
  ip: string
}

export function runProduct(req: RunInput): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: RunEvent) => controller.enqueue(encodeSse(sseFrame(e)))
      const fail = (err: StoreErr): void => {
        emit(runEvent('error', 100, err.payload.userMessage))
        controller.enqueue(encodeSse(sseError(toErrorResponse(err).body.error)))
        controller.close()
      }

      try {
        const now = Math.floor(Date.now() / 1000)
        emit(runEvent('auth', 5, 'Verifying your access…'))

        const product = getProduct(req.slug)
        if (!product) return fail(storeError('INPUT_INVALID', 'Unknown product.'))
        if (!product.byokProviders.includes(req.provider))
          return fail(
            storeError('INPUT_INVALID', 'That AI provider isn’t supported for this tool.')
          )

        const v = await verifyToken(req.token, now)
        if (!v.ok) {
          const map = {
            exhausted: storeError(
              'QUOTA_EXHAUSTED',
              'You’ve used all your runs for this purchase. Buy again to keep going.'
            ),
            expired: storeError(
              'TOKEN_EXPIRED',
              'This access link has expired. We’ve emailed you a fresh one.'
            ),
            invalid: storeError(
              'TOKEN_INVALID',
              'This access link isn’t valid. Check the link from your email.'
            ),
          } as const
          return fail(map[v.reason])
        }

        const tokenRl = await rateLimit('run', v.payload.jti, 10, 60)
        const ipRl = await rateLimit('run-ip', req.ip, 30, 60)
        if (!tokenRl.allowed || !ipRl.allowed)
          return fail(
            storeError('RATE_LIMITED', 'Too many requests just now — give it a few seconds.', {
              retryable: true,
            })
          )

        const runId = req.runId ?? randomUUID()

        // Idempotency: a completed run replays its cached result; never re-charges (contracts §6).
        const cached = await getRun(runId)
        if (cached?.status === 'success') {
          emit(runEvent('done', 100, 'Done.'))
          controller.enqueue(encodeSse(sseDone({ runId, artifactUrl: cached.artifactUrl })))
          controller.close()
          return
        }
        const gotLock = await acquireRunLock(runId, product.estRunSeconds * 3)
        if (!gotLock)
          return fail(
            storeError('RATE_LIMITED', 'A run is already in progress for this request.', {
              retryable: true,
            })
          )

        emit(runEvent('validate', 8, 'Checking your input…'))
        const schema = await product.inputSchema()
        const parsed = schema.safeParse(req.input)
        if (!parsed.success)
          return fail(storeError('INPUT_INVALID', 'Something about that input isn’t right.'))

        emit(runEvent('key', 12, `Validating your ${req.provider} key…`))
        const ai = makeAiRunner(req.provider, req.byokKey)
        try {
          await ai.ping(product.defaultModel[req.provider])
        } catch (e) {
          // Distinguishes KEY_INVALID from PROVIDER_TIMEOUT/ERROR; quota not yet spent.
          return fail(
            e instanceof StoreErr
              ? e
              : storeError(
                  'KEY_INVALID',
                  `That ${req.provider} key didn’t work — check it’s active and try again. We never store it.`
                )
          )
        }

        const pipeline = await product.pipeline()
        const ac = new AbortController()
        let output: unknown
        try {
          output = await pipeline({ input: parsed.data, ai, emit, signal: ac.signal })
        } catch (e) {
          // Pipeline failure: quota was not yet spent, so nothing to restore.
          return fail(
            e instanceof StoreErr
              ? e
              : storeError(
                  'RUN_FAILED',
                  'Something went wrong on our side and we’ve kept your run. Try again.',
                  { retryable: true }
                )
          )
        }

        emit(runEvent('persist', 95, 'Finishing up…'))
        await kv.set(`artifact:${runId}`, output, { ex: 30 * DAY })
        const result: RunResult = {
          runId,
          slug: req.slug,
          status: 'success',
          artifactUrl: `/api/store/artifact/${runId}`,
          finishedAt: Date.now(),
          ownerJti: v.payload.jti,
        }
        // Persist the result BEFORE spending quota: if any earlier step (crawl,
        // key check, pipeline) failed, quota was never touched — the buyer keeps
        // the run. Quota is spent last, only on full success.
        await setRun(runId, result)
        const remaining = await decrementQuota(v.payload.jti)
        if (remaining === null)
          console.warn(`[store] quota record vanished mid-run for ${runId} (buyer not charged)`)

        // Email a copy (nicety — never blocks the result).
        try {
          await sendArtifactReady({
            to: v.payload.email,
            productName: product.name,
            viewUrl: `${storeEnv().STORE_BASE_URL}/store/use/${req.token}?run=${runId}`,
          })
        } catch (e) {
          console.warn('[store] artifact email failed:', e instanceof Error ? e.message : e)
        }

        emit(runEvent('done', 100, 'Done.'))
        controller.enqueue(encodeSse(sseDone({ runId, artifactUrl: result.artifactUrl })))
        controller.close()
      } catch (e) {
        fail(
          e instanceof StoreErr
            ? e
            : storeError(
                'INTERNAL',
                'Unexpected error on our end. Your purchase is safe — please retry.',
                { retryable: true }
              )
        )
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
