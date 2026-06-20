/**
 * SaaS Pricing Teardown pipeline. Reuses the crawl spine + an AI pricing teardown.
 * Grade forced from score; url/title from the digest.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  SaasPricingOutput,
  pricingGrade,
  type SaasPricingInput,
  type SaasPricingOutput as Out,
} from '../schemas/saas-pricing-teardown'
import { crawlSite } from './agentic/crawl'

const SYSTEM = `You are a senior SaaS pricing and packaging strategist. Tear down the pricing page across
4 dimensions: clarity (can a buyer instantly tell what each tier gives and who it's for), positioning
(does pricing reflect value, not cost), anchoring (is the recommended tier framed well), packaging
(are tiers/limits coherent, is the value metric right). Identify the value metric the pricing scales on.
Rules: use ONLY the crawled page; invent nothing (no fake competitors, no assumed features). Be specific,
quote the page's actual copy in fixes, and prioritize ruthlessly.`

export const saasPricingPipeline: ProductPipeline<SaasPricingInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('crawl', 25, 'Reading your pricing page…'))
  const digest = await crawlSite(input.url, { maxPages: 1 })

  emit(runEvent('generate', 70, 'Running the teardown…'))
  const out = await ai.structured({
    system: SYSTEM,
    prompt: [
      'CRAWLED PRICING PAGE (use ONLY this — invent nothing):',
      JSON.stringify(
        {
          url: digest.url,
          title: digest.title,
          headings: digest.headings,
          content: digest.contentExcerpt,
        },
        null,
        2
      ),
      '',
      'Produce the pricing teardown as structured output: the value metric, the 4 dimensions (score, status, findings, current→rewrite fixes), a per-tier read, an overall score, and 3–5 prioritized top actions.',
    ].join('\n'),
    schema: SaasPricingOutput,
    effort: 'high',
  })

  return {
    ...out,
    site: { url: digest.url, title: digest.title },
    grade: pricingGrade(out.overallScore),
  }
}
