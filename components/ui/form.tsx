import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />
}

export function FormLabel({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('text-sm font-medium text-[#f0ede5]', className)} {...props}>
      {children}
      {required && (
        <span className="ml-0.5 text-[#ff5b3a]" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

export function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null
  return (
    <p role="alert" className={cn('text-sm text-[#b91c1c]', className)} {...props}>
      {children}
    </p>
  )
}

export function FormDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-[#c4c1b8]', className)} {...props}>
      {children}
    </p>
  )
}
