import type { WithContext, Service as SchemaService } from 'schema-dts'
import type { Service } from '@/lib/data/services'
import { company } from '@/lib/data/company'

export function serviceSchema(service: Service): WithContext<SchemaService> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'Digitribe',
      url: company.url,
    },
    areaServed: ['EU', 'US'],
    offers: {
      '@type': 'Offer',
      price: String(service.startingPriceEur),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  }
}
