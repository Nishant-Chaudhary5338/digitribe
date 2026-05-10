'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV = [
  { label: 'Services', href: '/saas/services' },
  { label: 'About', href: '/saas/about' },
  { label: 'Contact', href: '/saas/contact' },
  { label: 'Field Notes', href: '/workshop' },
] as const

export function GardenHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          background: 'var(--color-bg-page)',
          borderBottomStyle: 'dashed',
          borderBottomColor: 'var(--color-border-decorative)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo: organic mark + Fraunces wordmark */}
            <Link
              href="/saas"
              className="flex items-center gap-2.5 shrink-0"
              style={{ textDecoration: 'none' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, #A35538 100%)',
                  borderRadius: '60% 50% 60% 50%',
                  transform: 'rotate(-12deg)',
                  boxShadow: '2px 2px 0 0 rgba(45, 36, 24, 0.15)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 600",
                  fontSize: '1.625rem',
                  letterSpacing: '-0.03em',
                  color: 'var(--color-text-primary)',
                }}
              >
                Digitribe
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-10">
              <ul className="flex items-center gap-8 list-none" role="list">
                {NAV.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-medium transition-colors duration-200 hover:opacity-70"
                      style={{ color: 'var(--color-text-body)', fontFamily: 'var(--font-body)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* CTA: pill, dark brown bg */}
              <Link
                href="/saas/audit"
                className="inline-flex items-center gap-2 px-6 py-3 text-[15px] font-medium transition-all duration-150"
                style={{
                  background: 'var(--color-bg-inverse)',
                  color: 'var(--color-text-on-inverse)',
                  borderRadius: '100px',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: "'opsz' 14, 'wght' 500",
                }}
              >
                → book audit
              </Link>
            </nav>

            {/* Mobile toggle */}
            <button
              className="lg:hidden inline-flex items-center justify-center h-10 w-10"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              style={{ color: 'var(--color-text-body)' }}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-60 flex flex-col p-8"
          style={{ background: 'var(--color-bg-page)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between mb-12">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 600",
                fontSize: '1.625rem',
                letterSpacing: '-0.03em',
                color: 'var(--color-text-primary)',
              }}
            >
              Digitribe
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{ color: 'var(--color-text-body)' }}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <nav>
            <ul className="flex flex-col gap-8 list-none">
              {NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500",
                      fontSize: '1.5rem',
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto">
            <Link
              href="/saas/audit"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 w-full text-base font-medium"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-text-on-inverse)',
                borderRadius: '999px',
                boxShadow: '0 5px 0 var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Book a 30-min audit →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
