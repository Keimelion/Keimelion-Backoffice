'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { AuthBootstrap } from '@/features/auth/components/auth-bootstrap'

interface ProvidersProps {
  children: React.ReactNode
}

const TOAST_DURATION_MS = 5000

export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster
          position="top-right"
          closeButton
          duration={TOAST_DURATION_MS}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
