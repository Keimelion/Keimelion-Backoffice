'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/shared/icon-button'
import type { ItemSourceInput, ItemSourceShop } from '@/data-access/items/item-sources.schemas'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ItemSourceSummaryProps {
  values: ItemSourceInput
  shopName: string | null
  canRemove: boolean
  isPending?: boolean
  editLabel: string
  removeLabel: string
  removeDisabledLabel?: string
  onEdit: () => void
  onRemove: () => void
}

export function ItemSourceSummary({
  values,
  shopName,
  canRemove,
  isPending = false,
  editLabel,
  removeLabel,
  removeDisabledLabel,
  onEdit,
  onRemove,
}: ItemSourceSummaryProps): React.JSX.Element {
  const t = useTranslate()
  const priceLabel =
    values.price !== null
      ? `${values.price} ${values.currency}`
      : t('items.sources.no_price')
  const effectiveRemoveLabel = canRemove ? removeLabel : (removeDisabledLabel ?? removeLabel)

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
      <div className="min-w-0 flex-1">
        {values.sourceUrl !== null ? (
          <a
            href={values.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
          >
            <span className="truncate">{values.sourceUrl}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">
            {t('items.sources.no_url')}
          </span>
        )}
      </div>
      <span className="whitespace-nowrap text-sm">{priceLabel}</span>
      <span className="w-32 truncate text-sm">
        {shopName ?? (
          <span className="text-muted-foreground">
            {t('items.sources.no_shop')}
          </span>
        )}
      </span>
      <div className="flex gap-1">
        <IconButton label={editLabel} disabled={isPending} onClick={onEdit}>
          <Pencil />
        </IconButton>
        <IconButton
          label={effectiveRemoveLabel}
          tone="destructive"
          disabled={!canRemove || isPending}
          onClick={onRemove}
        >
          <Trash2 />
        </IconButton>
      </div>
    </div>
  )
}

export function resolveShopName(
  shopId: string | null,
  shops: readonly ItemSourceShop[],
): string | null {
  if (shopId === null) return null
  return shops.find((shop) => shop.id === shopId)?.name ?? null
}
