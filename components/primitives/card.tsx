import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type CardVariant = 'default' | 'inverted' | 'outline'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  pulseBorder?: boolean
  children: React.ReactNode
}

export function Card({
  variant = 'default',
  pulseBorder = false,
  children,
  className,
  ...props
}: CardProps) {
  const baseStyle = {
    default: {
      background: 'var(--color-bg-card)',
      color: 'var(--color-text-body)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 'var(--radius-theme-lg, 12px)',
      border: '1px solid var(--color-border)',
    },
    inverted: {
      background: 'var(--color-bg-inverse)',
      color: 'var(--color-text-on-inverse)',
      borderRadius: 'var(--radius-theme-lg, 12px)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-body)',
      borderRadius: 'var(--radius-theme-lg, 12px)',
    },
  } satisfies Record<CardVariant, React.CSSProperties>

  return (
    <div
      className={cn('p-6 sm:p-8', pulseBorder && 'border-l-4 pl-6', className)}
      style={{
        ...baseStyle[variant],
        ...(pulseBorder ? { borderLeftColor: 'var(--color-accent)' } : {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
}
