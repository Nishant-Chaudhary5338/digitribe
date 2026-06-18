import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light'
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, theme = 'dark', error = false, type, ...props }, ref) => {
    const themeClasses =
      theme === 'dark'
        ? 'bg-[#1a1f3a] border-[rgba(240,237,229,0.1)] text-[#f0ede5] placeholder:text-[#c4c1b8] focus:border-[#ff5b3a]'
        : 'bg-[#fafaf7] border-[#e5e3dc] text-[#2d3748] placeholder:text-[#6b7280] focus:border-[#ff5b3a]'

    const errorClasses = error ? 'border-[#b91c1c] focus:border-[#b91c1c]' : ''

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border px-4 py-2.5 text-sm',
          'transition-colors duration-150 outline-none',
          'focus-visible:ring-2 focus-visible:ring-[#ff5b3a] focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          themeClasses,
          errorClasses,
          className
        )}
        aria-invalid={error || undefined}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
