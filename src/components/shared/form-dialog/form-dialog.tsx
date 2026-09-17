'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DiscardChangesDialog } from '@/components/shared/discard-changes-dialog'
import { useTranslate } from '@/lib/i18n/use-translate'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  isFormDirty: boolean
  children: React.ReactNode
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  isFormDirty,
  children,
}: FormDialogProps): React.JSX.Element {
  const t = useTranslate()
  const [isDiscardOpen, setIsDiscardOpen] = useState<boolean>(false)

  function handleDialogOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      onOpenChange(true)
      return
    }
    if (isFormDirty) {
      setIsDiscardOpen(true)
      return
    }
    onOpenChange(false)
  }

  function handleDiscard(): void {
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>

      <DiscardChangesDialog
        open={isDiscardOpen}
        onOpenChange={setIsDiscardOpen}
        title={t('common.discard_changes.title')}
        description={t('common.discard_changes.description')}
        discardLabel={t('common.discard_changes.discard')}
        keepLabel={t('common.discard_changes.keep')}
        onDiscard={handleDiscard}
      />
    </>
  )
}
