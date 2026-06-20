/**
 * Webhook fulfilment — the source of truth (contracts §6, platform-spec §9).
 * order.paid -> create Purchase, then fulfil by delivery type:
 *   in-browser      -> mint an access token (KV)
 *   download-license -> issue a license + download (no token)
 * refund -> mark refunded, revoke token/license.
 *
 * Decoupled from Polar SDK types: the webhook route passes primitives.
 */
import { eq } from 'drizzle-orm'
import { kv } from '@vercel/kv'
import { db } from '../../server/store/db/client'
import { purchases } from '../../server/store/db/schema'
import { getProduct } from './products'
import { mintToken, revokeToken } from './access'
import { issueLicense, revokeLicensesForPurchase } from './license'

const DAY = 60 * 60 * 24
const DEFAULT_RUNS = 3

export interface PaidOrder {
  orderId: string
  slug: string
  email: string
  totalCents: number
}

/** Idempotent on the Polar order id. Returns what was issued (for the success page). */
export async function fulfilOrderPaid(
  o: PaidOrder,
  nowSeconds: number
): Promise<{ token?: string; licenseKey?: string }> {
  const product = getProduct(o.slug)
  const delivery = product?.delivery ?? 'in-browser'
  const runsTotal = delivery === 'in-browser' ? (product?.runsPerPurchase ?? DEFAULT_RUNS) : 0

  const inserted = await db()
    .insert(purchases)
    .values({
      polarOrderId: o.orderId,
      productSlug: o.slug,
      email: o.email,
      priceCents: o.totalCents,
      runsTotal,
      runsUsed: 0,
    })
    .onConflictDoNothing({ target: purchases.polarOrderId })
    .returning()

  const purchase = inserted[0]
  if (!purchase) return {} // duplicate webhook — already fulfilled

  if (delivery === 'download-license') {
    const licenseKey = await issueLicense({
      purchaseId: purchase.id,
      slug: o.slug,
      email: o.email,
    })
    await kv.set(`order:${o.orderId}`, { licenseKey }, { ex: 30 * DAY })
    return { licenseKey }
  }

  const token = await mintToken(
    { purchaseId: purchase.id, slug: o.slug, email: o.email },
    runsTotal,
    nowSeconds
  )
  await kv.set(`order:${o.orderId}`, { token }, { ex: 30 * DAY })
  return { token }
}

/** Mark a purchase refunded and revoke its access (token or license). */
export async function fulfilRefund(o: { orderId: string }): Promise<void> {
  const [purchase] = await db()
    .select()
    .from(purchases)
    .where(eq(purchases.polarOrderId, o.orderId))
    .limit(1)
  if (!purchase) return

  await db().update(purchases).set({ refunded: true }).where(eq(purchases.id, purchase.id))
  await revokeLicensesForPurchase(purchase.id)

  const issued = await kv.get<{ token?: string }>(`order:${o.orderId}`)
  if (issued?.token) {
    const dot = issued.token.indexOf('.')
    if (dot > 0) {
      try {
        const payload = JSON.parse(
          Buffer.from(issued.token.slice(0, dot), 'base64url').toString('utf8')
        )
        if (typeof payload?.jti === 'string') await revokeToken(payload.jti)
      } catch {
        /* token shape changed — nothing to revoke */
      }
    }
  }
  await kv.del(`order:${o.orderId}`)
}
