'use client'

import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { IconButton } from '@/components/shared/icon-button'

interface ItemSourceEditorRowShellProps {
  title: string
  canRemove: boolean
  isPending: boolean
  removeLabel: string
  onRemove: () => void
  children: ReactNode
}

export function ItemSourceEditorRowShell({
  title,
  canRemove,
  isPending,
  removeLabel,
  onRemove,
  children,
}: ItemSourceEditorRowShellProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <IconButton
          label={removeLabel}
          tone="destructive"
          disabled={!canRemove || isPending}
          onClick={onRemove}
        >
          <Trash2 />
        </IconButton>
      </div>
      {children}
    </div>
  )
}
