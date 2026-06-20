/**
 * Shopify PDP Optimizer pipeline. Reuses the crawl spine + an AI rewrite/CRO pass.
 * Grade forced from score; site from the digest.
 */
import type { ProductPipeline } from '../../../lib/store/types'
import { runEvent } from '../../../lib/store/events'
import {
  ShopifyPdpOutput,
  pdpGrade,
  type ShopifyPdpInput,
  type ShopifyPdpOutput as Out,
} from '../schemas/shopify-pdp-optimizer'
import { crawlSite } from './agentic/crawl'

const SYSTEM = `You are a senior DTC/Shopify conversion copywriter. Optimize the product page: rewrite the
title, description, and bullets to be benefit-led and specific; list concrete CRO fixes (by area); and
recommend trust/social-proof additions. Rules: use ONLY the crawled page; invent nothing (no fake reviews,
no claims the page doesn't support). Write like a strong DTC brand, not a template.`

export const shopifyPdpPipeline: ProductPipeline<ShopifyPdpInput, Out> = async ({
  input,
  ai,
  emit,
}) => {
  emit(runEvent('crawl', 25, 'Reading your product page…'))
  const digest = await crawlSite(input.url, { maxPages: 1 })

  emit(runEvent('generate', 70, 'Optimizing…'))
  const out = await ai.structured({
    system: SYSTEM,
    prompt: [
      'CRAWLED PRODUCT PAGE (use ONLY this — invent nothing):',
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
      'Produce: rewritten copy (title/description/bullets), CRO fixes, trust recommendations, an overall score, and 3–5 prioritized top actions.',
    ].join('\n'),
    schema: ShopifyPdpOutput,
    effort: 'high',
  })

  return {
    ...out,
    site: { url: digest.url, title: digest.title },
    grade: pdpGrade(out.overallScore),
  }
}
