import { trackGa4Event } from '@/lib/analytics/ga4-consent'

export type Theme = 'studio' | 'garden' | 'neutral'

export const PLAUSIBLE_EVENTS = {
  THEME_CHOSEN: 'theme_chosen',
  THEME_SWITCHED: 'theme_switched',
  AUDIT_CTA_CLICK: 'audit_cta_click',
  AUDIT_CALENDAR_LOADED: 'audit_calendar_loaded',
  AUDIT_BOOKING_COMPLETED: 'audit_booking_completed',
  SERVICES_EXPLORED: 'services_explored',
  FOUNDER_PROFILE_VIEWED: 'founder_profile_viewed',
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',
  WORKSHOP_INTEREST_SUBMITTED: 'workshop_interest_submitted',
} as const

export type PlausibleEvent = (typeof PLAUSIBLE_EVENTS)[keyof typeof PLAUSIBLE_EVENTS]

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void
  }
}

function track(event: string, props?: Record<string, string>) {
  if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
    window.plausible(event, props ? { props } : undefined)
  }
  trackGa4Event(event, props)
}

export const analytics = {
  themeChosen: (theme: Theme) =>
    track(PLAUSIBLE_EVENTS.THEME_CHOSEN, { theme }),

  themeSwitched: (fromTheme: Theme, toTheme: Theme) =>
    track(PLAUSIBLE_EVENTS.THEME_SWITCHED, { from_theme: fromTheme, to_theme: toTheme }),

  auditCtaClick: (theme: Theme, pagePath: string, ctaPosition: string) =>
    track(PLAUSIBLE_EVENTS.AUDIT_CTA_CLICK, { theme, page_path: pagePath, cta_position: ctaPosition }),

  auditCalendarLoaded: (theme: Theme, path: string) =>
    track(PLAUSIBLE_EVENTS.AUDIT_CALENDAR_LOADED, { theme, path }),

  auditBookingCompleted: (theme: Theme, referrerPath: string) =>
    track(PLAUSIBLE_EVENTS.AUDIT_BOOKING_COMPLETED, { theme, referrer_path: referrerPath }),

  servicesExplored: (theme: Theme, serviceSlug: string) =>
    track(PLAUSIBLE_EVENTS.SERVICES_EXPLORED, { theme, service_slug: serviceSlug }),

  founderProfileViewed: (theme: Theme, founderSlug: string) =>
    track(PLAUSIBLE_EVENTS.FOUNDER_PROFILE_VIEWED, { theme, founder_slug: founderSlug }),

  contactFormSubmitted: (theme: Theme) =>
    track(PLAUSIBLE_EVENTS.CONTACT_FORM_SUBMITTED, { theme }),

  workshopInterestSubmitted: () =>
    track(PLAUSIBLE_EVENTS.WORKSHOP_INTEREST_SUBMITTED),
}
