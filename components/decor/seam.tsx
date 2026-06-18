'use client'

import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'

export interface SeamProps {
  theme: 'studio' | 'garden'
}

/**
 * The Seam — Digitribe's signature connective element. A thin line that runs down
 * the left gutter and "draws in" as you scroll, rendering the brand thesis: two
 * founders, two lanes, one continuous team. Decorative only (aria-hidden,
 * pointer-events:none), desktop-only, and fully static under reduced motion / no-JS.
 *
 * Studio = a two-channel registration line (pink + blue, slightly offset).
 * Garden = a single terracotta ink line with a budded cap.
 */
export function Seam({ theme }: SeamProps) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const height = useTransform(scrollYProgress, [0, 1], ['4%', '100%'])
  const isStudio = theme === 'studio'

  // Reduced motion / pre-hydration: a fully-drawn static seam carries the same meaning.
  const drawn = reduced ? { height: '100%' } : { height }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 z-0 hidden md:block"
      style={{ left: 'clamp(14px, 3.5vw, 44px)', height: '100vh', width: isStudio ? 7 : 3 }}
    >
      {isStudio ? (
        <>
          {/* blue channel */}
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 2,
              borderRadius: 2,
              background: 'var(--color-secondary)',
              opacity: 0.5,
              ...drawn,
            }}
          />
          {/* pink channel, offset — the registration "misprint" */}
          <motion.div
            style={{
              position: 'absolute',
              left: 4,
              top: 0,
              width: 2,
              borderRadius: 2,
              background: 'var(--color-accent)',
              opacity: 0.55,
              ...drawn,
            }}
          />
        </>
      ) : (
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 2,
            borderRadius: 2,
            background:
              'linear-gradient(to bottom, var(--color-accent), color-mix(in oklab, var(--color-accent) 55%, transparent))',
            opacity: 0.6,
            ...drawn,
          }}
        />
      )}
    </div>
  )
}
