import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type BodySize = 'lg' | 'base' | 'sm'
type BodyTag = 'p' | 'div' | 'span' | 'li' | 'dd' | 'dt' | 'blockquote'

const sizeMap: Record<BodySize, string> = {
  lg: 'text-[17px] leading-[26px] sm:text-[18px] sm:leading-[28px]',
  base: 'text-[15px] leading-[25px] sm:text-[16px] sm:leading-[26px]',
  sm: 'text-[14px] leading-[22px]',
}

export interface BodyTextProps extends React.HTMLAttributes<HTMLElement> {
  size?: BodySize
  as?: BodyTag
  children: React.ReactNode
}

export function BodyText({
  size = 'base',
  as: Tag = 'p',
  children,
  className,
  ...props
}: BodyTextProps) {
  return (
    <Tag
      className={cn(
        'font-[family-name:var(--font-body)]',
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
