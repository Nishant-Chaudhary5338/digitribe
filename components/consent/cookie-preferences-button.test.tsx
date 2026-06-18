import { describe, it, expect } from 'vitest'

describe('CookiePreferencesButton', () => {
  it('is defined', () => {
    expect(CookiePreferencesButton).toBeDefined()
  })

  it('returns a value for valid input', () => {
    const result = CookiePreferencesButton()
    expect(result).toBeDefined()
  })
})
