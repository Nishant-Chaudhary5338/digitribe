'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function OrganicBlobs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Dashed circle top-left */}
      <svg
        className="absolute"
        style={{ top: 60, left: -100, width: 380, height: 380 }}
        viewBox="0 0 200 200"
      >
        <path
          d="M40,100 Q40,40 100,40 Q160,40 160,100 Q160,160 100,160 Q40,160 40,100"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="0.7"
          strokeDasharray="3 5"
          opacity="0.6"
        />
      </svg>
      {/* Organic blob bottom-right */}
      <svg
        className="absolute"
        style={{ bottom: 100, right: -80, width: 320, height: 320 }}
        viewBox="0 0 100 100"
      >
        <path
          d="M50,8 Q72,18 82,40 Q92,62 80,82 Q68,92 48,90 Q26,88 16,68 Q8,46 22,26 Q36,8 50,8"
          fill="var(--color-secondary)"
          opacity="0.16"
        />
      </svg>
      {/* Pollen dot cluster mid */}
      <svg
        className="absolute hidden sm:block"
        style={{ top: 320, left: 580, width: 80, height: 80 }}
        viewBox="0 0 40 40"
      >
        <circle cx="20" cy="20" r="10" fill="var(--color-tertiary)" opacity="0.5" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="var(--color-tertiary)" strokeWidth="0.5" opacity="0.7" />
      </svg>
      {/* Leaf bottom-left */}
      <svg
        className="absolute"
        style={{ bottom: 120, left: 40, width: 60, height: 60 }}
        viewBox="0 0 40 40"
      >
        <path d="M20 5 Q 25 15 20 20 Q 15 15 20 5" fill="var(--color-secondary)" opacity="0.5" />
        <path d="M5 20 Q 15 25 20 20 Q 15 15 5 20" fill="var(--color-secondary)" opacity="0.5" />
      </svg>
    </div>
  )
}

function HandDrawnUnderline() {
  return (
    <svg
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: -4,
        left: 0,
        right: 0,
        width: '100%',
        height: 16,
      }}
    >
      <path
        d="M0 8 Q 25 0 50 8 T 100 8 T 150 8 T 200 8"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const FOUNDERS = [
  { initial: 'N', name: 'Nishant', role: 'Engineering & build', dotStyle: { borderRadius: '60% 50% 60% 50%', background: 'linear-gradient(135deg, #C5704F, #A35538)' } },
  { initial: 'N', name: 'Nidhi', role: 'Design & UX research', dotStyle: { borderRadius: '50% 60% 50% 60%', background: 'linear-gradient(135deg, #7A8B6E, #5C6E54)' } },
  { initial: 'M', name: 'Manu', role: 'Paid acquisition & growth', dotStyle: { borderRadius: '60% 60% 50% 50%', background: 'linear-gradient(135deg, #6B3E5C, #4F2D44)' } },
]

export function GardenHero() {
  const reduced = useReducedMotion()

  const container = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1 } },
  }
  const item = {
    initial: reduced ? {} : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'var(--color-bg-page)',
        paddingTop: 'clamp(4rem, 7vw, 7rem)',
        paddingBottom: 'clamp(4rem, 7vw, 7rem)',
        minHeight: 720,
      }}
    >
      <OrganicBlobs />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-14">
        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16 items-start"
        >
          {/* Left: content */}
          <div>
            {/* Eyebrow */}
            <motion.div variants={item} className="mb-8">
              <span
                className="inline-flex items-center gap-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: "'opsz' 14, 'wght' 500",
                  fontSize: '0.9375rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ display: 'inline-block', width: 32, height: 1, background: 'var(--color-accent)', flexShrink: 0 }}
                />
                A small studio · Delhi · serving EU + US
                <span aria-hidden="true" style={{ color: 'var(--color-accent)', fontSize: '1rem', marginLeft: 4 }}>✿</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="mb-10"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 400",
                fontSize: 'clamp(3rem, 7.5vw, 6rem)',
                lineHeight: 0.96,
                letterSpacing: '-0.04em',
                color: 'var(--color-text-primary)',
              }}
            >
              Code, content,{' '}
              <br />
              <span
                className="relative inline-block"
                style={{
                  color: 'var(--color-accent)',
                  fontStyle: 'italic',
                  fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 500",
                }}
              >
                conversions
                <HandDrawnUnderline />
              </span>
              {' '}—{' '}
              <br />
              <span
                style={{
                  fontStyle: 'italic',
                  fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 300",
                }}
              >
                under one roof.
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={item}
              className="mb-12 max-w-[580px]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(1rem, 1.5vw, 1.1875rem)',
                lineHeight: 1.55,
                color: 'var(--color-text-body)',
              }}
            >
              A senior 3-person tribe building conversion-focused websites and running the paid traffic to fill them. We work the way studios used to — small, considered, ours.
            </motion.p>

            {/* CTA row */}
            <motion.div variants={item} className="flex flex-wrap gap-6 items-center">
              {/* Primary: terracotta pill, 3D push shadow */}
              <Link
                href="/saas/audit"
                className="btn-primary inline-flex items-center gap-3 px-8 py-[18px] text-[15px] font-semibold"
                style={{
                  background: 'var(--color-accent)',
                  color: '#F8F1DC',
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                }}
              >
                Book a 30-min audit
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Link>

              {/* Secondary: Fraunces italic underline */}
              <Link
                href="/workshop"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: "'opsz' 14, 'wght' 500",
                  fontSize: '1.0625rem',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  borderBottom: '1.5px solid currentColor',
                  paddingBottom: 3,
                }}
              >
                or read our notes
              </Link>
            </motion.div>
          </div>

          {/* Right: founder card */}
          <motion.div
            variants={item}
            className="relative mt-10 lg:mt-14"
            style={{
              background: 'var(--color-bg-card)',
              backdropFilter: 'blur(2px)',
              borderRadius: '24px',
              padding: '36px 32px',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Decorative ✿ */}
            <span
              aria-hidden="true"
              className="absolute"
              style={{
                top: -28,
                right: -16,
                fontFamily: 'var(--font-display)',
                fontSize: '4rem',
                transform: 'rotate(15deg)',
                color: 'var(--color-accent)',
                lineHeight: 1,
              }}
            >
              ✿
            </span>

            <p
              className="mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: "'opsz' 14, 'wght' 500",
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
              }}
            >
              — who you'll work with
            </p>
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500",
                fontSize: '1.5rem',
                lineHeight: 1.2,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Three senior practitioners. No middle layer.
            </p>

            <div className="flex flex-col">
              {FOUNDERS.map((f, i) => (
                <div
                  key={f.name}
                  className="flex items-center gap-4 py-3.5"
                  style={{
                    borderBottom: i < FOUNDERS.length - 1
                      ? '1px dotted rgba(45, 36, 24, 0.2)'
                      : 'none',
                  }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      ...f.dotStyle,
                      color: 'var(--color-text-on-inverse)',
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    {f.initial}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'wght' 500",
                        fontSize: '1.0625rem',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {f.name}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {f.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          variants={item}
          initial={reduced ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
          className="mt-20 pt-9 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t"
          style={{ borderTopStyle: 'dashed', borderTopColor: 'var(--color-border-decorative)' }}
        >
          {[
            { num: '3', label: 'senior makers' },
            { num: '5+', label: 'years each' },
            { num: '0', label: 'account managers' },
            { num: 'EU+US', label: 'built for', small: true },
          ].map(({ num, label, small }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500",
                  fontSize: small ? '2rem' : '2.75rem',
                  color: 'var(--color-accent)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {num}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-body)', fontWeight: 500 }}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
