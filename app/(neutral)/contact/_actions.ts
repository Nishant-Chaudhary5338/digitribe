'use server'

import { headers } from 'next/headers'
import { contactSchema } from '@/lib/validation/contact-schema'
import { sendContactEmail } from '@/lib/email/send'
import { kv } from '@/lib/kv/store'

type ActionResult =
  | { success: true }
  | { success: false; errors: Record<string, string[]> }
  | { success: false; error: string }

export async function submitContact(formData: FormData): Promise<ActionResult> {
  // Build plain object from FormData -- handle multi-value 'needs' checkboxes
  const raw: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key === 'needs') {
      if (!Array.isArray(raw['needs'])) raw['needs'] = []
      ;(raw['needs'] as string[]).push(value as string)
    } else {
      raw[key] = value
    }
  }

  // Honeypot check -- silently succeed so bots get no signal
  if (raw['company_url'] && String(raw['company_url']).length > 0) {
    return { success: true }
  }

  // Rate limit: 3 submissions per IP per hour
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const rateKey = `rate:contact:${ip}:${Math.floor(Date.now() / 3600000)}`
  const count = await kv.incr(rateKey)
  if (count === 1) await kv.set(rateKey, 1, { ex: 3600 })
  if (count > 3) {
    return { success: false, error: 'Too many submissions. Please try again later.' }
  }

  // Validate
  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors }
  }

  // Persist + send
  try {
    await kv.set(`contact:${Date.now()}:${ip}`, parsed.data, { ex: 60 * 60 * 24 * 90 })
    await sendContactEmail(parsed.data)
    return { success: true }
  } catch {
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
