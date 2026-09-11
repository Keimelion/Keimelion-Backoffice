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

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  moderator: 'Moderator',
  user: 'User',
}

export function RoleBadge({ role }: RoleBadgeProps): React.JSX.Element {
  return <Badge className={ROLE_CLASSES[role]}>{ROLE_LABELS[role]}</Badge>
}
