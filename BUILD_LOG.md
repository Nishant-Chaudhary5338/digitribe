# BUILD LOG — Digitribe Website

## Project

- **Repo:** `~/Desktop/digitribe-web/`
- **Domain:** `https://digitribe.world`
- **Build started:** 2026-05-09
- **Brief version:** v1.0 (Claude Code Build Brief)

---

## Decisions

### Stack

- Used Next.js 16.2.6 (latest 15.x-era App Router release available via create-next-app)
- Tailwind v4 CSS-first `@theme` config — no tailwind.config.ts for tokens
- motion v12 (latest at build time) — API identical to v11 spec in brief
- zod v4 — breaking changes from v3; schemas use `z.string().min()` syntax unchanged
- `@vercel/kv` v3 (deprecated notice, but still functional; migrate to `@vercel/kv` from `ioredis` if Vercel updates SDK)
- React Email deprecated individual packages — using `@react-email/components` bundle instead

### TypeScript

- `noUncheckedIndexedAccess: true` enabled — all array/object access uses optional chaining

### Fonts

- Manrope and Inter sourced from Google Fonts and self-hosted as woff2 files
- TODO: Download actual woff2 files to `public/fonts/` — currently using CSS @font-face with fallback

---

## TODOs for Nishant

- [ ] **Logo files** — Replace mock SVG in `public/brand/` with the actual logo files (logo.svg, logo-mono-light.svg, logo-mono-dark.svg, mark.svg)
- [ ] **Founder photos** — Add real photos as `public/founders/nishant.jpg`, `manu.jpg` (square crop, min 600×600px)
- [ ] **Manu's full name** — Update `lib/data/founders.ts` with Manu's full name
- [ ] **Cal.com URL** — Set real Cal.com booking link in `NEXT_PUBLIC_CAL_URL` env var
- [ ] **Resend API key** — Add real key to Vercel env vars after deploying
- [ ] **Social links** — Update `lib/data/company.ts` with real LinkedIn, Twitter, Instagram URLs
- [ ] **Legal pages** — `content/legal/privacy.mdx` and `terms.mdx` have TODO markers — get lawyer review before launch
- [ ] **Font files** — Download Manrope 700/800 and Inter 400/500 woff2 files to `public/fonts/`
- [ ] **Vercel KV** — Connect a KV store in Vercel dashboard; env vars auto-populate
- [ ] **Plausible** — Add `digitribe.world` to your Plausible account
- [ ] **DNS** — Point `digitribe.world` to Vercel; set up www → non-www redirect; add Resend DNS records for email sending
- [ ] **Google Search Console** — Submit sitemap after launch

---

## Issues Found & Fixed

_(populated during build)_
