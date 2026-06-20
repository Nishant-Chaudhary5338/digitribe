/**
 * GET /api/store/artifact/[runId]?token=…&fmt=json — fetch a produced artifact.
 * Canonical: contracts §6. Token-gated: only the access token that produced the
 * run (matching ownerJti) may read it. (pdf/zip land with the report renderer, S9.)
 */
import { NextResponse, type NextRequest } from 'next/server'
import { kv } from '@vercel/kv'
import { verifyToken } from '../../../../../lib/store/access'
import { getRun } from '../../../../../lib/store/kv'
import { toErrorResponse, storeError } from '../../../../../lib/store/errors'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ runId: string }> }
): Promise<NextResponse> {
  try {
    const { runId } = await ctx.params

    const token = req.nextUrl.searchParams.get('token') ?? req.headers.get('x-store-token')
    if (!token) throw storeError('TOKEN_INVALID', 'This access link isn’t valid.')
    const v = await verifyToken(token, Math.floor(Date.now() / 1000))
    if (!v.ok)
      throw storeError(
        v.reason === 'expired' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        'This access link isn’t valid.'
      )

    const run = await getRun(runId)
    if (!run)
      throw storeError(
        'ARTIFACT_NOT_FOUND',
        'We couldn’t find that result. It may have expired — results are kept 30 days.'
      )
    if (run.ownerJti !== v.payload.jti)
      throw storeError('TOKEN_INVALID', 'This access link isn’t valid.')

    const artifact = await kv.get(`artifact:${runId}`)
    if (artifact == null) throw storeError('ARTIFACT_NOT_FOUND', 'That result has expired.')
    return NextResponse.json(artifact)
  } catch (e) {
    const { status, body } = toErrorResponse(e)
    return NextResponse.json(body, { status })
  }
}
