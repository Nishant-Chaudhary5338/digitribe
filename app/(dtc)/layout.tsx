import { ThemeProvider } from '@/components/theme-provider'
import { StudioHeader } from '@/components/layout/studio-header'
import { StudioFooter } from '@/components/layout/studio-footer'

export default function DTCLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme="studio" className="flex flex-col min-h-full">
      <StudioHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <StudioFooter />
    </ThemeProvider>
  )
}
