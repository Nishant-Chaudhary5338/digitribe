import { ThemeProvider } from '@/components/theme-provider'
import { GardenHeader } from '@/components/layout/garden-header'
import { GardenFooter } from '@/components/layout/garden-footer'

export default function SaaSLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme="garden" className="flex flex-col min-h-full">
      <GardenHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <GardenFooter />
    </ThemeProvider>
  )
}
