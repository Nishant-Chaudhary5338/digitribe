'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { updateGa4Consent, hasAnalyticsConsent } from '@/lib/analytics/ga4-consent'

export function Ga4Client() {
  const pathname = usePathname()
  // Tracks whether the mount effect has run so the route-change effect
  // can skip the initial render (page_view already sent in mount effect).
  const isFirstRender = React.useRef(true)

  React.useEffect(() => {
    if (hasAnalyticsConsent()) {
      updateGa4Consent(true) // grants storage + fires initial page_view
    }
  }, [])

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!hasAnalyticsConsent()) return
    if (typeof window.gtag !== 'function') return
    window.gtag('event', 'page_view', { page_path: pathname })
  }, [pathname])

  return null
}
