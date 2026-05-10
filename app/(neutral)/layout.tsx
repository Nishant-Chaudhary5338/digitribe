import { NeutralHeader } from '@/components/layout/neutral-header'
import { Footer } from '@/components/layout/footer'

export default function NeutralLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <NeutralHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
