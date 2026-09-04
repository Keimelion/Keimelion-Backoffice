import { LayoutDashboard, ListTodo, Package, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const dashboardNav: readonly NavItem[] = [
  { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { label: 'Listes', href: '/lists', icon: ListTodo },
  { label: 'Produits', href: '/products', icon: Package },
  { label: 'Utilisateurs', href: '/users', icon: Users },
]
