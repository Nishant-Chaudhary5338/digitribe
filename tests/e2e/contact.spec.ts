import { test, expect } from '@playwright/test'

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
  })

  test('page renders with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/contact/i)
  })

  test('H1 is present on the page', async ({ page }) => {
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('contact form is visible', async ({ page }) => {
    const form = page.locator('form').first()
    await expect(form).toBeVisible()
  })

  test('form has name, email, and message fields', async ({ page }) => {
    const form = page.locator('form').first()
    await expect(form.locator('input[name="name"], input[id="name"]').first()).toBeVisible()
    await expect(form.locator('input[name="email"], input[id="email"], input[type="email"]').first()).toBeVisible()
    await expect(form.locator('textarea').first()).toBeVisible()
  })

  test('submit button is visible', async ({ page }) => {
    const submitBtn = page.locator('form button[type="submit"], form button:has-text("Send")').first()
    await expect(submitBtn).toBeVisible()
  })

  test('submitting empty form shows validation errors', async ({ page }) => {
    const submitBtn = page.locator('form button[type="submit"], form button:has-text("Send")').first()
    await submitBtn.click()

    // Expect at least one error message to appear
    const error = page.locator(
      '[role="alert"], .error, [aria-describedby], p:has-text("required"), p:has-text("valid")'
    ).first()
    await expect(error).toBeVisible({ timeout: 3000 })
  })

  test('submitting with invalid email shows an error', async ({ page }) => {
    const emailField = page.locator('input[name="email"], input[id="email"], input[type="email"]').first()
    await emailField.fill('not-an-email')

    const submitBtn = page.locator('form button[type="submit"], form button:has-text("Send")').first()
    await submitBtn.click()

    const error = page.locator(
      '[role="alert"], .error, p:has-text("email"), p:has-text("valid")'
    ).first()
    await expect(error).toBeVisible({ timeout: 3000 })
  })

  test('honeypot field exists and is hidden', async ({ page }) => {
    // Honeypot is typically a visually-hidden input with tabIndex=-1 or display:none
    const honeypot = page.locator(
      'input[name="website"], input[name="honeypot"], input[name="bot_field"], input[tabindex="-1"]'
    ).first()

    const count = await honeypot.count()
    expect(count).toBeGreaterThan(0)

    // It should not be visible to real users
    await expect(honeypot).not.toBeVisible()
  })
})
