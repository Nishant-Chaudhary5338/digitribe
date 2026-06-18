import * as React from 'react'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'

export function NavDesktop() {
  return (
    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-8">
      <ul className="flex items-center gap-6 list-none" role="list">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[#c4c1b8] hover:text-[#f0ede5] transition-colors duration-150 text-sm font-medium"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Button variant="primary" size="sm" asChild>
        <Link href="/audit">Free Audit</Link>
      </Button>
    </nav>
  )
}
