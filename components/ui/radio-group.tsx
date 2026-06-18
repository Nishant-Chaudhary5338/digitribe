'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  name: string
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  theme?: 'dark' | 'light'
  className?: string
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  theme = 'dark',
  className,
}: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => {
        const checked = opt.value === value
        return (
          <label
            key={opt.value}
            className={cn(
              'cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150',
              theme === 'dark'
                ? checked
                  ? 'border-[#ff5b3a] bg-[#1a1f3a] text-[#f0ede5]'
                  : 'border-[rgba(240,237,229,0.15)] bg-transparent text-[#c4c1b8] hover:border-[rgba(240,237,229,0.3)]'
                : checked
                  ? 'border-[#ff5b3a] bg-[#fafaf7] text-[#0a0e27]'
                  : 'border-[#e5e3dc] bg-transparent text-[#4a5568] hover:border-[#c4c1b8]'
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        )
      })}
    </div>
  )
}
