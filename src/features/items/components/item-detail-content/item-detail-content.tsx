'use client'

import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getStoredUser, isAdmin } from '@/data-access/_shared/auth-storage'
import { formatDate } from '@/lib/format-date'
import { isUuid } from '@/lib/uuid'
import { useTranslate } from '@/lib/i18n/use-translate'
import { useItem } from '@/features/items/hooks/use-items'
import { CreateItemSourceDialog } from '@/features/items/components/create-item-source-dialog'
import { EditItemDialog } from '@/features/items/components/edit-item-dialog'
import { ItemNotFound } from '@/features/items/components/item-not-found'
import { ItemsForbidden } from '@/features/items/components/items-forbidden'
import { ItemSourcesTable } from '@/features/items/components/item-sources-table'
import { ItemThumbnail } from '@/features/items/components/item-thumbnail'
import { ModerationStatusBadge } from '@/features/items/components/moderation-status-badge'

interface ItemDetailContentProps {
  itemId: string
}

export function ItemDetailContent({ itemId }: ItemDetailContentProps): React.JSX.Element {
  const t = useTranslate()
  const user = getStoredUser()
  const isCurrentUserAdmin = user !== null && isAdmin(user.role)
  const isValidId = isUuid(itemId)

  const itemQuery = useItem(itemId, { enabled: isCurrentUserAdmin && isValidId })
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [isAddSourceOpen, setIsAddSourceOpen] = useState<boolean>(false)

  if (!isCurrentUserAdmin) return <ItemsForbidden />
  if (!isValidId) return <ItemNotFound />

  if (itemQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (itemQuery.isError || itemQuery.data === undefined) {
    return <ItemNotFound />
  }

  const item = itemQuery.data
  const isLocked = item.deletedAt !== null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
        <div className="flex items-center gap-4">
          <ItemThumbnail imageUrl={item.imageUrl} name={item.name} className="h-16 w-16" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
              <ModerationStatusBadge status={item.moderationStatus} />
              {isLocked ? <Badge variant="secondary">{t('items.detail.deleted_badge')}</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('items.detail.created_at_label', { date: formatDate(item.createdAt) })}
            </p>
            {item.deletedAt !== null ? (
              <p className="text-sm text-muted-foreground">
                {t('items.detail.deleted_at_label', { date: formatDate(item.deletedAt) })}
              </p>
            ) : null}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => { setIsEditOpen(true) }}>
          <Pencil className="mr-2 h-4 w-4" />
          {t('common.actions.update', { name: item.name })}
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{t('items.detail.sources_title')}</h3>
          {isLocked ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button size="sm" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('items.detail.add_source_button')}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('items.detail.locked_tooltip')}</TooltipContent>
            </Tooltip>
          ) : (
            <Button size="sm" onClick={() => { setIsAddSourceOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('items.detail.add_source_button')}
            </Button>
          )}
        </div>
        <ItemSourcesTable itemId={item.id} isLocked={isLocked} />
      </div>

      <EditItemDialog open={isEditOpen} onOpenChange={setIsEditOpen} item={item} />
      <CreateItemSourceDialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen} itemId={item.id} />
    </div>
  )
}
