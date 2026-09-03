import type { Metadata } from 'next'
import { QueryProvider } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Keimelion Backoffice',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
