/**
 * Ad Hook Generator pipeline. Canonical PRD: ad-hook-generator.md.
 * Pure generation (no crawl). Diversity is enforced by the schema (20 hooks,
 * >=5 angles); the channel is forced from input.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  AdHookOutput,
  type AdHookInput,
  type AdHookOutput as Out,
} from '../schemas/ad-hook-generator'

const SYSTEM = `You are a senior direct-response copywriter who writes scroll-stopping ad hooks.
Generate exactly 20 hooks across AT LEAST 5 distinct angles (e.g. problem-agitate, social proof,
curiosity gap, contrarian, transformation, urgency, founder story, objection-handle). Rules:
- Channel-native for the given platform (Meta/TikTok = pattern-interrupt + emotion; Google = intent +
  clarity; LinkedIn = credibility + specificity).
- DTC buyers respond to emotion, proof, and urgency; SaaS buyers to clarity of value and fit.
- No clichés, no emoji soup, no fabricated stats. Use ONLY the provided product and offer.`

export const adHookPipeline: ProductPipeline<AdHookInput, Out> = async ({ input, ai, emit }) => {
  emit(runEvent('generate', 50, 'Writing your hooks…'))
  const out = await ai.structured({
    system: SYSTEM,
    prompt: [
      `CHANNEL: ${input.channel}`,
      `AUDIENCE: ${input.audience}`,
      `PRODUCT: ${input.product}`,
      input.offer ? `OFFER: ${input.offer}` : '',
      '',
      'Generate exactly 20 hooks across at least 5 distinct angles for this channel and audience.',
    ].join('\n'),
    schema: AdHookOutput,
    effort: 'medium',
  })
  return { ...out, channel: input.channel }
}
