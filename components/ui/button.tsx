'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-(--color-accent) focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        // Theme-aware primary: globals.css .btn-primary provides shape/shadow per theme
        primary:
          'btn-primary bg-(--color-accent) text-(--color-text-primary) hover:opacity-90',
        secondary:
          'rounded-[var(--radius-theme-md,8px)] bg-(--color-bg-card) text-(--color-text-body) border border-(--color-border) hover:bg-(--color-bg-card-alt)',
        ghost:
          'rounded-[var(--radius-theme-md,8px)] bg-transparent text-(--color-text-on-inverse) hover:underline underline-offset-4',
        link: 'bg-transparent text-(--color-text-on-inverse) underline underline-offset-4 hover:text-(--color-accent)',
        outline:
          'rounded-[var(--radius-theme-md,8px)] bg-transparent border border-(--color-border) text-(--color-text-primary) hover:bg-(--color-bg-card)',
      },
      size: {
        sm: 'min-h-9 px-4 py-2 text-sm',
        md: 'min-h-11 px-5 py-2.5 text-sm lg:min-h-12',
        lg: 'min-h-12 px-7 py-3 text-base lg:min-h-14',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </>
    )

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
