/**
 * Regression Guard pipeline. Pure generation — a CI test file + GitHub Actions
 * workflow that locks the prompt's must-hold behaviors. Files are downloadable.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  RegressionGuardOutput,
  type RegressionGuardInput,
  type RegressionGuardOutput as Out,
} from '../schemas/regression-guard'

const SYSTEM = `You are a senior AI test engineer. Given a prompt and a list of must-hold invariants, generate a
drop-in CI guard: a test file that asserts each invariant (deterministic checks where possible; mark any
LLM-judge assertions clearly, to run on the buyer's own key) and a GitHub Actions workflow that runs it.
Rules: every invariant must be covered by at least one assertion; an unfilled runAgent() seam must FAIL
loudly (never silently pass); use ONLY the given prompt + invariants; the files must parse.`

export const regressionGuardPipeline: ProductPipeline<RegressionGuardInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('generate', 50, 'Generating your regression guard…'))
  return ai.structured({
    system: SYSTEM,
    prompt: [
      'PROMPT:',
      input.prompt,
      '',
      'MUST-HOLD INVARIANTS:',
      ...input.invariants.map((i, n) => `${n + 1}. ${i}`),
      '',
      'Generate the CI test file + GitHub Actions workflow, and list which invariants are covered.',
    ].join('\n'),
    schema: RegressionGuardOutput,
    effort: 'high',
  })
}
