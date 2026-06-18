import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Reveal } from '@/components/primitives/reveal'
import { Container } from '@/components/layout/container'
import { founders } from '@/lib/data/founders'
import type { Founder } from '@/lib/data/founders'

interface FoundersGridProps {
  variant: 'compact' | 'full'
}

// Uses theme color tokens — accent, secondary, and bg-inverse per theme.
// Studio:  pink / electric blue / navy
// Garden:  terracotta / sage / deep brown
const FOUNDER_DOT_STYLES = [
  { borderRadius: '60% 50% 60% 50%', background: 'var(--color-accent)' },
  { borderRadius: '50% 60% 50% 60%', background: 'var(--color-secondary)' },
  { borderRadius: '60% 60% 50% 50%', background: 'var(--color-bg-inverse)' },
]

function CompactCard({ founder, index }: { founder: Founder; index: number }) {
  return (
    <Reveal delay={index * 0.15}>
      <div className="flex flex-col items-center p-6 text-center">
        {founder.photo ? (
          <Image
            src={founder.photo}
            unoptimized={founder.photo.endsWith('.svg')}
            alt={`${founder.name} — ${founder.role}`}
            width={80}
            height={80}
            className="mb-4 rounded-full object-cover"
          />
        ) : (
          <div
            className="mb-4 flex h-20 w-20 shrink-0 items-center justify-center text-xl font-bold"
            aria-label={`${founder.name} initials`}
            style={{
              ...FOUNDER_DOT_STYLES[index % FOUNDER_DOT_STYLES.length],
              color: 'var(--color-text-on-inverse)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {founder.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
        )}

        <h3
          className="mb-0.5 text-base font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {founder.name}
        </h3>
        <p className="mb-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {founder.role}
        </p>
        <p className="mb-3 text-sm" style={{ color: 'var(--color-text-body)' }}>
          {founder.oneLiner}
        </p>

        <Link
          href={`/about#${founder.slug}`}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-accent)' }}
        >
          More about {founder.name.split(' ')[0]} &rarr;
        </Link>
      </div>
    </Reveal>
  )
}

function FullCard({ founder, index }: { founder: Founder; index: number }) {
  return (
    <Reveal delay={index * 0.15}>
      <div
        id={founder.slug}
        className="flex flex-col p-6 sm:p-8"
        style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-theme-lg, 12px)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {founder.photo ? (
          <Image
            src={founder.photo}
            unoptimized={founder.photo.endsWith('.svg')}
            alt={`${founder.name} — ${founder.role} at Digitribe`}
            width={192}
            height={192}
            className="mb-5 h-48 w-48 object-cover"
            style={{ borderRadius: 'var(--radius-theme-md, 8px)' }}
          />
        ) : (
          <div
            className="mb-5 flex h-48 w-48 shrink-0 items-center justify-center text-4xl font-bold"
            aria-label={`${founder.name} initials`}
            style={{
              ...FOUNDER_DOT_STYLES[index % FOUNDER_DOT_STYLES.length],
              color: 'var(--color-text-on-inverse)',
              fontFamily: 'var(--font-display)',
              borderRadius: 'var(--radius-theme-md, 8px)',
            }}
          >
            {founder.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            {founder.name}
          </h3>
          <span
            className="px-2.5 py-1 text-xs font-medium"
            style={{
              background: 'var(--color-accent-soft)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-theme-pill, 999px)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {founder.role}
          </span>
        </div>

        <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
          {founder.bio}
        </p>

        {founder.stack && founder.stack.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {founder.stack.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs"
                style={{
                  background: 'var(--color-bg-card-alt)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: 'var(--radius-theme-sm, 4px)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {founder.links && Object.entries(founder.links).some(([, v]) => Boolean(v)) && (
          <div className="flex flex-wrap gap-3">
            {Object.entries(founder.links)
              .filter(([, url]) => Boolean(url))
              .map(([key, url]) => (
                <Link
                  key={key}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <ExternalLink size={12} aria-hidden="true" />
                </Link>
              ))}
          </div>
        )}
      </div>
    </Reveal>
  )
}

export function FoundersGrid({ variant }: FoundersGridProps) {
  const isCompact = variant === 'compact'

  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ background: 'var(--color-bg-page)' }}>
      <Container>
        <Reveal>
          <div className="mb-12 text-center">
            <p
              className="mb-3 text-xs tracking-[0.12em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
            >
              The tribe
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                color: 'var(--color-text-primary)',
              }}
            >
              {isCompact
                ? 'Two of us. All senior. No layers.'
                : 'Senior practitioners. Direct contact. No layers.'}
            </h2>
          </div>
        </Reveal>

        <div className="relative mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Founder seam — two people, one team, joined at the center. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center sm:flex"
            style={{ zIndex: 1 }}
          >
            <span
              style={{ width: 12, height: 2, background: 'var(--color-accent)', opacity: 0.5 }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                margin: '0 2px',
                background: 'var(--color-accent)',
                transform: 'rotate(45deg)',
              }}
            />
            <span
              style={{ width: 12, height: 2, background: 'var(--color-accent)', opacity: 0.5 }}
            />
          </div>
          {founders.map((founder, index) =>
            isCompact ? (
              <CompactCard key={founder.slug} founder={founder} index={index} />
            ) : (
              <FullCard key={founder.slug} founder={founder} index={index} />
            )
          )}
        </div>
      </Container>
    </section>
  )
}
