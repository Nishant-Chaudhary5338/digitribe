import Link from 'next/link'

const NAV_LINKS = [
  { group: 'Work', links: [{ label: 'Services', href: '/saas/services' }, { label: 'Audit', href: '/saas/audit' }] },
  { group: 'Tribe', links: [{ label: 'About', href: '/saas/about' }, { label: 'Contact', href: '/saas/contact' }] },
  { group: 'Field Notes', links: [{ label: 'Workshop', href: '/workshop' }, { label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
] as const

export function GardenFooter() {
  return (
    <footer
      style={{
        background: 'var(--color-bg-card-alt)',
        borderTop: '1px dashed var(--color-border-decorative)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-14 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <p
              className="mb-3 text-sm"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 600",
                fontSize: '1.75rem',
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              Digitribe
            </p>
            <p
              className="mb-8"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: "'opsz' 14, 'wght' 400",
                fontSize: '0.9375rem',
                color: 'var(--color-text-muted)',
              }}
            >
              a small studio
            </p>
            <p
              className="text-base leading-relaxed max-w-[220px] mb-8"
              style={{ color: 'var(--color-text-body)', fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 400" }}
            >
              Code, content, conversions — under one roof.
            </p>
            <Link
              href="/dtc"
              className="text-sm opacity-50 hover:opacity-80 transition-opacity"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                textDecoration: 'none',
              }}
            >
              Switch view → DTC
            </Link>
          </div>

          {/* Nav columns */}
          {NAV_LINKS.map((col) => (
            <div key={col.group}>
              <h3
                className="mb-5 text-[15px]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: "'opsz' 14, 'wght' 500",
                  color: 'var(--color-text-muted)',
                }}
              >
                {col.group}
              </h3>
              <ul className="flex flex-col gap-3 list-none">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-text-body)', fontFamily: 'var(--font-body)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="my-12 border-t"
          style={{ borderTopStyle: 'dashed', borderTopColor: 'var(--color-border-decorative)' }}
          aria-hidden="true"
        />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            &copy; 2026 Digitribe
          </p>
          <p
            className="text-sm"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontVariationSettings: "'opsz' 14, 'wght' 400",
              color: 'var(--color-text-muted)',
            }}
          >
            ✿ made in Delhi · for the EU + US
          </p>
        </div>
      </div>
    </footer>
  )
}
