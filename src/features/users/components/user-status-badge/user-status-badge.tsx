import { useIntl } from 'react-intl'
import { Badge } from '@/components/ui/badge'

interface UserStatusBadgeProps {
  deletedAt: string | null
  bannedAt: string | null
}

type UserStatus = 'active' | 'deleted' | 'banned'

const STATUS_CLASSES: Record<UserStatus, string> = {
  active: 'border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80',
  deleted: 'border-transparent bg-slate-400 text-white hover:bg-slate-400/80',
  banned: 'border-transparent bg-red-500 text-white hover:bg-red-500/80',
}

const STATUS_MESSAGE_IDS: Record<UserStatus, string> = {
  active: 'users.status.active',
  deleted: 'users.status.deleted',
  banned: 'users.status.banned',
}

function resolveUserStatus(deletedAt: string | null, bannedAt: string | null): UserStatus {
  if (deletedAt !== null) return 'deleted'
  if (bannedAt !== null) return 'banned'
  return 'active'
}

export function UserStatusBadge({ deletedAt, bannedAt }: UserStatusBadgeProps): React.JSX.Element {
  const intl = useIntl()
  const status = resolveUserStatus(deletedAt, bannedAt)
  return (
    <Badge className={STATUS_CLASSES[status]}>
      {intl.formatMessage({ id: STATUS_MESSAGE_IDS[status] })}
    </Badge>
  )
}
