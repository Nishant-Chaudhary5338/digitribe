import Link from 'next/link'
import { Reveal } from '@/components/primitives/reveal'
import { Container } from '@/components/layout/container'
import { getServicesByCategory } from '@/lib/data/services'

const buildStack = ['React', 'Next.js', 'Shopify', 'TypeScript']
const growOutcomes = ['ROAS', 'CAC', 'CVR', 'LTV:CAC']
const aiStack = ['MCP', 'Claude', 'AI SDK', 'evals']

function serviceNames(category: 'build' | 'grow' | 'automate'): string[] {
  return getServicesByCategory(category).map((s) => s.name)
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-2.5 py-1 text-xs font-medium"
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
  accent,
  featured = false,
  featuredLabel,
  delay,
}: {
  title: string
  description: string
  bullets: readonly string[]
  tags: readonly string[]
  ctaHref: string
  ctaLabel: string
  accent: string
  featured?: boolean
  featuredLabel?: string
  delay: number
}) {
  return (
    <Reveal delay={delay}>
      <div
        className="flex h-full flex-col p-6 sm:p-8"
        style={{
          background: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-card)',
          borderRadius: 'var(--radius-theme-lg, 12px)',
          border: featured ? `1.5px solid ${accent}` : '1px solid var(--color-border)',
          borderTop: `4px solid ${accent}`,
        }}
      >
        {featured && featuredLabel && (
          <span
            className="mb-3 inline-block w-fit"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              color: accent,
            }}
          >
            {featuredLabel}
          </span>
        )}

        <h3
          className="mb-2 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {title}
        </h3>

        <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {description}
        </p>

        <ul className="mb-6 flex-1 space-y-2">
          {bullets.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--color-text-body)' }}
            >
              <span
                className="inline-block h-1 w-1 shrink-0 rounded-full"
                style={{ background: accent }}
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>

        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <Link
          href={ctaHref}
          className="mt-auto text-sm font-medium hover:underline"
          style={{ color: accent }}
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
      style={{ background: 'var(--color-bg-page)', paddingBlock: 'var(--space-section-md)' }}
    >
      <Container>
        <Reveal>
          <div className="mb-12 text-center">
            <p
              className="mb-3 text-xs uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                letterSpacing: 'var(--tracking-label)',
                color: 'var(--color-text-muted)',
              }}
            >
              What we do
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--display-sm)',
                letterSpacing: 'var(--tracking-display)',
                color: 'var(--color-text-primary)',
              }}
            >
              Three things. One team. No handoffs.
            </h2>
          </div>
        </Reveal>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <AnchorCard
            title="Build"
            description="Sites and apps engineered to convert and load fast — landing pages to full Shopify and custom web apps."
            bullets={serviceNames('build')}
            tags={buildStack}
            ctaHref="/services#build"
            ctaLabel="See Build"
            accent="var(--color-secondary)"
            delay={0.1}
          />
          <AnchorCard
            title="Grow"
            description="Paid acquisition and SEO run like it's our own money. ROAS, CAC, LTV:CAC — not vanity metrics."
            bullets={serviceNames('grow')}
            tags={growOutcomes}
            ctaHref="/services#grow"
            ctaLabel="See Grow"
            accent="var(--color-accent)"
            delay={0.2}
          />
          <AnchorCard
            title="AI & Automation"
            description="Custom MCP servers and task-specific agents on Claude — wired into your stack, with real evals and guardrails. Not a prompt in a Zapier step."
            bullets={serviceNames('automate')}
            tags={aiStack}
            ctaHref="/services#automate"
            ctaLabel="See AI & Automation"
            accent="var(--color-quaternary, var(--color-secondary))"
            featured
            featuredLabel="/// the new bet"
            delay={0.3}
          />
        </div>

        <Reveal delay={0.4}>
          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            +{' '}
            <Link
              href="/services#design"
              className="transition-colors hover:underline"
              style={{ color: 'var(--color-text-body)' }}
            >
              Design, research-first, woven through every build.
            </Link>
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
