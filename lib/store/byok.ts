/**
 * BYOK key vault. Canonical: contracts §5, platform-spec §5.
 * Keys are NEVER logged or persisted unless the buyer opts in — then encrypted here
 * with AES-256-GCM (KEY_VAULT_SECRET = 64 hex chars / 32 bytes).
 *
 * `validateKey` lives in ai.ts (it pings the provider) to avoid a cycle.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { storeEnv } from './env'

export interface EncryptedKey {
  ciphertext: string // base64
  iv: string // base64
  tag: string // base64
}

function vaultKey(): Buffer {
  const key = Buffer.from(storeEnv().KEY_VAULT_SECRET, 'hex')
  if (key.length !== 32) throw new Error('KEY_VAULT_SECRET must be 32 bytes (64 hex chars)')
  return key
}

export function encryptKey(plaintext: string): EncryptedKey {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', vaultKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  }
}

export function decryptKey(enc: EncryptedKey): string {
  const decipher = createDecipheriv('aes-256-gcm', vaultKey(), Buffer.from(enc.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(enc.tag, 'base64'))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(enc.ciphertext, 'base64')),
    decipher.final(),
  ])
  return plaintext.toString('utf8')
}

/**
 * Scrub a BYOK key (and common provider key shapes) from any string before it's
 * logged or surfaced in an error `detail`. Always call on outgoing error text.
 */
export function redactKey(text: string, key?: string): string {
  let out = text
  if (key && key.length >= 8) out = out.split(key).join('[redacted-key]')
  // Common provider key prefixes (sk-..., sk-ant-..., AIza..., etc.)
  out = out.replace(/\b(sk-[a-zA-Z0-9-]{8,}|AIza[a-zA-Z0-9_-]{8,})\b/g, '[redacted-key]')
  return out
}
