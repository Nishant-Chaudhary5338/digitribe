'use client'

import Link from 'next/link'
import { Reveal } from '@/components/primitives/reveal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { useTheme } from '@/components/theme-provider'

const DELIVERABLE =
  '// 30 min → a Loom walkthrough + a prioritized punch list within 24h. Yours to keep.'

const HEADLINE: Record<'studio' | 'garden' | 'neutral', string> = {
  studio: 'Stop coordinating between vendors.',
  garden: 'One studio. Build, growth, and the AI in between.',
  neutral: 'Ready to stop coordinating between vendors?',
}

export function FinalCTA() {
  const theme = useTheme()
  const isStudio = theme === 'studio'
  const isGarden = theme === 'garden'

  return (
    <section
      style={{ background: 'var(--color-bg-inverse)', paddingBlock: 'var(--space-section-lg)' }}
    >
      <Container>
        <Reveal>
          <div
            className="mx-auto max-w-2xl text-center"
            style={
              isStudio
                ? {
                    border: '2.5px solid var(--color-accent)',
                    boxShadow: '8px 8px 0 var(--color-secondary)',
                    padding: 'clamp(2rem, 5vw, 3.5rem)',
                    background:
                      'color-mix(in oklab, var(--color-bg-inverse) 92%, var(--color-secondary))',
                  }
                : undefined
            }
          >
            {/* seam fuses here — a short accent stem feeding the CTA */}
            <div
              aria-hidden="true"
              className="mx-auto mb-8"
              style={{
                width: isStudio ? 3 : 2,
                height: isStudio ? 40 : 32,
                background: isGarden
                  ? 'linear-gradient(to bottom, transparent, var(--color-accent))'
                  : 'var(--color-accent)',
              }}
            />

            <h2
              className="mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--display-sm)',
                fontWeight: isStudio ? 800 : undefined,
                fontStyle: isGarden ? 'italic' : undefined,
                fontVariationSettings: isGarden ? "'opsz' 144, 'SOFT' 100, 'wght' 500" : undefined,
                letterSpacing: 'var(--tracking-display)',
                lineHeight: 'var(--leading-tight)',
                color: 'var(--color-text-on-inverse)',
              }}
            >
              {HEADLINE[theme]}
            </h2>

            <p
              className="mb-4"
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--color-text-on-inverse)',
                opacity: 0.78,
              }}
            >
              Book a 30-minute audit. We&apos;ll review your site, ad accounts, and funnel — and
              tell you exactly what we&apos;d change. No pitch, no obligation.
            </p>

            <p
              className="mb-10"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-on-inverse)',
                opacity: 0.5,
              }}
            >
              {DELIVERABLE}
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild variant="primary">
                <Link href="/audit">Book the free audit</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/contact">Or start a project</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
