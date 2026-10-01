'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import type { ApiItemSource } from '@/data-access/items/item-sources.schemas'
import { useAdminItem } from '@/features/items/hooks/use-admin-items'
import { CreateItemSourceDialog } from '@/features/items/components/create-item-source-dialog'
import { EditItemSourceDialog } from '@/features/items/components/edit-item-source-dialog'
import { DeleteItemSourceDialog } from '@/features/items/components/delete-item-source-dialog'
import { ItemSourcesTable } from '@/features/items/components/item-sources-table'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ManageItemSourcesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ApiAdminItem
}

export function ManageItemSourcesSheet({
  open,
  onOpenChange,
  item,
}: ManageItemSourcesSheetProps): React.JSX.Element {
  const t = useTranslate()
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false)
  const [editTarget, setEditTarget] = useState<ApiItemSource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiItemSource | null>(null)

  const itemQuery = useAdminItem(open ? item.id : null)
  const sources = itemQuery.data?.sources ?? item.sources

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{t('items.sources.sheet.title', { name: item.name })}</SheetTitle>
            <SheetDescription>{t('items.sources.sheet.description')}</SheetDescription>
          </SheetHeader>

          <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => { setIsCreateOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('items.sources.sheet.add_button')}
            </Button>
          </div>

          {itemQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
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
        </SheetContent>
      </Sheet>

      <CreateItemSourceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        itemId={item.id}
      />

      {editTarget !== null ? (
        <EditItemSourceDialog
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditTarget(null)
          }}
          itemId={item.id}
          source={editTarget}
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
