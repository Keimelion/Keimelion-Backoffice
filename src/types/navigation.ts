import { LayoutDashboard, ListTodo, Package, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const dashboardNav: readonly NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Lists', href: '/lists', icon: ListTodo },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Users', href: '/users', icon: Users },
]
