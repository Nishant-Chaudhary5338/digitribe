# Store setup — Polar products

One-time setup to create the 27 store products in Polar (Merchant of Record). Prices are locked (DECISIONS D-17); to change one, edit `polar-products.json`.

## Steps

1. Create a Polar account/organization and a **sandbox** API token (`Settings → API`).
2. **Dry run** (prints the exact payloads, creates nothing):
   ```bash
   POLAR_ACCESS_TOKEN=polar_sandbox_xxx POLAR_MODE=sandbox node setup-polar.mjs
   ```
3. ⚠️ **Confirm the payload** in `setup-polar.mjs` → `buildPayload()` matches the current Polar API ([docs.polar.sh/api-reference](https://docs.polar.sh/api-reference)). Adjust field names if Polar's schema differs. (Some API versions need `POLAR_ORGANIZATION_ID`.)
4. **Create for real** (sandbox first, then production):
   ```bash
   POLAR_ACCESS_TOKEN=polar_sandbox_xxx POLAR_MODE=sandbox node setup-polar.mjs --create
   ```
5. The script writes **`polar-ids.json`** (`{ slug: productId }`). Paste each `productId` into `lib/store/products.ts` as the product's `polarProductId` (spine §3 / contracts §2).
6. Repeat step 4 with a **production** token + `POLAR_MODE=production` when going live. Set up the webhook (`order.paid`, `refund`) → `/api/store/webhook` with `POLAR_WEBHOOK_SECRET` (platform-spec §9).

## Files

- `polar-products.json` — the locked product registry seed (slug, name, price, segment, delivery).
- `setup-polar.mjs` — creates the products; `--create` to apply, dry-run by default.
- `polar-ids.json` — generated; the slug→Polar-ID map for the code registry.

> `delivery: "download-license"` products (Segment 5) are sold the same way in Polar; they differ only in fulfilment (license key + download, not an in-browser run) — see DECISIONS D-13/14/15.
