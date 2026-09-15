'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  const t = useTranslate()

  useEffect(() => {
    console.error('Route segment error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('error.title')}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t('error.description')}</p>
      </div>
      <Button onClick={reset}>{t('error.try_again')}</Button>
    </div>
  )
}
