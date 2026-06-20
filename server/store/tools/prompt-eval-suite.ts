/**
 * Prompt → Eval Suite pipeline. Pure generation — produces eval cases + a
 * runnable harness as downloadable files (the artifact route serves fmt=zip).
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  PromptEvalOutput,
  type PromptEvalInput,
  type PromptEvalOutput as Out,
} from '../schemas/prompt-eval-suite'

const SYSTEM = `You are a senior AI evaluation engineer. Given a prompt, design a rigorous eval suite so the
prompt can never silently regress. Produce: at least 5 concrete test cases (representative + adversarial +
edge), each with the input and machine-checkable assertions; and runnable harness files (a {framework}
runner plus a cases file). Rules: use ONLY the given prompt + intended behavior; assertions must be
deterministic where possible, and clearly mark any that need an LLM-judge (run on the buyer's own key).
The harness must parse and run.`

export const promptEvalPipeline: ProductPipeline<PromptEvalInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('generate', 50, 'Designing your eval suite…'))
  return ai.structured({
    system: SYSTEM.replace('{framework}', input.framework),
    prompt: [
      'PROMPT UNDER TEST:',
      input.prompt,
      input.intendedBehavior ? `\nINTENDED BEHAVIOR: ${input.intendedBehavior}` : '',
      `\nFRAMEWORK: ${input.framework}`,
      '\nProduce the eval cases and the runnable harness files.',
    ].join('\n'),
    schema: PromptEvalOutput,
    effort: 'high',
  })
}
