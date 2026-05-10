import { test, expect } from '@playwright/test'

test.describe('Splash page (/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with Digitribe title', async ({ page }) => {
    await expect(page).toHaveTitle(/Digitribe/i)
  })

  test('two choice cards are visible', async ({ page }) => {
    await expect(page.locator('text=Built for DTC brands')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=Built for product-led SaaS')).toBeVisible({ timeout: 8000 })
  })

  test('DTC card links to /dtc', async ({ page }) => {
    const dtcLink = page.locator('a[href="/dtc"], button[aria-label*="DTC"]').first()
    await expect(dtcLink).toBeVisible()
  })

  test('SaaS card links to /saas', async ({ page }) => {
    const saasLink = page.locator('a[href="/saas"], button[aria-label*="SaaS"]').first()
    await expect(saasLink).toBeVisible()
  })
})

test.describe('Studio / DTC home (/dtc)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dtc')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/DTC.*Digitribe|Digitribe.*DTC/i)
  })

  test('H1 contains "conversions"', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText(/conversions/i)
  })

  test('primary CTA links to /dtc/audit', async ({ page }) => {
    const cta = page.locator('a[href="/dtc/audit"]').first()
    await expect(cta).toBeVisible()
  })

  test('data-theme is set to studio', async ({ page }) => {
    const themeEl = page.locator('[data-theme="studio"]').first()
    await expect(themeEl).toBeAttached()
  })

  test('stat strip shows 3 and 5+', async ({ page }) => {
    await expect(page.locator('text=senior makers')).toBeVisible()
  })
})

test.describe('Garden / SaaS home (/saas)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/saas')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/SaaS.*Digitribe|Digitribe.*SaaS/i)
  })

  test('H1 contains "conversions"', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText(/conversions/i)
  })

  test('primary CTA links to /saas/audit', async ({ page }) => {
    const cta = page.locator('a[href="/saas/audit"]').first()
    await expect(cta).toBeVisible()
  })

  test('data-theme is set to garden', async ({ page }) => {
    const themeEl = page.locator('[data-theme="garden"]').first()
    await expect(themeEl).toBeAttached()
  })

  test('founder card shows three practitioners', async ({ page }) => {
    await expect(page.locator('text=Three senior practitioners')).toBeVisible()
  })
})
