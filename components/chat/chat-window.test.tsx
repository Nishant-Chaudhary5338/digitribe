import { describe, it, expect } from 'vitest'

describe('handleSend', () => {
  it('is defined', () => {
    expect(handleSend).toBeDefined()
  })

  it('returns a value for valid input', () => {
    const result = handleSend("test")
    expect(result).toBeDefined()
  })
})
