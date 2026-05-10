import type { Metadata } from 'next'
import { HeroPage } from '@/components/sections/hero-page'
import { AuditPromise } from '@/components/sections/audit-promise'
import { AuditWhyFree } from '@/components/sections/audit-why-free'
import { AuditNotFor } from '@/components/sections/audit-not-for'
import { AuditCalEmbed } from '@/components/sections/audit-cal-embed'
import { AuditFaq } from '@/components/sections/audit-faq'
import { FinalCTA } from '@/components/sections/final-cta'
import { faqPageSchema } from '@/lib/schema/faq-page'
import { serviceSchema } from '@/lib/schema/service'
import { auditFaqs } from '@/lib/data/faqs'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata({
  title: 'Free 30-minute audit',
  description:
    "We audit your site, ads, and funnel — then tell you exactly what we'd change. You walk away with a punch list. Whether you hire us or not.",
  path: '/audit',
})

// Lightweight virtual service for JSON-LD
const auditVirtualService = {
  slug: 'free-audit',
  name: 'Free 30-Minute Website and Ads Audit',
  category: 'grow' as const,
  oneLiner: 'A no-pitch audit of your site, ads, and funnel.',
  description:
    'We review your site, your paid ads, and your conversion funnel in a focused 30-minute session. You receive a prioritized punch list within 24 hours of the call.',
  scope: [
    'Website performance and conversion review',
    'Paid ads structure and efficiency review',
    'Funnel gap analysis',
    'Prioritized punch list delivered within 24 hours',
  ],
  timeline: '30 minutes',
  startingPriceEur: 0,
  startingPriceUsd: 0,
  recurring: false,
}

export default function AuditPage() {
  const faqSchema = faqPageSchema(auditFaqs)
  const svcSchema = serviceSchema(auditVirtualService)

  return (
    <>
      <HeroPage
        eyebrow="Free · 30 minutes · No pitch"
        headline="We'll audit your site, your ads, and your funnel — and tell you exactly what we'd change."
        sub="You walk away with a punch list. Whether you hire us or not."
        cta={{ label: 'Book the free audit', href: '#book' }}
      />

      <AuditPromise />
      <AuditWhyFree />
      <AuditNotFor />

      <div id="book">
        <AuditCalEmbed />
      </div>

      <AuditFaq />
      <FinalCTA />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([faqSchema, svcSchema]),
        }}
      />
    </>
  )
}
