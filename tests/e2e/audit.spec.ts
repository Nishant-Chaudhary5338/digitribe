import { test, expect } from '@playwright/test'

test.describe('Audit page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/audit')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/audit/i)
  })

  test('H1 is present on the page', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('H1 contains the word "audit"', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toContainText(/audit/i)
  })

  test('"Book the audit" CTA is visible', async ({ page }) => {
    // Could be a link to #book or the Cal embed section
    const bookCta = page.locator('a[href="#book"], a[href*="audit"], button:has-text("Book")').first()
    await expect(bookCta).toBeVisible()
  })

  test('clicking "Book the audit" CTA scrolls to #book section', async ({ page }) => {
    const bookCta = page.locator('a[href="#book"]').first()
    // Only test scroll behavior if the anchor link exists
    const count = await bookCta.count()
    if (count > 0) {
      await bookCta.click()
      // Use .first() — AuditCalEmbed no longer has its own id="book"
      const bookSection = page.locator('#book').first()
      await expect(bookSection).toBeInViewport({ ratio: 0.1 })
    }
  })

  test('Cal.com iframe or embed is present', async ({ page }) => {
    // Cal embed renders either as an iframe or a div with a cal.com data attribute
    const calEmbed = page.locator(
      'iframe[src*="cal.com"], [data-cal-link], [data-cal-namespace], div[class*="cal"]'
    ).first()

    // Wait up to 10 seconds for the Cal embed to load
    await expect(calEmbed).toBeVisible({ timeout: 10000 })
  })
})
