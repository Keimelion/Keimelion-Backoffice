'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'
import { useAdminItem } from '@/features/items/hooks/use-admin-items'
import { CreateItemSourceDialog } from '@/features/items/components/create-item-source-dialog'
import { EditItemSourceDialog } from '@/features/items/components/edit-item-source-dialog'
import { DeleteItemSourceDialog } from '@/features/items/components/delete-item-source-dialog'
import { ItemSourcesTable } from '@/features/items/components/item-sources-table'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ItemSourcesManagerProps {
  item: ApiAdminItem
  enabled?: boolean
}

export function ItemSourcesManager({
  item,
  enabled = true,
}: ItemSourcesManagerProps): React.JSX.Element {
  const t = useTranslate()
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<ApiItemSource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiItemSource | null>(null)

  const itemQuery = useAdminItem(enabled ? item.id : null)
  const sources = itemQuery.data?.sources ?? item.sources

  const takenShopIdsForCreate = useMemo<ReadonlySet<string>>(() => {
    return new Set(
      sources
        .map((source) => source.shopId)
        .filter((shopId): shopId is string => shopId !== null),
    )
  }, [sources])

  const takenShopIdsForEdit = useMemo<ReadonlySet<string>>(() => {
    if (editTarget === null) return new Set<string>()
    return new Set(
      sources
        .filter((source) => source.id !== editTarget.id)
        .map((source) => source.shopId)
        .filter((shopId): shopId is string => shopId !== null),
    )
  }, [editTarget, sources])

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end">
          <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            {t('items.sources.add_button')}
          </Button>
        </div>

        {itemQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <ItemSourcesTable
            sources={sources}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <CreateItemSourceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        itemId={item.id}
        disabledShopIds={takenShopIdsForCreate}
      />

      {editTarget !== null ? (
        <EditItemSourceDialog
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditTarget(null)
          }}
          itemId={item.id}
          source={editTarget}
          disabledShopIds={takenShopIdsForEdit}
        />
      ) : null}

      {deleteTarget !== null ? (
        <DeleteItemSourceDialog
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDeleteTarget(null)
          }}
          itemId={item.id}
          source={deleteTarget}
        />
      ) : null}
    </>
  )
}
