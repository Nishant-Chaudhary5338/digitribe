// In dev without KV env vars, operations are no-ops (log to console).
// In production, uses @vercel/kv.
import { kv as vercelKv } from '@vercel/kv'

const hasKv = Boolean(process.env['KV_REST_API_URL'])

export const kv = {
  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
    if (!hasKv) {
      console.log('[KV mock] set', key, value)
      return
    }
    await vercelKv.set(key, value, opts as Parameters<typeof vercelKv.set>[2])
  },

  async get<T>(key: string): Promise<T | null> {
    if (!hasKv) {
      console.log('[KV mock] get', key)
      return null
    }
    return vercelKv.get<T>(key)
  },

  async incr(key: string): Promise<number> {
    if (!hasKv) {
      console.log('[KV mock] incr', key)
      return 1
    }
    return vercelKv.incr(key)
  },
}
