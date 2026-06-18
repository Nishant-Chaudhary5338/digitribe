import * as React from 'react'

export function PlausibleScript() {
  const domain = process.env['NEXT_PUBLIC_PLAUSIBLE_DOMAIN']
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isProduction || !domain) {
    return null
  }

  return (
    <script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
    />
  )
}
