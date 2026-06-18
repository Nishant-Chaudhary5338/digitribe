import * as React from 'react'

type SectionHeaderAlign = 'center' | 'start'

export interface SectionHeaderProps {
  eyebrow?: string
  title: string
  align?: SectionHeaderAlign
  className?: string
}

export function SectionHeader({ eyebrow, title, align = 'start', className }: SectionHeaderProps) {
  return (
    <div className={className} style={{ textAlign: align === 'center' ? 'center' : 'left' }}>
      {eyebrow ? (
        <span
          className="inline-block"
          style={{
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-label)',
            color: 'var(--color-text-muted)',
          }}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--display-sm)',
          letterSpacing: 'var(--tracking-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h2>
    </div>
  )
}
