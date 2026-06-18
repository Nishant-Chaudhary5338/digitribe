import type { WithContext, Person } from 'schema-dts'
import type { Founder } from '@/lib/data/founders'
import { company } from '@/lib/data/company'

export function personSchema(founder: Founder): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: founder.name,
    jobTitle: founder.role,
    worksFor: {
      '@type': 'Organization',
      name: 'Digitribe',
      url: company.url,
    },
    url: founder.links.portfolio ?? company.url,
    sameAs: [
      founder.links.linkedin,
      founder.links.twitter,
      founder.links.portfolio,
    ].filter(Boolean) as string[],
  }
}
