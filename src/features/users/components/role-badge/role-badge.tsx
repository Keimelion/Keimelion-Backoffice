import { useIntl } from 'react-intl'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'

interface RoleBadgeProps {
  role: UserRole
}

const ROLE_CLASSES: Record<UserRole, string> = {
  admin: 'border-transparent bg-rose-500 text-white hover:bg-rose-500/80',
  moderator: 'border-transparent bg-violet-500 text-white hover:bg-violet-500/80',
  user: 'border-transparent bg-sky-500 text-white hover:bg-sky-500/80',
}

const ROLE_MESSAGE_IDS: Record<UserRole, string> = {
  admin: 'users.role.admin',
  moderator: 'users.role.moderator',
  user: 'users.role.user',
}

export function RoleBadge({ role }: RoleBadgeProps): React.JSX.Element {
  const intl = useIntl()
  return (
    <Badge className={ROLE_CLASSES[role]}>
      {intl.formatMessage({ id: ROLE_MESSAGE_IDS[role] })}
    </Badge>
  )
}
