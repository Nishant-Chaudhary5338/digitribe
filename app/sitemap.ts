import type { MetadataRoute } from 'next'
import { services } from '@/lib/data/services'

const BASE = 'https://digitribe.co'
const now = new Date()

function entry(
  path: string,
  opts: { priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }
): MetadataRoute.Sitemap[number] {
  return { url: `${BASE}${path}`, lastModified: now, ...opts }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const dtcServiceRoutes = services.map((s) =>
    entry(`/dtc/services/${s.slug}`, { priority: 0.6, changeFrequency: 'monthly' })
  )
  const saasServiceRoutes = services.map((s) =>
    entry(`/saas/services/${s.slug}`, { priority: 0.6, changeFrequency: 'monthly' })
  )

  return [
    // Splash
    entry('/', { priority: 1, changeFrequency: 'weekly' }),

    // DTC variant
    entry('/dtc', { priority: 0.95, changeFrequency: 'weekly' }),
    entry('/dtc/audit', { priority: 0.95, changeFrequency: 'monthly' }),
    entry('/dtc/services', { priority: 0.85, changeFrequency: 'monthly' }),
    entry('/dtc/about', { priority: 0.7, changeFrequency: 'monthly' }),
    entry('/dtc/contact', { priority: 0.7, changeFrequency: 'monthly' }),

    // SaaS variant
    entry('/saas', { priority: 0.95, changeFrequency: 'weekly' }),
    entry('/saas/audit', { priority: 0.95, changeFrequency: 'monthly' }),
    entry('/saas/services', { priority: 0.85, changeFrequency: 'monthly' }),
    entry('/saas/about', { priority: 0.7, changeFrequency: 'monthly' }),
    entry('/saas/contact', { priority: 0.7, changeFrequency: 'monthly' }),

    // Shared / neutral
    entry('/workshop', { priority: 0.6, changeFrequency: 'weekly' }),
    entry('/privacy', { priority: 0.3, changeFrequency: 'yearly' }),
    entry('/terms', { priority: 0.3, changeFrequency: 'yearly' }),

    // Per-variant service detail pages
    ...dtcServiceRoutes,
    ...saasServiceRoutes,
  ]
}
