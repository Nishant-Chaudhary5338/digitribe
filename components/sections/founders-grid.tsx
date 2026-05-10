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
      <div className="flex flex-col items-center text-center p-6">
        {founder.photo ? (
          <Image
            src={founder.photo}
            unoptimized={founder.photo.endsWith('.svg')}
            alt={`${founder.name} — ${founder.role}`}
            width={80}
            height={80}
            className="rounded-full object-cover mb-4"
          />
        ) : (
          <div
            className="w-20 h-20 flex items-center justify-center font-bold text-xl mb-4 shrink-0"
            aria-label={`${founder.name} initials`}
            style={{
              ...FOUNDER_DOT_STYLES[index % FOUNDER_DOT_STYLES.length],
              color: 'var(--color-text-on-inverse)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {founder.name.split(' ').map((n) => n[0]).join('')}
          </div>
        )}

        <h3
          className="text-base font-bold mb-0.5"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {founder.name}
        </h3>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>{founder.role}</p>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-body)' }}>{founder.oneLiner}</p>

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
            className="object-cover mb-5 w-48 h-48"
            style={{ borderRadius: 'var(--radius-theme-md, 8px)' }}
          />
        ) : (
          <div
            className="w-48 h-48 flex items-center justify-center font-bold text-4xl mb-5 shrink-0"
            aria-label={`${founder.name} initials`}
            style={{
              ...FOUNDER_DOT_STYLES[index % FOUNDER_DOT_STYLES.length],
              color: 'var(--color-text-on-inverse)',
              fontFamily: 'var(--font-display)',
              borderRadius: 'var(--radius-theme-md, 8px)',
            }}
          >
            {founder.name.split(' ').map((n) => n[0]).join('')}
          </div>
        )}

        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            {founder.name}
          </h3>
          <span
            className="text-xs px-2.5 py-1 font-medium"
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

        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: 'var(--color-text-body)' }}
        >
          {founder.bio}
        </p>

        {founder.stack && founder.stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {founder.stack.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1"
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
                ? 'Three of us. All senior. No layers.'
                : 'Senior practitioners. Direct contact. No layers.'}
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
