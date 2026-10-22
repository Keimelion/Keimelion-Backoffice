'use client'

import type { FeedbackStatus } from '@keimelion/api/shared/enums/feedback-status'
import { Badge } from '@/components/ui/badge'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

const STATUS_CLASSES: Record<FeedbackStatus, string> = {
  open: 'border-transparent bg-amber-500 text-white hover:bg-amber-500/80',
  reviewed: 'border-transparent bg-sky-500 text-white hover:bg-sky-500/80',
  closed: 'border-transparent bg-slate-500 text-white hover:bg-slate-500/80',
}

interface FeedbackStatusBadgeProps {
  status: FeedbackStatus
}

export function FeedbackStatusBadge({ status }: FeedbackStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  const label = t(`feedback.status.${status}` as MessageId)
  return <Badge className={STATUS_CLASSES[status]}>{label}</Badge>
}
