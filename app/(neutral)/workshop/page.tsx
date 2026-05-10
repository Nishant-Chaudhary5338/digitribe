import type { Metadata } from 'next'
import { WorkshopComingSoon } from '@/components/sections/workshop-coming-soon'
import { generatePageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMetadata({
  title: 'Workshop',
  description:
    'Digitribe is building a hands-on workshop for DTC and SaaS founders. Join the waitlist to be first to know when it launches.',
  path: '/workshop',
})

export default function WorkshopPage() {
  return <WorkshopComingSoon />
}
