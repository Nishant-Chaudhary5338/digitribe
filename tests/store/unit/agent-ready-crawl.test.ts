import { describe, it, expect } from 'vitest'
import {
  crawlSite,
  type Fetcher,
  type FetchResult,
} from '../../../server/store/tools/agentic/crawl'

function fetcherFrom(routes: Record<string, Partial<FetchResult>>): Fetcher {
  return async (url) => {
    const r = routes[url] ?? routes[new URL(url).pathname]
    if (!r) return { ok: false, status: 404, text: '', contentType: '' }
    return { ok: true, status: 200, text: '', contentType: 'text/html', ...r }
  }
}

const html = (body: string, head = '') => `<html><head>${head}</head><body>${body}</body></html>`

describe('crawlSite', () => {
  it('builds a digest: title, JSON-LD types, special files, entity', async () => {
    const fetcher = fetcherFrom({
      '/': {
        text: html(
          `<h1>Acme</h1>${'x'.repeat(300)}`,
          '<title>Acme Inc</title><meta name="description" content="we sell things"><script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>'
        ),
      },
      '/llms.txt': { contentType: 'text/plain', text: '# Acme' },
      '/sitemap.xml': { contentType: 'application/xml', text: '<urlset/>' },
    })
    const d = await crawlSite('https://acme.com', { maxPages: 10 }, fetcher)
    expect(d.title).toBe('Acme Inc')
    expect(d.jsonLdTypes).toContain('Organization')
    expect(d.hasLlmsTxt).toBe(true)
    expect(d.hasAgentsMd).toBe(false)
    expect(d.hasSitemap).toBe(true)
    expect(d.entityClear).toBe(true)
    expect(d.jsRenderedOnly).toBe(false)
  })

  it('flags a JS-only site (near-empty body)', async () => {
    const fetcher = fetcherFrom({
      '/': { text: html('<div id="root"></div>', '<title>App</title>') },
    })
    expect((await crawlSite('https://app.com', { maxPages: 5 }, fetcher)).jsRenderedOnly).toBe(true)
  })

  it('detects commerce from a Product JSON-LD', async () => {
    const fetcher = fetcherFrom({
      '/': {
        text: html(
          'x'.repeat(300),
          '<title>Shop</title><script type="application/ld+json">{"@type":"Product","name":"Widget"}</script>'
        ),
      },
    })
    expect((await crawlSite('https://shop.com', { maxPages: 5 }, fetcher)).isCommerce).toBe(true)
  })

  it('throws when the homepage is unreachable', async () => {
    const fetcher: Fetcher = async () => ({ ok: false, status: 500, text: '', contentType: '' })
    await expect(crawlSite('https://down.com', { maxPages: 5 }, fetcher)).rejects.toThrow()
  })

  it('blocks an SSRF target before fetching', async () => {
    const fetcher: Fetcher = async () => ({
      ok: true,
      status: 200,
      text: '<html></html>',
      contentType: 'text/html',
    })
    await expect(crawlSite('http://169.254.169.254', { maxPages: 5 }, fetcher)).rejects.toThrow()
  })
})
