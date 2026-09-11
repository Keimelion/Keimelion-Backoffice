'use client'

import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'
import { dismissAllPersistent } from '@/lib/notify'
import { AuthBootstrap } from '@/features/auth/components/auth-bootstrap'

interface ProvidersProps {
  children: React.ReactNode
}

const TOAST_DURATION_MS = 5000

function PersistentToastCleaner(): null {
  const pathname = usePathname()

  useEffect(() => {
    return () => {
      dismissAllPersistent()
    }
  }, [pathname])

  return null
}

export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={400}>
        <QueryClientProvider client={queryClient}>
          <PersistentToastCleaner />
          <AuthBootstrap>{children}</AuthBootstrap>
          <Toaster
            position="top-right"
            closeButton
            duration={TOAST_DURATION_MS}
          />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
