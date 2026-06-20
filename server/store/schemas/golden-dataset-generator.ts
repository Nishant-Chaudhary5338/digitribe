/**
 * Golden-Dataset Generator — Output Contract + input. Canonical PRD:
 * docs/store/segment-4-evals/golden-dataset-generator.md.
 */
import { z } from 'zod'

export const GoldenDatasetInput = z.object({
  task: z.string().min(1).max(1000),
  examples: z.string().max(3000).optional(),
  rowCount: z.number().int().min(5).max(100).default(30),
})
export type GoldenDatasetInput = z.infer<typeof GoldenDatasetInput>

const Row = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  rationale: z.string().max(300).optional(),
  confidence: z.enum(['high', 'medium', 'low']),
})

const GeneratedFile = z.object({
  path: z.string(),
  language: z.enum(['json', 'csv', 'markdown']),
  contents: z.string(),
})

export const GoldenDatasetOutput = z.object({
  task: z.string(),
  rows: z.array(Row).min(5),
  howToUse: z.string().max(600),
  files: z.array(GeneratedFile).min(1),
})
export type GoldenDatasetOutput = z.infer<typeof GoldenDatasetOutput>
