'use client'

import { CheckCircle2, Clock, PackageCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ItemStatus } from '@keimelion/api/shared/enums/item-status'
import { Badge } from '@/components/ui/badge'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

interface StatusVisuals {
  className: string
  Icon: LucideIcon
  messageId: MessageId
}

const STATUS_VISUALS: Record<ItemStatus, StatusVisuals> = {
  available: {
    className: 'border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80',
    Icon: CheckCircle2,
    messageId: 'lists.sub_table.item_status.available',
  },
  reserved: {
    className: 'border-transparent bg-amber-500 text-white hover:bg-amber-500/80',
    Icon: Clock,
    messageId: 'lists.sub_table.item_status.reserved',
  },
  purchased: {
    className: 'border-transparent bg-slate-500 text-white hover:bg-slate-500/80',
    Icon: PackageCheck,
    messageId: 'lists.sub_table.item_status.purchased',
  },
}

interface ItemStatusBadgeProps {
  status: ItemStatus
}

export function ItemStatusBadge({ status }: ItemStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  const { className, Icon, messageId } = STATUS_VISUALS[status]
  return (
    <Badge className={`${className} gap-1`}>
      <Icon className="h-3 w-3" />
      {t(messageId)}
    </Badge>
  )
}
