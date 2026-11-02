'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ApiCategory } from '@/data-access/categories/categories.schemas'
import { resolveCategoryName } from '@/features/categories/lib/resolve-category-name'
import { useLocaleStore } from '@/lib/i18n/locale-store'
import { useTranslate } from '@/lib/i18n/use-translate'

interface MoveCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ApiCategory
  currentParentName: string | null
  newParentName: string | null
  onConfirm: () => Promise<void>
}

export function MoveCategoryDialog({
  open,
  onOpenChange,
  category,
  currentParentName,
  newParentName,
  onConfirm,
}: MoveCategoryDialogProps): React.JSX.Element {
  const t = useTranslate()
  const locale = useLocaleStore((state) => state.locale)
  const [isPending, setIsPending] = useState<boolean>(false)

  const currentLocationLabel = currentParentName ?? t('categories.move_dialog.root_label')
  const newLocationLabel = newParentName ?? t('categories.move_dialog.root_label')
  const categoryName = resolveCategoryName(category, locale)

  async function handleConfirm(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault()
    setIsPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // keep dialog open; caller has already surfaced the error
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('categories.move_dialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('categories.move_dialog.description', {
              name: categoryName,
              from: currentLocationLabel,
              to: newLocationLabel,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('categories.move_dialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => { void handleConfirm(event) }}
            disabled={isPending}
          >
            {t('categories.move_dialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
