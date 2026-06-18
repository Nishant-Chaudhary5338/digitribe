import type { WithContext, Organization } from 'schema-dts'
import { company } from '@/lib/data/company'

export function organizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: company.url,
    logo: `${company.url}/brand/logo.svg`,
    description:
      'A senior 2-person digital agency — frontend engineering, AI agents, and paid acquisition under one roof — building and growing DTC and SaaS brands in the EU and US.',
    email: company.email,
    foundingDate: String(company.foundedYear),
    areaServed: ['EU', 'US', 'UK'],
    founder: [
      { '@type': 'Person', name: 'Nishant Chaudhary' },
      { '@type': 'Person', name: 'Manu' },
    ],
    sameAs: [company.social.linkedin, company.social.twitter],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      email: company.email,
      availableLanguage: 'English',
    },
  }
}
