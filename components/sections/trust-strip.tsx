'use client'

import { useTheme } from '@/components/theme-provider'

const CLAIMS = [
  '0 account managers',
  'you talk to the makers',
  'build + ads, one invoice',
  'EU & US hours',
]

export function TrustStrip() {
  const theme = useTheme()

  if (theme === 'garden') {
    // Hairline-ruled, warm, Fraunces-italic line on paper.
    return (
      <section
        style={{
          background: 'var(--color-bg-page)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          paddingBlock: 'var(--space-section-sm)',
        }}
      >
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p
            style={{
              fontFamily: 'var(--font-accent)',
              fontStyle: 'italic',
              fontVariationSettings: "'opsz' 40, 'wght' 400",
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--color-text-body)',
            }}
          >
            — {CLAIMS.map((c) => c).join('. ')}. —
          </p>
        </div>
      </section>
    )
  }

  // Studio / neutral: hard dark band, mono, registration crosses.
  const isStudio = theme === 'studio'
  return (
    <section
      className="py-5"
      style={{
        background: 'var(--color-bg-inverse)',
        borderTop: '1px solid var(--color-border-decorative)',
        borderBottom: '1px solid var(--color-border-decorative)',
      }}
    >
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8 lg:px-12">
        <p
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
          style={{
            fontFamily: isStudio ? 'var(--font-mono)' : 'var(--font-body)',
            fontSize: isStudio ? '0.8125rem' : '1rem',
            letterSpacing: isStudio ? '0.04em' : undefined,
            color: 'var(--color-text-on-inverse)',
            opacity: 0.78,
          }}
        >
          {CLAIMS.map((c, i) => (
            <span key={c} className="inline-flex items-center gap-3">
              <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
                {isStudio ? '✛' : '—'}
              </span>
              {c}
              {i === CLAIMS.length - 1 && (
                <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
                  {isStudio ? '✛' : '—'}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
