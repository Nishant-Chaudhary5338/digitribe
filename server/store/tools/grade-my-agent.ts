/**
 * Grade My Agent pipeline. Pure generation — a reliability scorecard. Grade is
 * forced from the (AI-judged) overall score via the shared letterGrade helper.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import { letterGrade } from '../../../lib/store/grade'
import {
  GradeAgentOutput,
  type GradeAgentInput,
  type GradeAgentOutput as Out,
} from '../schemas/grade-my-agent'

const SYSTEM = `You are a senior AI reliability engineer. Grade the described agent across 4 dimensions:
correctness, robustness (to weird/adversarial input), failure_handling (graceful degradation, retries,
guardrails), and consistency. Identify concrete failure modes with likelihood + mitigation, and prioritize
the highest-leverage hardening. Rules: use ONLY the description + provided samples; invent nothing; every
finding must reference the described behavior or a sample. Be specific and senior, never generic.`

export const gradeAgentPipeline: ProductPipeline<GradeAgentInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('generate', 50, 'Grading your agent…'))
  const out = await ai.structured({
    system: SYSTEM,
    prompt: [
      'AGENT DESCRIPTION:',
      input.description,
      input.samples ? `\nSAMPLE INPUTS/OUTPUTS:\n${input.samples}` : '',
      '\nProduce the reliability scorecard (4 dimensions), failure modes, and top actions.',
    ].join('\n'),
    schema: GradeAgentOutput,
    effort: 'high',
  })
  return { ...out, grade: letterGrade(out.overallScore) }
}
