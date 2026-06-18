import { describe, it, expect } from 'vitest'

describe('formAction', () => {
  it('is defined', () => {
    expect(formAction).toBeDefined()
  })

  it('returns a value for valid input', async () => {
    const result = await formAction(undefined, undefined)
    expect(result).toBeDefined()
  })
})
