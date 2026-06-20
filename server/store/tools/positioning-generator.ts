/**
 * Positioning Generator pipeline. Pure generation — a symmetric DTC + SaaS
 * positioning artifact mirroring Digitribe's own dual-theme DNA.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  PositioningOutput,
  type PositioningInput,
  type PositioningOutput as Out,
} from '../schemas/positioning-generator'

const SYSTEM = `You are a senior positioning strategist. Given a product, produce TWO distinct, fully-developed
positioning angles — one for a DTC framing and one for a SaaS framing — each with a sharp value
proposition, 3–6 headline options, a concrete ICP, and a message hierarchy. Then recommend which angle to
lead with and why. Rules: use ONLY the provided product description; invent nothing (no fake competitors or
metrics); the two angles must be genuinely different, not rewordings; be specific and senior.`

export const positioningPipeline: ProductPipeline<PositioningInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('generate', 50, 'Building your positioning…'))
  return ai.structured({
    system: SYSTEM,
    prompt: `PRODUCT:\n${input.product}\n\nProduce the dual-angle positioning (DTC + SaaS) and a lead-with recommendation.`,
    schema: PositioningOutput,
    effort: 'high',
  })
}
