declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export const GA_COOKIE_NAME = 'digitribe_cookie_consent'

function callGtag(command: string, ...args: unknown[]) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag(command, ...args)
}

export function updateGa4Consent(granted: boolean) {
  callGtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  })
  if (granted) {
    callGtag('event', 'page_view')
  }
}

export function trackGa4Event(name: string, params?: Record<string, string>) {
  callGtag('event', name, params)
}

export function hasAnalyticsConsent(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((c) => c === `${GA_COOKIE_NAME}=accepted`)
}
