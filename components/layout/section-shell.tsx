import * as React from 'react'
import { Container } from '@/components/layout/container'

type SectionSize = 'sm' | 'md' | 'lg'
type SectionTone = 'page' | 'card' | 'inverse'

export interface SectionShellProps {
  size?: SectionSize
  tone?: SectionTone
  id?: string
  children: React.ReactNode
  className?: string
}

const TONE_BG: Record<SectionTone, string> = {
  page: 'var(--color-bg-page)',
  card: 'var(--color-bg-card-alt)',
  inverse: 'var(--color-bg-inverse)',
}

export function SectionShell({
  size = 'md',
  tone = 'page',
  id,
  children,
  className,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={className}
      style={{
        paddingBlock: `var(--space-section-${size})`,
        background: TONE_BG[tone],
      }}
    >
      <Container>{children}</Container>
    </section>
  )
}
