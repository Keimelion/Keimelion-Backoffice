'use client'

import type { FeedbackStatus } from '@keimelion/api/shared/enums/feedback-status'
import { Badge } from '@/components/ui/badge'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

const VARIANT_BY_STATUS: Record<FeedbackStatus, BadgeVariant> = {
  open: 'default',
  reviewed: 'secondary',
  closed: 'outline',
}

interface FeedbackStatusBadgeProps {
  status: FeedbackStatus
}

export function FeedbackStatusBadge({ status }: FeedbackStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  const label = t(`feedback.status.${status}` as MessageId)
  return <Badge variant={VARIANT_BY_STATUS[status]}>{label}</Badge>
}
