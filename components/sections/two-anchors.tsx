import Link from 'next/link'
import { Reveal } from '@/components/primitives/reveal'
import { Container } from '@/components/layout/container'

const buildBullets = ['Landing pages', 'Marketing sites', 'Shopify builds', 'Custom web apps', 'Automation workflows']
const buildStack = ['React', 'Next.js', 'Shopify', 'Webflow', 'TypeScript']
const growBullets = ['Meta Ads', 'Google Ads', 'SEO audits', 'Content calendar']
const growOutcomes = ['ROAS', 'CAC', 'CVR', 'LTV:CAC']

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs px-2.5 py-1 font-medium"
      style={{
        background: 'var(--color-bg-card-alt)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-mono)',
        borderRadius: 'var(--radius-theme-sm, 4px)',
        border: '1px solid var(--color-border)',
      }}
    >
      {children}
    </span>
  )
}

function AnchorCard({
  title,
  description,
  bullets,
  tags,
  ctaHref,
  ctaLabel,
  delay,
}: {
  title: string
  description: string
  bullets: readonly string[]
  tags: readonly string[]
  ctaHref: string
  ctaLabel: string
  delay: number
}) {
  return (
    <Reveal delay={delay}>
      <div
        className="h-full flex flex-col p-6 sm:p-8"
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-card)',
          borderRadius: 'var(--radius-theme-lg, 12px)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {title}
        </h3>

        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {description}
        </p>

        <ul className="space-y-2 mb-6 flex-1">
          {bullets.map((item) => (
            <li key={item} className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text-body)' }}>
              <span
                className="w-1 h-1 rounded-full inline-block shrink-0"
                style={{ background: 'var(--color-accent)' }}
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <Link
          href={ctaHref}
          className="text-sm font-medium hover:underline mt-auto"
          style={{ color: 'var(--color-accent)' }}
        >
          {ctaLabel} &rarr;
        </Link>
      </div>
    </Reveal>
  )
}

export function TwoAnchors() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <Container>
        <Reveal>
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-[0.12em] mb-3"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
            >
              What we do
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                color: 'var(--color-text-primary)',
              }}
            >
              Two anchors. One growth engine.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <AnchorCard
            title="Build"
            description="Sites and apps built to perform. Fast, accessible, conversion-optimised — from landing pages to full-stack web apps."
            bullets={buildBullets}
            tags={buildStack}
            ctaHref="/services#build"
            ctaLabel="See Build services"
            delay={0.1}
          />
          <AnchorCard
            title="Grow"
            description="Paid acquisition and SEO that treats your budget like it's our own. ROAS, CAC, and LTV:CAC — not vanity metrics."
            bullets={growBullets}
            tags={growOutcomes}
            ctaHref="/services#grow"
            ctaLabel="See Grow services"
            delay={0.2}
          />
        </div>

        <Reveal delay={0.3}>
          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            +{' '}
            <Link
              href="/services#design"
              className="hover:underline transition-colors"
              style={{ color: 'var(--color-text-body)' }}
            >
              Design woven through every engagement.
            </Link>
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
