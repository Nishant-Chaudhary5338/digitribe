/**
 * /store/use/[token] — the tool UI for a purchased product. The token carries the
 * product slug; the /run, /key-check, /artifact routes enforce all security.
 */
import { getProduct } from '../../../../../lib/store/products'
import { ToolRunner } from '../../../../../components/store/tool-runner'

function slugFromToken(token: string): string | null {
  try {
    const payloadB64 = token.split('.')[0]
    if (!payloadB64) return null
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      slug?: unknown
    }
    return typeof payload.slug === 'string' ? payload.slug : null
  } catch {
    return null
  }
}

export default async function ToolPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const slug = slugFromToken(token)
  const product = slug ? getProduct(slug) : undefined

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
      {product ? (
        <ToolRunner
          token={token}
          slug={product.slug}
          productName={product.name}
          providers={product.byokProviders}
        />
      ) : (
        <div
          className="mx-auto max-w-2xl px-6 py-16 text-center"
          style={{ color: 'var(--color-text-body)' }}
        >
          <h1 className="mb-2 text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            This access link isn’t valid
          </h1>
          <p>Check the link from your email, or contact us and we’ll sort it out.</p>
        </div>
      )}
    </main>
  )
}
