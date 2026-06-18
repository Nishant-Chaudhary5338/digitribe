import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/', '/services', '/about', '/contact', '/audit', '/workshop'] as const

for (const path of PAGES) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      // Exclude third-party embeds (Cal.com iframe) from the audit
      .exclude('iframe')
      .analyze()

    expect(results.violations).toEqual([])
  })
}
