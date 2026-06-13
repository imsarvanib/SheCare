/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type ThemeName = 'blush' | 'rose' | 'dark'

interface ThemeContextValue {
  theme: ThemeName
  toggleTheme: () => void
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const KEY = 'shecare-theme'
const themeOrder: ThemeName[] = ['blush', 'rose', 'dark']

const isThemeName = (value: string | null): value is ThemeName => {
  return value === 'blush' || value === 'rose' || value === 'dark'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = localStorage.getItem(KEY)

    // Drop legacy light theme and invalid values back to blush.
    if (stored === 'light') {
      localStorage.removeItem(KEY)
      return 'blush'
    }

    return isThemeName(stored) ? stored : 'blush'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.className = theme
    localStorage.setItem(KEY, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () =>
        setTheme((prev) => {
          const index = themeOrder.indexOf(prev)
          return themeOrder[(index + 1) % themeOrder.length]
        }),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useThemeMode = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeProvider')
  }
  return context
}
