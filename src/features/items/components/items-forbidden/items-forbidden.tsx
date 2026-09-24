import { useTranslate } from '@/lib/i18n/use-translate'

export function ItemsForbidden(): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-6 py-10 text-center">
      <p className="text-lg font-semibold text-foreground">{t('items.errors.forbidden.title')}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t('items.errors.forbidden.description')}</p>
    </div>
  )
}
