export type Package = {
  slug: string
  name: string
  positioning: string
  oneLiner: string
  priceEur: number
  priceUsd: number
  perMonth: boolean
  timeline: string
  minimumMonths?: number
  recommended: boolean
  inclusions: string[]
}

export const packages: Package[] = [
  {
    slug: 'launch-sprint',
    name: 'Launch Sprint',
    positioning: 'Founders launching or relaunching',
    oneLiner: 'Site + ads under one team. From kickoff to launch in 4–6 weeks.',
    priceEur: 10000,
    priceUsd: 11000,
    perMonth: false,
    timeline: '4–6 weeks',
    recommended: false,
    inclusions: [
      '5–7 page marketing site',
      'Meta or Google ads setup + 30-day management',
      'Tracking, analytics, and conversion setup',
      '30 days post-launch optimization',
      'All deliverables owned by you',
    ],
  },
  {
    slug: 'growth-engine',
    name: 'Growth Engine',
    positioning: 'DTC brands $5M–$20M ARR scaling paid',
    oneLiner: 'Site + Meta + Google + monthly optimization, all one team.',
    priceEur: 5500,
    priceUsd: 6000,
    perMonth: true,
    timeline: '3-month minimum',
    minimumMonths: 3,
    recommended: true,
    inclusions: [
      'Ongoing site improvements and CRO',
      'Meta Ads management',
      'Google Ads management',
      'Monthly reporting + strategy call',
      'Landing page A/B tests',
    ],
  },
  {
    slug: 'full-stack',
    name: 'Full Stack',
    positioning: 'Brands consolidating to one partner',
    oneLiner: 'Build + grow + design under one team. Everything coordinated.',
    priceEur: 9500,
    priceUsd: 10500,
    perMonth: true,
    timeline: '3-month minimum',
    minimumMonths: 3,
    recommended: false,
    inclusions: [
      'Everything in Growth Engine',
      'SEO + content calendar',
      'Design support (visual + UX)',
      'Quarterly strategy reviews',
      'Priority response SLA',
    ],
  },
]
