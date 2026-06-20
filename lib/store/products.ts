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
  // Ad Hook Generator — Segment 6 (pure generation, no crawl; top-of-funnel tripwire).
  {
    slug: 'ad-hook-generator',
    name: 'Ad Hook Generator',
    segment: 6,
    tagline: '20 scroll-stopping ad hooks for your product, channel-native.',
    priceUSD: 19,
    polarProductId: process.env['POLAR_AD_HOOK_GENERATOR_PRODUCT_ID'] ?? 'ad-hook-generator',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 30,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/ad-hook-generator')).AdHookInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/ad-hook-generator')).AdHookOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/ad-hook-generator'))
        .adHookPipeline as ProductPipeline<unknown, unknown>,
  },
  // SaaS Pricing Teardown — Segment 6 (crawl-based).
  {
    slug: 'saas-pricing-teardown',
    name: 'SaaS Pricing-Page Teardown',
    segment: 6,
    tagline: 'Clarity, positioning, anchoring & packaging fixes for your pricing page.',
    priceUSD: 29,
    polarProductId:
      process.env['POLAR_SAAS_PRICING_TEARDOWN_PRODUCT_ID'] ?? 'saas-pricing-teardown',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 60,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/saas-pricing-teardown')).SaasPricingInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/saas-pricing-teardown')).SaasPricingOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/saas-pricing-teardown'))
        .saasPricingPipeline as ProductPipeline<unknown, unknown>,
  },
  // Positioning Generator — Segment 6 (pure generation, dual DTC+SaaS).
  {
    slug: 'positioning-generator',
    name: 'Positioning Generator',
    segment: 6,
    tagline: 'Dual DTC + SaaS positioning angles for your product.',
    priceUSD: 19,
    polarProductId:
      process.env['POLAR_POSITIONING_GENERATOR_PRODUCT_ID'] ?? 'positioning-generator',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 35,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/positioning-generator')).PositioningInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/positioning-generator')).PositioningOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/positioning-generator'))
        .positioningPipeline as ProductPipeline<unknown, unknown>,
  },
  // DTC Email-Flow Generator — Segment 6 (pure generation).
  {
    slug: 'dtc-email-flows',
    name: 'DTC Email-Flow Generator',
    segment: 6,
    tagline: 'Written welcome + abandoned-cart email sequences for your brand.',
    priceUSD: 19,
    polarProductId: process.env['POLAR_DTC_EMAIL_FLOWS_PRODUCT_ID'] ?? 'dtc-email-flows',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 40,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/dtc-email-flows')).DtcEmailInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/dtc-email-flows')).DtcEmailOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/dtc-email-flows'))
        .dtcEmailPipeline as ProductPipeline<unknown, unknown>,
  },
  // Shopify Product-Page Optimizer — Segment 6 (crawl-based).
  {
    slug: 'shopify-pdp-optimizer',
    name: 'Shopify Product-Page Optimizer',
    segment: 6,
    tagline: 'Rewritten copy + CRO fixes for any Shopify product page.',
    priceUSD: 29,
    polarProductId:
      process.env['POLAR_SHOPIFY_PDP_OPTIMIZER_PRODUCT_ID'] ?? 'shopify-pdp-optimizer',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 60,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/shopify-pdp-optimizer')).ShopifyPdpInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/shopify-pdp-optimizer')).ShopifyPdpOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/shopify-pdp-optimizer'))
        .shopifyPdpPipeline as ProductPipeline<unknown, unknown>,
  },
  // Prompt → Eval Suite — Segment 4 (generation; produces downloadable files).
  {
    slug: 'prompt-eval-suite',
    name: 'Prompt → Eval Suite',
    segment: 4,
    tagline: 'Turn a prompt into a runnable eval suite so it never silently regresses.',
    priceUSD: 29,
    polarProductId: process.env['POLAR_PROMPT_EVAL_SUITE_PRODUCT_ID'] ?? 'prompt-eval-suite',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 45,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/prompt-eval-suite')).PromptEvalInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/prompt-eval-suite')).PromptEvalOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/prompt-eval-suite'))
        .promptEvalPipeline as ProductPipeline<unknown, unknown>,
  },
  // Grade My Agent — Segment 4 (generation; reliability scorecard).
  {
    slug: 'grade-my-agent',
    name: 'Grade My Agent',
    segment: 4,
    tagline: 'A reliability scorecard for your agent: failure modes + prioritized hardening.',
    priceUSD: 29,
    polarProductId: process.env['POLAR_GRADE_MY_AGENT_PRODUCT_ID'] ?? 'grade-my-agent',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 40,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/grade-my-agent')).GradeAgentInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/grade-my-agent')).GradeAgentOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/grade-my-agent'))
        .gradeAgentPipeline as ProductPipeline<unknown, unknown>,
  },
  // Golden-Dataset Generator — Segment 4 (generation; downloadable dataset).
  {
    slug: 'golden-dataset-generator',
    name: 'Golden-Dataset Generator',
    segment: 4,
    tagline: 'Generate a labeled test set to evaluate your agent or prompt.',
    priceUSD: 19,
    polarProductId: process.env['POLAR_GOLDEN_DATASET_PRODUCT_ID'] ?? 'golden-dataset-generator',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 45,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/golden-dataset-generator')).GoldenDatasetInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/golden-dataset-generator')).GoldenDatasetOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/golden-dataset-generator'))
        .goldenDatasetPipeline as ProductPipeline<unknown, unknown>,
  },
  // Regression Guard — Segment 4 (generation; CI test file + workflow).
  {
    slug: 'regression-guard',
    name: 'Regression Guard',
    segment: 4,
    tagline: 'A CI test file that locks your prompt’s must-hold behaviors.',
    priceUSD: 19,
    polarProductId: process.env['POLAR_REGRESSION_GUARD_PRODUCT_ID'] ?? 'regression-guard',
    model: 'byok-finite',
    delivery: 'in-browser',
    byokProviders: ['anthropic', 'openai', 'google'],
    defaultModel: { anthropic: 'claude-opus-4-8' },
    estRunSeconds: 40,
    runsPerPurchase: 3,
    status: 'beta',
    inputSchema: async () =>
      (await import('../../server/store/schemas/regression-guard')).RegressionGuardInput,
    outputSchema: async () =>
      (await import('../../server/store/schemas/regression-guard')).RegressionGuardOutput,
    pipeline: async () =>
      (await import('../../server/store/tools/regression-guard'))
        .regressionGuardPipeline as ProductPipeline<unknown, unknown>,
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
