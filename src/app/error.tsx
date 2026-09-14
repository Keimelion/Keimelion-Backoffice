'use client'

import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  const intl = useIntl()

  useEffect(() => {
    console.error('Route segment error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {intl.formatMessage({ id: 'error.title' })}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {intl.formatMessage({ id: 'error.description' })}
        </p>
      </div>
      <Button onClick={reset}>{intl.formatMessage({ id: 'error.try_again' })}</Button>
    </div>
  )
}
