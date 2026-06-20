#!/usr/bin/env node
/**
 * setup-polar.mjs — create the store's Polar products from polar-products.json.
 *
 * ⚠️ VERIFY THE PAYLOAD SHAPE against the current Polar API before a live run:
 *    https://docs.polar.sh/api-reference   (the product/price body + auth can change)
 *    Adjust buildPayload() below if Polar's schema differs. Default is --dry-run.
 *
 * Usage:
 *   POLAR_ACCESS_TOKEN=polar_xxx POLAR_MODE=sandbox node setup-polar.mjs            # dry run (prints payloads)
 *   POLAR_ACCESS_TOKEN=polar_xxx POLAR_MODE=sandbox node setup-polar.mjs --create   # actually create
 *   ... POLAR_ORGANIZATION_ID=org_xxx ...   # if your API version requires it
 *
 * Output: writes polar-ids.json ({ slug: productId }) to paste into lib/store/products.ts.
 * Requires Node 18+ (global fetch). No dependencies.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const CREATE = process.argv.includes('--create')
const TOKEN = process.env.POLAR_ACCESS_TOKEN
const MODE = process.env.POLAR_MODE === 'production' ? 'production' : 'sandbox'
const ORG = process.env.POLAR_ORGANIZATION_ID // optional, depending on API version
const BASE = MODE === 'production' ? 'https://api.polar.sh' : 'https://sandbox-api.polar.sh'

if (!TOKEN) {
  console.error('✗ Set POLAR_ACCESS_TOKEN. (Use a SANDBOX token first: POLAR_MODE=sandbox)')
  process.exit(1)
}

const { products, currency } = JSON.parse(readFileSync(join(__dir, 'polar-products.json'), 'utf8'))

/** Build the Polar product create body. ⚠️ Confirm field names against docs.polar.sh. */
function buildPayload(p) {
  return {
    name: p.name,
    description: p.description,
    ...(ORG ? { organization_id: ORG } : {}),
    recurring_interval: null, // one-time purchase
    prices: [
      {
        amount_type: 'fixed',
        price_amount: Math.round(p.priceUSD * 100), // cents
        price_currency: (currency || 'USD').toLowerCase(),
      },
    ],
    metadata: { slug: p.slug, segment: String(p.segment), delivery: p.delivery },
  }
}

async function createProduct(p) {
  const res = await fetch(`${BASE}/v1/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildPayload(p)),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json()
}

const ids = {}
console.log(
  `\nPolar ${MODE} · ${products.length} products · ${CREATE ? 'CREATE' : 'DRY RUN (pass --create to apply)'}\n`
)

for (const p of products) {
  const label = `[${p.slug}] $${p.priceUSD} — ${p.name}`
  if (!CREATE) {
    console.log('• ' + label)
    console.log('    ' + JSON.stringify(buildPayload(p)))
    continue
  }
  try {
    const created = await createProduct(p)
    ids[p.slug] = created.id ?? created.product_id ?? '(check response shape)'
    console.log(`✓ ${label}  →  ${ids[p.slug]}`)
  } catch (e) {
    console.error(`✗ ${label}  →  ${e.message}`)
  }
}

if (CREATE) {
  writeFileSync(join(__dir, 'polar-ids.json'), JSON.stringify(ids, null, 2))
  console.log(
    `\nWrote polar-ids.json (${Object.keys(ids).length}/${products.length}). Paste these into lib/store/products.ts as polarProductId.\n`
  )
} else {
  console.log('\nDry run complete. Re-run with --create once the payload matches the Polar API.\n')
}
