/**
 * /store/checkout/success — post-Polar landing. The webhook (source of truth)
 * emails the access link / license; we tell the buyer to check their inbox.
 * (A direct checkout_id -> token handoff is a later enhancement.)
 */
export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Manrope, sans-serif' }}
        >
          Payment received — you’re all set
        </h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text-body)' }}>
          We’ve emailed your access link (or license key + download). It works for 30 days so you
          can re-run and re-download your result. Check your inbox — and your spam folder, just in
          case.
        </p>
        <p className="mt-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Didn’t get it within a minute? Contact us and we’ll resend it.
        </p>
      </div>
    </main>
  )
}
