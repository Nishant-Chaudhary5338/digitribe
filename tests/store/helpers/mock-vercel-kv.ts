/**
 * In-memory @vercel/kv mock for store tests (doc 05 §2.2). Deterministic, no network.
 * Use:  vi.mock('@vercel/kv', async () => ({ kv: (await import('../helpers/mock-vercel-kv')).kv }))
 * and call __resetKv() in beforeEach.
 */
const store = new Map<string, unknown>()

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    return (store.has(key) ? store.get(key) : null) as T | null
  },
  async set(
    key: string,
    value: unknown,
    opts?: { nx?: boolean; ex?: number }
  ): Promise<'OK' | null> {
    if (opts?.nx && store.has(key)) return null
    store.set(key, value)
    return 'OK'
  },
  async incr(key: string): Promise<number> {
    const next = Number(store.get(key) ?? 0) + 1
    store.set(key, next)
    return next
  },
  async decr(key: string): Promise<number> {
    const next = Number(store.get(key) ?? 0) - 1
    store.set(key, next)
    return next
  },
  async expire(_key: string, _seconds: number): Promise<number> {
    return 1
  },
  async del(...keys: string[]): Promise<number> {
    let n = 0
    for (const key of keys) if (store.delete(key)) n++
    return n
  },
}

export function __resetKv(): void {
  store.clear()
}

export function __dumpKv(): Map<string, unknown> {
  return new Map(store)
}
