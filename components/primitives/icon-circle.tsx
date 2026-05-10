import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type IconCircleSize = 'sm' | 'md' | 'lg'

const sizeMap: Record<IconCircleSize, { container: string; icon: string }> = {
  sm: { container: 'h-10 w-10', icon: 'h-5 w-5' },
  md: { container: 'h-14 w-14', icon: 'h-7 w-7' },
  lg: { container: 'h-[72px] w-[72px]', icon: 'h-9 w-9' },
}

export interface IconCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  size?: IconCircleSize
}

export function IconCircle({
  icon: Icon,
  size = 'md',
  className,
  ...props
}: IconCircleProps) {
  const { container, icon } = sizeMap[size]

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-[#1a1f3a] shrink-0',
        container,
        className
      )}
      {...props}
    >
      <Icon className={cn('text-[#ff5b3a]', icon)} aria-hidden="true" />
    </div>
  )
}
