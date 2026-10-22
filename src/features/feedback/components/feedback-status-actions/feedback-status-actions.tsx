'use client'

import { Archive, Eye, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  FeedbackStatuses,
  type FeedbackStatus,
} from '@keimelion/api/shared/enums/feedback-status'
import { IconButton } from '@/components/shared/icon-button'
import type { ApiAdminFeedback } from '@/data-access/feedback/feedback.schemas'
import { useUpdateFeedbackStatus } from '@/features/feedback/hooks/use-update-feedback-status'
import { translate } from '@/lib/i18n/translate'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifyError, notifySuccess } from '@/lib/notify'

interface FeedbackStatusActionsProps {
  feedback: ApiAdminFeedback
}

interface StatusActionConfig {
  labelId: MessageId
  Icon: LucideIcon
}

const STATUS_ACTIONS: Record<FeedbackStatus, StatusActionConfig> = {
  open: { labelId: 'feedback.actions.mark_open', Icon: Undo2 },
  reviewed: { labelId: 'feedback.actions.mark_reviewed', Icon: Eye },
  closed: { labelId: 'feedback.actions.mark_closed', Icon: Archive },
}

const TRANSITIONS: Record<FeedbackStatus, readonly FeedbackStatus[]> = {
  open: [FeedbackStatuses.REVIEWED, FeedbackStatuses.CLOSED],
  reviewed: [FeedbackStatuses.OPEN, FeedbackStatuses.CLOSED],
  closed: [FeedbackStatuses.OPEN, FeedbackStatuses.REVIEWED],
}

export function FeedbackStatusActions({ feedback }: FeedbackStatusActionsProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useUpdateFeedbackStatus()
  const nextStatuses = TRANSITIONS[feedback.status]

  const handleSelect = (nextStatus: FeedbackStatus): void => {
    mutation.mutate(
      { id: feedback.id, status: nextStatus },
      {
        onSuccess: (updated) => {
          notifySuccess({
            title: translate('feedback.mutation.status_updated_toast', {
              title: updated.title,
              status: translate(`feedback.status.${updated.status}` as MessageId),
            }),
          })
        },
        onError: (error) => {
          notifyError(error)
        },
      },
    )
  }

  return (
    <div className="flex justify-end gap-1">
      {nextStatuses.map((nextStatus) => {
        const { labelId, Icon } = STATUS_ACTIONS[nextStatus]
        return (
          <IconButton
            key={nextStatus}
            label={t(labelId)}
            disabled={mutation.isPending}
            onClick={() => { handleSelect(nextStatus) }}
          >
            <Icon />
          </IconButton>
        )
      })}
    </div>
  )
}
