import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@/lib/kv/store'

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    await kv.set(`audit_event:${Date.now()}`, body, { ex: 60 * 60 * 24 * 30 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
