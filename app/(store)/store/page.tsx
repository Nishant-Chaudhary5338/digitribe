/**
 * Storefront — the product grid. Canonical: doc 03 §1, platform-spec §2.
 * v1 lists all non-draft products; real showcase cards (artifact previews) come
 * with the sales pages.
 */
import type { Metadata } from 'next'
import { PRODUCT_REGISTRY } from '../../../lib/store/products'
import { BuyButton } from '../../../components/store/buy-button'

export const metadata: Metadata = {
  title: 'Digitribe Store — instant AI tools, pay once',
  description:
    'Self-serve AI tools you run on your own key. Buy once, use immediately. No subscriptions.',
}

const SEGMENTS: Record<number, string> = {
  1: 'Agentic Web',
  2: 'Compliance',
  3: 'MCP & Agent Security',
  4: 'Agent Reliability',
  5: 'Codebase Intelligence',
  6: 'Conversion & Growth',
}

export default function StorePage() {
  const products = PRODUCT_REGISTRY.filter((p) => p.status !== 'draft')

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1
          className="text-3xl font-semibold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Manrope, sans-serif' }}
        >
          Instant AI tools. Pay once, use now.
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Bring your own AI key · no subscriptions · built by Digitribe.
        </p>

        {products.length === 0 ? (
          <p className="mt-12 text-sm" style={{ color: 'var(--color-text-body)' }}>
            Tools are launching soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <div
                key={p.slug}
                className="flex flex-col justify-between rounded-xl border p-4"
                style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
              >
                <div>
                  <p
                    className="text-xs tracking-wider uppercase"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    {SEGMENTS[p.segment]}
                  </p>
                  <h2
                    className="mt-1 text-lg font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {p.name}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--color-text-body)' }}>
                    {p.tagline}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {p.priceUSD === 0 ? 'Free' : `$${p.priceUSD}`}
                  </span>
                  <BuyButton
                    slug={p.slug}
                    label={p.priceUSD === 0 ? 'Get it' : `Buy · $${p.priceUSD}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
