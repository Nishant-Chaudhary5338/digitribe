'use client'

import { useTheme } from '@/components/theme-provider'
import { StudioHero } from './hero/studio-hero'
import { GardenHero } from './hero/garden-hero'

// --- Neutral/legacy hero (used on old flat routes during transition) ----------

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Eyebrow } from '@/components/primitives/eyebrow'
import { Button } from '@/components/ui/button'

const HEADLINE = 'We build conversion-focused websites and run the paid traffic to fill them.'
const HEADLINE_WORDS = HEADLINE.split(' ')
const EASE_EXPRESSIVE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const TRUST_ITEMS = [
  '2 specialists',
  'Zero account managers',
  'Direct contact with the makers',
] as const

function TrustDot() {
  return (
    <span
      className="mx-3 inline-block h-1 w-1 rounded-full align-middle"
      style={{ background: 'var(--color-accent)' }}
      aria-hidden="true"
    />
  )
}

function NeutralHero() {
  const [showGlow, setShowGlow] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(() => setShowGlow(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      className="relative overflow-hidden py-32 sm:py-36 lg:py-40"
      style={{ background: 'var(--color-bg-inverse)' }}
    >
      <Container>
        <div className="max-w-3xl">
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_EXPRESSIVE }}
          >
            <Eyebrow as="p">Code, content, conversions — under one roof.</Eyebrow>
          </motion.div>

          <h1
            className="mt-6 font-bold tracking-[-0.02em]"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-on-inverse)',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 1.05,
            }}
          >
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE_EXPRESSIVE }}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: EASE_EXPRESSIVE }}
            className="mt-6 max-w-xl"
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              lineHeight: 1.55,
              color: 'var(--color-text-on-inverse)',
              opacity: 0.75,
            }}
          >
            A senior 2-person tribe — frontend engineering, AI agents, and paid acquisition — under
            one roof.
          </motion.p>

          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: EASE_EXPRESSIVE }}
            className="mt-10 flex flex-col items-start gap-4 sm:flex-row"
          >
            <Button asChild variant="primary" size="lg">
              <Link href="/audit">Book a free 30-min audit</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="#process">See how we work</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0, ease: EASE_EXPRESSIVE }}
            className="mt-8 text-sm"
            style={{ color: 'var(--color-text-on-inverse)', opacity: 0.6 }}
          >
            {TRUST_ITEMS.map((item, i) => (
              <span key={item}>
                {i > 0 && <TrustDot />}
                {item}
              </span>
            ))}
          </motion.p>
        </div>
      </Container>
    </section>
  )
}

// --- Public component --------------------------------------------------------

export function HeroHome() {
  const theme = useTheme()
  if (theme === 'studio') return <StudioHero />
  if (theme === 'garden') return <GardenHero />
  return <NeutralHero />
}
