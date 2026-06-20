/**
 * Polar (Merchant of Record) client + checkout. Canonical: contracts §6, platform-spec §9.
 * The webhook is the source of truth for fulfilment (see fulfilment.ts).
 */
import { Polar } from '@polar-sh/sdk'
import { storeEnv } from './env'

function polarServer(): 'sandbox' | 'production' {
  return storeEnv().POLAR_MODE === 'live' ? 'production' : 'sandbox'
}

export function polarClient(): Polar {
  return new Polar({ accessToken: storeEnv().POLAR_ACCESS_TOKEN, server: polarServer() })
}

/** Create a hosted Polar checkout for a product; returns the URL to redirect to. */
export async function createCheckout(opts: {
  polarProductId: string
  slug: string
  email?: string
}): Promise<string> {
  const env = storeEnv()
  const checkout = await polarClient().checkouts.create({
    products: [opts.polarProductId],
    successUrl: `${env.STORE_BASE_URL}/store/checkout/success?checkout_id={CHECKOUT_ID}`,
    metadata: { slug: opts.slug },
    ...(opts.email ? { customerEmail: opts.email } : {}),
  })
  return checkout.url
}
