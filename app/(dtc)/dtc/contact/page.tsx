import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroPage } from '@/components/sections/hero-page'
import { FinalCTA } from '@/components/sections/final-cta'
import { ContactForm } from '@/components/forms/contact-form'
import { CONTACT_EMAIL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Contact — start a project',
  description:
    'Three ways to start working with Digitribe: book a free 30-minute audit, fill a project brief, or just say hello. We reply within one business day.',
  alternates: { canonical: 'https://digitribe.co/dtc/contact' },
  openGraph: {
    title: 'Contact Digitribe — for DTC founders',
    images: [{ url: '/og/dtc-contact.png', width: 1200, height: 630 }],
  },
}

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" />
  </svg>
)
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
    <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
    <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
  </svg>
)

const paths = [
  { icon: <CalendarIcon />, title: 'Free 30-min audit', body: "We'll review your site, your ads, and your funnel — and tell you exactly what we'd change. You walk away with a punch list whether you hire us or not.", cta: 'Book the audit', href: '/dtc/audit', external: false },
  { icon: <FileIcon />, title: 'Scoped project quote', body: "Know what you want to build or launch? Fill the brief below and we'll come back with a fixed-scope proposal within 2 business days.", cta: 'Fill the brief', href: '#brief', external: false },
  { icon: <MailIcon />, title: 'Just exploring', body: "Not ready to book? That's fine. Drop us a line and we'll have a quick no-agenda chat to see if there's a fit worth pursuing.", cta: 'Say hello', href: `mailto:${CONTACT_EMAIL}`, external: true },
]

export default function DTCContactPage() {
  return (
    <>
      <HeroPage eyebrow="Start a project" headline="Three ways to start." sub="Pick the one that fits where you are." />

      {/* Path cards */}
      <section className="py-24" style={{ background: 'var(--color-bg-inverse)' }}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {paths.map((path) => (
              <div
                key={path.title}
                className="flex flex-col p-8"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-theme-lg, 12px)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div className="mb-5" style={{ color: 'var(--color-accent)' }}>{path.icon}</div>
                <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-on-inverse)' }}>
                  {path.title}
                </h2>
                <p className="text-sm leading-relaxed flex-1 mb-8" style={{ color: 'var(--color-text-on-inverse)', opacity: 0.6 }}>
                  {path.body}
                </p>
                {path.external ? (
                  <a
                    href={path.href}
                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 'var(--radius-theme-pill)',
                      color: 'var(--color-text-on-inverse)',
                    }}
                  >
                    {path.cta}
                  </a>
                ) : (
                  <Link
                    href={path.href}
                    className="btn-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
                    style={{
                      background: 'var(--color-accent)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-display)',
                      textDecoration: 'none',
                    }}
                  >
                    {path.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="brief" className="py-24" style={{ background: 'var(--color-bg-card-alt)' }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
            Tell us about your project.
          </h2>
          <p className="mb-10" style={{ color: 'var(--color-text-muted)' }}>
            We read every submission. You&apos;ll hear back within 2 business days.
          </p>
          <ContactForm />
        </div>
      </section>

      <FinalCTA />
    </>
  )
}
