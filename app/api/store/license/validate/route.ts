/**
 * POST /api/store/license/validate  { licenseKey, deviceId, slug }
 *   -> { valid, activationsRemaining }
 * Canonical: contracts §6 (Segment-5 downloadable apps). Never receives buyer code.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { validateLicense } from '../../../../../lib/store/license'
import { rateLimit } from '../../../../../lib/store/kv'
import { toErrorResponse, storeError } from '../../../../../lib/store/errors'

const Body = z.object({
  licenseKey: z.string().min(1),
  deviceId: z.string().min(1),
  slug: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) throw storeError('INPUT_INVALID', 'Provide licenseKey, deviceId and slug.')

    const ip = req.headers.get('x-forwarded-for') ?? 'anon'
    const rl = await rateLimit('license', ip, 20, 60)
    if (!rl.allowed)
      throw storeError('RATE_LIMITED', 'Too many requests — wait a moment.', { retryable: true })

    const result = await validateLicense(
      parsed.data.licenseKey,
      parsed.data.deviceId,
      parsed.data.slug
    )
    if (!result.valid) {
      if (result.reason === 'exhausted')
        throw storeError('LICENSE_EXHAUSTED', 'No device activations left on this license.')
      throw storeError('LICENSE_INVALID', 'That license key isn’t valid for this product.')
    }
    return NextResponse.json({ valid: true, activationsRemaining: result.activationsRemaining })
  } catch (e) {
    const { status, body } = toErrorResponse(e)
    return NextResponse.json(body, { status })
  }
}
