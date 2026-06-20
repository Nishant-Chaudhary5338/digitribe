import { defineConfig } from 'drizzle-kit'

/** Store database migrations. Run `pnpm db:generate` after schema changes,
 *  then `pnpm db:migrate` (or `pnpm db:push` for dev). */
export default defineConfig({
  schema: './server/store/db/schema.ts',
  out: './server/store/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env['DATABASE_URL'] ?? '' },
})
