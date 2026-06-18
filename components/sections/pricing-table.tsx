import Link from 'next/link'
import { Eyebrow } from '@/components/primitives/eyebrow'
import { Headline } from '@/components/primitives/headline'
import { Reveal } from '@/components/primitives/reveal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { getServicesByCategory } from '@/lib/data/services'
import type { Service, ServiceCategory } from '@/lib/data/services'

interface PricingTableProps {
  category: ServiceCategory
  theme: 'ink' | 'sand'
}

function ServiceRow({ service, dark }: { service: Service; dark: boolean }) {
  const text = dark ? 'var(--color-text-on-inverse)' : 'var(--color-text-primary)'
  const muted = dark ? 'rgba(240,237,229,0.6)' : 'var(--color-text-muted)'
  const border = dark ? 'rgba(240,237,229,0.1)' : 'var(--color-border)'

  return (
    <div
      className="hidden items-center gap-4 border-b py-4 last:border-b-0 lg:grid lg:grid-cols-[1fr_160px_140px_160px]"
      style={{ borderBottomColor: border }}
    >
      <div>
        <p className="font-medium" style={{ color: text }}>
          {service.name}
        </p>
        {service.description && (
          <p className="mt-0.5 text-sm" style={{ color: muted }}>
            {service.description}
          </p>
        )}
      </div>
      <p className="text-sm" style={{ color: muted }}>
        {service.timeline}
      </p>
      <p className="font-medium" style={{ color: text }}>
        From €{service.startingPriceEur.toLocaleString()}
      </p>
      <div>
        <Button asChild variant="secondary" className="px-4 py-1.5 text-sm">
          <Link href={`/audit?service=${service.slug}`}>Get started</Link>
        </Button>
      </div>
    </div>
  )
}

function ServiceCard({ service, dark }: { service: Service; dark: boolean }) {
  const text = dark ? 'var(--color-text-on-inverse)' : 'var(--color-text-primary)'
  const muted = dark ? 'rgba(240,237,229,0.6)' : 'var(--color-text-muted)'
  const border = dark ? 'rgba(240,237,229,0.1)' : 'var(--color-border)'

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-5 lg:hidden"
      style={{ borderColor: border }}
    >
      <div>
        <p className="font-medium" style={{ color: text }}>
          {service.name}
        </p>
        {service.description && (
          <p className="mt-1 text-sm" style={{ color: muted }}>
            {service.description}
          </p>
        )}
      </div>
      <div className="flex gap-6 text-sm">
        <div>
          <span className="mb-0.5 block text-xs tracking-wide uppercase" style={{ color: muted }}>
            Timeline
          </span>
          <span style={{ color: text }}>{service.timeline}</span>
        </div>
        <div>
          <span className="mb-0.5 block text-xs tracking-wide uppercase" style={{ color: muted }}>
            Starting from
          </span>
          <span className="font-medium" style={{ color: text }}>
            €{service.startingPriceEur.toLocaleString()}
          </span>
        </div>
      </div>
      <Button asChild variant="secondary" className="self-start text-sm">
        <Link href={`/audit?service=${service.slug}`}>Get started</Link>
      </Button>
    </div>
  )
}

const headlines: Partial<Record<ServiceCategory, string>> = {
  build: "Sites that load fast. Pages that convert. Apps that don't break.",
  grow: 'Paid traffic that pays for itself. SEO that compounds.',
  design: "Design that's grounded in research and built to scale.",
  automate:
    'AI agents, MCP servers, and automation — built to save your team real hours every week.',
}

const categoryLabels: Record<ServiceCategory, string> = {
  build: 'Build',
  grow: 'Grow',
  design: 'Design',
  automate: 'AI & Automation',
}

export function PricingTable({ category, theme }: PricingTableProps) {
  const services = getServicesByCategory(category)
  const isInk = theme === 'ink'
  const bg = isInk ? 'var(--color-bg-inverse)' : 'var(--color-bg-card-alt)'
  const text = isInk ? 'var(--color-text-on-inverse)' : 'var(--color-text-primary)'
  const muted = isInk ? 'rgba(240,237,229,0.6)' : 'var(--color-text-muted)'
  const border = isInk ? 'rgba(240,237,229,0.15)' : 'var(--color-border)'

  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ background: bg }}>
      <Container>
        <Reveal>
          <div className="mb-10">
            <Eyebrow style={{ color: muted }}>{categoryLabels[category]}</Eyebrow>
            <Headline as="h2" className="mt-4" style={{ color: text }}>
              {headlines[category]}
            </Headline>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <div
              className="mb-2 hidden gap-4 border-b-2 pb-3 lg:grid lg:grid-cols-[1fr_160px_140px_160px]"
              style={{ borderBottomColor: border }}
            >
              {['Service', 'Timeline', 'Starting from', 'Action'].map((h) => (
                <p
                  key={h}
                  className="text-xs font-medium tracking-wide uppercase"
                  style={{ color: muted }}
                >
                  {h}
                </p>
              ))}
            </div>

            <div className="hidden lg:block">
              {services.map((service) => (
                <ServiceRow key={service.slug} service={service} dark={isInk} />
              ))}
            </div>

            <div className="flex flex-col gap-4 lg:hidden">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} dark={isInk} />
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
