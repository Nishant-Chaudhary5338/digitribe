'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function RisoShapes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Pink circle */}
      <div
        className="riso-pink absolute"
        style={{ width: 520, height: 520, top: 80, right: -140 }}
      />
      {/* Blue circle */}
      <div
        className="riso-blue absolute"
        style={{ width: 380, height: 380, top: 360, right: 60 }}
      />
      {/* Yellow square */}
      <div
        className="riso-yellow absolute"
        style={{ width: 200, height: 200, top: 420, right: 350, transform: 'rotate(8deg)' }}
      />
    </div>
  )
}

function Annotation({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-accent)',
        fontStyle: 'italic',
        fontSize: '1.0625rem',
        background: 'var(--color-tertiary)',
        padding: '5px 11px',
        border: '2px solid var(--color-border)',
        transform: 'rotate(-3deg)',
        display: 'inline-block',
        color: 'var(--color-text-primary)',
      }}
    >
      {children}
    </span>
  )
}

export function StudioHero() {
  const reduced = useReducedMotion()

  const container = {
    initial: {},
    animate: { transition: { staggerChildren: 0.08 } },
  }
  const item = {
    initial: reduced ? {} : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  return (
    <section
      className="relative grain-bg overflow-hidden border-b-[2.5px]"
      style={{
        background: 'var(--color-bg-page)',
        borderBottomColor: 'var(--color-border)',
        minHeight: 720,
        paddingTop: 'clamp(4rem, 6vw, 6rem)',
        paddingBottom: 'clamp(4rem, 6vw, 6rem)',
      }}
    >
      <RisoShapes />

      <div
        className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12"
      >
        <motion.div variants={container} initial="initial" animate="animate">

          {/* Eyebrow */}
          <motion.div variants={item} className="mb-8">
            <span
              className="inline-block"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'var(--color-tertiary)',
                padding: '8px 16px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                border: '2px solid var(--color-border)',
                transform: 'rotate(-1deg)',
                color: 'var(--color-text-primary)',
              }}
            >
              /// 3-person studio · built for brands that move fast
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="mb-9 max-w-[900px]"
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: "'wdth' 92, 'opsz' 96",
              fontWeight: 800,
              fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
              lineHeight: 0.93,
              letterSpacing: '-0.05em',
              color: 'var(--color-text-primary)',
            }}
          >
            Code, content,{' '}
            <span
              className="relative inline-block"
              style={{ color: 'var(--color-secondary)' }}
            >
              {/* Yellow underline highlight behind "conversions" */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0"
                style={{
                  bottom: '14px',
                  height: '18px',
                  background: 'var(--color-tertiary)',
                  zIndex: -1,
                }}
              />
              conversions
            </span>{' '}
            —{' '}
            <br />
            under one{' '}
            <span
              style={{
                fontFamily: 'var(--font-accent)',
                fontStyle: 'italic',
                fontWeight: 400,
                letterSpacing: '-0.02em',
              }}
            >
              roof.
            </span>
          </motion.h1>

          {/* Floating annotation */}
          <motion.div
            variants={item}
            className="hidden sm:block absolute"
            style={{ top: 'clamp(14rem, 22vw, 22rem)', left: 'clamp(24rem, 40%, 48rem)' }}
            aria-hidden="true"
          >
            <Annotation>↑ same team. same week.</Annotation>
          </motion.div>

          {/* Sub */}
          <motion.p
            variants={item}
            className="mb-11 max-w-[600px]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.5vw, 1.3125rem)',
              lineHeight: 1.42,
              color: 'var(--color-text-body)',
            }}
          >
            Senior practitioners running the entire build-to-growth funnel. No account managers. No silos. We make websites that convert and run the paid traffic to fill them — same team, same week.
          </motion.p>

          {/* CTA row */}
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-20">
            {/* Primary: pink + navy border + blue offset shadow */}
            <Link
              href="/dtc/audit"
              className="btn-primary inline-flex items-center gap-3 px-7 py-[18px] text-[15px] font-bold"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Book a 30-min audit
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>

            {/* Secondary: mono, curly braces, bordered */}
            <Link
              href="/dtc/services"
              className="inline-flex items-center px-7 py-[16px] text-sm font-medium transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-primary)',
                border: '2.5px solid var(--color-border)',
                background: 'transparent',
                textDecoration: 'none',
              }}
            >
              {'{ see services }'}
            </Link>
          </motion.div>

          {/* Stat stamps */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-9 border-t-[2.5px]"
            style={{ borderTopColor: 'var(--color-border)' }}
          >
            {[
              { num: '3', label: 'senior makers', color: 'var(--color-secondary)' },
              { num: '5+', label: 'years each', color: 'var(--color-accent)' },
              { num: '0', label: 'account managers', color: 'var(--color-text-primary)' },
              { num: 'EU+US', label: 'built for', color: 'var(--color-secondary)', small: true },
            ].map(({ num, label, color, small }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontVariationSettings: "'wdth' 88, 'opsz' 96",
                    fontWeight: 800,
                    fontSize: small ? '2.375rem' : '3.25rem',
                    lineHeight: 1,
                    color,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {num}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
