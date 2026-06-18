import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface WordmarkProps {
  theme?: 'light' | 'dark'
  className?: string
}

export function Wordmark({ theme = 'light', className }: WordmarkProps) {
  const digiColor = theme === 'light' ? 'text-[#f0ede5]' : 'text-[#0a0e27]'

  return (
    <span
      className={cn(
        'font-[family-name:var(--font-display)] font-bold tracking-[-0.02em] text-xl',
        className
      )}
      aria-label="Digitribe"
    >
      <span className={digiColor}>Digi</span>
      <span className="text-[#ff5b3a]">tribe</span>
      <span className="text-[#ff5b3a]">.</span>
    </span>
  )
}
