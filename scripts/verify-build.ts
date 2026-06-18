#!/usr/bin/env npx tsx
import { execSync } from 'child_process'
import { existsSync } from 'fs'

const checks: { name: string; fn: () => void }[] = [
  {
    name: 'TypeScript check',
    fn: () => execSync('pnpm typecheck', { stdio: 'inherit' }),
  },
  {
    name: 'ESLint',
    fn: () => execSync('pnpm lint', { stdio: 'inherit' }),
  },
  {
    name: 'Critical files exist',
    fn: () => {
      const required = [
        'app/layout.tsx',
        'app/page.tsx',
        'app/audit/page.tsx',
        'app/contact/page.tsx',
        'app/services/page.tsx',
        'lib/data/company.ts',
        'lib/data/founders.ts',
        'lib/data/services.ts',
        'components/sections/hero-home.tsx',
        'components/sections/audit-cal-embed.tsx',
        'components/forms/contact-form.tsx',
        'app/contact/_actions.ts',
      ]
      for (const f of required) {
        if (!existsSync(f)) throw new Error(`Missing required file: ${f}`)
      }
      console.log(`✓ All ${required.length} critical files present`)
    },
  },
]

let passed = 0
let failed = 0

for (const check of checks) {
  process.stdout.write(`Running: ${check.name}... `)
  try {
    check.fn()
    console.log('✓')
    passed++
  } catch (err) {
    console.log('✗')
    console.error(err instanceof Error ? err.message : err)
    failed++
  }
}

console.log(`\n${passed} passed · ${failed} failed`)
if (failed > 0) process.exit(1)
