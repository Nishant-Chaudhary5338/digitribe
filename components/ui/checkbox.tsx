'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error = false, id, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId()
    const checkboxId = id ?? generatedId

    const [internalChecked, setInternalChecked] = React.useState(
      props.defaultChecked ?? false
    )

    const isControlled = checked !== undefined
    const isChecked = isControlled ? checked : internalChecked

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked)
      }
      onChange?.(e)
    }

    return (
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="sr-only peer"
            aria-invalid={error || undefined}
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded border-2 flex items-center justify-center',
              'transition-colors duration-150 cursor-pointer',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-(--color-accent)',
              'peer-focus-visible:ring-offset-2',
              !isChecked && 'bg-transparent border-[rgba(100,80,60,0.3)] hover:border-(--color-accent)',
              error ? 'border-[#b91c1c]' : '',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className
            )}
            style={isChecked ? {
              background: 'var(--color-text-primary)',  /* dark on light bg — passes contrast */
              borderColor: 'var(--color-text-primary)',
            } : undefined}
            aria-hidden="true"
            onClick={() => {
              const input = document.getElementById(checkboxId) as HTMLInputElement | null
              input?.click()
            }}
          >
            {isChecked && (
              <Check className="h-3 w-3" style={{ color: 'var(--color-text-on-inverse)' }} strokeWidth={3} />
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm text-[#f0ede5] cursor-pointer select-none leading-none"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
