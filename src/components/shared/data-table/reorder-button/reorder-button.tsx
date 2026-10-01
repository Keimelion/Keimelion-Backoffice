'use client'

import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ReorderButtonProps {
  onClick: () => void
}

export function ReorderButton({ onClick }: ReorderButtonProps): React.JSX.Element {
  const t = useTranslate()
  return (
    <Button size="sm" variant="outline" onClick={onClick}>
      <ArrowUpDown className="mr-2 h-4 w-4" />
      {t('common.reorder.start_button')}
    </Button>
  )
}
