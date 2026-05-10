import Link from 'next/link'

export function NeutralHeader() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: 'var(--color-bg-page)',
        borderBottomColor: 'var(--color-border-decorative)',
        borderBottomStyle: 'dashed',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
            }}
          >
            Digitribe
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dtc"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              For DTC
            </Link>
            <Link
              href="/saas"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              For SaaS
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
