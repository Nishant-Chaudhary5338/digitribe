// [TODO: lawyer review before launch]
import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata({
  title: 'Terms of Service',
  description: 'Digitribe terms of service. Fixed-scope engagements, 50/50 milestone payments, and clear IP transfer terms.',
  path: '/terms',
  noindex: false,
})

const LAST_UPDATED = 'May 2026'

export default function TermsPage() {
  return (
    <div className="bg-[#fafaf7] py-24">
      <div className="mx-auto max-w-2xl px-6">
        <p className="text-sm font-medium text-[#ff5b3a] mb-3 uppercase tracking-widest">
          Legal
        </p>
        <h1 className="text-4xl font-bold text-[#0a0e27] mb-2 font-display">
          Terms of Service
        </h1>
        <p className="text-sm text-[#0a0e27]/40 mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-slate max-w-none space-y-10 text-[#0a0e27]/80">

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              1. Acceptance of terms
            </h2>
            <p className="leading-relaxed">
              By engaging Digitribe for any service — whether through our website, email, or verbal agreement — you confirm that you have read, understood, and agreed to these Terms of Service. If you do not agree to these terms, do not proceed with an engagement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              2. Description of services
            </h2>
            <p className="leading-relaxed mb-4">
              Digitribe provides digital services including, but not limited to: website design and development, Shopify builds, paid advertising management (Meta, Google), SEO audits, content strategy, and design sprints.
            </p>
            <p className="leading-relaxed">
              Each engagement is governed by a written Statement of Work (SOW) or project brief that defines the scope, deliverables, timeline, and price. The SOW takes precedence over these general terms in the event of any conflict.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              3. Payment terms
            </h2>
            <p className="leading-relaxed mb-4">
              All engagements follow a <strong>50/50 milestone payment structure</strong> unless otherwise agreed in writing:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>50% on kickoff:</strong> due before work begins. Work does not start until receipt of payment.
              </li>
              <li>
                <strong>50% on delivery:</strong> due when final deliverables are handed over or launched, whichever comes first.
              </li>
            </ul>
            <p className="leading-relaxed mb-4">
              For ongoing monthly retainer services (e.g., Meta Ads, Google Ads, Content Calendar), the monthly fee is due at the start of each billing period.
            </p>
            <p className="leading-relaxed">
              Invoices are due within 7 calendar days of issuance. Late payments beyond 14 days may result in a pause of active work until the outstanding balance is cleared.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              4. Out-of-scope work
            </h2>
            <p className="leading-relaxed">
              If a client requests work that falls outside the agreed scope, Digitribe will provide a written change request including the additional cost and timeline impact before proceeding. No out-of-scope work will be billed without prior written approval from the client.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              5. Intellectual property
            </h2>
            <p className="leading-relaxed mb-4">
              Upon receipt of final payment, the client receives full ownership of all final deliverables produced under the engagement, including design files, source code, and content assets.
            </p>
            <p className="leading-relaxed mb-4">
              Digitribe retains the right to display completed work in our portfolio and case studies unless the client requests otherwise in writing prior to project kickoff.
            </p>
            <p className="leading-relaxed">
              Any third-party assets (stock photography, fonts, plugins, libraries) incorporated into deliverables remain subject to their respective third-party licenses. It is the client's responsibility to maintain appropriate licenses after handoff.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              6. Client responsibilities
            </h2>
            <p className="leading-relaxed mb-4">
              The client agrees to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide content, assets, and feedback within agreed timelines.</li>
              <li>Designate a primary point of contact with authority to approve deliverables.</li>
              <li>Not hold Digitribe responsible for delays caused by the client's failure to deliver materials on time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              7. Limitation of liability
            </h2>
            <p className="leading-relaxed mb-4">
              Digitribe's total liability for any claim arising out of or related to an engagement is limited to the total fees paid by the client for that engagement.
            </p>
            <p className="leading-relaxed">
              Digitribe is not liable for indirect, incidental, consequential, or punitive damages — including lost revenue, lost data, or lost business opportunities — arising from our services or any delay in delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              8. Termination
            </h2>
            <p className="leading-relaxed">
              Either party may terminate an engagement with 14 days written notice. Upon termination, the client is responsible for payment of all work completed to date. Digitribe will deliver all work-in-progress materials at the time of termination. The 50% kickoff payment is non-refundable if work has commenced.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              9. Confidentiality
            </h2>
            <p className="leading-relaxed">
              Both parties agree to keep confidential any non-public information shared during the engagement. This includes business strategies, customer data, financial information, and technical specifications. Digitribe will sign a mutual NDA upon request before any sensitive information is shared.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              10. Governing law
            </h2>
            <p className="leading-relaxed">
              These terms are governed by the laws of India. Any disputes arising from these terms or a related engagement will be resolved through binding arbitration in Delhi, India, unless both parties agree to an alternative resolution mechanism in writing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0a0e27] mb-4 font-display">
              11. Contact
            </h2>
            <p className="leading-relaxed">
              For questions about these terms, contact us at{' '}
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
