import { test, expect } from '@playwright/test'

test.describe('Workshop page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workshop')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/workshop/i)
  })

  test('H1 is present on the page', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('email capture form is visible', async ({ page }) => {
    const form = page.locator('form').first()
    await expect(form).toBeVisible()
  })

  test('email input field is present', async ({ page }) => {
    const emailField = page.locator('input[type="email"], input[name="email"]').first()
    await expect(emailField).toBeVisible()
  })

  test('form submit button is visible', async ({ page }) => {
    const submitBtn = page
      .locator('form button[type="submit"], form button:has-text("Join"), form button:has-text("Sign"), form button:has-text("Get")')
      .first()
    await expect(submitBtn).toBeVisible()
  })

  test('submitting empty form shows a validation error', async ({ page }) => {
    const submitBtn = page
      .locator('form button[type="submit"], form button:has-text("Join"), form button:has-text("Sign"), form button:has-text("Get")')
      .first()
    await submitBtn.click()

    const error = page
      .locator('[role="alert"], .error, p:has-text("required"), p:has-text("valid email")')
      .first()
    await expect(error).toBeVisible({ timeout: 3000 })
  })
})
