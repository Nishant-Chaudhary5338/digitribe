/**
 * Shopify Product-Page Optimizer — Output Contract + input. Canonical PRD:
 * docs/store/segment-6-conversion/shopify-pdp-optimizer.md.
 */
import { z } from 'zod'

export const ShopifyPdpInput = z.object({ url: z.string().url() })
export type ShopifyPdpInput = z.infer<typeof ShopifyPdpInput>

export const ShopifyPdpOutput = z.object({
  site: z.object({ url: z.string().url(), title: z.string() }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  rewrittenCopy: z.object({
    title: z.string(),
    description: z.string(),
    bullets: z.array(z.string()).max(8),
  }),
  croFixes: z.array(z.object({ area: z.string(), issue: z.string(), fix: z.string() })).max(10),
  trustRecommendations: z.array(z.string()).max(8),
  topActions: z.array(z.string()).min(3).max(5),
})
export type ShopifyPdpOutput = z.infer<typeof ShopifyPdpOutput>

export function pdpGrade(score: number): ShopifyPdpOutput['grade'] {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}
