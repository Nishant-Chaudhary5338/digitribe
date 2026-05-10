import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type DividerVariant = 'full' | 'short' | 'centered'

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: DividerVariant
}

const variantMap: Record<DividerVariant, string> = {
  full: 'w-full h-px bg-[#ff5b3a]',
  short: 'w-[60px] h-px bg-[#ff5b3a]',
  centered: 'w-[60px] h-px bg-[#ff5b3a] mx-auto',
}

export function Divider({
  variant = 'full',
  className,
  ...props
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn(variantMap[variant], className)}
      {...props}
    />
  )
}
