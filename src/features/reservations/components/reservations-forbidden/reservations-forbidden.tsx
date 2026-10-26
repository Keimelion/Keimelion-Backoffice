'use client'

import { ShieldAlert } from 'lucide-react'
import { useTranslate } from '@/lib/i18n/use-translate'

export function ReservationsForbidden(): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/30 p-6">
      <ShieldAlert className="h-6 w-6 text-muted-foreground" />
      <p className="text-base font-semibold text-foreground">{t('reservations.forbidden.title')}</p>
      <p className="text-sm text-muted-foreground">{t('reservations.forbidden.description')}</p>
    </div>
  )
}
