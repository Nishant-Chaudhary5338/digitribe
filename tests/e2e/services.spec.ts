import { test, expect } from '@playwright/test'

test.describe('Services page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/services/i)
  })

  test('H1 is present on the page', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('packages grid section is present', async ({ page }) => {
    const packagesSection = page.locator('#packages, section:has([data-testid="packages-grid"])').first()
    // Fall back: look for multiple cards that look like pricing cards
    const cards = page.locator('[class*="package"], [class*="pricing"], [class*="card"]')
    const sectionOrCards = (await packagesSection.count()) > 0 ? packagesSection : cards.first()
    await expect(sectionOrCards).toBeVisible()
  })

  test('Build pricing section is present', async ({ page }) => {
    const buildSection = page.locator('#build').first()
    await expect(buildSection).toBeVisible()
  })

  test('Grow pricing section is present', async ({ page }) => {
    const growSection = page.locator('#grow').first()
    await expect(growSection).toBeVisible()
  })

  test('at least one service heading is visible', async ({ page }) => {
    // Services page should have headings for individual services
    const headings = page.locator('h2, h3').filter({ hasNotText: /^$/ })
    const count = await headings.count()
    expect(count).toBeGreaterThan(2)
  })

  test('audit CTA link is present', async ({ page }) => {
    const auditLink = page.locator('a[href="/audit"]').first()
    await expect(auditLink).toBeVisible()
  })
})
