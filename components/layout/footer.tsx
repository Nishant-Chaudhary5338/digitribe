import * as React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Container } from '@/components/layout/container'
import { CookiePreferencesButton } from '@/components/consent/cookie-preferences-button'

const SERVICES_LINKS = [
  { label: 'Build', href: '/services#build' },
  { label: 'Grow', href: '/services#grow' },
  { label: 'Design', href: '/services#design' },
  { label: 'Automate', href: '/services#automate' },
] as const

const RESOURCES_LINKS = [
  { label: 'Free Audit', href: '/audit' },
  { label: 'Workshop', href: '/workshop' },
  { label: 'Contact', href: '/contact' },
] as const

const LEGAL_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
] as const

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/digitribe', icon: ExternalLink },
  { label: 'Twitter/X', href: 'https://twitter.com/digitribe', icon: ExternalLink },
  { label: 'Instagram', href: 'https://instagram.com/digitribe', icon: ExternalLink },
] as const

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wider text-[#f0ede5] mb-4">
      {children}
    </p>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[#c4c1b8] hover:text-[#f0ede5] text-sm transition-colors duration-150"
      >
        {children}
      </Link>
    </li>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#0a0e27] border-t border-[rgba(240,237,229,0.08)]">
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="full" theme="light" size="md" className="mb-4" />
            <p className="text-sm text-[#c4c1b8] leading-relaxed max-w-[240px] mb-6">
              We build, grow, and automate digital experiences for ambitious brands.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#c4c1b8] hover:text-[#f0ede5] transition-colors duration-150"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <FooterHeading>Services</FooterHeading>
            <ul className="flex flex-col gap-3 list-none" role="list">
              {SERVICES_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>Resources</FooterHeading>
            <ul className="flex flex-col gap-3 list-none" role="list">
              {RESOURCES_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>Legal</FooterHeading>
            <ul className="flex flex-col gap-3 list-none" role="list">
              {LEGAL_LINKS.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
              <li>
                <CookiePreferencesButton />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[rgba(240,237,229,0.08)]">
          <p className="text-sm text-[#c4c1b8] text-center">
            &copy; 2026 Digitribe. Made with care in Delhi, India.
          </p>
        </div>
      </Container>
    </footer>
  )
}
