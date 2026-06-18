import { NextRequest, NextResponse } from 'next/server'
import { workshopInterestSchema } from '@/lib/validation/workshop-schema'
import { sendWorkshopInterestEmail } from '@/lib/email/send'
import { kv } from '@/lib/kv/store'

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    const parsed = workshopInterestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Honeypot check
    if (parsed.data.company_url && parsed.data.company_url.length > 0) {
      return NextResponse.json({ success: true })
    }

    await kv.set(
      `workshop:${Date.now()}`,
      { email: parsed.data.email },
      { ex: 60 * 60 * 24 * 365 }
    )
    await sendWorkshopInterestEmail(parsed.data.email)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
