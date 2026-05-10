'use client'

import { createContext, useContext } from 'react'

type Theme = 'studio' | 'garden' | 'neutral'

const ThemeContext = createContext<Theme>('neutral')

interface ThemeProviderProps {
  theme: Theme
  children: React.ReactNode
  className?: string
}

export function ThemeProvider({ theme, children, className }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      <div
        data-theme={theme === 'neutral' ? undefined : theme}
        className={className}
        style={{
          background: 'var(--color-bg-page)',
          color: 'var(--color-text-body)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
