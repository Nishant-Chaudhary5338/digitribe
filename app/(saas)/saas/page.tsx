import type { Metadata } from 'next'
import { HeroHome } from '@/components/sections/hero-home'
import { TrustStrip } from '@/components/sections/trust-strip'
import { ProblemStatement } from '@/components/sections/problem-statement'
import { TwoAnchors } from '@/components/sections/two-anchors'
import { HowWeWork } from '@/components/sections/how-we-work'
import { IdealClients } from '@/components/sections/ideal-clients'
import { ProcessSteps } from '@/components/sections/process-steps'
import { FoundersGrid } from '@/components/sections/founders-grid'
import { FinalCTA } from '@/components/sections/final-cta'
import { organizationSchema } from '@/lib/schema/organization'
import { faqPageSchema } from '@/lib/schema/faq-page'
import { auditFaqs } from '@/lib/data/faqs'

export const metadata: Metadata = {
  title: 'Code + content for product-led SaaS founders',
  description:
    'A senior 3-person studio. We build product-grade marketing sites and run the paid traffic to fill them. For seed to Series A SaaS.',
  alternates: { canonical: 'https://digitribe.co/saas' },
  openGraph: {
    title: 'For SaaS founders',
    description:
      'A senior 3-person studio. We build product-grade marketing sites and run the paid traffic to fill them. For seed to Series A SaaS.',
    url: 'https://digitribe.co/saas',
    siteName: 'Digitribe',
    images: [{ url: '/og/saas-home.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/saas-home.png'],
  },
}

export default function SaaSHomePage() {
  const orgSchema = organizationSchema()
  const faqSchema = faqPageSchema(auditFaqs)

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Digitribe',
    url: 'https://digitribe.co/saas',
  }

  return (
    <>
      <HeroHome />
      <TrustStrip />
      <ProblemStatement />
      <TwoAnchors />
      <HowWeWork />
      <IdealClients />
      <ProcessSteps />
      <FoundersGrid variant="compact" />
      <FinalCTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([orgSchema, faqSchema, websiteSchema]),
        }}
      />
    </>
  )
}
