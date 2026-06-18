import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

describe('useTheme', () => {
  it('returns a value', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current).toBeDefined()
  })

  it('does not throw on unmount', () => {
    const { unmount } = renderHook(() => useTheme())
    expect(() => unmount()).not.toThrow()
  })
})
