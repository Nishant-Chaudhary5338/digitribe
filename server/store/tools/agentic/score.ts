/**
 * Deterministic agent-readiness scorer (PRD §7). Turns a crawl digest into the
 * 5 fixed dimension statuses + an overall score. The AI step writes the
 * findings/fixes/files on top — but the scores are computed here, not invented.
 */
import { DIMENSION_KEYS } from '../../schemas/agent-ready-kit'

export interface CrawlDigest {
  url: string
  title: string
  pagesCrawled: number
  /** Optional readable content (populated by the crawler; used by content-based
   *  products like Conversion Teardown, ignored by the readiness scorer). */
  headings?: string[]
  contentExcerpt?: string
  metaDescription?: string
  hasLlmsTxt: boolean
  hasAgentsMd: boolean
  jsonLdTypes: string[]
  hasSitemap: boolean
  robotsBlocked: boolean
  jsRenderedOnly: boolean
  isCommerce: boolean
  hasWellKnownMcp: boolean
  entityClear: boolean
}

export type DimStatus = 'missing' | 'partial' | 'good'
export interface DimScore {
  key: (typeof DIMENSION_KEYS)[number]
  status: DimStatus
  score: number
}
export interface ReadinessScore {
  dimensions: DimScore[]
  overallScore: number
}

const band = (s: DimStatus): number => (s === 'good' ? 100 : s === 'partial' ? 50 : 0)

export function scoreReadiness(d: CrawlDigest): ReadinessScore {
  const description: DimStatus =
    d.hasLlmsTxt && d.hasAgentsMd ? 'good' : d.hasLlmsTxt || d.hasAgentsMd ? 'partial' : 'missing'
  const structured: DimStatus =
    d.jsonLdTypes.length >= 2 ? 'good' : d.jsonLdTypes.length === 1 ? 'partial' : 'missing'
  const crawlability: DimStatus =
    d.jsRenderedOnly || d.robotsBlocked ? 'missing' : d.hasSitemap ? 'good' : 'partial'
  const transaction: DimStatus = d.hasWellKnownMcp ? 'good' : d.isCommerce ? 'partial' : 'missing'
  const entity: DimStatus = d.entityClear
    ? 'good'
    : d.jsonLdTypes.includes('Organization')
      ? 'partial'
      : 'missing'

  const dimensions: DimScore[] = [
    { key: 'description_layer', status: description, score: band(description) },
    { key: 'structured_data', status: structured, score: band(structured) },
    { key: 'crawlability', status: crawlability, score: band(crawlability) },
    { key: 'transaction_layer', status: transaction, score: band(transaction) },
    { key: 'entity_clarity', status: entity, score: band(entity) },
  ]
  const overallScore = Math.round(
    dimensions.reduce((sum, x) => sum + x.score, 0) / dimensions.length
  )
  return { dimensions, overallScore }
}
