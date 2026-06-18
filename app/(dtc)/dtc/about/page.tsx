import type { Metadata } from 'next'
import { HeroPage } from '@/components/sections/hero-page'
import { FoundersGrid } from '@/components/sections/founders-grid'
import { FinalCTA } from '@/components/sections/final-cta'
import { personSchema } from '@/lib/schema/person'
import { founders } from '@/lib/data/founders'

export const metadata: Metadata = {
  title: 'About — the tribe behind Digitribe',
  description:
    'Two senior operators — one engineer, one paid acquisition specialist — who got tired of watching agencies over-charge and under-deliver. We built a better model.',
  alternates: { canonical: 'https://digitribe.co/dtc/about' },
  openGraph: {
    title: 'About Digitribe — for DTC founders',
    images: [{ url: '/og/dtc-about.png', width: 1200, height: 630 }],
  },
}

const principles = [
  {
    heading: 'We work at operator level.',
    body: 'Every client gets a senior founder on their account — not an account manager relaying messages to a junior team. You talk directly to the person doing the work.',
  },
  {
    heading: 'We price honestly.',
    body: "Fixed scope, fixed price, 50/50 milestones. No hourly billing, no retainer traps, no 'scope creep' penalties for reasonable requests.",
  },
  {
    heading: "We're a small team on purpose.",
    body: 'Two people who each specialize deeply beats twelve people where nobody owns anything. We know our limits and we stay within them.',
  },
]

const notForUs = [
  "We don't take enterprise contracts.",
  "We don't white-label for other agencies.",
  "We don't do 'we'll figure out scope later.'",
  "We don't ghost after launch.",
  "We don't bill hourly.",
]

export default function DTCAboutPage() {
  const personSchemas = founders.map((f) => personSchema(f))

  return (
    <>
      <HeroPage
        eyebrow="The tribe"
        headline="Two founders. One agency model that doesn't suck."
        sub="We started Digitribe because we kept watching agencies overcharge for under-delivery."
      />

      {/* Story */}
      <section className="py-24" style={{ background: 'var(--color-bg-card-alt)' }}>
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
            Between us, we have 15+ years building and growing digital products inside large
            organizations. We&apos;ve sat in the meetings where agencies presented beautiful decks
            and then handed work to interns. We&apos;ve watched clients pay retainers for strategy
            documents that never shipped.
          </p>
          <p className="mb-16 text-lg leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
            So we left our jobs and built the agency we always wanted to hire. Small team, senior
            operators, productized scope, transparent pricing. We do the work ourselves. Every time.
          </p>

          <h2
            className="mb-10 text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            Three principles we don&apos;t negotiate on.
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {principles.map((p) => (
              <div key={p.heading} className="flex flex-col gap-3">
                <h3
                  className="text-base font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
                >
                  {p.heading}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FoundersGrid variant="full" />

      {/* Not for everyone */}
      <section className="py-24" style={{ background: 'var(--color-bg-card-alt)' }}>
        <div className="mx-auto max-w-3xl px-6">
          <h2
            className="mb-4 text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            We&apos;re not for everyone.
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'var(--color-text-muted)' }}>
            We&apos;d rather be the right fit for fewer clients than the wrong fit for many.
          </p>
          <ul className="space-y-4">
            {notForUs.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
                  aria-hidden="true"
                  style={{
                    background: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-theme-pill)',
                    color: 'var(--color-text-on-inverse)',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </span>
                <span className="text-base" style={{ color: 'var(--color-text-body)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCTA />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchemas) }}
      />
    </>
  )
}
