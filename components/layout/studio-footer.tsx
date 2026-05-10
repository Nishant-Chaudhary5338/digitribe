import Link from 'next/link'

const NAV_COLS = [
  {
    heading: 'WORK',
    links: [
      { label: 'Services', href: '/dtc/services' },
      { label: 'About', href: '/dtc/about' },
      { label: 'Free Audit', href: '/dtc/audit' },
    ],
  },
  {
    heading: 'TRIBE',
    links: [
      { label: 'Contact', href: '/dtc/contact' },
      { label: 'Workshop', href: '/workshop' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
] as const

export function StudioFooter() {
  return (
    <footer
      style={{
        background: 'var(--color-bg-inverse)',
        color: 'var(--color-text-on-inverse)',
        borderTop: '2.5px solid var(--color-border)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Top band */}
      <div
        className="w-full py-5 px-5 sm:px-8 lg:px-12 flex items-center justify-between border-b"
        style={{ borderBottomColor: 'rgba(244, 239, 226, 0.15)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.5rem',
            letterSpacing: '-0.04em',
            color: 'var(--color-text-on-inverse)',
          }}
        >
          Digitribe<span style={{ color: 'var(--color-accent)' }}>.</span>
        </span>
        <span
          className="text-xs uppercase tracking-[0.12em] opacity-50"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          EST. 2026
        </span>
      </div>

      {/* Main footer grid */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <p
              className="text-2xl font-bold leading-tight mb-8 max-w-xs"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: 'var(--color-text-on-inverse)',
                letterSpacing: '-0.03em',
              }}
            >
              CODE, CONTENT,<br />CONVERSIONS —<br />UNDER ONE ROOF.
            </p>
            <Link
              href="/saas"
              className="text-xs uppercase tracking-[0.1em] opacity-50 hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-on-inverse)' }}
            >
              Switch view → SaaS
            </Link>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.heading}>
              <h3
                className="text-[11px] uppercase tracking-[0.12em] mb-5 opacity-50"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-on-inverse)' }}
              >
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3 list-none">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--color-text-on-inverse)', fontFamily: 'var(--font-mono)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t text-[11px] uppercase tracking-[0.08em] opacity-50"
          style={{
            borderTopColor: 'rgba(244, 239, 226, 0.15)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-on-inverse)',
          }}
        >
          <span>&copy; 2026 · MADE IN DELHI · STILL PRINTING</span>
          <span>DIGITRIBE.CO</span>
        </div>
      </div>
    </footer>
  )
}
