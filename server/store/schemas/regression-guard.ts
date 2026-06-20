/**
 * Regression Guard — Output Contract + input. Canonical PRD:
 * docs/store/segment-4-evals/regression-guard.md.
 * Prompt + must-hold invariants -> a CI test file + a GitHub Actions workflow.
 */
import { z } from 'zod'

export const RegressionGuardInput = z.object({
  prompt: z.string().min(1).max(4000),
  invariants: z.array(z.string().min(1)).min(1).max(20),
})
export type RegressionGuardInput = z.infer<typeof RegressionGuardInput>

const GeneratedFile = z.object({
  path: z.string(),
  language: z.enum(['typescript', 'yaml', 'markdown']),
  contents: z.string(),
})

export const RegressionGuardOutput = z.object({
  summary: z.string().max(400),
  coveredInvariants: z.array(z.string()).min(1),
  files: z.array(GeneratedFile).min(1),
})
export type RegressionGuardOutput = z.infer<typeof RegressionGuardOutput>
