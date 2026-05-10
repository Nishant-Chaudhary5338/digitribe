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
    role: 'Co-founder, Build',
    lane: 'build',
    oneLiner: "Senior frontend engineer. Builds sites and apps that load fast and don't break.",
    bio: "5+ years shipping production frontend systems at scale. Specialist in micro-frontend platforms, monorepos (Turborepo), Next.js, design systems, and AI-native development with MCP tooling. Owns the full frontend SDLC end-to-end. The kind of engineer who actually reads the Lighthouse output.",
    stack: ['React', 'Next.js', 'TypeScript', 'Vue', 'Shopify', 'Webflow', 'Turborepo', 'MCP Tooling'],
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
    slug: 'nidhi',
    name: 'Nidhi Chhimwal',
    role: 'Co-founder, Design',
    lane: 'design',
    oneLiner: 'Senior designer and UX researcher. Bridges research, strategy, and visual craft.',
    bio: '5+ years inside large-scale product organizations. Bridges UX research, strategy, and visual craft. Branding, packaging, illustration, design systems, and UX research methodology. The designer who actually does research before opening Figma.',
    stack: ['Figma', 'Adobe Suite', 'Webflow', 'After Effects', 'Cinema 4D', 'UX Research'],
    experience: '5+ years senior design and UX research at scale',
    links: {
      linkedin: 'https://linkedin.com/in/nidhichhimwal', // MOCK — replace
      portfolio: 'https://nidhi.digitribe.world',
      dribbble: 'https://dribbble.com/nidhichhimwal', // MOCK — replace
      behance: 'https://behance.net/nidhichhimwal', // MOCK — replace
    },
    photo: '/founders/nidhi.svg', // MOCK — replace with real photo
    initials: 'NC',
    accentColor: '#0A0E27',
  },
  {
    slug: 'manu',
    name: 'Manu', // MOCK — add full last name
    role: 'Co-founder, Grow',
    lane: 'grow',
    oneLiner: 'Paid acquisition operator. Trains the next generation of digital marketers.',
    bio:"Hands-on operator across Meta, Google, and content. Active trainer at India\'s leading digital marketing institution — currently training the next generation of digital marketers. The rare marketer who teaches, runs paid, and reads attribution reports for fun.",
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
