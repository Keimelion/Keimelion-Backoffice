'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { I18nProvider } from '@/lib/i18n/i18n-provider'
import { queryClient } from '@/lib/query-client'
import { AuthBootstrap } from '@/features/auth/components/auth-bootstrap'

interface ProvidersProps {
  children: React.ReactNode
}

const TOAST_DURATION_MS = 5000

export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={400}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <AuthBootstrap>{children}</AuthBootstrap>
            <Toaster
              position="top-right"
              closeButton
              duration={TOAST_DURATION_MS}
            />
          </I18nProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
