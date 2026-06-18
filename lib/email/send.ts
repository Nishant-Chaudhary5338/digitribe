import { resend } from './resend-client'
import { render } from '@react-email/render'
import { ContactNotificationEmail } from './templates/contact-notification'
import { ContactConfirmationEmail } from './templates/contact-confirmation'
import { WorkshopInterestEmail } from './templates/workshop-interest'
import type { ContactInput } from '@/lib/validation/contact-schema'

const FROM = process.env['CONTACT_FROM_EMAIL'] ?? 'hello@digitribe.world'
const TO_FOUNDERS = process.env['CONTACT_TO_EMAIL'] ?? 'hello@digitribe.world'
const TO_WORKSHOP = process.env['WORKSHOP_TO_EMAIL'] ?? 'hello@digitribe.world'

async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend) {
    console.log('[Email mock] Would send to', opts.to, ':', opts.subject)
    return
  }
  await resend.emails.send({ from: FROM, ...opts })
}

export async function sendContactEmail(data: ContactInput): Promise<void> {
  const notificationHtml = await render(ContactNotificationEmail({ data }))
  const confirmationHtml = await render(ContactConfirmationEmail({ name: data.name }))

  await Promise.all([
    sendEmail({
      to: TO_FOUNDERS,
      subject: `[Lead] ${data.company} - ${data.budget} - ${data.needs[0] ?? 'general'}`,
      html: notificationHtml,
    }),
    sendEmail({
      to: data.email,
      subject: 'Got it - one of us will be in touch',
      html: confirmationHtml,
    }),
  ])
}

export async function sendWorkshopInterestEmail(email: string): Promise<void> {
  const html = await render(WorkshopInterestEmail({ email }))
  await sendEmail({
    to: TO_WORKSHOP,
    subject: `[Workshop interest] ${email}`,
    html,
  })
}
