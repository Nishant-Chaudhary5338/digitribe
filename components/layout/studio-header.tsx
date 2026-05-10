'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV = [
  { label: '// services', href: '/dtc/services' },
  { label: '// about', href: '/dtc/about' },
  { label: '// contact', href: '/dtc/contact' },
  { label: '// notes', href: '/workshop' },
] as const

export function StudioHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b-[2px]"
        style={{
          background: 'var(--color-bg-page)',
          borderBottomColor: 'var(--color-border)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link
              href="/dtc"
              className="flex items-baseline gap-0 shrink-0"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.75rem',
                letterSpacing: '-0.04em',
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
              }}
            >
              Digitribe
              <span
                aria-hidden="true"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: '2.25rem',
                  lineHeight: 0,
                  verticalAlign: 'middle',
                }}
              >
                .
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-8">
              <ul className="flex items-center gap-6 list-none" role="list">
                {NAV.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium transition-colors duration-150 hover:opacity-70"
                      style={{ color: 'var(--color-text-body)', fontFamily: 'var(--font-mono)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* CTA: navy bg, yellow offset shadow */}
              <Link
                href="/dtc/audit"
                className="relative inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-150"
                style={{
                  background: 'var(--color-text-primary)',
                  color: 'var(--color-text-on-inverse)',
                  border: '2px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '5px 5px 0 var(--color-tertiary)',
                }}
              >
                ↗ book audit
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
          className="fixed inset-0 z-[60] flex flex-col p-6"
          style={{ background: 'var(--color-bg-page)', border: '2px solid var(--color-border)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex items-center justify-between mb-10">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.75rem',
                letterSpacing: '-0.04em',
                color: 'var(--color-text-primary)',
              }}
            >
              Digitribe<span style={{ color: 'var(--color-accent)' }}>.</span>
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
            <ul className="flex flex-col gap-6 list-none">
              {NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.125rem',
                      color: 'var(--color-text-body)',
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
              href="/dtc/audit"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2 px-6 py-4 text-sm font-semibold w-full justify-center"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-text-primary)',
                border: '2.5px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
                boxShadow: '5px 5px 0 var(--color-secondary)',
              }}
            >
              ↗ book audit
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
