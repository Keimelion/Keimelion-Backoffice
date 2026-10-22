'use client'

import { MoreHorizontal } from 'lucide-react'
import {
  FeedbackStatuses,
  type FeedbackStatus,
} from '@keimelion/api/shared/enums/feedback-status'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ApiAdminFeedback } from '@/data-access/feedback/feedback.schemas'
import { useUpdateFeedbackStatus } from '@/features/feedback/hooks/use-update-feedback-status'
import { translate } from '@/lib/i18n/translate'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'
import { notifyError, notifySuccess } from '@/lib/notify'

interface FeedbackStatusActionsProps {
  feedback: ApiAdminFeedback
}

interface StatusAction {
  status: FeedbackStatus
  labelId: MessageId
}

const STATUS_ACTIONS: readonly StatusAction[] = [
  { status: FeedbackStatuses.OPEN, labelId: 'feedback.actions.mark_open' },
  { status: FeedbackStatuses.REVIEWED, labelId: 'feedback.actions.mark_reviewed' },
  { status: FeedbackStatuses.CLOSED, labelId: 'feedback.actions.mark_closed' },
]

export function FeedbackStatusActions({ feedback }: FeedbackStatusActionsProps): React.JSX.Element {
  const t = useTranslate()
  const mutation = useUpdateFeedbackStatus()

  const handleSelect = (nextStatus: FeedbackStatus): void => {
    if (nextStatus === feedback.status) return
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t('feedback.actions.change_status', { title: feedback.title })}
          disabled={mutation.isPending}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {STATUS_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action.status}
            disabled={action.status === feedback.status || mutation.isPending}
            onSelect={() => { handleSelect(action.status) }}
            className="cursor-pointer"
          >
            {t(action.labelId)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
