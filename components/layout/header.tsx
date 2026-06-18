'use client'

import * as React from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Logo } from '@/components/brand/logo'
import { NavDesktop } from '@/components/layout/nav-desktop'
import { NavMobile } from '@/components/layout/nav-mobile'

export function Header() {
  const [scrolled, setScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobile = React.useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-[250ms]',
          scrolled
            ? 'bg-[#0a0e27]/95 backdrop-blur-sm border-b border-[rgba(240,237,229,0.08)]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Logo variant="full" theme="light" size="md" />

            <NavDesktop />

            <button
              className={cn(
                'lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg',
                'text-[#c4c1b8] hover:text-[#f0ede5] hover:bg-[#1a1f3a]',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5b3a]'
              )}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <NavMobile isOpen={mobileOpen} onClose={closeMobile} />
    </>
  )
}
