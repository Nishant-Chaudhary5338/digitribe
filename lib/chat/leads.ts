import { kv } from '@/lib/kv/store'
import { resend } from '@/lib/email/resend-client'
import type { ChatLead } from './types'

const FROM = process.env['CONTACT_FROM_EMAIL'] ?? 'hello@digitribe.world'
const TO = process.env['CONTACT_TO_EMAIL'] ?? 'hello@digitribe.world'

export async function saveChatLead(lead: ChatLead): Promise<void> {
  await kv.set(`chat_lead:${Date.now()}`, lead, { ex: 60 * 60 * 24 * 365 })
  await notifyTeam(lead)
}

async function notifyTeam(lead: ChatLead): Promise<void> {
  if (!resend) {
    console.log('[Email mock] Chat lead captured', lead)
    return
  }

  const rows = [
    ['Company', lead.company],
    ['Need', lead.need],
    ['Budget', lead.budget],
    ['Email', lead.email],
    ['Name', lead.name],
    ['Session', lead.sessionId],
    ['Captured', lead.capturedAt],
  ]
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;white-space:nowrap">${k}</td><td style="padding:6px 12px;font-size:13px">${v}</td></tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f9fafb;padding:32px">
<div style="max-width:480px;background:#fff;border-radius:8px;padding:24px;border:1px solid #e5e7eb">
  <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#111">New chat lead</p>
  <table style="width:100%;border-collapse:collapse">${rows}</table>
</div></body></html>`

  const subject = `[Chat lead] ${lead.company ?? lead.email ?? 'Unknown'} — ${lead.need ?? 'inquiry'}`

  await resend.emails.send({ from: FROM, to: TO, subject, html })
}
