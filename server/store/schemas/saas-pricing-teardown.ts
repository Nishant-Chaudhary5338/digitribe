/**
 * SaaS Pricing-Page Teardown — Output Contract + input. Canonical PRD:
 * docs/store/segment-6-conversion/saas-pricing-teardown.md.
 */
import { z } from 'zod'
import { letterGrade } from '../../../lib/store/grade'

export const SaasPricingInput = z.object({ url: z.string().url() })
export type SaasPricingInput = z.infer<typeof SaasPricingInput>

export const PRICING_DIMENSION_KEYS = ['clarity', 'positioning', 'anchoring', 'packaging'] as const

const Fix = z.object({ issue: z.string(), currentText: z.string().optional(), rewrite: z.string() })
const PricingDimension = z.object({
  key: z.enum(PRICING_DIMENSION_KEYS),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['weak', 'okay', 'strong']),
  findings: z.array(z.string()).max(8),
  fixes: z.array(Fix).max(6),
})

export const SaasPricingOutput = z.object({
  site: z.object({ url: z.string().url(), title: z.string() }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  valueMetric: z.string().describe('the metric the pricing scales on, or "unclear"'),
  dimensions: z.array(PricingDimension).length(4),
  tiers: z.array(z.object({ name: z.string(), read: z.string() })).max(6),
  topActions: z.array(z.string()).min(3).max(5),
})
export type SaasPricingOutput = z.infer<typeof SaasPricingOutput>

export function pricingGrade(score: number): SaasPricingOutput['grade'] {
  return letterGrade(score)
}
