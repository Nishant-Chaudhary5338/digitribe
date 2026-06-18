import type { Metadata } from 'next'
import { HeroHome } from '@/components/sections/hero-home'
import { TrustStrip } from '@/components/sections/trust-strip'
import { ProblemStatement } from '@/components/sections/problem-statement'
import { TwoAnchors } from '@/components/sections/two-anchors'
import { ProcessSteps } from '@/components/sections/process-steps'
import { FoundersGrid } from '@/components/sections/founders-grid'
import { AICallout } from '@/components/sections/ai-callout'
import { Seam } from '@/components/decor/seam'
import { FinalCTA } from '@/components/sections/final-cta'
import { organizationSchema } from '@/lib/schema/organization'
import { faqPageSchema } from '@/lib/schema/faq-page'
import { auditFaqs } from '@/lib/data/faqs'

export const metadata: Metadata = {
  title: 'Build + grow agency for DTC founders',
  description:
    'A senior 2-person studio building conversion-focused websites and running the paid traffic to fill them. For DTC brands $5M–$20M ARR.',
  alternates: { canonical: 'https://digitribe.co/dtc' },
  openGraph: {
    title: 'For DTC founders',
    description:
      'A senior 2-person studio building conversion-focused websites and running the paid traffic to fill them. For DTC brands $5M–$20M ARR.',
    url: 'https://digitribe.co/dtc',
    siteName: 'Digitribe',
    images: [{ url: '/og/dtc-home.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/dtc-home.png'],
  },
}

export default function DTCHomePage() {
  const orgSchema = organizationSchema()
  const faqSchema = faqPageSchema(auditFaqs)

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Digitribe',
    url: 'https://digitribe.co/dtc',
  }

  return (
    <>
      <Seam theme="studio" />
      <HeroHome />
      <TrustStrip />
      <TwoAnchors />
      <ProblemStatement theme="studio" />
      <AICallout theme="studio" />
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
