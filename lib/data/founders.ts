export type Founder = {
  slug: string
  name: string
  role: string
  lane: 'build' | 'design' | 'grow'
  oneLiner: string
  bio: string
  stack: string[]
  experience: string
  links: {
    linkedin?: string
    twitter?: string
    portfolio?: string
    github?: string
    dribbble?: string
    behance?: string
  }
  photo: string
  initials: string
  accentColor: string
}

export const founders: Founder[] = [
  {
    slug: 'nishant',
    name: 'Nishant Chaudhary',
    role: 'Co-founder, Build & AI',
    lane: 'build',
    oneLiner:
      "Senior frontend engineer. Builds sites, apps, and AI agents that load fast and don't break.",
    bio: '5+ years shipping production frontend systems at scale. Specialist in micro-frontend platforms, monorepos (Turborepo), Next.js, design systems, and AI-native development — custom MCP servers and task-specific agents wired into real product stacks. Owns the full build-to-AI SDLC end-to-end. The kind of engineer who actually reads the Lighthouse output.',
    stack: [
      'React',
      'Next.js',
      'TypeScript',
      'Shopify',
      'Turborepo',
      'MCP Servers',
      'AI Agents',
      'Claude / AI SDK',
    ],
    experience: '5+ years building product-grade frontend systems at scale',
    links: {
      linkedin: 'https://linkedin.com/in/nishantchaudhary', // MOCK — replace
      portfolio: 'https://nishant.digitribe.world',
      github: 'https://github.com/nishantchaudhary', // MOCK — replace
    },
    photo: '/founders/nishant.svg', // MOCK — replace with real photo
    initials: 'NC',
    accentColor: '#FF5B3A',
  },
  {
    slug: 'manu',
    name: 'Manu', // MOCK — add full last name
    role: 'Co-founder, Grow',
    lane: 'grow',
    oneLiner: 'Paid acquisition operator. Trains the next generation of digital marketers.',
    bio: "Hands-on operator across Meta, Google, and content. Active trainer at India\'s leading digital marketing institution — currently training the next generation of digital marketers. The rare marketer who teaches, runs paid, and reads attribution reports for fun.",
    stack: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'GA4', 'Mixpanel', 'Segment'],
    experience: '5+ years running paid acquisition + active training role',
    links: {
      linkedin: 'https://linkedin.com/in/manu', // MOCK — replace
      twitter: 'https://twitter.com/manu', // MOCK — replace
      portfolio: 'https://manu.digitribe.world',
    },
    photo: '/founders/manu.svg', // MOCK — replace with real photo
    initials: 'M',
    accentColor: '#0A0E27',
  },
]
