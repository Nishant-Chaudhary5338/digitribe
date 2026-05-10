import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type EyebrowElement = 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface EyebrowProps extends React.HTMLAttributes<HTMLElement> {
  as?: EyebrowElement
  children: React.ReactNode
}

export function Eyebrow({
  as: Tag = 'span',
  children,
  className,
  ...props
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.15em] text-(--color-accent)',
        'font-[family-name:var(--font-display)]',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
