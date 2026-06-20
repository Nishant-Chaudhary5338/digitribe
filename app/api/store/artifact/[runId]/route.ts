/**
 * GET /api/store/artifact/[runId]?fmt=json — fetch a produced artifact.
 * Canonical: contracts §6. (pdf/zip formats land with the report renderer, S9.)
 */
import { NextResponse, type NextRequest } from 'next/server'
import { kv } from '@vercel/kv'
import { toErrorResponse, storeError } from '../../../../../lib/store/errors'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ runId: string }> }
): Promise<NextResponse> {
  try {
    const { runId } = await ctx.params
    const artifact = await kv.get(`artifact:${runId}`)
    if (artifact == null)
      throw storeError(
        'ARTIFACT_NOT_FOUND',
        'We couldn’t find that result. It may have expired — results are kept 30 days.'
      )
    return NextResponse.json(artifact)
  } catch (e) {
    const { status, body } = toErrorResponse(e)
    return NextResponse.json(body, { status })
  }
}
