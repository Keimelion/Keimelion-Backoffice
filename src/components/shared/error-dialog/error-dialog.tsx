'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actions?: React.ReactNode
}

export function ErrorDialog({
  open,
  onOpenChange,
  title,
  description,
  actions,
}: ErrorDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {actions ? <DialogFooter>{actions}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}
