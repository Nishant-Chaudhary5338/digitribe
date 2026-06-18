import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  theme?: 'dark' | 'light'
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, theme = 'dark', ...props }, ref) => {
    const themeClasses =
      theme === 'dark' ? 'text-[#f0ede5]' : 'text-[#2d3748]'

    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium leading-none',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          themeClasses,
          className
        )}
        {...props}
      />
    )
  }
)

Label.displayName = 'Label'

export { Label }
