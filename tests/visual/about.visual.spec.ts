import { test } from '@playwright/test'
import { BREAKPOINTS } from '../fixtures/breakpoints'

test.describe('About page visual', () => {
  for (const bp of BREAKPOINTS) {
    test(`renders at ${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.goto('/about')
      await page.waitForLoadState('networkidle')

      // Let any CSS animations settle before snapping
      await page.waitForTimeout(500)

      await page.screenshot({
        path: `tests/visual/screenshots/about-${bp.name}.png`,
        fullPage: true,
      })
    })
  }
})
