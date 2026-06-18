import * as React from 'react'

interface PatternProps {
  className?: string
  opacity?: number
}

export function Pattern({ className, opacity = 0.04 }: PatternProps) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id="dots"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="#F0EDE5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}
