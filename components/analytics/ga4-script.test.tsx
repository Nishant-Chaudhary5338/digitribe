import { describe, it, expect } from 'vitest'

describe('gtag', () => {
  it('is defined', () => {
    expect(gtag).toBeDefined()
  })

  it('returns a value for valid input', () => {
    const result = gtag()
    expect(result).toBeDefined()
  })
})
