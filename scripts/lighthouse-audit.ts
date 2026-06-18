#!/usr/bin/env npx tsx
// Lighthouse audit runner
// Usage: pnpm tsx scripts/lighthouse-audit.ts
// Requires: pnpm add -D lighthouse (run separately)

import { execSync } from 'child_process'

const BASE_URL = process.env['LIGHTHOUSE_URL'] ?? 'http://localhost:3000'

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/about', name: 'About' },
  { path: '/audit', name: 'Audit' },
  { path: '/contact', name: 'Contact' },
]

const THRESHOLDS = {
  performance: 95,
  accessibility: 95,
  'best-practices': 95,
  seo: 100,
}

console.log(`Running Lighthouse audits on ${BASE_URL}\n`)

for (const page of PAGES) {
  console.log(`Auditing ${page.name} (${page.path})...`)
  try {
    execSync(
      `npx lighthouse ${BASE_URL}${page.path} ` +
        `--only-categories=performance,accessibility,best-practices,seo ` +
        `--output=json ` +
        `--output-path=tests/lighthouse/reports/${page.name.toLowerCase()}.json ` +
        `--chrome-flags="--headless" ` +
        `--quiet`,
      { stdio: 'pipe' },
    )
    console.log(
      `  ✓ Report saved to tests/lighthouse/reports/${page.name.toLowerCase()}.json`,
    )
  } catch {
    console.log(`  ✗ Audit failed (is Chrome available and server running?)`)
  }
}

console.log('\nThresholds to meet:')
for (const [cat, score] of Object.entries(THRESHOLDS)) {
  console.log(`  ${cat}: ≥${score}`)
}
