/**
 * Shared Segment-1 crawler. Canonical: PRD §7, platform-spec §10.
 * Fetch is INJECTED (a Fetcher) so the crawl is fully testable without network;
 * the default httpFetcher applies the SSRF guard + a timeout + our bot UA.
 */
import * as cheerio from 'cheerio'
import { assertPublicUrl } from './ssrf'
import { storeError } from '../../../../lib/store/errors'
import type { CrawlDigest } from './score'

export interface FetchResult {
  ok: boolean
  status: number
  text: string
  contentType: string
}
export type Fetcher = (url: string) => Promise<FetchResult>

export const httpFetcher: Fetcher = async (url) => {
  assertPublicUrl(url) // re-guard every fetched URL (redirects, probes)
  const res = await fetch(url, {
    headers: { 'user-agent': 'DigitribeAgentReadyBot/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
  })
  return {
    ok: res.ok,
    status: res.status,
    text: await res.text(),
    contentType: res.headers.get('content-type') ?? '',
  }
}

function collectTypes(data: unknown, out: string[]): void {
  if (Array.isArray(data)) {
    for (const d of data) collectTypes(d, out)
    return
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    const t = obj['@type']
    if (typeof t === 'string') out.push(t)
    else if (Array.isArray(t)) for (const x of t) if (typeof x === 'string') out.push(x)
    if (obj['@graph']) collectTypes(obj['@graph'], out)
  }
}

async function probe(fetcher: Fetcher, url: string): Promise<boolean> {
  try {
    return (await fetcher(url)).ok
  } catch {
    return false
  }
}

export async function crawlSite(
  rawUrl: string,
  opts: { maxPages: number },
  fetcher: Fetcher = httpFetcher
): Promise<CrawlDigest> {
  void opts.maxPages // multi-page BFS is a planned enhancement; v1 = homepage + probes
  const url = assertPublicUrl(rawUrl)
  const home = await fetcher(url.href)
  if (!home.ok)
    throw storeError(
      'INPUT_UNREACHABLE',
      `We couldn’t reach ${url.hostname}. Is it public and live?`
    )
  if (!home.contentType.includes('html'))
    throw storeError('INPUT_INVALID', 'That URL isn’t a crawlable website.')

  const $ = cheerio.load(home.text)
  const title = $('title').first().text().trim() || url.hostname
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const jsRenderedOnly = bodyText.length < 200

  const jsonLdTypes: string[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      collectTypes(JSON.parse($(el).text()), jsonLdTypes)
    } catch {
      /* malformed JSON-LD — skip */
    }
  })

  const metaDesc = $('meta[name="description"]').attr('content')?.trim()
  const entityClear = Boolean(metaDesc) || jsonLdTypes.includes('Organization')
  const lower = bodyText.toLowerCase()
  const isCommerce =
    jsonLdTypes.includes('Product') || /add to cart|add to bag|checkout|shopping cart/.test(lower)

  const origin = url.origin
  const [hasLlmsTxt, hasAgentsMd, hasWellKnownMcp, hasSitemap] = await Promise.all([
    probe(fetcher, `${origin}/llms.txt`),
    probe(fetcher, `${origin}/agents.md`),
    probe(fetcher, `${origin}/.well-known/mcp.json`),
    probe(fetcher, `${origin}/sitemap.xml`),
  ])

  let robotsBlocked = false
  try {
    const robots = await fetcher(`${origin}/robots.txt`)
    robotsBlocked = robots.ok && /disallow:\s*\/\s*$/im.test(robots.text)
  } catch {
    /* no robots.txt — fine */
  }

  const headings = $('h1, h2, h3')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean)
    .slice(0, 30)

  return {
    url: url.href,
    title,
    pagesCrawled: 1,
    headings,
    contentExcerpt: bodyText.slice(0, 2000),
    metaDescription: metaDesc,
    hasLlmsTxt,
    hasAgentsMd,
    jsonLdTypes: [...new Set(jsonLdTypes)],
    hasSitemap,
    robotsBlocked,
    jsRenderedOnly,
    isCommerce,
    hasWellKnownMcp,
    entityClear,
  }
}
