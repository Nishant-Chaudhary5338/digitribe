import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  theme?: 'dark' | 'light'
  error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, theme = 'dark', error = false, children, ...props }, ref) => {
    const themeClasses =
      theme === 'dark'
        ? 'bg-[#1a1f3a] border-[rgba(240,237,229,0.1)] text-[#f0ede5] focus:border-[#ff5b3a]'
        : 'bg-[#fafaf7] border-[#e5e3dc] text-[#2d3748] focus:border-[#ff5b3a]'

    const errorClasses = error ? 'border-[#b91c1c] focus:border-[#b91c1c]' : ''

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm',
            'transition-colors duration-150 outline-none cursor-pointer',
            'focus-visible:ring-2 focus-visible:ring-[#ff5b3a] focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            themeClasses,
            errorClasses,
            className
          )}
          aria-invalid={error || undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4',
            theme === 'dark' ? 'text-[#c4c1b8]' : 'text-[#6b7280]'
          )}
          aria-hidden="true"
        />
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
