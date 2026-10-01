'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/shared/icon-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ItemSourcesTableProps {
  sources: ApiItemSource[]
  onEdit: (source: ApiItemSource) => void
  onDelete: (source: ApiItemSource) => void
}

function formatPrice(source: ApiItemSource): string {
  if (source.price === null) return '—'
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
    <div className="overflow-hidden rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>{t('items.sources.table.column.url')}</TableHead>
            <TableHead className="w-24">{t('items.sources.table.column.price')}</TableHead>
            <TableHead className="w-32">{t('items.sources.table.column.shop')}</TableHead>
            <TableHead className="w-24 text-right">
              {t('items.sources.table.column.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.id} className="hover:bg-primary/10">
              <TableCell>
                {source.sourceUrl !== null ? (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                  >
                    <span className="max-w-xs truncate">{source.sourceUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t('items.sources.table.no_url')}
                  </span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">{formatPrice(source)}</TableCell>
              <TableCell>
                {source.shop !== null ? (
                  <span className="text-sm">{source.shop.name}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {t('items.sources.table.no_shop')}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
