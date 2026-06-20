'use client'

/** Starts a Polar checkout for a product and redirects to the hosted page. */
import { useState } from 'react'

export function BuyButton({ slug, label }: { slug: string; label: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function buy() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      setError(data?.error?.userMessage ?? 'Couldn’t start checkout.')
    } catch {
      setError('Network error — please retry.')
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={buy}
        disabled={loading}
        className="h-9 rounded-md px-4 text-sm font-semibold disabled:opacity-50"
        style={{ background: 'var(--color-accent)', color: 'var(--color-text-on-inverse)' }}
      >
        {loading ? 'Starting…' : label}
      </button>
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
