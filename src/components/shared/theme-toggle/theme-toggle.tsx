'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { flushSync } from 'react-dom'
import { useIntl } from 'react-intl'
import { Button } from '@/components/ui/button'

export function ThemeToggle(): React.JSX.Element {
  const { resolvedTheme, setTheme } = useTheme()
  const intl = useIntl()

  const handleToggle = (): void => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    const documentWithViewTransition = document as unknown as {
      startViewTransition?: (callback: () => void) => unknown
    }

    if (!documentWithViewTransition.startViewTransition) {
      setTheme(nextTheme)
      return
    }

    documentWithViewTransition.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme)
      })
    })
  }

  const label = intl.formatMessage({ id: 'common.theme_toggle.toggle' })

  return (
    <Button variant="outline" size="icon" onClick={handleToggle} aria-label={label}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all duration-500 ease-out dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all duration-500 ease-out dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{label}</span>
    </Button>
  )
}
