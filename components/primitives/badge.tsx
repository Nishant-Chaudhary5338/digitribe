import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'pulse' | 'sand' | 'outline'

const variantMap: Record<BadgeVariant, string> = {
  pulse: 'bg-[#ff5b3a] text-[#0a0e27]',
  sand: 'bg-[#f0ede5] text-[#0a0e27]',
  outline: 'border border-[rgba(240,237,229,0.3)] text-[#f0ede5]',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: React.ReactNode
}

export function Badge({
  variant = 'sand',
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold uppercase tracking-wider',
        'px-3 py-1 rounded-full',
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
