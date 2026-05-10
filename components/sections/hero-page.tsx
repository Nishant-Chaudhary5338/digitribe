import Link from 'next/link'
import { Eyebrow } from '@/components/primitives/eyebrow'
import { Headline } from '@/components/primitives/headline'
import { BodyText } from '@/components/primitives/body-text'
import { Reveal } from '@/components/primitives/reveal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'

interface BreadcrumbItem {
  label: string
  href: string
}

interface CtaItem {
  label: string
  href: string
}

interface HeroPageProps {
  eyebrow: string
  headline: string
  sub?: string
  cta?: CtaItem
  breadcrumb?: BreadcrumbItem[]
}

export function HeroPage({ eyebrow, headline, sub, cta, breadcrumb }: HeroPageProps) {
  return (
    <section
      className="py-20 sm:py-24 lg:py-28"
      style={{ background: 'var(--color-bg-inverse)' }}
    >
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          {breadcrumb && breadcrumb.length > 0 && (
            <Reveal>
              <nav
                aria-label="Breadcrumb"
                className="flex items-center justify-center gap-2 text-sm mb-6"
                style={{ color: 'var(--color-text-on-inverse)', opacity: 0.6 }}
              >
                {breadcrumb.map((crumb, index) => (
                  <span key={crumb.href} className="flex items-center gap-2">
                    {index > 0 && (
                      <span aria-hidden className="opacity-40">/</span>
                    )}
                    <Link
                      href={crumb.href}
                      className="hover:opacity-100 transition-opacity"
                      style={{ color: 'inherit' }}
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
                <span aria-hidden className="opacity-40">/</span>
                <span style={{ color: 'var(--color-text-on-inverse)', opacity: 1 }}>{eyebrow}</span>
              </nav>
            </Reveal>
          )}

          <Reveal delay={0.05}>
            {/* Use on-inverse color — cream on dark bg gives 13.5:1 contrast */}
            <Eyebrow
              className="mb-4"
              style={{ color: 'var(--color-text-on-inverse)' }}
            >
              {eyebrow}
            </Eyebrow>
          </Reveal>

          <Reveal delay={0.1}>
            <Headline
              as="h1"
              className="mb-6"
              style={{ color: 'var(--color-text-on-inverse)' }}
            >
              {headline}
            </Headline>
          </Reveal>

          {sub && (
            <Reveal delay={0.15}>
              <BodyText
                className="text-lg mb-8"
                style={{ color: 'var(--color-text-on-inverse)', opacity: 0.75 }}
              >
                {sub}
              </BodyText>
            </Reveal>
          )}

          {cta && (
            <Reveal delay={0.2}>
              <Button asChild variant="primary">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  )
}
