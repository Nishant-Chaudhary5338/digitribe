import { describe, it, expect } from 'vitest'
import { encryptKey, decryptKey, redactKey } from '../../../lib/store/byok'

describe('byok vault', () => {
  it('round-trips a key through encrypt/decrypt', () => {
    const key = 'sk-ant-secret-value-12345'
    const enc = encryptKey(key)
    expect(decryptKey(enc)).toBe(key)
  })

  it('ciphertext is not the plaintext and uses a fresh iv each time', () => {
    const a = encryptKey('same-secret')
    const b = encryptKey('same-secret')
    expect(a.ciphertext).not.toContain('same-secret')
    expect(a.iv).not.toBe(b.iv) // random nonce per encryption
    expect(a.ciphertext).not.toBe(b.ciphertext)
  })

  it('rejects a tampered auth tag', () => {
    const enc = encryptKey('tamper-me')
    const tampered = { ...enc, tag: Buffer.from('0'.repeat(16)).toString('base64') }
    expect(() => decryptKey(tampered)).toThrow()
  })

  it('redactKey scrubs the literal key and common provider patterns', () => {
    const key = 'sk-ant-abc123def456'
    const text = `failed for key ${key} and also sk-openai-zzz999 and AIzaSyABCDEF123456`
    const out = redactKey(text, key)
    expect(out).not.toContain(key)
    expect(out).not.toContain('sk-openai-zzz999')
    expect(out).not.toContain('AIzaSyABCDEF123456')
    expect(out).toContain('[redacted-key]')
  })
})
