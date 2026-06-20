/**
 * Golden-Dataset Generator pipeline. Pure generation — a labeled eval dataset
 * + downloadable JSONL/CSV files. Labels carry honest confidence + rationale.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  GoldenDatasetOutput,
  type GoldenDatasetInput,
  type GoldenDatasetOutput as Out,
} from '../schemas/golden-dataset-generator'

const SYSTEM = `You are a senior AI evaluation engineer building a golden test set. Generate a labeled dataset
for the task: a diverse, representative + adversarial + edge set of rows, each with an input, the expected
output, an honest confidence (high/medium/low), and a short rationale where the label is non-obvious. Then
emit downloadable files (JSONL + CSV). Rules: use ONLY the task + examples; invent nothing implausible;
labels must be defensible — never claim high confidence on a genuinely ambiguous case. CSV must be
injection-safe (no leading =,+,-,@ in cells).`

export const goldenDatasetPipeline: ProductPipeline<GoldenDatasetInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('generate', 50, 'Generating your golden set…'))
  return ai.structured({
    system: SYSTEM,
    prompt: [
      `TASK: ${input.task}`,
      input.examples ? `EXAMPLES:\n${input.examples}` : '',
      `TARGET ROWS: ${input.rowCount}`,
      '\nGenerate the labeled dataset rows, a how-to-use note, and JSONL + CSV files.',
    ].join('\n'),
    schema: GoldenDatasetOutput,
    effort: 'high',
  })
}
