'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DiscardChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  discardLabel: string
  keepLabel: string
  onDiscard: () => void
}

export function DiscardChangesDialog({
  open,
  onOpenChange,
  title,
  description,
  discardLabel,
  keepLabel,
  onDiscard,
}: DiscardChangesDialogProps): React.JSX.Element {
  function handleDiscard(): void {
    onOpenChange(false)
    onDiscard()
  }

  function handleKeep(): void {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleKeep}>
            {keepLabel}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDiscard}>
            {discardLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
