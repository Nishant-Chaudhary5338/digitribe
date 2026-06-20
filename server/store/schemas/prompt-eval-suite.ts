/**
 * Prompt → Eval Suite — Output Contract + input. Canonical PRD:
 * docs/store/segment-4-evals/prompt-eval-suite.md.
 * A prompt -> generated eval cases + a runnable scoring harness (downloadable files).
 */
import { z } from 'zod'

export const PromptEvalInput = z.object({
  prompt: z.string().min(1).max(4000),
  intendedBehavior: z.string().max(500).optional(),
  framework: z.enum(['vitest', 'node']).default('vitest'),
})
export type PromptEvalInput = z.infer<typeof PromptEvalInput>

const EvalCase = z.object({
  name: z.string(),
  input: z.string(),
  assertions: z.array(z.string()).min(1).max(8),
})

const GeneratedFile = z.object({
  path: z.string(),
  language: z.enum(['typescript', 'json', 'markdown']),
  contents: z.string(),
})

export const PromptEvalOutput = z.object({
  summary: z.string().max(400),
  cases: z.array(EvalCase).min(5),
  files: z.array(GeneratedFile).min(1),
})
export type PromptEvalOutput = z.infer<typeof PromptEvalOutput>
