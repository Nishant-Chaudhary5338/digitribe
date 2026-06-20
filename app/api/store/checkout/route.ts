/**
 * POST /api/store/checkout  { slug, email? } -> { checkoutUrl }
 * Canonical: contracts §6.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getProduct } from '../../../../lib/store/products'
import { createCheckout } from '../../../../lib/store/polar'
import { rateLimit } from '../../../../lib/store/kv'
import { storeError, toErrorResponse } from '../../../../lib/store/errors'

const Body = z.object({
  slug: z.string().min(1),
  email: z.string().email().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
    const rl = await rateLimit('checkout', ip, 20, 60)
    if (!rl.allowed)
      throw storeError('RATE_LIMITED', 'Too many requests — wait a moment.', { retryable: true })

    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) throw storeError('INPUT_INVALID', 'Missing or invalid product.')

    const product = getProduct(parsed.data.slug)
    if (!product) throw storeError('INPUT_INVALID', 'Unknown product.')

    const checkoutUrl = await createCheckout({
      polarProductId: product.polarProductId,
      slug: product.slug,
      email: parsed.data.email,
    })
    return NextResponse.json({ checkoutUrl })
  } catch (e) {
    const { status, body } = toErrorResponse(e)
    return NextResponse.json(body, { status })
  }
}
