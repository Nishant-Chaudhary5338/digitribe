'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const COOKIE_NAME = 'digitribe_theme'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days

function setThemeCookie(theme: 'studio' | 'garden') {
  document.cookie = `${COOKIE_NAME}=${theme}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
}

export default function SplashPage() {
  const router = useRouter()
  const [hovered, setHovered] = useState<'studio' | 'garden' | null>(null)

  function handleChoose(theme: 'studio' | 'garden') {
    setThemeCookie(theme)
    router.push(theme === 'studio' ? '/dtc' : '/saas')
  }

  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background:
          hovered === 'studio'
            ? '#F4EFE2'
            : hovered === 'garden'
              ? '#F0E6CE'
              : '#F2EAD8',
        transition: 'background 300ms ease',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Hidden h1 for a11y / SEO */}
      <h1 className="sr-only">Digitribe — choose your experience</h1>

      {/* Wordmark */}
      <p
        className="mb-16 text-center"
        style={{
          fontFamily: 'var(--font-bricolage, var(--font-fraunces, system-ui))',
          fontWeight: 700,
          fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
          letterSpacing: '-0.03em',
          color: '#2D2418',
        }}
      >
        Digitribe
      </p>

      {/* Tagline */}
      <p
        className="mb-12 text-center text-sm max-w-xs"
        style={{ color: '#4D6040', fontFamily: 'var(--font-inter-tight, system-ui)' }}
      >
        Code, content, conversions — under one roof.
      </p>

      {/* Two choice cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {/* Studio / DTC card */}
        <button
          onClick={() => handleChoose('studio')}
          onMouseEnter={() => setHovered('studio')}
          onMouseLeave={() => setHovered(null)}
          className="group text-left p-8 border-[2.5px] transition-all duration-200"
          style={{
            background: '#FAF6E8',
            borderColor: '#1A2233',
            boxShadow:
              hovered === 'studio'
                ? '7px 7px 0 #2841DD'
                : '5px 5px 0 rgba(26, 34, 51, 0.2)',
            transform: hovered === 'studio' ? 'translate(-2px, -2px)' : 'translate(0, 0)',
          }}
          aria-label="Enter DTC experience"
        >
          <p
            className="text-xs uppercase tracking-[0.12em] mb-4"
            style={{
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
              color: '#1A2233',      /* Navy — 9.7:1 on card bg, passes WCAG AA */
            }}
          >
            /// For e-commerce founders
          </p>
          <h2
            className="text-2xl font-bold mb-3 leading-tight"
            style={{
              fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', system-ui)",
              fontWeight: 800,
              color: '#1A2233',
              letterSpacing: '-0.03em',
            }}
          >
            Built for DTC brands
          </h2>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: '#2D3548', fontFamily: "var(--font-bricolage, system-ui)" }}
          >
            $5M–$20M ARR. Conversion-focused sites and the paid traffic to fill them. Riso-print energy, senior craft.
          </p>
          <span
            className="inline-flex items-center gap-2 text-sm font-bold"
            style={{
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              color: '#1A2233',
            }}
          >
            → See how we work for DTC
          </span>
        </button>

        {/* Garden / SaaS card */}
        <button
          onClick={() => handleChoose('garden')}
          onMouseEnter={() => setHovered('garden')}
          onMouseLeave={() => setHovered(null)}
          className="group text-left p-8 border transition-all duration-200"
          style={{
            background: 'rgba(255, 251, 240, 0.65)',
            backdropFilter: 'blur(2px)',
            borderColor: 'rgba(45, 36, 24, 0.15)',
            borderRadius: '24px',
            boxShadow:
              hovered === 'garden'
                ? '0 8px 0 #2D2418'
                : '0 5px 0 rgba(45, 36, 24, 0.15)',
            transform: hovered === 'garden' ? 'translateY(-3px)' : 'translateY(0)',
          }}
          aria-label="Enter SaaS experience"
        >
          <p
            className="text-sm italic mb-4"
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontVariationSettings: "'opsz' 14, 'wght' 400",
              color: '#4D6040',   /* Darkened sage: 5.6:1 on card bg — WCAG AA */
            }}
          >
            ─── for SaaS founders ✿
          </p>
          <h2
            className="text-2xl mb-3 leading-tight"
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 500",
              color: '#2D2418',
              letterSpacing: '-0.03em',
            }}
          >
            Built for product-led SaaS
          </h2>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{
              color: '#4A4030',
              fontFamily: "var(--font-inter-tight, system-ui)",
            }}
          >
            Seed to Series A. Product-grade marketing sites and the paid traffic behind them. Considered, not templated.
          </p>
          <span
            className="inline-flex items-center gap-2 text-sm italic border-b pb-0.5"
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontVariationSettings: "'opsz' 14, 'wght' 500",
              color: '#2D2418',
              borderBottomColor: '#2D2418',
            }}
          >
            → See how we work for SaaS
          </span>
        </button>
      </div>

      {/* Direct links for SEO / accessibility */}
      <nav
        aria-label="Direct theme links"
        className="mt-10 flex gap-6 text-xs"
        style={{ color: '#4D6040' }}  /* Accessible dark sage */
      >
        <Link href="/dtc" style={{ color: 'inherit', textDecoration: 'none' }}>
          /dtc
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/saas" style={{ color: 'inherit', textDecoration: 'none' }}>
          /saas
        </Link>
      </nav>
    </main>
  )
}
