import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/utils/constants'

type MetadataOptions = {
  title: string
  description: string
  path: string
  noindex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  path,
  noindex = false,
}: MetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`
  const ogTitle = `${title} — ${SITE_NAME}`

  return {
    title,
    description,
    ...(noindex && { robots: { index: false, follow: false } }),
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630 }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
    alternates: {
      canonical: url,
    },
  }
}
