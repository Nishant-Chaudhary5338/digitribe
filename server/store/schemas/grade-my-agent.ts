/**
 * Grade My Agent — Output Contract + input. Canonical PRD:
 * docs/store/segment-4-evals/grade-my-agent.md.
 */
import { z } from 'zod'

export const GradeAgentInput = z.object({
  description: z.string().min(1).max(2000),
  samples: z.string().max(4000).optional(),
})
export type GradeAgentInput = z.infer<typeof GradeAgentInput>

export const AGENT_DIMENSION_KEYS = [
  'correctness',
  'robustness',
  'failure_handling',
  'consistency',
] as const

const AgentDimension = z.object({
  key: z.enum(AGENT_DIMENSION_KEYS),
  label: z.string(),
  score: z.number().int().min(0).max(100),
  status: z.enum(['weak', 'okay', 'strong']),
  findings: z.array(z.string()).max(8),
  recommendations: z.array(z.string()).max(6),
})

export const GradeAgentOutput = z.object({
  overallScore: z.number().int().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  dimensions: z.array(AgentDimension).length(4),
  failureModes: z
    .array(
      z.object({
        mode: z.string(),
        likelihood: z.enum(['low', 'medium', 'high']),
        mitigation: z.string(),
      })
    )
    .max(8),
  topActions: z.array(z.string()).min(3).max(5),
})
export type GradeAgentOutput = z.infer<typeof GradeAgentOutput>
