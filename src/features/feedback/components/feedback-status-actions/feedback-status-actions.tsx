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
  className: string
}

const STATUS_ACTIONS: Record<FeedbackStatus, StatusActionConfig> = {
  open: {
    labelId: 'feedback.actions.mark_open',
    Icon: Undo2,
    className:
      'text-amber-600/80 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400/90 dark:hover:bg-amber-400/10 dark:hover:text-amber-400',
  },
  reviewed: {
    labelId: 'feedback.actions.mark_reviewed',
    Icon: Eye,
    className:
      'text-sky-600/80 hover:bg-sky-500/10 hover:text-sky-600 dark:text-sky-400/90 dark:hover:bg-sky-400/10 dark:hover:text-sky-400',
  },
  closed: {
    labelId: 'feedback.actions.mark_closed',
    Icon: Archive,
    className:
      'text-slate-600/80 hover:bg-slate-500/10 hover:text-slate-600 dark:text-slate-400/90 dark:hover:bg-slate-400/10 dark:hover:text-slate-400',
  },
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
        const { labelId, Icon, className } = STATUS_ACTIONS[nextStatus]
        return (
          <IconButton
            key={nextStatus}
            label={t(labelId)}
            disabled={mutation.isPending}
            onClick={() => { handleSelect(nextStatus) }}
            className={className}
          >
            <Icon />
          </IconButton>
        )
      })}
    </div>
  )
}
