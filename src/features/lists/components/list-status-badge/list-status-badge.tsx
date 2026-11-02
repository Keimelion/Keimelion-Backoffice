'use client'

import { Archive, CircleDot, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ListStatus } from '@keimelion/api/shared/enums/list-status'
import { Badge } from '@/components/ui/badge'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

interface StatusVisuals {
  className: string
  Icon: LucideIcon
  messageId: MessageId
}

const STATUS_VISUALS: Record<ListStatus, StatusVisuals> = {
  active: {
    className: 'border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80',
    Icon: CircleDot,
    messageId: 'lists.status.active',
  },
  archived: {
    className: 'border-transparent bg-slate-500 text-white hover:bg-slate-500/80',
    Icon: Archive,
    messageId: 'lists.status.archived',
  },
  deleted: {
    className: 'border-transparent bg-rose-500 text-white hover:bg-rose-500/80',
    Icon: Trash2,
    messageId: 'lists.status.deleted',
  },
}

interface ListStatusBadgeProps {
  status: ListStatus
}

export function ListStatusBadge({ status }: ListStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  const { className, Icon, messageId } = STATUS_VISUALS[status]
  return (
    <Badge className={`${className} gap-1`}>
      <Icon className="h-3 w-3" />
      {t(messageId)}
    </Badge>
  )
}
