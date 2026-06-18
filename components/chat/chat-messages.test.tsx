import { describe, it, expect } from 'vitest'

describe('getTextFromMessage', () => {
  it('is defined', () => {
    expect(getTextFromMessage).toBeDefined()
  })

  it('returns a value for valid input', () => {
    const result = getTextFromMessage(undefined)
    expect(result).toBeDefined()
  })
})
