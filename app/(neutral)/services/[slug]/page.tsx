import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { HeroPage } from '@/components/sections/hero-page'
import { FinalCTA } from '@/components/sections/final-cta'
import { serviceSchema } from '@/lib/schema/service'
import { breadcrumbSchema } from '@/lib/schema/breadcrumb'
import { services, getServiceBySlug } from '@/lib/data/services'
import { SITE_NAME } from '@/lib/utils/constants'
import { CAL_URL } from '@/lib/utils/constants'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)

  if (!service) {
    return { title: 'Service not found' }
  }

  return {
    title: `${service.name} — ${SITE_NAME}`,
    description: service.oneLiner,
    openGraph: {
      title: `${service.name} — ${SITE_NAME}`,
      description: service.oneLiner,
    },
    alternates: {
      canonical: `/services/${service.slug}`,
    },
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const service = getServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  const related = services
    .filter((s) => s.category === service.category && s.slug !== service.slug)
    .slice(0, 3)

  const breadcrumbItems = [
    { label: 'Services', href: '/services' },
    { label: service.name, href: `/services/${service.slug}` },
  ]

  const svcSchema = serviceSchema(service)
  const bcSchema = breadcrumbSchema(breadcrumbItems)

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
      <section className="py-24 bg-[#fafaf7]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 lg:grid-cols-[60fr_40fr] lg:items-start">
            {/* Left: description + scope */}
            <div>
              <p className="text-lg leading-relaxed text-[#0a0e27]/80 mb-10">
                {service.description}
              </p>
              <h2 className="text-xl font-bold text-[#0a0e27] mb-6 font-display">
                What's in scope.
              </h2>
              <ul className="space-y-3">
                {service.scope.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ff5b3a]"
                      aria-hidden="true"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-2.5 w-2.5"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="text-base text-[#0a0e27]/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: sticky pricing card */}
            <div className="lg:sticky lg:top-8">
              <div className="rounded-2xl border border-[#0a0e27]/10 bg-white p-8 shadow-md">
                <div className="mb-6">
                  <p className="text-sm text-[#0a0e27]/50 mb-1">Starting price</p>
                  <p className="text-3xl font-bold text-[#0a0e27] font-display">
                    {priceDisplay}
                  </p>
                  {service.recurring && (
                    <p className="text-sm text-[#0a0e27]/50 mt-1">/month</p>
                  )}
                </div>
                <div className="mb-8 border-t border-[#0a0e27]/10 pt-6">
                  <p className="text-sm text-[#0a0e27]/50 mb-1">Timeline</p>
                  <p className="text-base font-medium text-[#0a0e27]">
                    {service.timeline}
                  </p>
                </div>
                <Link
                  href={`/audit?service=${service.slug}`}
                  className="block w-full rounded-full bg-[#ff5b3a] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#ff7556]"
                >
                  Book the free audit
                </Link>
                <p className="mt-3 text-center text-xs text-[#0a0e27]/40">
                  30 minutes. No pitch. Just honest feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="py-20 bg-[#f0ede5]">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-[#0a0e27] mb-10 font-display">
              Other {service.category} services.
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-[#ff5b3a] mb-2">
                    {r.category}
                  </p>
                  <h3 className="text-lg font-bold text-[#0a0e27] mb-2 font-display group-hover:text-[#ff5b3a] transition-colors">
                    {r.name}
                  </h3>
                  <p className="text-sm text-[#0a0e27]/60">{r.oneLiner}</p>
                  <p className="mt-4 text-sm font-medium text-[#0a0e27]/70">
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([svcSchema, bcSchema]),
        }}
      />
    </>
  )
}
