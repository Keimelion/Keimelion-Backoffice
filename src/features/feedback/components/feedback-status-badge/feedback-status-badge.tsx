'use client'

import { Archive, CircleDot, Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FeedbackStatus } from '@keimelion/api/shared/enums/feedback-status'
import { Badge } from '@/components/ui/badge'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

interface StatusVisuals {
  className: string
  Icon: LucideIcon
}

const STATUS_VISUALS: Record<FeedbackStatus, StatusVisuals> = {
  open: {
    className: 'border-transparent bg-amber-500 text-white hover:bg-amber-500/80',
    Icon: CircleDot,
  },
  reviewed: {
    className: 'border-transparent bg-sky-500 text-white hover:bg-sky-500/80',
    Icon: Eye,
  },
  closed: {
    className: 'border-transparent bg-slate-500 text-white hover:bg-slate-500/80',
    Icon: Archive,
  },
}

interface FeedbackStatusBadgeProps {
  status: FeedbackStatus
}

export function FeedbackStatusBadge({ status }: FeedbackStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  const label = t(`feedback.status.${status}` as MessageId)
  const { className, Icon } = STATUS_VISUALS[status]
  return (
    <Badge className={`${className} gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
