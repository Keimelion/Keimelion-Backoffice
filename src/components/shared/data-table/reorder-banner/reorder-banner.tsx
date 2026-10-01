'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ReorderBannerProps {
  onExit: () => void
}

export function ReorderBanner({ onExit }: ReorderBannerProps): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-foreground">{t('common.reorder.banner')}</p>
      <div className="ml-auto">
        <Button size="sm" variant="outline" onClick={onExit}>
          <Check className="mr-2 h-4 w-4" />
          {t('common.reorder.end_button')}
        </Button>
      </div>
    </div>
  )
}
