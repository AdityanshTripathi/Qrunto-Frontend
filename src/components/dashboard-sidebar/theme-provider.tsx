import { useTheme as useAppTheme } from '@/context/ThemeContext'

export function useTheme() {
  const { theme, toggleTheme } = useAppTheme()
  return {
    resolvedTheme: theme,
    setTheme: (newTheme: 'light' | 'dark') => {
      if (theme !== newTheme) {
        toggleTheme()
      }
    }
  }
}
