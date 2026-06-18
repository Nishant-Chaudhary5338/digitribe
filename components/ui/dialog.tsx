'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const titleId = React.useId()
  const panelRef = React.useRef<HTMLDivElement>(null)

  // Close on ESC
  React.useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap: move focus into panel when dialog opens
  React.useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    // Find the first focusable element inside the panel
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    function trapTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', trapTab)

    return () => {
      document.removeEventListener('keydown', trapTab)
      previouslyFocused?.focus()
    }
  }, [open])

  // Prevent body scroll while open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0a0e27]/80 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 mx-4 w-full max-w-lg rounded-2xl bg-[#1a1f3a] p-6 shadow-lg sm:p-8',
          className
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className={[
            'absolute right-4 top-4 rounded-md p-1.5',
            'text-[#c4c1b8] transition-colors duration-150',
            'hover:bg-[rgba(240,237,229,0.08)] hover:text-[#f0ede5]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5b3a]',
          ].join(' ')}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Title */}
        <h2
          id={titleId}
          className="mb-4 pr-8 text-lg font-semibold text-[#f0ede5]"
        >
          {title}
        </h2>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
