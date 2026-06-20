/**
 * The product registry — the single source of truth for the storefront, pricing,
 * routing, and Polar mapping. Canonical: contracts §3, platform-spec §3.
 *
 * Products register themselves here as they're built. The spine (checkout,
 * webhook, runner, storefront) reads only from this list + getProduct().
 *
 * Pricing note: `priceUSD` is DISPLAY ONLY — always charge against `polarProductId`.
 */
import type { ProductDef } from './types'

export const PRODUCT_REGISTRY: ProductDef[] = [
  // Products are appended here as each is built (Agent-Ready Kit first).
  // The demo "hello-store" product (segment-0 S12) is added when wiring the spine end-to-end.
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
