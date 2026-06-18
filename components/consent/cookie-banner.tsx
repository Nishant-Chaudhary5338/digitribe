'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { updateGa4Consent } from '@/lib/analytics/ga4-consent'

const COOKIE_NAME = 'digitribe_cookie_consent'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null
}

function setConsentCookie(value: 'accepted' | 'declined') {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function CookieBanner() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const existing = getCookieValue(COOKIE_NAME)
    if (!existing) {
      setVisible(true)
    }

    const handleReopen = () => setVisible(true)
    window.addEventListener('open-cookie-banner', handleReopen)
    return () => window.removeEventListener('open-cookie-banner', handleReopen)
  }, [])

  const handleAccept = () => {
    setConsentCookie('accepted')
    updateGa4Consent(true)
    setVisible(false)
  }

  const handleDecline = () => {
    setConsentCookie('declined')
    updateGa4Consent(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-[#0a0e27] border-t border-[rgba(240,237,229,0.1)]',
        'px-5 py-4 sm:px-8'
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-sm text-[#c4c1b8] leading-relaxed max-w-xl">
          We use cookies to improve your experience and measure site performance.
          By clicking Accept, you consent to our use of cookies as described in
          our{' '}
          <a
            href="/privacy"
            className="text-[#f0ede5] underline underline-offset-2 hover:text-[#ff5b3a] transition-colors duration-150"
          >
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
