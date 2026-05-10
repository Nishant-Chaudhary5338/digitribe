import { test, expect } from '@playwright/test'

test.describe('About page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/about/i)
  })

  test('H1 is present on the page', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('3 founder cards are present', async ({ page }) => {
    // FoundersGrid full variant — heading "Senior practitioners. Direct contact. No layers."
    // is unique to this section (HeroPage also has "The tribe" but no h3 founder names).
    const founderSection = page.locator('section').filter({ hasText: 'Senior practitioners' }).first()
    await expect(founderSection).toBeVisible()

    // Scroll the section into view so Framer Motion reveals children
    await founderSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)

    // FullCard renders one h3 per founder
    const founderNames = founderSection.locator('h3')
    const count = await founderNames.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test("\"What we don\'t do\" / \"not for everyone\" section is present", async ({ page }) => {
    const section = page.locator('section').filter({ hasText: /not for everyone|don't do|don't take/i }).first()
    await expect(section).toBeVisible()
  })

  test("\"What we don\'t do\" section lists at least 3 items", async ({ page }) => {
    const section = page.locator('section').filter({ hasText: /not for everyone|don't do|don't take/i }).first()
    const items = section.locator('li')
    const count = await items.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('principles section is present', async ({ page }) => {
    const principles = page.locator('text=Three principles').first()
    await expect(principles).toBeVisible()
  })

  test('audit CTA link is present', async ({ page }) => {
    const auditLink = page.locator('a[href="/audit"]').first()
    await expect(auditLink).toBeVisible()
  })
})
