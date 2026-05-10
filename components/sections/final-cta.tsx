import Link from 'next/link'
import { Reveal } from '@/components/primitives/reveal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'

export function FinalCTA() {
  return (
    <section
      className="py-24 sm:py-28 lg:py-32"
      style={{ background: 'var(--color-bg-inverse)' }}
    >
      <Container>
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <div
              aria-hidden="true"
              className="w-10 h-px mx-auto mb-8"
              style={{ background: 'var(--color-accent)' }}
            />

            <h2
              className="mb-6 font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                color: 'var(--color-text-on-inverse)',
              }}
            >
              Ready to stop coordinating between vendors?
            </h2>

            <p
              className="mb-10"
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--color-text-on-inverse)',
                opacity: 0.75,
              }}
            >
              Book a 30-minute audit. We&apos;ll review your site, ad accounts, and funnel — and tell you exactly what we&apos;d change. No pitch, no obligation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
