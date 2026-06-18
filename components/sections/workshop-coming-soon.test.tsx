import { describe, it, expect } from 'vitest'

describe('WorkshopComingSoon', () => {
  it('is defined', () => {
    expect(WorkshopComingSoon).toBeDefined()
  })

  it('returns a value for valid input', () => {
    const result = WorkshopComingSoon()
    expect(result).toBeDefined()
  })
})
