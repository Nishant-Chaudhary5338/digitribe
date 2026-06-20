/**
 * Agent-Ready Kit — Output Contract + input schema. Canonical: the PRD
 * docs/store/segment-1-agentic-web/agent-ready-kit.md §5, §6.
 * The AI step is forced to fill AgentReadyOutput exactly (same artifact every run).
 */
import { z } from 'zod'

export const AgentReadyInput = z.object({
  url: z.string().url(),
  maxPages: z.number().int().min(5).max(40).default(20),
  businessContext: z.string().max(500).optional(),
})
export type AgentReadyInput = z.infer<typeof AgentReadyInput>

const Dimension = z.object({
  key: z.enum([
    'description_layer',
    'structured_data',
    'crawlability',
    'transaction_layer',
    'entity_clarity',
  ]),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['missing', 'partial', 'good']),
  findings: z.array(z.string()).max(8),
  fixes: z.array(z.string()).max(8),
})

const GeneratedFile = z.object({
  path: z.string(),
  language: z.enum(['markdown', 'json', 'text']),
  contents: z.string(),
  rationale: z.string().max(280),
})

export const AgentReadyOutput = z.object({
  site: z.object({
    url: z.string().url(),
    title: z.string(),
    summary: z.string().max(600),
    pagesCrawled: z.number().int(),
    isCommerce: z.boolean(),
    detectedEntities: z.array(z.string()).max(20),
  }),
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  dimensions: z.array(Dimension).length(5),
  files: z.array(GeneratedFile).min(3),
  topActions: z.array(z.string()).min(3).max(5),
  upsell: z.object({
    needsTransactionLayer: z.boolean(),
    reason: z.string(),
  }),
})
export type AgentReadyOutput = z.infer<typeof AgentReadyOutput>

export const DIMENSION_KEYS = [
  'description_layer',
  'structured_data',
  'crawlability',
  'transaction_layer',
  'entity_clarity',
] as const

/** Deterministic grade from score (PRD §6). */
export function gradeFor(score: number): AgentReadyOutput['grade'] {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}
