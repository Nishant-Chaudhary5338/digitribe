import * as React from 'react'

type StatRowTheme = 'studio' | 'garden'

interface Stat {
  num: string
  label: string
}

export interface StatRowProps {
  stats: Stat[]
  theme: StatRowTheme
}

const STUDIO_NUM_COLORS = [
  'var(--color-accent)',
  'var(--color-secondary)',
  'var(--color-text-primary)',
] as const

function StudioStatRow({ stats }: { stats: Stat[] }) {
  return (
    <div
      className="grid grid-cols-1 gap-8 border-t-[2.5px] pt-9 sm:grid-cols-3"
      style={{ borderTopColor: 'var(--color-border)' }}
    >
      {stats.map((stat, index) => {
        const isLast = index === stats.length - 1
        return (
          <div key={stat.label} className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: "'wdth' 88, 'opsz' 96",
                fontWeight: 800,
                fontSize: isLast ? '2.375rem' : '3.25rem',
                lineHeight: 1,
                color: STUDIO_NUM_COLORS[index % STUDIO_NUM_COLORS.length],
                letterSpacing: '-0.04em',
              }}
            >
              {stat.num}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              {stat.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function GardenStatRow({ stats }: { stats: Stat[] }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 border-t pt-9 sm:grid-cols-3"
      style={{ borderTopStyle: 'dashed', borderTopColor: 'var(--color-border-decorative)' }}
    >
      {stats.map((stat, index) => {
        const isLast = index === stats.length - 1
        return (
          <div key={stat.label} className="flex flex-col gap-1.5">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'wght' 500",
                fontSize: isLast ? '2rem' : '2.75rem',
                color: 'var(--color-accent)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {stat.num}
            </span>
            <span
              style={{ fontSize: '0.8125rem', color: 'var(--color-text-body)', fontWeight: 500 }}
            >
              {stat.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function StatRow({ stats, theme }: StatRowProps) {
  return theme === 'studio' ? <StudioStatRow stats={stats} /> : <GardenStatRow stats={stats} />
}
