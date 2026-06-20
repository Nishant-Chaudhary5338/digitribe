/**
 * DTC Email-Flow Generator pipeline. Pure generation — welcome + abandoned-cart
 * sequences, platform-agnostic (delayHours kept so a v2 can push to an ESP).
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  DtcEmailOutput,
  type DtcEmailInput,
  type DtcEmailOutput as Out,
} from '../schemas/dtc-email-flows'

const SYSTEM = `You are a senior DTC email/retention copywriter. Write two complete sequences for the brand:
a welcome sequence and an abandoned-cart sequence. Each email needs a subject, preview text, a send delay
(hours from the trigger), a clear goal, and a full body. Also give a bank of 5–20 strong subject lines.
Rules: use ONLY the provided brand/product; invent nothing (no fake discounts unless implied); match the
requested tone; write like a real brand, not a template. No emoji soup.`

export const dtcEmailPipeline: ProductPipeline<DtcEmailInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('generate', 50, 'Writing your email flows…'))
  return ai.structured({
    system: SYSTEM,
    prompt: [
      `BRAND: ${input.brand}`,
      `PRODUCT: ${input.product}`,
      input.tone ? `TONE: ${input.tone}` : '',
      '',
      'Write the welcome sequence and the abandoned-cart sequence, plus a subject-line bank.',
    ].join('\n'),
    schema: DtcEmailOutput,
    effort: 'high',
  })
}
