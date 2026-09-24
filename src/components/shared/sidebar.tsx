'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarHeart, LayoutDashboard, ListTodo, LogOut, Package, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLogout } from '@/features/auth/hooks/use-logout'
import type { MessageId } from '@/lib/i18n/messages/en'
import { useTranslate } from '@/lib/i18n/use-translate'

interface NavItem {
  labelId: MessageId
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: readonly NavItem[] = [
  { labelId: 'sidebar.nav.dashboard', href: '/', icon: LayoutDashboard },
  { labelId: 'sidebar.nav.lists', href: '/lists', icon: ListTodo },
  { labelId: 'sidebar.nav.items', href: '/items', icon: Package },
  { labelId: 'sidebar.nav.users', href: '/users', icon: Users },
  { labelId: 'sidebar.nav.occasion_types', href: '/occasion-types', icon: CalendarHeart },
]

const BRAND_INITIAL = 'K'
const BRAND_NAME = 'Keimelion'

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname()
  const logout = useLogout()
  const t = useTranslate()

  const handleLogout = (): void => {
    logout.mutate(null)
  }

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-background px-4 py-6">
      <Link href="/" className="mb-10 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg font-bold">{BRAND_INITIAL}</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">{BRAND_NAME}</span>
      </Link>

      <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('common.nav.menu')}
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
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
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="group mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-500 ease-in-out hover:bg-destructive hover:text-destructive-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <LogOut className="h-5 w-5 transition-transform duration-500 ease-in-out group-hover:-translate-x-0.5" />
        {t('common.actions.sign_out')}
      </button>
    </aside>
  )
}
