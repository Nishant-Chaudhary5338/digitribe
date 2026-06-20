/**
 * POST /api/store/webhook — Polar -> us; the source of truth (contracts §6).
 * Signature is verified by the @polar-sh/nextjs adapter against POLAR_WEBHOOK_SECRET.
 */
import type { NextRequest } from 'next/server'
import { Webhooks } from '@polar-sh/nextjs'
import { storeEnv } from '../../../../lib/store/env'
import { fulfilOrderPaid, fulfilRefund } from '../../../../lib/store/fulfilment'

export function POST(req: NextRequest) {
  const handler = Webhooks({
    webhookSecret: storeEnv().POLAR_WEBHOOK_SECRET,
    onOrderPaid: async (payload) => {
      const o = payload.data
      await fulfilOrderPaid(
        {
          orderId: o.id,
          slug: String(o.metadata?.['slug'] ?? ''),
          email: o.customer?.email ?? '',
          totalCents: o.totalAmount,
        },
        Math.floor(Date.now() / 1000)
      )
    },
    onOrderRefunded: async (payload) => {
      await fulfilRefund({ orderId: payload.data.id })
    },
  })
  return handler(req)
}
