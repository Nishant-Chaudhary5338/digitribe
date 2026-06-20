/**
 * Demo product pipeline (segment-0 S12). Proves the runner end-to-end:
 * streams progress, calls the BYOK runner with a schema-enforced output.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import { HelloStoreOutput, type HelloStoreInput } from '../schemas/hello-store'

export const helloStorePipeline: ProductPipeline<HelloStoreInput, HelloStoreOutput> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('generate', 40, 'Restyling your text…'))
  const result = await ai.structured({
    system:
      'You restyle short text into a confident, senior brand voice. Use ONLY the provided text; invent nothing.',
    prompt: `Restyle the following text, then report its original tone and word count.\n\n"""${input.text}"""`,
    schema: HelloStoreOutput,
    effort: 'low',
  })
  emit(runEvent('generate', 90, 'Polishing…'))
  return result
}
