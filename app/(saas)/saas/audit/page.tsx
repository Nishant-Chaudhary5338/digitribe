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

export const metadata: Metadata = {
  title: 'Free 30-min audit — for SaaS founders',
  description:
    "We audit your site, ads, and funnel — then tell you exactly what we'd change. For seed to Series A SaaS.",
  alternates: { canonical: 'https://digitribe.co/saas/audit' },
  openGraph: {
    title: 'Free 30-min audit — for SaaS founders',
    images: [{ url: '/og/saas-audit.png', width: 1200, height: 630 }],
  },
}

const auditVirtualService = {
  slug: 'free-audit-saas',
  name: 'Free 30-Minute SaaS Website and Ads Audit',
  category: 'grow' as const,
  oneLiner: 'A no-pitch audit of your site, ads, and funnel — built for SaaS founders.',
  description:
    'We review your site, your paid ads, and your conversion funnel in a focused 30-minute session.',
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

export default function SaaSAuditPage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, svcSchema]) }}
      />
    </>
  )
}
