/**
 * POST /api/store/key-check  { provider, apiKey, model? } -> { valid }
 * Canonical: contracts §6. Validates a BYOK key without spending quota; never logs the key.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { validateKey } from '../../../../lib/store/ai'
import { rateLimit } from '../../../../lib/store/kv'
import { toErrorResponse, storeError } from '../../../../lib/store/errors'

const Body = z.object({
  provider: z.enum(['anthropic', 'openai', 'google']),
  apiKey: z.string().min(1),
  model: z.string().min(1).optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) throw storeError('INPUT_INVALID', 'Provide a provider and key.')

    const ip = req.headers.get('x-forwarded-for') ?? 'anon'
    const rl = await rateLimit('keycheck', ip, 20, 60)
    if (!rl.allowed)
      throw storeError('RATE_LIMITED', 'Too many requests — wait a moment.', { retryable: true })

    const valid = await validateKey(parsed.data.provider, parsed.data.apiKey, parsed.data.model)
    return NextResponse.json({ valid })
  } catch (e) {
    const { status, body } = toErrorResponse(e)
    return NextResponse.json(body, { status })
  }
}
