'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookmarkCheck, CalendarHeart, FolderTree, LayoutDashboard, ListTodo, MessageSquareWarning, PackageOpen, Store, Tag, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isAdmin } from '@/data-access/_shared/auth-storage'
import { useCurrentUserRole } from '@/features/auth/hooks/use-current-user-role'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

interface NavItem {
  labelId: MessageId
  href: string
  icon: LucideIcon
  adminOnly?: boolean
}

const NAV_GROUPS: readonly (readonly NavItem[])[] = [
  [
    { labelId: 'sidebar.nav.dashboard', href: '/', icon: LayoutDashboard },
  ],
  [
    { labelId: 'sidebar.nav.users', href: '/users', icon: Users },
    { labelId: 'sidebar.nav.lists', href: '/lists', icon: ListTodo, adminOnly: true },
    { labelId: 'sidebar.nav.items', href: '/items', icon: PackageOpen, adminOnly: true },
    { labelId: 'sidebar.nav.reservations', href: '/reservations', icon: BookmarkCheck, adminOnly: true },
    { labelId: 'sidebar.nav.feedback', href: '/feedback', icon: MessageSquareWarning, adminOnly: true },
  ],
  [
    { labelId: 'sidebar.nav.categories', href: '/categories', icon: FolderTree, adminOnly: true },
    { labelId: 'sidebar.nav.tags', href: '/tags', icon: Tag, adminOnly: true },
    { labelId: 'sidebar.nav.shops', href: '/shops', icon: Store, adminOnly: true },
    { labelId: 'sidebar.nav.occasion_types', href: '/occasion-types', icon: CalendarHeart },
  ],
]

const BRAND_INITIAL = 'K'
const BRAND_NAME = 'Keimelion'

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname()
  const t = useTranslate()
  const currentRole = useCurrentUserRole()
  const isCurrentUserAdmin = currentRole !== null && isAdmin(currentRole)

  const visibleGroups = NAV_GROUPS
    .map((items) => items.filter((item) => item.adminOnly !== true || isCurrentUserAdmin))
    .filter((items) => items.length > 0)

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-background px-4 py-6">
      <Link href="/" className="mb-10 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg font-bold">{BRAND_INITIAL}</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">{BRAND_NAME}</span>
      </Link>

      <nav className="flex flex-col">
        {visibleGroups.map((items, groupIndex) => (
          <div
            key={items[0]?.href ?? `group-${String(groupIndex)}`}
            className={cn(
              'flex flex-col gap-1 py-3',
              groupIndex > 0 ? 'border-t border-border' : null,
            )}
          >
            {items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              const label = t(item.labelId)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5',
                  )}
                >
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200 ease-out',
                      isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                    )}
                  />
                  <Icon className="h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-110" />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
