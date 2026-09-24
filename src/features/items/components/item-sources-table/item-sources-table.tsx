'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconButton } from '@/components/shared/icon-button'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'
import type { ApiShop } from '@/data-access/shops/shops.schemas'
import { EditItemSourceDialog } from '@/features/items/components/edit-item-source-dialog'
import { DeleteItemSourceDialog } from '@/features/items/components/delete-item-source-dialog'
import { useItemSources } from '@/features/items/hooks/use-item-sources'
import { useUpdateItemSource } from '@/features/items/hooks/use-item-source-mutations'
import { useShops } from '@/features/shops/hooks/use-shops'
import { useTranslate } from '@/lib/i18n/use-translate'
import { isHttpsUrl } from '@/lib/url'

const SKELETON_ROW_COUNT = 3

interface ItemSourcesTableProps {
  itemId: string
  isLocked: boolean
}

function resolveShopName(shopId: string | null, shops: ApiShop[]): string | null {
  if (shopId === null) return null
  return shops.find((shop) => shop.id === shopId)?.name ?? null
}

export function ItemSourcesTable({ itemId, isLocked }: ItemSourcesTableProps): React.JSX.Element {
  const t = useTranslate()
  const sourcesQuery = useItemSources(itemId)
  const shopsQuery = useShops()
  const setPrimaryMutation = useUpdateItemSource()
  const [editTarget, setEditTarget] = useState<ApiItemSource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiItemSource | null>(null)

  const shops = shopsQuery.data ?? []
  const sources = sourcesQuery.data ?? []
  const currentPrimary = sources.find((source) => source.isPrimary)

  function handleSetPrimary(nextSourceId: string): void {
    const nextPrimary = sources.find((source) => source.id === nextSourceId)
    if (!nextPrimary || nextPrimary.isPrimary) return
    setPrimaryMutation.mutate({
      itemId,
      sourceId: nextPrimary.id,
      input: {
        shopId: nextPrimary.shopId,
        sourceUrl: nextPrimary.sourceUrl,
        price: nextPrimary.price,
        currency: nextPrimary.currency,
        isPrimary: true,
      },
    })
  }

  if (sourcesQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (sourcesQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-6 py-4">
        <p className="text-sm font-medium text-destructive">{sourcesQuery.error.message}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => { void sourcesQuery.refetch() }}>
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  return (
    <>
      <RadioGroup
        value={currentPrimary?.id ?? null}
        onValueChange={handleSetPrimary}
        disabled={isLocked || setPrimaryMutation.isPending}
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14">{t('items.sources_table.column.is_primary')}</TableHead>
                <TableHead>{t('items.sources_table.column.source_url')}</TableHead>
                <TableHead>{t('items.sources_table.column.price')}</TableHead>
                <TableHead>{t('items.sources_table.column.shop')}</TableHead>
                <TableHead className="w-24 text-right">{t('items.sources_table.column.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    {t('items.sources_table.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => {
                  const shopName = resolveShopName(source.shopId, shops)
                  const actionsLabel = isLocked ? t('items.detail.locked_tooltip') : null
                  const rawSourceUrl = source.sourceUrl
                  return (
                    <TableRow key={source.id}>
                      <TableCell>
                        <RadioGroupItem
                          value={source.id}
                          aria-label={t('items.sources_table.primary_radio_label', {
                            url: rawSourceUrl ?? t('items.sources_table.no_url'),
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        {rawSourceUrl === null ? (
                          t('items.sources_table.no_url')
                        ) : isHttpsUrl(rawSourceUrl) ? (
                          <a
                            href={rawSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {rawSourceUrl}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{rawSourceUrl}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {source.price !== null
                          ? `${source.price} ${source.currency}`
                          : t('items.sources_table.no_price')}
                      </TableCell>
                      <TableCell>{shopName ?? t('items.sources_table.no_shop')}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <IconButton
                            label={actionsLabel ?? t('common.actions.update', { name: source.sourceUrl ?? source.id })}
                            disabled={isLocked}
                            onClick={() => { setEditTarget(source) }}
                          >
                            <Pencil />
                          </IconButton>
                          <IconButton
                            label={actionsLabel ?? t('common.actions.delete', { name: source.sourceUrl ?? source.id })}
                            tone="destructive"
                            disabled={isLocked}
                            onClick={() => { setDeleteTarget(source) }}
                          >
                            <Trash2 />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </RadioGroup>

      {editTarget !== null ? (
        <EditItemSourceDialog
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null)
          }}
          itemId={itemId}
          source={editTarget}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteItemSourceDialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
          itemId={itemId}
          sourceId={deleteTarget.id}
        />
      ) : null}
    </>
  )
}
