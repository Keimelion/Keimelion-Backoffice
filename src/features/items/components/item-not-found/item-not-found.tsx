import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/lib/i18n/use-translate'

export function ItemNotFound(): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 px-6 py-10 text-center">
      <div>
        <p className="text-lg font-semibold text-foreground">{t('items.detail.not_found.title')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('items.detail.not_found.description')}</p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/items">{t('items.detail.back_to_list')}</Link>
      </Button>
    </div>
  )
}
