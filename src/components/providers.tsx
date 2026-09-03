'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

interface ProvidersProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: ProvidersProps): React.JSX.Element {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
