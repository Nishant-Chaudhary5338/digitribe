/**
 * Drizzle schema for the store. Canonical: platform-spec §7 + contracts §6.
 * Durable records (purchases, runs, accounts, saved keys, licenses) live here;
 * ephemeral state (tokens, quota, rate limits, artifacts) lives in KV/Blob.
 */
import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  polarOrderId: text('polar_order_id').notNull().unique(),
  productSlug: text('product_slug').notNull(),
  email: text('email').notNull(),
  priceCents: integer('price_cents').notNull(),
  runsTotal: integer('runs_total').notNull().default(0),
  runsUsed: integer('runs_used').notNull().default(0),
  refunded: boolean('refunded').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const runs = pgTable('runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseId: uuid('purchase_id')
    .notNull()
    .references(() => purchases.id),
  productSlug: text('product_slug').notNull(),
  status: text('status', { enum: ['running', 'success', 'error'] }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  artifactKey: text('artifact_key'),
  error: text('error'),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const savedKeys = pgTable('saved_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id),
  provider: text('provider', { enum: ['anthropic', 'openai', 'google'] }).notNull(),
  ciphertext: text('ciphertext').notNull(),
  iv: text('iv').notNull(),
  tag: text('tag').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ── Licensing (Segment 5 downloadable apps) ────────────────────────────────

export const licenses = pgTable('licenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseId: uuid('purchase_id')
    .notNull()
    .references(() => purchases.id),
  productSlug: text('product_slug').notNull(),
  email: text('email').notNull(),
  /** hash of the license key shown to the buyer — never store the raw key */
  keyHash: text('key_hash').notNull().unique(),
  maxActivations: integer('max_activations').notNull().default(3),
  revoked: boolean('revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const activations = pgTable(
  'activations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    keyHash: text('key_hash')
      .notNull()
      .references(() => licenses.keyHash),
    deviceId: text('device_id').notNull(),
    activatedAt: timestamp('activated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('activations_key_device_uniq').on(t.keyHash, t.deviceId)]
)

export type Purchase = typeof purchases.$inferSelect
export type NewPurchase = typeof purchases.$inferInsert
export type Run = typeof runs.$inferSelect
export type LicenseRow = typeof licenses.$inferSelect
