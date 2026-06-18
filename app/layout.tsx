import type { Metadata } from 'next'
import { ChatWidget } from '@/components/chat/chat-widget'
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Instrument_Serif,
  Fraunces,
  Inter_Tight,
  IBM_Plex_Mono,
} from 'next/font/google'
import './globals.css'
import { PlausibleScript } from '@/components/analytics/plausible'
import { Ga4Script } from '@/components/analytics/ga4-script'
import { Ga4Client } from '@/components/analytics/ga4-client'
import { CookieBanner } from '@/components/consent/cookie-banner'
import { organizationSchema } from '@/lib/schema/organization'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz', 'wdth'],
  variable: '--font-bricolage',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT'],
  variable: '--font-fraunces',
  display: 'swap',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://digitribe.co'),
  title: {
    default: 'Digitribe — Build and grow agency for DTC and SaaS founders',
    template: '%s — Digitribe',
  },
  description:
    'A senior 2-person tribe building conversion-focused websites, AI agents, and the paid traffic to fill them. For DTC and SaaS founders in the EU and US.',
  openGraph: {
    siteName: 'Digitribe',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const schema = organizationSchema()

  return (
    <html
      lang="en"
      className={[
        bricolage.variable,
        jetbrainsMono.variable,
        instrumentSerif.variable,
        fraunces.variable,
        interTight.variable,
        ibmPlexMono.variable,
        'h-full antialiased',
      ].join(' ')}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to main content
        </a>
        <Ga4Script />
        <PlausibleScript />
        <Ga4Client />
        {children}
        <CookieBanner />
        <ChatWidget />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </body>
    </html>
  )
}
