# Digitribe Website

Marketing website for Digitribe — a senior 3-person agency building conversion-focused websites and running paid traffic for DTC and SaaS founders.

Live domain: **digitribe.world**

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | Motion (Framer Motion v12) |
| Fonts | Manrope (display) + Inter (body) via `next/font` |
| Email | Resend |
| Scheduling | Cal.com embed |
| Analytics | Plausible (privacy-first, no cookies) |
| Form persistence | Vercel KV |
| OG images | `@vercel/og` (edge runtime) |
| Testing | Playwright (E2E + a11y + visual) |
| Deploy | Vercel |

---

## Quick start

```bash
pnpm install
cp .env.example .env.local
# Fill in the env vars (see below)
pnpm dev
```

The dev server starts on `http://localhost:3000`.

---

## Environment variables

All variables live in `.env.local` for local dev and in the Vercel dashboard for production.

| Variable | Required | Description | How to get it |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Full canonical URL, no trailing slash. Example: `https://digitribe.world` | Set to your domain |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Yes | Domain registered in your Plausible account. Example: `digitribe.world` | From Plausible dashboard |
| `NEXT_PUBLIC_CAL_URL` | Yes | Full Cal.com booking link. Example: `https://cal.com/digitribe-audit/30min` | From Cal.com - create a new event type |
| `RESEND_API_KEY` | Yes | API key for sending transactional email. Format: `re_xxxxx` | From resend.com - API Keys section |
| `CONTACT_FROM_EMAIL` | Yes | "From" address for contact form emails. Must be verified in Resend. | Set to `hello@yourdomain.com` after verifying domain |
| `CONTACT_TO_EMAIL` | Yes | Where contact form submissions are delivered. | Your inbox address |
| `WORKSHOP_TO_EMAIL` | Yes | Where workshop sign-ups are delivered. | Your inbox address |
| `KV_URL` | Yes (prod) | Vercel KV connection string. Auto-set when a KV store is linked in the Vercel dashboard. | Storage tab in Vercel project |
| `KV_REST_API_URL` | Yes (prod) | Vercel KV REST endpoint. Auto-set by Vercel. | Storage tab in Vercel project |
| `KV_REST_API_TOKEN` | Yes (prod) | Vercel KV read-write token. Auto-set by Vercel. | Storage tab in Vercel project |
| `KV_REST_API_READ_ONLY_TOKEN` | Yes (prod) | Vercel KV read-only token. Auto-set by Vercel. | Storage tab in Vercel project |

For local development, `KV_*` vars can be left empty — form submissions will skip persistence and only send email.

---

## Swapping mock data

All content is centralized in `lib/data/`. You don't need to touch component files to update copy, people, or services.

### Logo

Replace the files in `public/brand/`:
- `logo.svg` — full horizontal lockup (dark background version)
- `logo-light.svg` — for light backgrounds
- `mark.svg` — icon-only mark (used for favicon and watermark)

### Founder photos

Replace the files in `public/founders/`. File names must match the `photo` field in `lib/data/founders.ts`.
- Format: JPEG or WebP
- Minimum size: 600x600px, square crop
- Recommended: 800x800px for sharp display at 2x on retina

### Company info

Edit `lib/data/company.ts`:
```ts
export const company = {
  name: 'Digitribe',
  email: 'hello@digitribe.world',   // confirm before launch
  social: {
    linkedin: 'https://linkedin.com/company/...',
    twitter:  'https://twitter.com/...',
    instagram: 'https://instagram.com/...',
  },
  calUrl: 'https://cal.com/digitribe-audit/30min', // or use NEXT_PUBLIC_CAL_URL env var
  // ...
}
```

### Founders

Edit `lib/data/founders.ts`. Each entry has:
- `name`, `slug`, `role`, `bio`, `oneLiner`
- `photo` — path relative to `/public`
- `stack` — array of skill tags shown on the about page
- `socials` — array of `{ label, url }` links

### Services

Edit `lib/data/services.ts`. Controls the pricing tables and schema markup.

### Packages

Edit `lib/data/packages.ts`. Controls the bundled packages grid on the services page.

---

## Project structure

```
app/                   Next.js App Router pages and layouts
  layout.tsx           Root layout — fonts, header, footer, cookie banner
  page.tsx             Home page
  opengraph-image.tsx  Dynamic OG image (edge runtime)
  /about/page.tsx
  /services/page.tsx
  /contact/page.tsx
  /audit/page.tsx
  /workshop/page.tsx

components/
  brand/               Mark, Wordmark, Logo
  layout/              Header, Footer, Container, Nav (desktop + mobile)
  primitives/          Eyebrow, Headline, BodyText, Divider, Badge, Reveal, Card
  sections/            All page sections (HeroHome, TrustStrip, ProcessSteps, ...)
  ui/                  Button, Input, Textarea, Label, Select, Checkbox
  analytics/           Plausible script component
  consent/             Cookie banner

lib/
  data/                company.ts, founders.ts, services.ts, packages.ts, faqs.ts
  utils/               cn.ts, constants.ts, format.ts
  schema/              JSON-LD helpers (Organization, Person, Service, FAQ, ...)
  seo/                 generatePageMetadata helper
  validation/          Zod schemas for contact and workshop forms
  email/               Resend client and send helpers
  kv/                  Vercel KV store wrapper
  analytics/           Event tracking helpers

tests/
  fixtures/            breakpoints.ts
  e2e/                 navigation, home, audit, contact, services, about, workshop
  a11y/                accessibility.spec.ts (axe-core on all pages)
  visual/              home.visual.spec.ts + screenshots/
```

---

## Deploy to Vercel

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. Open the [Vercel dashboard](https://vercel.com) and click **Add New Project**.
3. Import the repository. Vercel detects Next.js automatically.
4. Add all variables from `.env.example` in the **Environment Variables** tab.
5. Connect a KV store: go to the **Storage** tab in the project, click **Create KV Store**, then link it. Vercel injects the `KV_*` variables automatically.
6. Verify your sending domain in the [Resend dashboard](https://resend.com) and add the required DNS records.
7. Connect the `digitribe.world` domain in **Settings - Domains**.
8. Deploy. Vercel runs `pnpm build` automatically.

Every push to `main` triggers a production deployment. Pull request branches get preview URLs.

---

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm start` | Start the production server locally |
| `pnpm typecheck` | Run TypeScript compiler check (no emit) |
| `pnpm lint` | Run ESLint across all files |
| `pnpm test:e2e` | Run all Playwright E2E tests |
| `pnpm test:a11y` | Run accessibility tests (axe-core) |
| `pnpm test:visual` | Take visual snapshots at all breakpoints |
| `pnpm test` | Run all test suites |

Playwright requires a running server. The config uses `webServer` to start one automatically. To run tests against an already-running server, set `PLAYWRIGHT_REUSE_SERVER=1`.

---

## TODOs before launch

- [ ] Replace mock logo files in `public/brand/` with final SVGs
- [ ] Add real founder photos in `public/founders/` (square JPEGs, min 600x600px)
- [ ] Update any placeholder names in `lib/data/founders.ts` (e.g. Manu's full surname)
- [ ] Set the real Cal.com booking URL as `NEXT_PUBLIC_CAL_URL` in Vercel env vars
- [ ] Verify the sending domain in Resend and add the required DNS TXT/CNAME records
- [ ] Update real social URLs in `lib/data/company.ts`
- [ ] Add the site to your Plausible account and set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] Have a lawyer review `content/legal/privacy.mdx` and `terms.mdx` before publishing
- [ ] Connect `digitribe.world` in the Vercel Domains tab and confirm DNS propagation
- [ ] Set up a Vercel KV store and link it to the project
- [ ] Run Lighthouse on the live Netlify/Vercel preview URL and confirm Core Web Vitals pass
- [ ] Add site to Google Search Console and submit the sitemap (`/sitemap.xml`)
- [ ] Configure Plausible goals for `/audit` page views and form submissions
