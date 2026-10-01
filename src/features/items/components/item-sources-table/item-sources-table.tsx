'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/shared/icon-button'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ItemSourcesTableProps {
  sources: ApiItemSource[]
  onEdit: (source: ApiItemSource) => void
  onDelete: (source: ApiItemSource) => void
}

function formatPrice(source: ApiItemSource, fallback: string): string {
  if (source.price === null) return fallback
  return `${source.price} ${source.currency}`
}

export function ItemSourcesTable({
  sources,
  onEdit,
  onDelete,
}: ItemSourcesTableProps): React.JSX.Element {
  const t = useTranslate()
  const canDelete = sources.length > 1

  if (sources.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        {t('items.sources.table.empty')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sources.map((source) => (
        <div
          key={source.id}
          className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
        >
          <div className="min-w-0 flex-1">
            {source.sourceUrl !== null ? (
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
              >
                <span className="truncate">{source.sourceUrl}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t('items.sources.table.no_url')}
              </span>
            )}
          </div>
          <span className="whitespace-nowrap text-sm">
            {formatPrice(source, t('items.sources.table.no_price'))}
          </span>
          <span className="w-32 truncate text-sm">
            {source.shop !== null ? (
              source.shop.name
            ) : (
              <span className="text-muted-foreground">
                {t('items.sources.table.no_shop')}
              </span>
            )}
          </span>
          <div className="flex gap-1">
            <IconButton
              label={t('common.actions.update', { name: source.sourceUrl ?? source.id })}
              onClick={() => { onEdit(source) }}
            >
              <Pencil />
            </IconButton>
            <IconButton
              label={
                canDelete
                  ? t('common.actions.delete', { name: source.sourceUrl ?? source.id })
                  : t('items.form.sources_remove_last_tooltip')
              }
              tone="destructive"
              disabled={!canDelete}
              onClick={() => { onDelete(source) }}
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  )
}
