import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type HeadlineLevel = 'display' | 'h1' | 'h2' | 'h3' | 'h4'
type HeadlineTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span'

const levelSizeMap: Record<HeadlineLevel, string> = {
  display:
    'text-[40px] leading-[44px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[76px]',
  h1: 'text-[32px] leading-[38px] sm:text-[40px] sm:leading-[46px] lg:text-[48px] lg:leading-[54px]',
  h2: 'text-[26px] leading-[32px] sm:text-[30px] sm:leading-[36px] lg:text-[36px] lg:leading-[42px]',
  h3: 'text-[20px] leading-[26px] sm:text-[22px] sm:leading-[28px] lg:text-[24px] lg:leading-[30px]',
  h4: 'text-[17px] leading-[22px] lg:text-[18px] lg:leading-[24px]',
}

const levelTagMap: Record<HeadlineLevel, HeadlineTag> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
}

export interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadlineLevel
  as?: HeadlineTag
  children: React.ReactNode
}

export function Headline({
  level = 'h2',
  as,
  children,
  className,
  ...props
}: HeadlineProps) {
  const Tag = (as ?? levelTagMap[level]) as React.ElementType

  return (
    <Tag
      className={cn(
        'font-[family-name:var(--font-display)] font-bold tracking-[-0.02em] text-(--color-text-primary)',
        levelSizeMap[level],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
