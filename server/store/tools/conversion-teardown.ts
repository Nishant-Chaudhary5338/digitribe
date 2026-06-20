/**
 * Conversion Teardown pipeline. Reuses the shared Segment-1 crawl spine, then an
 * AI CRO teardown. Audience + grade are forced for consistency (CRO scores are
 * AI judgment, unlike Agent-Ready Kit's deterministic readiness scores).
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  ConversionTeardownOutput,
  croGrade,
  type ConversionTeardownInput,
  type ConversionTeardownOutput as Out,
} from '../schemas/conversion-teardown'
import { crawlSite } from './agentic/crawl'
import { CONVERSION_TEARDOWN_SYSTEM, buildPrompt } from '../prompts/conversion-teardown'

export const conversionTeardownPipeline: ProductPipeline<ConversionTeardownInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('crawl', 25, 'Reading your page…'))
  const digest = await crawlSite(input.url, { maxPages: 1 })

  emit(runEvent('generate', 70, 'Running the teardown…'))
  const out = await ai.structured({
    system: CONVERSION_TEARDOWN_SYSTEM,
    prompt: buildPrompt(digest, input.audience, input.goal),
    schema: ConversionTeardownOutput,
    effort: 'high',
  })

  return {
    ...out,
    site: { ...out.site, url: digest.url, title: digest.title, audience: input.audience },
    grade: croGrade(out.overallScore),
  }
}
