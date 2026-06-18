'use client'

import * as React from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { NAV_LINKS } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export interface NavMobileProps {
  isOpen: boolean
  onClose: () => void
}

export function NavMobile({ isOpen, onClose }: NavMobileProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#0a0e27]/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-[#0a0e27]',
          'px-5 pt-5 pb-8'
        )}
      >
        <div className="flex items-center justify-between mb-10">
          <span className="font-[family-name:var(--font-display)] font-bold text-xl">
            <span className="text-[#f0ede5]">Digi</span>
            <span className="text-[#ff5b3a]">tribe.</span>
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              'inline-flex items-center justify-center h-10 w-10 rounded-lg',
              'text-[#c4c1b8] hover:text-[#f0ede5] hover:bg-[#1a1f3a]',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5b3a]'
            )}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1">
          <ul className="flex flex-col list-none" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center min-h-[56px] text-[#f0ede5]',
                    'text-2xl font-semibold font-[family-name:var(--font-display)]',
                    'border-b border-[rgba(240,237,229,0.08)]',
                    'hover:text-[#ff5b3a] transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:text-[#ff5b3a]'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8">
          <Button variant="primary" size="lg" fullWidth asChild>
            <Link href="/audit" onClick={onClose}>
              Free Audit
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}
