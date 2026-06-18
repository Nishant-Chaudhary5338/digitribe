import { test, expect } from '@playwright/test'

const PAGES = ['/', '/services', '/about', '/audit', '/contact']
const MAX_LOAD_MS = 5000 // 5 seconds max in dev (production will be faster)

test.describe('Performance budgets', () => {
  for (const path of PAGES) {
    test(`${path} loads within budget`, async ({ page }) => {
      const start = Date.now()
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - start
      expect(loadTime, `${path} loaded in ${loadTime}ms (budget: ${MAX_LOAD_MS}ms)`).toBeLessThan(
        MAX_LOAD_MS,
      )
    })
  }
})
