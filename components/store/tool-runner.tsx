'use client'

/**
 * Generic tool UI — the 8-state run machine (doc 06 §4). Consumes the /run SSE
 * stream over fetch (POST, so not EventSource). For v1 the input is a single
 * textarea (the demo product); schema-driven inputs come with later products.
 */
import { useState, useRef } from 'react'

type Phase = 'collecting' | 'validatingKey' | 'running' | 'success' | 'error'
type Provider = 'anthropic' | 'openai' | 'google'

interface Props {
  token: string
  slug: string
  productName: string
  providers: Provider[]
}

const surface = { background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }
const accent = { background: 'var(--color-accent)', color: 'var(--color-text-on-inverse)' }

export function ToolRunner({ token, slug, productName, providers }: Props) {
  const [phase, setPhase] = useState<Phase>('collecting')
  const [text, setText] = useState('')
  const [provider, setProvider] = useState<Provider>(providers[0] ?? 'anthropic')
  const [apiKey, setApiKey] = useState('')
  const [keyState, setKeyState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle')
  const [pct, setPct] = useState(0)
  const [message, setMessage] = useState('')
  const [artifact, setArtifact] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const runIdRef = useRef('')

  async function checkKey() {
    if (!apiKey) return
    setKeyState('checking')
    try {
      const res = await fetch('/api/store/key-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      })
      const data = await res.json()
      setKeyState(res.ok && data.valid ? 'ok' : 'bad')
    } catch {
      setKeyState('bad')
    }
  }

  async function run() {
    setPhase('running')
    setPct(5)
    setMessage('Starting…')
    setError('')
    runIdRef.current = crypto.randomUUID()

    let res: Response
    try {
      res = await fetch(`/api/store/run/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          byokKey: apiKey,
          provider,
          input: { text },
          runId: runIdRef.current,
        }),
      })
    } catch {
      return fail('Network error — please retry.')
    }

    if (!res.ok || !res.body || !res.headers.get('content-type')?.includes('event-stream')) {
      const body = await res.json().catch(() => null)
      return fail(body?.error?.userMessage ?? 'Something went wrong — please retry.')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      let idx: number
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, idx)
        buf = buf.slice(idx + 2)
        const line = frame.split('\n').find((l) => l.startsWith('data: '))
        if (!line) continue
        let data: Record<string, unknown>
        try {
          data = JSON.parse(line.slice(6))
        } catch {
          continue
        }
        if (data.error)
          return fail((data.error as { userMessage?: string }).userMessage ?? 'Run failed.')
        if (data.done) {
          await loadArtifact(String(data.runId ?? runIdRef.current))
          return
        }
        if (typeof data.pct === 'number') setPct(data.pct)
        if (typeof data.message === 'string') setMessage(data.message)
      }
    }
  }

  async function loadArtifact(runId: string) {
    try {
      const res = await fetch(`/api/store/artifact/${runId}?token=${encodeURIComponent(token)}`)
      if (!res.ok) return fail('Your result was produced but couldn’t be loaded — try refreshing.')
      setArtifact(await res.json())
      setPhase('success')
    } catch {
      fail('Couldn’t load your result — please retry.')
    }
  }

  function fail(msg: string) {
    setError(msg)
    setPhase('error')
  }

  const canRun = text.trim().length > 0 && keyState === 'ok' && phase === 'collecting'

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Manrope, sans-serif' }}
        >
          {productName}
        </h1>
      </header>

      {(phase === 'collecting' || phase === 'validatingKey') && (
        <div className="space-y-4 rounded-xl border p-4" style={surface}>
          <label className="block">
            <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>
              Your text
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={500}
              className="mt-1 w-full rounded-md border p-3 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card-alt)' }}
              placeholder="Paste up to 500 characters…"
            />
          </label>

          <fieldset className="space-y-2">
            <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>
              Your AI key (BYOK)
            </span>
            <div className="flex gap-2">
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value as Provider)
                  setKeyState('idle')
                }}
                className="h-9 rounded-md border px-2 text-sm"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setKeyState('idle')
                }}
                onBlur={checkKey}
                placeholder="sk-…"
                className="h-9 flex-1 rounded-md border px-3 text-sm"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <span className="self-center text-sm" aria-live="polite">
                {keyState === 'checking'
                  ? '…'
                  : keyState === 'ok'
                    ? '✓'
                    : keyState === 'bad'
                      ? '✕'
                      : ''}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              We never store your API key — it’s used only for this run, over an encrypted
              connection.
            </p>
          </fieldset>

          <button
            onClick={run}
            disabled={!canRun}
            className="h-9 w-full rounded-md text-sm font-semibold disabled:opacity-50"
            style={accent}
          >
            Run
          </button>
        </div>
      )}

      {phase === 'running' && (
        <div className="rounded-xl border p-6" style={surface} role="status" aria-live="polite">
          <div
            className="mb-3 h-2 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--color-bg-card-alt)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'var(--color-accent)' }}
            />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
            {message || 'Working…'}
          </p>
        </div>
      )}

      {phase === 'success' && artifact && (
        <div className="space-y-4 rounded-xl border p-6" style={surface}>
          <p
            className="text-xs tracking-wider uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {String(artifact.tone ?? '')} · {String(artifact.wordCount ?? '')} words
          </p>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            {String(artifact.restyled ?? '')}
          </p>
          <details className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <summary className="cursor-pointer">Raw result</summary>
            <pre
              className="mt-2 overflow-auto rounded-md p-3"
              style={{
                background: 'var(--color-bg-inverse)',
                color: 'var(--color-text-on-inverse)',
              }}
            >
              {JSON.stringify(artifact, null, 2)}
            </pre>
          </details>
          <button
            onClick={() => {
              setPhase('collecting')
              setArtifact(null)
            }}
            className="h-8 rounded-md border px-3 text-sm"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Run again
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div
          className="space-y-3 rounded-xl border p-6"
          style={{ ...surface, borderColor: 'var(--color-error)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
          <button
            onClick={() => setPhase('collecting')}
            className="h-8 rounded-md text-sm font-semibold"
            style={accent}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
