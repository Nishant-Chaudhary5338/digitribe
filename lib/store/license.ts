/**
 * Licensing for Segment-5 downloadable apps. Canonical: contracts §6, DECISIONS D-13/14/15.
 * We store only a HASH of the license key. The local app activates once online
 * via /api/store/license/validate, then runs on the buyer's own BYOK key.
 */
import { createHash, randomBytes } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../../server/store/db/client'
import { licenses, activations } from '../../server/store/db/schema'

export const DEFAULT_MAX_ACTIVATIONS = 3

export function hashLicenseKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

function generateLicenseKey(): string {
  const raw = randomBytes(10).toString('hex').toUpperCase()
  const groups = raw.match(/.{1,4}/g) ?? []
  return `DGT-${groups.join('-')}`
}

/** Create a license for a purchase. Returns the raw key (shown once to the buyer). */
export async function issueLicense(opts: {
  purchaseId: string
  slug: string
  email: string
  maxActivations?: number
}): Promise<string> {
  const key = generateLicenseKey()
  await db()
    .insert(licenses)
    .values({
      purchaseId: opts.purchaseId,
      productSlug: opts.slug,
      email: opts.email,
      keyHash: hashLicenseKey(key),
      maxActivations: opts.maxActivations ?? DEFAULT_MAX_ACTIVATIONS,
    })
  return key
}

export type ValidateResult =
  | { valid: true; activationsRemaining: number }
  | { valid: false; reason: 'invalid' | 'revoked' | 'exhausted' }

/** Validate + activate a license on a device (idempotent per device). */
export async function validateLicense(
  rawKey: string,
  deviceId: string,
  slug: string
): Promise<ValidateResult> {
  const keyHash = hashLicenseKey(rawKey)
  const [lic] = await db().select().from(licenses).where(eq(licenses.keyHash, keyHash)).limit(1)
  if (!lic || lic.productSlug !== slug) return { valid: false, reason: 'invalid' }
  if (lic.revoked) return { valid: false, reason: 'revoked' }

  const existing = await db()
    .select()
    .from(activations)
    .where(and(eq(activations.keyHash, keyHash), eq(activations.deviceId, deviceId)))
    .limit(1)

  const used = await db().select().from(activations).where(eq(activations.keyHash, keyHash))
  if (existing.length === 0) {
    if (used.length >= lic.maxActivations) return { valid: false, reason: 'exhausted' }
    await db().insert(activations).values({ keyHash, deviceId })
  }
  const total = existing.length === 0 ? used.length + 1 : used.length
  return { valid: true, activationsRemaining: Math.max(0, lic.maxActivations - total) }
}

/** Revoke all licenses for a purchase (on refund). */
export async function revokeLicensesForPurchase(purchaseId: string): Promise<void> {
  await db().update(licenses).set({ revoked: true }).where(eq(licenses.purchaseId, purchaseId))
}
