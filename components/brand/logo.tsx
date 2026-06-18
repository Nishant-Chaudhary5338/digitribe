import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Mark } from './mark'
import { Wordmark } from './wordmark'

type LogoVariant = 'full' | 'wordmark' | 'mark'
type LogoSize = 'sm' | 'md' | 'lg'

const markSizeMap: Record<LogoSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
}

const wordmarkSizeMap: Record<LogoSize, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

export interface LogoProps {
  variant?: LogoVariant
  theme?: 'light' | 'dark'
  size?: LogoSize
  className?: string
  href?: string
}

export function Logo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className,
  href = '/',
}: LogoProps) {
  const markSize = markSizeMap[size]
  const wordmarkSize = wordmarkSizeMap[size]

  return (
    <Link
      href={href}
      aria-label="Digitribe — home"
      className={cn(
        'inline-flex items-center gap-2.5 shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5b3a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e27]',
        'rounded-sm',
        className
      )}
    >
      {(variant === 'full' || variant === 'mark') && (
        <Mark size={markSize} theme={theme} />
      )}
      {(variant === 'full' || variant === 'wordmark') && (
        <Wordmark theme={theme} className={wordmarkSize} />
      )}
    </Link>
  )
}
