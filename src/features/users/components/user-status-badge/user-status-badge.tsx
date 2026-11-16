import type { UserStatus } from '@keimelion/sdk/enums'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslate } from '@/lib/i18n/use-translate'
import type { MessageId } from '@/lib/i18n/messages/en'

interface UserStatusBadgeProps {
  status: UserStatus
}

const STATUS_CLASSES: Record<UserStatus, string> = {
  active: 'border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80',
  inactive: 'border-transparent bg-slate-500 text-white hover:bg-slate-500/80',
  unverified: 'border-transparent bg-amber-500 text-white hover:bg-amber-500/80',
  invited: 'border-transparent bg-indigo-500 text-white hover:bg-indigo-500/80',
  banned: 'border-transparent bg-red-600 text-white hover:bg-red-600/80',
  pending_deletion: 'border-transparent bg-orange-500 text-white hover:bg-orange-500/80',
}

const STATUS_MESSAGE_IDS: Record<UserStatus, MessageId> = {
  active: 'users.status.active',
  inactive: 'users.status.inactive',
  unverified: 'users.status.unverified',
  invited: 'users.status.invited',
  banned: 'users.status.banned',
  pending_deletion: 'users.status.pending_deletion',
}

export function UserStatusBadge({ status }: UserStatusBadgeProps): React.JSX.Element {
  const t = useTranslate()
  return (
    <Badge className={cn('whitespace-nowrap', STATUS_CLASSES[status])}>
      {t(STATUS_MESSAGE_IDS[status])}
    </Badge>
  )
}
