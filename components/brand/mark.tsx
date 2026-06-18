import * as React from 'react'

export interface MarkProps {
  size?: number
  theme?: 'light' | 'dark'
}

export function Mark({ size = 32, theme = 'light' }: MarkProps) {
  const secondaryColor = theme === 'light' ? '#f0ede5' : '#0a0e27'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="16" cy="6" r="5" fill="#ff5b3a" />
      <circle cx="6" cy="24" r="5" fill={secondaryColor} />
      <circle cx="26" cy="24" r="5" fill={secondaryColor} />
    </svg>
  )
}
