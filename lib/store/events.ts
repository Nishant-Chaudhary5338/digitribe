/**
 * Run-event helpers for the SSE stream. Canonical: contracts §4.
 * Wire format: `data: ${JSON.stringify(RunEvent)}\n\n`
 */
import type { RunEvent, RunPhase } from './types'
import type { StoreError } from './errors'

/** Build a RunEvent (keeps pct clamped to 0–100). */
export function runEvent(
  phase: RunPhase,
  pct: number,
  message: string,
  extra?: { partial?: unknown; findingCount?: number }
): RunEvent {
  return {
    phase,
    pct: Math.max(0, Math.min(100, Math.round(pct))),
    message,
    ...(extra?.partial !== undefined ? { partial: extra.partial } : {}),
    ...(extra?.findingCount !== undefined ? { findingCount: extra.findingCount } : {}),
  }
}

/** Serialize a RunEvent to an SSE frame. */
export function sseFrame(event: RunEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

/** Terminal success frame carrying the run result reference. */
export function sseDone(payload: { runId: string; artifactUrl?: string }): string {
  return `data: ${JSON.stringify({ done: true, ...payload })}\n\n`
}

/** Terminal error frame (also emit a `phase:"error"` RunEvent before this). */
export function sseError(error: Omit<StoreError, 'detail'>): string {
  return `data: ${JSON.stringify({ error })}\n\n`
}

/** Encode any SSE string to bytes for a ReadableStream. */
export function encodeSse(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}
