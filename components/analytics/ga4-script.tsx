import * as React from 'react'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function Ga4Script() {
  if (process.env.NODE_ENV !== 'production' || !GA_ID) return null

  // Inline init MUST run before gtag.js loads so Consent Mode v2 defaults are
  // set while the async script is still fetching.
  const initScript = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',wait_for_update:500});
gtag('config','${GA_ID}',{send_page_view:false});
`.trim()

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
    </>
  )
}
