/**
 * The product registry — the single source of truth for the storefront, pricing,
 * routing, and Polar mapping. Canonical: contracts §3, platform-spec §3.
 *
 * Products register themselves here as they're built. The spine (checkout,
 * webhook, runner, storefront) reads only from this list + getProduct().
 *
 * Pricing note: `priceUSD` is DISPLAY ONLY — always charge against `polarProductId`.
 */
import type { ProductDef, ProductPipeline } from './types'

export const PRODUCT_REGISTRY: ProductDef[] = [
  // Demo product — the spine's end-to-end acceptance test (segment-0 S12).
  {
    slug: 'hello-store',
    name: 'Hello Store',
    segment: 1,
    tagline: 'Paste text, get it restyled — the demo that proves the loop.',
    priceUSD: 0,
    polarProductId: process.env['POLAR_HELLO_STORE_PRODUCT_ID'] ?? 'demo',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 15,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/hello-store')).HelloStoreInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/hello-store')).HelloStoreOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/hello-store')).helloStorePipeline as ProductPipeline<
        unknown,
        unknown
      >,
  },
  // Real products (Agent-Ready Kit first) append here.
]

export function getProduct(slug: string): ProductDef | undefined {
  return PRODUCT_REGISTRY.find((p) => p.slug === slug)
}

export function liveProducts(): ProductDef[] {
  return PRODUCT_REGISTRY.filter((p) => p.status === 'live')
}

export function productsBySegment(segment: ProductDef['segment']): ProductDef[] {
  return PRODUCT_REGISTRY.filter((p) => p.segment === segment)
}
