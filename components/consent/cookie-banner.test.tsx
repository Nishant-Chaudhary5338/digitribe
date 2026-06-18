import { describe, it, expect } from 'vitest'

describe('getCookieValue', () => {
  it('is defined', () => {
    expect(getCookieValue).toBeDefined()
  })

  it('returns a value for valid input', () => {
    const result = getCookieValue("test")
    expect(result).toBeDefined()
  })
})


import { describe, it, expect } from 'vitest'

describe('setConsentCookie', () => {
  it('is defined', () => {
    expect(setConsentCookie).toBeDefined()
  })

  it('returns a value for valid input', () => {
    const result = setConsentCookie(undefined)
    expect(result).toBeDefined()
  })
})
