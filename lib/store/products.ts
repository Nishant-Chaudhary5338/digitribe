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
  // Agent-Ready Kit — first real product (Segment 1).
  {
    slug: 'agent-ready-kit',
    name: 'Agent-Ready Kit',
    segment: 1,
    tagline: 'Paste a URL — get the llms.txt, agents.md, JSON-LD & MCP files AI agents need.',
    priceUSD: 29,
    polarProductId: process.env['POLAR_AGENT_READY_KIT_PRODUCT_ID'] ?? 'agent-ready-kit',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 75,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/agent-ready-kit')).AgentReadyInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/agent-ready-kit')).AgentReadyOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/agent-ready-kit'))
        .agentReadyPipeline as ProductPipeline<unknown, unknown>,
  },
  // Conversion Teardown — Segment 6 (reuses the crawl spine; monetizes the free /audit).
  {
    slug: 'conversion-teardown',
    name: 'Conversion Teardown',
    segment: 6,
    tagline: 'A senior CRO teardown of any landing page — prioritized, specific fixes.',
    priceUSD: 29,
    polarProductId: process.env['POLAR_CONVERSION_TEARDOWN_PRODUCT_ID'] ?? 'conversion-teardown',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 60,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/conversion-teardown')).ConversionTeardownInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/conversion-teardown')).ConversionTeardownOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/conversion-teardown'))
        .conversionTeardownPipeline as ProductPipeline<unknown, unknown>,
  },
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
