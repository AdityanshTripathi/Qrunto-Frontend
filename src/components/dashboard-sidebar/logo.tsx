import { useTheme } from '@/context/ThemeContext'

export function MedeskLogo({ className }: { className?: string }) {
  const { theme } = useTheme()
  const logoSrc = theme === 'light' ? '/logo-black.png' : '/logo-white.png'
  return (
    <img
      src={logoSrc}
      alt="Ordio Logo"
      className={className || "h-7 w-auto shrink-0 object-contain"}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/favicon.png'
      }}
    />
  )
}
