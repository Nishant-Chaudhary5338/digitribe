import { test, expect } from '@playwright/test'

test.describe('Studio nav — desktop (1280px) from /dtc', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dtc')
    await page.waitForLoadState('networkidle')
  })

  test('header is visible', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('Services link navigates to /dtc/services', async ({ page }) => {
    await page.click('header a[href="/dtc/services"]')
    await expect(page).toHaveURL('/dtc/services')
  })

  test('About link navigates to /dtc/about', async ({ page }) => {
    await page.click('header a[href="/dtc/about"]')
    await expect(page).toHaveURL('/dtc/about')
  })

  test('Contact link navigates to /dtc/contact', async ({ page }) => {
    await page.click('header a[href="/dtc/contact"]')
    await expect(page).toHaveURL('/dtc/contact')
  })

  test('"book audit" CTA links to /dtc/audit', async ({ page }) => {
    const cta = page.locator('header a[href="/dtc/audit"]').first()
    await expect(cta).toBeVisible()
  })
})

test.describe('Garden nav — desktop (1280px) from /saas', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/saas')
    await page.waitForLoadState('networkidle')
  })

  test('header is visible', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('Services link navigates to /saas/services', async ({ page }) => {
    await page.click('header a[href="/saas/services"]')
    await expect(page).toHaveURL('/saas/services')
  })

  test('About link navigates to /saas/about', async ({ page }) => {
    await page.click('header a[href="/saas/about"]')
    await expect(page).toHaveURL('/saas/about')
  })

  test('"book audit" CTA links to /saas/audit', async ({ page }) => {
    const cta = page.locator('header a[href="/saas/audit"]').first()
    await expect(cta).toBeVisible()
  })
})

test.describe('Studio nav — mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/dtc')
    await page.waitForLoadState('networkidle')
  })

  test('mobile menu button is visible', async ({ page }) => {
    const btn = page.locator('button[aria-label="Open menu"]').first()
    await expect(btn).toBeVisible()
  })

  test('mobile drawer opens and shows audit link', async ({ page }) => {
    await page.locator('button[aria-label="Open menu"]').first().click()
    // Wait for the nav menu dialog (distinct from cookie banner dialog)
    await page.waitForSelector('[aria-label="Mobile navigation menu"]', { timeout: 3000 })
    const auditLink = page.locator('[aria-label="Mobile navigation menu"] a[href="/dtc/audit"]').first()
    await expect(auditLink).toBeVisible()
  })

  test('mobile drawer closes on close button click', async ({ page }) => {
    await page.locator('button[aria-label="Open menu"]').first().click()
    await page.waitForSelector('[aria-label="Mobile navigation menu"]', { timeout: 3000 })
    await page.locator('button[aria-label="Close menu"]').first().click()
    // Nav menu is unmounted from DOM on close
    await page.waitForSelector('[aria-label="Mobile navigation menu"]', { state: 'detached', timeout: 3000 })
  })
})
