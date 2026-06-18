export const SITE_URL =
  process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://digitribe.world'

export const SITE_NAME = 'Digitribe'
export const SITE_TAGLINE = 'Code, content, conversions — under one roof.'

export const CAL_URL =
  process.env['NEXT_PUBLIC_CAL_URL'] ??
  'https://cal.com/digitribe-audit/30min'

export const PLAUSIBLE_DOMAIN =
  process.env['NEXT_PUBLIC_PLAUSIBLE_DOMAIN'] ?? 'digitribe.world'

export const CONTACT_EMAIL = 'hello@digitribe.world'

export const BRAND_COLORS = {
  ink: '#0a0e27',
  inkSoft: '#1a1f3a',
  pulse: '#ff5b3a',
  pulseHover: '#ff7556',
  pulseDeep: '#e84520',
  sand: '#f0ede5',
  paper: '#fafaf7',
  slate: '#4a5568',
  slateSoft: '#6b7280',
  slateDeep: '#2d3748',
} as const

export const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const
