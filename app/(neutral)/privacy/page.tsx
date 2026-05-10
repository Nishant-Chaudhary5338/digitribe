// [TODO: lawyer review before launch]
import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description: 'Digitribe privacy policy. How we collect, use, and protect your data under GDPR.',
  path: '/privacy',
  noindex: false,
})

const LAST_UPDATED = 'May 2026'

export default function PrivacyPage() {
  return (
    <div className="bg-[#fafaf7] py-24">
      <div className="mx-auto max-w-2xl px-6">
        <p className="text-sm font-medium text-[#ff5b3a] mb-3 uppercase tracking-widest">
          Legal
        </p>
        <h1 className="text-4xl font-bold text-[#0a0e27] mb-2 font-display">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#0a0e27]/40 mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-slate max-w-none space-y-10 text-[#0a0e27]/80">

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              Who we are
            </h2>
            <p className="leading-relaxed">
              Digitribe ("we", "our", "us") is a digital agency operating under the domain{' '}
              <strong>digitribe.world</strong>. Our contact email is{' '}
              <a href="mailto:hello@digitribe.world" className="text-[#ff5b3a] underline">
                hello@digitribe.world
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              Data we collect
            </h2>
            <p className="leading-relaxed mb-4">
              We collect the minimum data needed to operate our service and respond to inquiries.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Contact form submissions:</strong> name, email address, company name, and your message. Stored securely and used only to respond to you.
              </li>
              <li>
                <strong>Audit booking data:</strong> name, email, and any context you provide via Cal.com at the time of booking.
              </li>
              <li>
                <strong>Usage analytics:</strong> page views, referrer, device type, and country — collected in aggregate, anonymously via Plausible Analytics. No cookies involved. No personal identifiers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              How we use your data
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To respond to your inquiry or project brief.</li>
              <li>To schedule and run your audit session.</li>
              <li>To understand how visitors use our website (aggregate, non-personal).</li>
              <li>We do not sell, share, or rent your personal data to any third party.</li>
              <li>We do not use your data to build advertising profiles or re-target you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              Third-party services
            </h2>
            <p className="leading-relaxed mb-4">
              We use the following third-party services to run this site. Each has its own privacy policy.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Cal.com</strong> — scheduling for audit calls. Data is processed by Cal.com, Inc. See{' '}
                <a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#ff5b3a] underline">
                  cal.com/privacy
                </a>.
              </li>
              <li>
                <strong>Plausible Analytics</strong> — privacy-first, cookieless analytics. GDPR-compliant by design. See{' '}
                <a href="https://plausible.io/privacy" target="_blank" rel="noopener noreferrer" className="text-[#ff5b3a] underline">
                  plausible.io/privacy
                </a>.
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery for form submissions. See{' '}
                <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#ff5b3a] underline">
                  resend.com/legal/privacy-policy
                </a>.
              </li>
              <li>
                <strong>Vercel</strong> — website hosting and edge functions. See{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#ff5b3a] underline">
                  vercel.com/legal/privacy-policy
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              Cookies
            </h2>
            <p className="leading-relaxed">
              Our analytics tool (Plausible) is cookieless. We do not set tracking cookies. If you opt in to our cookie consent banner, we may store a small preference token in your browser's localStorage to remember your choice. No advertising or profiling cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              Data retention
            </h2>
            <p className="leading-relaxed">
              Contact form submissions are retained for up to 12 months from the date of submission, after which they are deleted. Audit booking data is managed by Cal.com under their retention policy. Aggregate analytics data has no personal identifiers and is retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              Your rights under GDPR
            </h2>
            <p className="leading-relaxed mb-4">
              If you are located in the EU or UK, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Right to access:</strong> request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong>Right to erasure:</strong> request deletion of your personal data ("right to be forgotten").
              </li>
              <li>
                <strong>Right to rectification:</strong> request correction of inaccurate data.
              </li>
              <li>
                <strong>Right to restriction:</strong> request that we limit how we process your data.
              </li>
              <li>
                <strong>Right to data portability:</strong> request your data in a structured, machine-readable format.
              </li>
              <li>
                <strong>Right to object:</strong> object to our processing your data for direct marketing.
              </li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:hello@digitribe.world" className="text-[#ff5b3a] underline">
                hello@digitribe.world
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              Contact
            </h2>
            <p className="leading-relaxed">
              For any privacy-related questions or requests, contact us at{' '}
              <a href="mailto:hello@digitribe.world" className="text-[#ff5b3a] underline">
                hello@digitribe.world
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
