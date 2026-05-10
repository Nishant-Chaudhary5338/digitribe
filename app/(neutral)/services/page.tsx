import type { Metadata } from 'next'
import { HeroPage } from '@/components/sections/hero-page'
import { PricingTable } from '@/components/sections/pricing-table'
import { PackagesGrid } from '@/components/sections/packages-grid'
import { FinalCTA } from '@/components/sections/final-cta'
import { serviceSchema } from '@/lib/schema/service'
import { services } from '@/lib/data/services'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata({
  title: 'Services',
  description:
    'Two anchors — Build and Grow — three bundled packages, and ten productized services. Fixed scope, fixed price, no surprises. Starting from €1,500.',
  path: '/services',
})

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

export default function ServicesPage() {
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
      <section className="bg-[#f0ede5] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-[#0a0e27] mb-12 text-center font-display">
            How we price things.
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {pricingPrinciples.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl bg-white p-8 shadow-sm"
              >
                <h3 className="text-lg font-bold text-[#0a0e27] mb-3 font-display">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#0a0e27]/70">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchemas) }}
      />
    </>
  )
}
