/**
 * Lazy Drizzle client over Supabase Postgres (postgres-js).
 * Connection is created on first `db()` call so importing never connects at build.
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { storeEnv } from '../../../lib/store/env'
import * as schema from './schema'

let cached: PostgresJsDatabase<typeof schema> | null = null

export function db(): PostgresJsDatabase<typeof schema> {
  if (cached) return cached
  // `prepare: false` is required for Supabase's transaction-mode pooler.
  const sql = postgres(storeEnv().DATABASE_URL, { prepare: false })
  cached = drizzle(sql, { schema })
  return cached
}

export { schema }
