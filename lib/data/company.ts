export const company = {
  name: 'Digitribe',
  tagline: 'Code, content, conversions — under one roof.',
  url: 'https://digitribe.world',
  email: 'hello@digitribe.world', // MOCK — confirm before launch
  domain: 'digitribe.world',
  baseLocation: { city: 'Delhi', region: 'Delhi', country: 'IN' },
  serviceRegions: ['EU', 'US', 'UK'] as const,
  social: {
    linkedin: 'https://linkedin.com/company/digitribe', // MOCK — replace
    twitter: 'https://twitter.com/digitribe', // MOCK — replace
    instagram: 'https://instagram.com/digitribe', // MOCK — replace
  },
  calUrl: 'https://cal.com/digitribe-audit/30min', // MOCK — replace via NEXT_PUBLIC_CAL_URL
  foundedYear: 2026,
} as const
