'use client'

/**
 * Generic tool UI — the 8-state run machine (doc 06 §4). Consumes the /run SSE
 * stream over fetch (POST, so not EventSource). For v1 the input is a single
 * textarea (the demo product); schema-driven inputs come with later products.
 */
import { useState, useRef, useEffect } from 'react'
import { toViewModel } from '../../lib/store/artifact-view-model'
import type { InputField } from '../../lib/store/input-field'

type Phase = 'collecting' | 'validatingKey' | 'running' | 'success' | 'error'
type Provider = 'anthropic' | 'openai' | 'google'

interface Props {
  token: string
  slug: string
  productName: string
  providers: Provider[]
  fields: InputField[]
}

const surface = { background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }
const accent = { background: 'var(--color-accent)', color: 'var(--color-text-on-inverse)' }

function statusColor(status?: string): string {
  if (status === 'good' || status === 'strong') return 'var(--color-success)'
  if (status === 'partial' || status === 'okay') return 'var(--color-warning)'
  if (status === 'missing' || status === 'weak') return 'var(--color-error)'
  return 'var(--color-text-muted)'
}

export function ToolRunner({ token, slug, productName, providers, fields }: Props) {
  const [phase, setPhase] = useState<Phase>('collecting')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const setField = (key: string, value: string) => setInputs((s) => ({ ...s, [key]: value }))
  const [provider, setProvider] = useState<Provider>(providers[0] ?? 'anthropic')
  const [apiKey, setApiKey] = useState('')
  const [keyState, setKeyState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle')
  const [pct, setPct] = useState(0)
  const [message, setMessage] = useState('')
  const [artifact, setArtifact] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const runIdRef = useRef('')

  // Deep link from the artifact-ready email: /store/use/[token]?run=<runId>
  // jumps straight to the finished result (review Pass-3 HIGH).
  useEffect(() => {
    const runId = new URLSearchParams(window.location.search).get('run')
    if (!runId) return
    setPhase('running')
    setPct(100)
    setMessage('Loading your result…')
    void loadArtifact(runId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          input: buildInput(),
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

  function buildInput(): Record<string, string> {
    const out: Record<string, string> = {}
    for (const f of fields) {
      const v = inputs[f.key]?.trim()
      if (v) out[f.key] = v
    }
    return out
  }

  const requiredFilled = fields.every((f) => !f.required || (inputs[f.key]?.trim().length ?? 0) > 0)
  const canRun = requiredFilled && keyState === 'ok' && phase === 'collecting'

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
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                {field.label}
                {!field.required && (
                  <span style={{ color: 'var(--color-text-muted)' }}> (optional)</span>
                )}
              </span>
              {field.type === 'url' ? (
                <input
                  type="url"
                  value={inputs[field.key] ?? ''}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border px-3 text-sm outline-none"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-card-alt)',
                  }}
                  placeholder="https://…"
                />
              ) : (
                <textarea
                  value={inputs[field.key] ?? ''}
                  onChange={(e) => setField(field.key, e.target.value)}
                  rows={fields.length > 2 ? 3 : 5}
                  className="mt-1 w-full rounded-md border p-3 text-sm outline-none"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-card-alt)',
                  }}
                  placeholder={`Your ${field.label.toLowerCase()}…`}
                />
              )}
            </label>
          ))}

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
          {(() => {
            const vm = toViewModel(artifact)
            return (
              <>
                {(vm.score !== undefined || vm.grade) && (
                  <div className="flex items-baseline gap-3">
                    {vm.grade && (
                      <span
                        className="text-3xl font-semibold"
                        style={{
                          color: 'var(--color-text-primary)',
                          fontFamily: 'Manrope, sans-serif',
                        }}
                      >
                        {vm.grade}
                      </span>
                    )}
                    {vm.score !== undefined && (
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {vm.score}/100
                      </span>
                    )}
                  </div>
                )}
                {vm.headline && (
                  <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                    {vm.headline}
                  </p>
                )}

                {vm.dimensions.length > 0 && (
                  <div className="space-y-2">
                    {vm.dimensions.map((d) => (
                      <div
                        key={d.key}
                        className="rounded-md border p-3"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {d.label ?? d.key}
                          </span>
                          <span className="text-xs" style={{ color: statusColor(d.status) }}>
                            {d.status ?? ''}
                            {d.score !== undefined ? ` · ${d.score}` : ''}
                          </span>
                        </div>
                        {d.findings && d.findings.length > 0 && (
                          <ul
                            className="mt-1 list-disc pl-4 text-xs"
                            style={{ color: 'var(--color-text-body)' }}
                          >
                            {d.findings.slice(0, 5).map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {vm.lists.map((list) => (
                  <div key={list.title}>
                    <p
                      className="text-xs tracking-wider uppercase"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {list.title}
                    </p>
                    <ul
                      className="mt-1 list-disc pl-4 text-sm"
                      style={{ color: 'var(--color-text-body)' }}
                    >
                      {list.items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {vm.files.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-xs tracking-wider uppercase"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Generated files ({vm.files.length})
                      </p>
                      <a
                        href={`/api/store/artifact/${runIdRef.current}?fmt=zip&token=${encodeURIComponent(token)}`}
                        className="inline-flex h-8 items-center rounded-md px-3 text-sm font-semibold"
                        style={accent}
                      >
                        Download ZIP
                      </a>
                    </div>
                    {vm.files.map((f) => (
                      <details
                        key={f.path}
                        className="rounded-md border"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <summary
                          className="cursor-pointer px-3 py-2 font-mono text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {f.path}
                        </summary>
                        <pre
                          className="overflow-auto px-3 pb-3 text-xs"
                          style={{ color: 'var(--color-text-body)' }}
                        >
                          {f.contents}
                        </pre>
                      </details>
                    ))}
                  </div>
                )}

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
              </>
            )
          })()}
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
