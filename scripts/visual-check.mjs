// Visual smoke test: screenshot key routes at desktop + mobile against the local server.
// Usage: node scripts/visual-check.mjs [baseURL] [outDir]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:3000'
const outDir = process.argv[3] ?? '/tmp/digitribe-shots'
mkdirSync(outDir, { recursive: true })

const routes = [
  ['splash', '/'],
  ['dtc-home', '/dtc'],
  ['saas-home', '/saas'],
  ['services', '/services'],
  ['dtc-services', '/dtc/services'],
  ['about', '/dtc/about'],
]

const viewports = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]

const browser = await chromium.launch()
for (const [vpName, width, height] of viewports) {
  // reduced-motion makes scroll-reveal sections render immediately (Reveal short-circuits),
  // so a full-page screenshot captures all content instead of opacity:0 below the fold.
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  for (const [name, path] of routes) {
    try {
      const res = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30000 })
      // Scroll through the page to trigger whileInView reveals (viewport once:true keeps them shown).
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.8)
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 120))
        }
        window.scrollTo(0, 0)
      })
      // Force any still-hidden scroll-reveal elements visible for a complete full-page capture.
      await page.addStyleTag({
        content:
          '[style*="opacity: 0"], [style*="opacity:0"] { opacity: 1 !important; transform: none !important; }',
      })
      await page.waitForTimeout(500) // let final reveals settle
      const file = `${outDir}/${name}.${vpName}.png`
      await page.screenshot({ path: file, fullPage: true })
      console.log(`OK   ${res?.status()}  ${path} -> ${file}`)
    } catch (e) {
      console.log(`FAIL ${path}: ${e.message}`)
    }
  }
  await ctx.close()
}
await browser.close()
console.log('done')
