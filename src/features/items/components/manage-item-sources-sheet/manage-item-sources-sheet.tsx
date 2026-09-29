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
import type { ApiAdminItem } from '@/data-access/items/items.schemas'
import { CreateItemSourceDialog } from '@/features/items/components/create-item-source-dialog'
import { ItemSourcesTable } from '@/features/items/components/item-sources-table'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ManageItemSourcesSheetProps {
  item: ApiAdminItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageItemSourcesSheet({
  item,
  open,
  onOpenChange,
}: ManageItemSourcesSheetProps): React.JSX.Element {
  const t = useTranslate()
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false)
  const isLocked = item.deletedAt !== null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{t('items.sources_sheet.title', { name: item.name })}</SheetTitle>
            <SheetDescription>{t('items.sources_sheet.description')}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-4">
            {!isLocked ? (
              <div className="flex justify-end">
                <Button size="sm" onClick={() => { setIsAddOpen(true) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('items.sources_sheet.add_button')}
                </Button>
              </div>
            ) : null}
            <ItemSourcesTable itemId={item.id} isLocked={isLocked} />
          </div>
        </SheetContent>
      </Sheet>
      <CreateItemSourceDialog open={isAddOpen} onOpenChange={setIsAddOpen} itemId={item.id} />
    </>
  )
}
