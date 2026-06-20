import { describe, it, expect } from 'vitest'
import { hashLicenseKey, decideActivation } from '../../../lib/store/license'

describe('license key hashing', () => {
  it('hashes deterministically and not to the raw key', () => {
    const key = 'DGT-AAAA-BBBB-CCCC-DDDD'
    expect(hashLicenseKey(key)).toBe(hashLicenseKey(key))
    expect(hashLicenseKey(key)).not.toContain('DGT')
    expect(hashLicenseKey(key)).toHaveLength(64) // sha256 hex
  })
})

describe('decideActivation (cap logic)', () => {
  const lic = { maxActivations: 3, revoked: false }

  it('blocks a revoked license', () => {
    expect(decideActivation({ ...lic, revoked: true }, false, 0)).toEqual({
      allow: false,
      reason: 'revoked',
    })
  })

  it('allows a new device under the cap and counts it', () => {
    expect(decideActivation(lic, false, 1)).toEqual({
      allow: true,
      isNew: true,
      activationsRemaining: 1,
    })
  })

  it('blocks a new device once the cap is reached', () => {
    expect(decideActivation(lic, false, 3)).toEqual({ allow: false, reason: 'exhausted' })
  })

  it('is idempotent for an already-activated device (no new seat)', () => {
    expect(decideActivation(lic, true, 3)).toEqual({
      allow: true,
      isNew: false,
      activationsRemaining: 0,
    })
  })

  it('never reports negative remaining', () => {
    const d = decideActivation(lic, true, 5)
    expect(d.allow && d.activationsRemaining).toBe(0)
  })
})
