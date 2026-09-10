import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@keimelion/api/shared/enums/user-role'
import { UserRoles } from '@keimelion/api/shared/enums/user-role'

interface RoleBadgeProps {
  role: UserRole
}

const ADMIN_CLASSES = 'border-transparent bg-rose-500 text-white hover:bg-rose-500/80'
const MODERATOR_CLASSES = 'border-transparent bg-violet-500 text-white hover:bg-violet-500/80'
const USER_CLASSES = 'border-transparent bg-sky-500 text-white hover:bg-sky-500/80'

export function RoleBadge({ role }: RoleBadgeProps): React.JSX.Element {
  switch (role) {
    case UserRoles.ADMIN:
      return <Badge className={ADMIN_CLASSES}>Admin</Badge>
    case UserRoles.MODERATOR:
      return <Badge className={MODERATOR_CLASSES}>Moderator</Badge>
    case UserRoles.USER:
      return <Badge className={USER_CLASSES}>User</Badge>
    default: {
      const exhaustiveCheck: never = role
      return <Badge variant="outline">{String(exhaustiveCheck)}</Badge>
    }
  }
}
