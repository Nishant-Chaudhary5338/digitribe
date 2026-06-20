/**
 * Zod-validated store environment. Canonical: contracts §8.
 * No AI provider keys here — inference is BYOK.
 *
 * Validation is lazy (first `storeEnv()` call) so importing this module never
 * throws at build time; it validates on first server-side use.
 */
import { z } from 'zod'

export const storeEnvSchema = z.object({
  POLAR_ACCESS_TOKEN: z.string().min(1),
  POLAR_WEBHOOK_SECRET: z.string().min(1),
  POLAR_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  KEY_VAULT_SECRET: z.string().length(64), // 32 bytes hex for AES-256-GCM
  DATABASE_URL: z.string().url(),
  KV_REST_API_URL: z.string().url(),
  KV_REST_API_TOKEN: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  STORE_BASE_URL: z.string().url(),
})

export type StoreEnv = z.infer<typeof storeEnvSchema>

let cached: StoreEnv | null = null

export function storeEnv(): StoreEnv {
  if (cached) return cached
  const parsed = storeEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ')
    throw new Error(`Invalid/missing store environment variables: ${missing}`)
  }
  cached = parsed.data
  return cached
}
