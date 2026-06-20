/**
 * Store transactional emails via Resend. Canonical: contracts §8, doc 07 §5.
 * Reuses the repo's Resend client (graceful mock when RESEND_API_KEY is unset).
 * Never embeds the buyer's BYOK key or sensitive content.
 */
import { resend } from '../email/resend-client'

const FROM = process.env['STORE_FROM_EMAIL'] ?? 'store@digitribe.world'

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f2ead8;font-family:Inter,Arial,sans-serif;color:#3a3028">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <h1 style="font-family:Manrope,Arial,sans-serif;color:#1c0a00;font-size:20px;margin:0 0 16px">${title}</h1>
    ${bodyHtml}
    <p style="color:#4d6040;font-size:12px;margin-top:32px">Digitribe · digitribe.world/store</p>
  </div></body></html>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#c5704f;color:#f2ead8;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">${label}</a>`
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log('[Store email mock] to=%s subject=%s', to, subject)
    return
  }
  await resend.emails.send({ from: FROM, to, subject, html })
}

/** Receipt + access on purchase. In-browser products get an access link; downloadable apps get the license + download. */
export async function sendReceipt(opts: {
  to: string
  productName: string
  accessUrl?: string
  licenseKey?: string
  downloadUrl?: string
}): Promise<void> {
  const body = opts.licenseKey
    ? `<p>Thanks for buying <strong>${opts.productName}</strong>. Your license key:</p>
       <p style="font-family:monospace;background:#f8f2e0;padding:10px 14px;border-radius:6px">${opts.licenseKey}</p>
       ${opts.downloadUrl ? `<p>${button(opts.downloadUrl, 'Download the app')}</p>` : ''}
       <p style="color:#4d6040;font-size:13px">Activate once online, then it runs on your own AI key. You can re-download anytime within 30 days.</p>`
    : `<p>Thanks for buying <strong>${opts.productName}</strong>. Click below to start — it runs on your own AI key.</p>
       <p>${opts.accessUrl ? button(opts.accessUrl, 'Open your tool') : ''}</p>
       <p style="color:#4d6040;font-size:13px">This link works for 30 days so you can re-run and re-download your result.</p>`
  await send(
    opts.to,
    `Your Digitribe ${opts.productName} purchase`,
    shell(`Your ${opts.productName} is ready`, body)
  )
}

/** Artifact-ready copy after a successful run. */
export async function sendArtifactReady(opts: {
  to: string
  productName: string
  viewUrl: string
  summary?: string
}): Promise<void> {
  const body = `<p>Your <strong>${opts.productName}</strong> result is ready.</p>
    ${opts.summary ? `<p style="color:#4d6040">${opts.summary}</p>` : ''}
    <p>${button(opts.viewUrl, 'View your result')}</p>
    <p style="color:#4d6040;font-size:13px">Saved for 30 days, then permanently deleted.</p>`
  await send(
    opts.to,
    `Your ${opts.productName} result is ready`,
    shell(`Your ${opts.productName} result`, body)
  )
}
