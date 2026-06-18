import Link from 'next/link'
import { Eyebrow } from '@/components/primitives/eyebrow'
import { Headline } from '@/components/primitives/headline'
import { Reveal } from '@/components/primitives/reveal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { getServicesByCategory } from '@/lib/data/services'
import type { Service } from '@/lib/data/services'

interface AIPracticeBoardProps {
  theme?: 'ink' | 'sand'
}

interface CardTokens {
  text: string
  muted: string
  border: string
  panel: string
  accent: string
}

function formatUsd(service: Service): string {
  const start = `$${service.startingPriceUsd.toLocaleString()}`
  return service.ceilingPriceUsd
    ? `${start}–$${service.ceilingPriceUsd.toLocaleString()}`
    : `From ${start}`
}

function priceLine(service: Service): string {
  const price = formatUsd(service)
  return service.recurring ? `${price}/month` : price
}

/** First few words of a scope bullet, slugged into a tool-ish identifier. */
function toToolName(scope: string): string {
  const cleaned = scope
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('_')
  return cleaned || 'tool'
}

function ManifestLine({ label, value, t }: { label: string; value: string; t: CardTokens }) {
  return (
    <div className="flex items-baseline gap-2">
      <span style={{ color: t.muted }}>{label}:</span>
      <span style={{ color: t.accent }}>{value}</span>
    </div>
  )
}

/** mcp-server-build → server manifest with exposed tools[] + config lines. */
function McpManifest({ service, t }: { service: Service; t: CardTokens }) {
  const tools = service.scope.slice(0, 4).map(toToolName)
  return (
    <div
      className="rounded-lg border p-4 text-[12px] leading-relaxed"
      style={{
        background: t.panel,
        borderColor: t.border,
        fontFamily: 'var(--font-mono)',
      }}
    >
      <p style={{ color: t.muted }}>tools[] {`{`}</p>
      <ul className="ml-3">
        {tools.map((tool) => (
          <li key={tool} style={{ color: t.text }}>
            {tool}()
          </li>
        ))}
      </ul>
      <p className="mb-2" style={{ color: t.muted }}>
        {`}`}
      </p>
      <ManifestLine label="auth" value="✓" t={t} />
      <ManifestLine label="transport" value="stdio + http" t={t} />
      <ManifestLine label="validated" value="zod" t={t} />
    </div>
  )
}

function PipelineStages({ stages, t }: { stages: string[]; t: CardTokens }) {
  return (
    <div className="flex flex-wrap items-center gap-2" style={{ fontFamily: 'var(--font-mono)' }}>
      {stages.map((stage, i) => (
        <span key={stage} className="flex items-center gap-2">
          <span
            className="rounded-md border px-2 py-1 text-[11px]"
            style={{ borderColor: t.border, background: t.panel, color: t.text }}
          >
            {stage}
          </span>
          {i < stages.length - 1 && (
            <span aria-hidden="true" style={{ color: t.accent }}>
              →
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

/** ai-agent-build → agent spec pipeline. */
function AgentSpec({ t }: { t: CardTokens }) {
  return (
    <div className="rounded-lg border p-4" style={{ background: t.panel, borderColor: t.border }}>
      <p className="mb-3 text-[11px] tracking-wide uppercase" style={{ color: t.muted }}>
        agent runtime
      </p>
      <PipelineStages stages={['inputs', 'tools', 'guardrails', 'evals', 'handoff']} t={t} />
    </div>
  )
}

/** ai-readiness-sprint → one-week roadmap with effort/impact chips. */
function ReadinessRoadmap({ service, t }: { service: Service; t: CardTokens }) {
  const scores: { effort: string; impact: string }[] = [
    { effort: 'low', impact: 'high' },
    { effort: 'med', impact: 'high' },
    { effort: 'low', impact: 'med' },
  ]
  const items = service.scope.slice(0, 3)
  return (
    <div className="rounded-lg border p-4" style={{ background: t.panel, borderColor: t.border }}>
      <p
        className="mb-3 text-[11px] tracking-wide uppercase"
        style={{ color: t.muted, fontFamily: 'var(--font-mono)' }}
      >
        week 1 · roadmap
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => {
          const score = scores[i] ?? { effort: 'med', impact: 'med' }
          return (
            <li key={item} className="flex items-start justify-between gap-3">
              <span className="text-[13px]" style={{ color: t.text }}>
                {item}
              </span>
              <span className="flex shrink-0 gap-1" style={{ fontFamily: 'var(--font-mono)' }}>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px]"
                  style={{ background: t.border, color: t.muted }}
                >
                  effort {score.effort}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px]"
                  style={{ background: t.border, color: t.accent }}
                >
                  impact {score.impact}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** automation-workflow → trigger → steps → docs flow. */
function WorkflowFlow({ service, t }: { service: Service; t: CardTokens }) {
  const steps = service.scope.slice(1, 3).map(toToolName)
  const stages = ['trigger', ...steps, 'docs']
  return (
    <div className="rounded-lg border p-4" style={{ background: t.panel, borderColor: t.border }}>
      <p
        className="mb-3 text-[11px] tracking-wide uppercase"
        style={{ color: t.muted, fontFamily: 'var(--font-mono)' }}
      >
        flow
      </p>
      <PipelineStages stages={stages} t={t} />
    </div>
  )
}

function renderObject(service: Service, t: CardTokens): React.ReactNode {
  switch (service.slug) {
    case 'mcp-server-build':
      return <McpManifest service={service} t={t} />
    case 'ai-agent-build':
      return <AgentSpec t={t} />
    case 'ai-readiness-sprint':
      return <ReadinessRoadmap service={service} t={t} />
    case 'automation-workflow':
      return <WorkflowFlow service={service} t={t} />
    default:
      return null
  }
}

function ServiceObjectCard({ service, t }: { service: Service; t: CardTokens }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border p-5" style={{ borderColor: t.border }}>
      <div>
        <h3 className="text-lg font-semibold" style={{ color: t.text }}>
          {service.name}
        </h3>
        <p className="mt-1 text-sm" style={{ color: t.muted }}>
          {service.oneLiner}
        </p>
      </div>

      {renderObject(service, t)}

      <div className="mt-auto flex items-end justify-between gap-4 pt-1">
        <div>
          <p className="font-medium" style={{ color: t.text }}>
            {priceLine(service)}
          </p>
          <p className="text-sm" style={{ color: t.muted }}>
            {service.timeline}
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/audit?service=${service.slug}`}>Get started</Link>
        </Button>
      </div>
    </div>
  )
}

export function AIPracticeBoard({ theme = 'sand' }: AIPracticeBoardProps) {
  const services = getServicesByCategory('automate')
  const isInk = theme === 'ink'

  const bg = isInk ? 'var(--color-bg-inverse)' : 'var(--color-bg-card-alt)'
  const t: CardTokens = {
    text: isInk ? 'var(--color-text-on-inverse)' : 'var(--color-text-primary)',
    muted: isInk ? 'rgba(240,237,229,0.6)' : 'var(--color-text-muted)',
    border: isInk ? 'rgba(240,237,229,0.15)' : 'var(--color-border)',
    panel: isInk ? 'rgba(240,237,229,0.04)' : 'var(--color-bg-card)',
    accent: 'var(--color-secondary)',
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ background: bg }}>
      <Container>
        <Reveal>
          <div className="mb-10">
            <Eyebrow style={{ color: t.accent }}>AI &amp; Automation</Eyebrow>
            <Headline as="h2" className="mt-4" style={{ color: t.text }}>
              Agents and MCP servers, built like product.
            </Headline>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {services.map((service) => (
              <ServiceObjectCard key={service.slug} service={service} t={t} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
