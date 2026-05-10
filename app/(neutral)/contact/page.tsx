import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroPage } from '@/components/sections/hero-page'
import { FinalCTA } from '@/components/sections/final-cta'
import { ContactForm } from '@/components/forms/contact-form'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { CONTACT_EMAIL } from '@/lib/utils/constants'

export const metadata: Metadata = generatePageMetadata({
  title: 'Contact',
  description:
    'Three ways to start working with Digitribe: book a free 30-minute audit, fill a project brief, or just say hello. We reply within one business day.',
  path: '/contact',
})

const paths = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    title: 'Free 30-min audit',
    body: "We'll review your site, your ads, and your funnel — and tell you exactly what we'd change. You walk away with a punch list whether you hire us or not.",
    cta: 'Book the audit',
    href: '/audit',
    external: false,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
      </svg>
    ),
    title: 'Scoped project quote',
    body: "Know what you want to build or launch? Fill the brief below and we'll come back with a fixed-scope proposal within 2 business days.",
    cta: 'Fill the brief',
    href: '#brief',
    external: false,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
      </svg>
    ),
    title: 'Just exploring',
    body: "Not ready to book? That's fine. Drop us a line and we'll have a quick no-agenda chat to see if there's a fit worth pursuing.",
    cta: 'Say hello',
    href: `mailto:${CONTACT_EMAIL}`,
    external: true,
  },
]

export default function ContactPage() {
  return (
    <>
      <HeroPage
        eyebrow="Start a project"
        headline="Three ways to start."
        sub="Pick the one that fits where you are."
      />

      {/* Three path cards */}
      <section className="bg-[#0a0e27] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {paths.map((path) => (
              <div
                key={path.title}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
              >
                <div className="mb-5 text-[#ff5b3a]">{path.icon}</div>
                <h2 className="text-xl font-bold text-white mb-3 font-display">
                  {path.title}
                </h2>
                <p className="text-sm leading-relaxed text-white/60 flex-1 mb-8">
                  {path.body}
                </p>
                {path.external ? (
                  <a
                    href={path.href}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/10"
                  >
                    {path.cta}
                  </a>
                ) : (
                  <Link
                    href={path.href}
                    className="btn-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-text-primary)', textDecoration: 'none' }}
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
      <section id="brief" className="bg-[#f0ede5] py-24">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold text-[#0a0e27] mb-3 font-display">
            Tell us about your project.
          </h2>
          <p className="text-[#0a0e27]/60 mb-10">
            We read every submission. You'll hear back within 2 business days.
          </p>
          <ContactForm />
        </div>
      </section>

      <FinalCTA />
    </>
  )
}
