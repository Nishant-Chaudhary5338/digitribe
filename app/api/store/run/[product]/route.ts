/**
 * POST /api/store/run/[product] (SSE) — the job runner. Canonical: contracts §6.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { runProduct } from '../../../../../lib/store/runner'
import { toErrorResponse, storeError } from '../../../../../lib/store/errors'

const Body = z.object({
  token: z.string().min(1),
  byokKey: z.string().min(1),
  provider: z.enum(['anthropic', 'openai', 'google']),
  input: z.unknown(),
  runId: z.string().uuid().optional(),
})

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ product: string }> }
): Promise<Response> {
  try {
    const { product } = await ctx.params
    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) {
      const { status, body } = toErrorResponse(storeError('INPUT_INVALID', 'Invalid run request.'))
      return NextResponse.json(body, { status })
    }
    return runProduct({ slug: product, ...parsed.data })
  } catch (e) {
    const { status, body } = toErrorResponse(e)
    return NextResponse.json(body, { status })
  }
}
