'use client'

import { FEEDBACK_STATUS_VALUES } from '@keimelion/sdk/enums'
import type { FeedbackStatus } from '@keimelion/sdk/enums'
import { BadgeToggleFilter } from '@/components/shared/badge-toggle-filter'
import { FeedbackStatusBadge } from '@/features/feedback/components/feedback-status-badge'
import { useTranslate } from '@/lib/i18n/use-translate'

export const STATUS_PARAM = 'status'

export function FeedbackStatusFilter(): React.JSX.Element {
  const t = useTranslate()
  return (
    <BadgeToggleFilter<FeedbackStatus>
      paramName={STATUS_PARAM}
      label={t('feedback.filters.status_label')}
      values={FEEDBACK_STATUS_VALUES}
      renderBadge={(status) => <FeedbackStatusBadge status={status} />}
    />
  )
}
