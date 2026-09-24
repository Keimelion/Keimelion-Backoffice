import { ModerationStatuses } from '@keimelion/api/shared/enums/moderation-status'
import type { ModerationStatus } from '@keimelion/api/shared/enums/moderation-status'
import { Badge } from '@/components/ui/badge'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

interface ModerationStatusBadgeProps {
  status: ModerationStatus
}

const MODERATION_STATUS_CLASSES: Record<ModerationStatus, string> = {
  [ModerationStatuses.APPROVED]: 'border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80',
  [ModerationStatuses.PENDING]: 'border-transparent bg-amber-500 text-white hover:bg-amber-500/80',
  [ModerationStatuses.REJECTED]: 'border-transparent bg-red-500 text-white hover:bg-red-500/80',
}

const MODERATION_STATUS_MESSAGE_IDS: Record<ModerationStatus, MessageId> = {
  [ModerationStatuses.APPROVED]: 'items.moderation_status.approved',
  [ModerationStatuses.PENDING]: 'items.moderation_status.pending',
  [ModerationStatuses.REJECTED]: 'items.moderation_status.rejected',
}

export function ModerationStatusBadge({ status }: ModerationStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  return <Badge className={MODERATION_STATUS_CLASSES[status]}>{t(MODERATION_STATUS_MESSAGE_IDS[status])}</Badge>
}
