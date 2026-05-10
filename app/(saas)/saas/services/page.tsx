import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroPage } from '@/components/sections/hero-page'
import { PricingTable } from '@/components/sections/pricing-table'
import { PackagesGrid } from '@/components/sections/packages-grid'
import { FinalCTA } from '@/components/sections/final-cta'
import { serviceSchema } from '@/lib/schema/service'
import { services } from '@/lib/data/services'

export const metadata: Metadata = {
  title: 'Services — what we build and grow',
  description:
    'Two anchors — Build and Grow — three bundled packages, and ten productized services. Fixed scope, fixed price, no surprises. Starting from €1,500.',
  alternates: { canonical: 'https://digitribe.co/saas/services' },
  openGraph: {
    title: 'Digitribe Services — for SaaS founders',
    images: [{ url: '/og/saas-services.png', width: 1200, height: 630 }],
  },
}

const pricingPrinciples = [
  {
    title: 'No hourly billing.',
    body: "Every engagement has a fixed price agreed before we start. You know exactly what you're paying. We know exactly what we're building.",
  },
  {
    title: '50/50 milestone payments.',
    body: '50% to start, 50% on delivery. No net-30 invoices chasing. No full payment upfront. Milestones align incentives on both sides.',
  },
  {
    title: 'Out-of-scope is honest, not punitive.',
    body: "If something outside original scope comes up, we tell you what it costs and you decide. We don't bill surprise hours or hold launches hostage.",
  },
]

export default function SaaSServicesPage() {
  const serviceSchemas = services.map((s) => serviceSchema(s))

  return (
    <>
      <HeroPage
        eyebrow="What we do"
        headline="Two anchors. Three packages. One outcome: growth you can measure."
        sub="Productized engagements with fixed scope and transparent pricing."
      />

      <section id="build">
        <PricingTable category="build" theme="sand" />
      </section>

      <section id="grow">
        <PricingTable category="grow" theme="ink" />
      </section>

      <section id="packages">
        <PackagesGrid />
      </section>

      {/* Pricing principles */}
      <section className="py-24" style={{ background: 'var(--color-bg-card-alt)' }}>
        <div className="mx-auto max-w-5xl px-6">
          <h2
            className="text-3xl font-bold mb-12 text-center"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            How we price things.
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {pricingPrinciples.map((p) => (
              <div
                key={p.title}
                className="p-8"
                style={{
                  background: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-theme-lg, 24px)',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--color-border)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
                >
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to audit */}
      <div className="pb-16 flex justify-center" style={{ background: 'var(--color-bg-card-alt)' }}>
        <Link
          href="/saas/audit"
          className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold"
          style={{
            background: 'var(--color-accent)',
            color: '#F8F1DC',
            fontFamily: 'var(--font-body)',
            textDecoration: 'none',
          }}
        >
          Book the free audit →
        </Link>
      </div>

      <FinalCTA />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchemas) }} />
    </>
  )
}
