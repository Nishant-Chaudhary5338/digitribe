import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { HeroPage } from '@/components/sections/hero-page'
import { FinalCTA } from '@/components/sections/final-cta'
import { serviceSchema } from '@/lib/schema/service'
import { breadcrumbSchema } from '@/lib/schema/breadcrumb'
import { services, getServiceBySlug } from '@/lib/data/services'
import { SITE_NAME } from '@/lib/utils/constants'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return { title: 'Service not found' }
  return {
    title: `${service.name}`,
    description: service.oneLiner,
    alternates: { canonical: `https://digitribe.co/dtc/services/${service.slug}` },
    openGraph: {
      title: `${service.name} — ${SITE_NAME}`,
      description: service.oneLiner,
    },
  }
}

export default async function DTCServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  const related = services
    .filter((s) => s.category === service.category && s.slug !== service.slug)
    .slice(0, 3)

  const breadcrumbItems = [
    { label: 'Services', href: '/dtc/services' },
    { label: service.name, href: `/dtc/services/${service.slug}` },
  ]

  const priceDisplay = service.ceilingPriceEur
    ? `€${service.startingPriceEur.toLocaleString()} — €${service.ceilingPriceEur.toLocaleString()}`
    : `From €${service.startingPriceEur.toLocaleString()}`

  return (
    <>
      <HeroPage
        eyebrow={service.category.charAt(0).toUpperCase() + service.category.slice(1)}
        headline={service.name}
        sub={service.oneLiner}
        breadcrumb={breadcrumbItems}
      />

      {/* Main content */}
      <section className="py-24" style={{ background: 'var(--color-bg-page)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-[60fr_40fr] lg:items-start">
            {/* Description + scope */}
            <div>
              <p className="text-lg leading-relaxed mb-10" style={{ color: 'var(--color-text-body)' }}>
                {service.description}
              </p>
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                What&apos;s in scope.
              </h2>
              <ul className="space-y-3">
                {service.scope.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center"
                      aria-hidden="true"
                      style={{ background: 'var(--color-accent)', borderRadius: 'var(--radius-theme-pill)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="text-base" style={{ color: 'var(--color-text-body)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sticky pricing card */}
            <div className="lg:sticky lg:top-8">
              <div
                className="p-8"
                style={{
                  background: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-theme-lg, 12px)',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="mb-6">
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Starting price</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                    {priceDisplay}
                  </p>
                  {service.recurring && (
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>/month</p>
                  )}
                </div>
                <div className="mb-8 border-t pt-6" style={{ borderTopColor: 'var(--color-border)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Timeline</p>
                  <p className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {service.timeline}
                  </p>
                </div>
                <Link
                  href={`/dtc/audit?service=${service.slug}`}
                  className="btn-primary block w-full px-6 py-3 text-center text-sm font-semibold"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none',
                  }}
                >
                  Book the free audit
                </Link>
                <p className="mt-3 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  30 minutes. No pitch. Just honest feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="py-20" style={{ background: 'var(--color-bg-card-alt)' }}>
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold mb-10" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
              Other {service.category} services.
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/dtc/services/${r.slug}`}
                  className="group flex flex-col p-6 transition-shadow hover:shadow-md"
                  style={{
                    background: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-theme-lg, 12px)',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--color-border)',
                    textDecoration: 'none',
                  }}
                >
                  <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>
                    {r.category}
                  </p>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                    {r.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{r.oneLiner}</p>
                  <p className="mt-4 text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>
                    From €{r.startingPriceEur.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCTA />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema(service), breadcrumbSchema(breadcrumbItems)]) }}
      />
    </>
  )
}
